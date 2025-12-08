import React, { useState } from 'react'
import { Plus, Tag, Search, ShoppingBag } from 'lucide-react'
import { useLocales } from '../hooks/useLocales'
import { useAppStore } from '../store/useAppStore'

const mockListings = [
    { id: 1, seller: 'JuanPerez', name: 'Mustang GT 2020', price: 12000, type: 'vehicle' },
    { id: 2, seller: 'MariaGamer', name: 'Casa en Vinewood', price: 45000, type: 'property' },
    { id: 3, seller: 'CarlosV', name: 'AK-47 Skin Gold', price: 500, type: 'item' },
    { id: 4, seller: 'LuisaM', name: 'Garage Plaza', price: 8000, type: 'property' },
]

export const MarketplaceView = () => {
    const { t } = useLocales()
    const { addToCart } = useAppStore()
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">{t.marketplace.title}</h2>
                    <p className="text-gray-400">{t.marketplace.subtitle}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
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
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
                {mockListings.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 hover:bg-white/10 transition-colors group">
                        <div className="w-24 h-24 bg-black/20 rounded-lg flex items-center justify-center text-gray-600 flex-shrink-0">
                            <Tag size={32} />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">Ref: {item.seller}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-blue-300 font-bold">{item.price.toLocaleString()} C</span>
                                <button
                                    onClick={() => addToCart(item)}
                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
                                >
                                    <ShoppingBag size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
