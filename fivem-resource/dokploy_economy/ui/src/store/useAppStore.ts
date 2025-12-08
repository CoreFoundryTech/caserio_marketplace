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
}

export const useAppStore = create<AppState>((set) => ({
    currentTab: 'home',
    setTab: (tab) => set({ currentTab: tab }),

    user: {
        coins: 12000, // Mock data
        money: 500000, // Mock data
        name: 'DokployUser'
    },
    setUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

    addToCart: (item) => {
        // En este MVP compramos directamente el item
        import('../utils/fetchNui').then(({ fetchNui }) => {
            fetchNui('buyItem', {
                itemId: item.id,
                category: item.category,
                price: item.price,
                label: item.name
            })
        })
    },

    fetchPlayerData: async () => {
        try {
            // En navegador usamos mock, en FiveM pedimos update
            if ((window as any).invokeNative) {
                // El cliente Lua responderá con un evento 'updatePlayerData'
                // pero también podemos pedirlo explícitamente si existe un callback
            } else {
                // Browser Mock
                set({ user: { coins: 15000, money: 750000, name: 'Browser User' } })
            }
        } catch (e) {
            console.error(e)
        }
    }
}))
