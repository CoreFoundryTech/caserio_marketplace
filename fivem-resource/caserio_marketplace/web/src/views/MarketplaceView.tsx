import { useState } from 'react'
import { Plus, Search, ShoppingBag, Users } from 'lucide-react'
import { useLocales } from '../hooks/useLocales'

// Listings will come from server via NUI
interface MarketplaceListing {
    id: number
    seller: string
    name: string
    price: number
    type: string
}

export const MarketplaceView = () => {
    const { t } = useLocales()
    const [searchTerm, setSearchTerm] = useState('')
    const [listings] = useState<MarketplaceListing[]>([]) // Will be populated via NUI

    const filteredListings = listings.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">{t.marketplace.title}</h2>
                    <p className="text-gray-400">{t.marketplace.subtitle}</p>
                </div>
                <button
                    className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 cef-transition"
                    style={{ background: 'rgba(37, 99, 235, 1)', color: '#fff' }}
                    onClick={() => {
                        // TODO: Open list item modal via NUI
                        import('../utils/fetchNui').then(({ fetchNui }) => {
                            fetchNui('openListItemModal', {})
                        })
                    }}
                >
                    <Plus size={18} />
                    {t.marketplace.list_item}
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder={t.marketplace.search_placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none cef-transition"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20 custom-scrollbar">
                {filteredListings.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                        <Users size={48} className="mb-4 opacity-30" />
                        <p className="text-lg">No hay ofertas disponibles</p>
                        <p className="text-sm">Las ofertas de otros jugadores aparecerán aquí</p>
                    </div>
                ) : (
                    filteredListings.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl p-4 flex gap-4 border border-white/5 cef-transition gpu-layer"
                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <div
                                className="w-24 h-24 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0"
                                style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                            >
                                <ShoppingBag size={32} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Vendedor: {item.seller}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-blue-300 font-bold">{item.price.toLocaleString()} C</span>
                                    <button
                                        onClick={() => {
                                            import('../utils/fetchNui').then(({ fetchNui }) => {
                                                fetchNui('buyMarketplaceItem', { id: item.id, price: item.price })
                                            })
                                        }}
                                        className="p-2 rounded-lg cef-transition"
                                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}
                                    >
                                        <ShoppingBag size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
