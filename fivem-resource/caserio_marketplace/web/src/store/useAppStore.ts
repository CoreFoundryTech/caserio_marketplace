import { create } from 'zustand'

export type Tab = 'home' | 'coins' | 'shop' | 'exchange' | 'marketplace'

interface UserState {
    coins: number
    money: number
    name: string
}

interface AppState {
    currentTab: Tab
    setTab: (tab: Tab) => void

    user: UserState
    setUser: (user: Partial<UserState>) => void

    addToCart: (item: any) => void
    buyItem: (item: any) => void
}

export const useAppStore = create<AppState>((set) => ({
    currentTab: 'home',
    setTab: (tab) => set({ currentTab: tab }),

    user: {
        coins: 0, // Loaded from server
        money: 0, // Loaded from server
        name: 'Jugador'
    },
    setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

    addToCart: (item) => {
        // Direct purchase in this MVP
        import('../utils/fetchNui').then(({ fetchNui }) => {
            fetchNui('buyItem', {
                itemId: item.id,
                category: item.category,
                price: item.price,
                label: item.name
            })
        })
    },

    buyItem: (item) => {
        // Same as addToCart for now
        import('../utils/fetchNui').then(({ fetchNui }) => {
            fetchNui('buyItem', {
                id: item.id,
                price: item.price,
                label: item.label || item.name
            })
        })
    },

    fetchPlayerData: async () => {
        // En FiveM, los datos se actualizan via evento 'updatePlayerData'
        // desde el cliente Lua cuando se abre el menú
        // No hacemos nada aquí, solo esperamos el evento
    }
}))
