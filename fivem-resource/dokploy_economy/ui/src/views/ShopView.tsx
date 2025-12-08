import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Home, Warehouse, Tag, ShoppingCart, ShoppingBag } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useLocales } from '../hooks/useLocales'

const dummyItems = [
    { id: 1, name: 'Lamborghini Urus', category: 'vehicles', price: 15000, image: 'https://i.imgur.com/3Z6Qj0M.png' }, // Placeholder images
    { id: 2, name: 'Mansion Vinewood', category: 'properties', price: 50000, image: 'https://i.imgur.com/3Z6Qj0M.png' },
    { id: 3, name: 'Garage Privado x10', category: 'garages', price: 5000, image: 'https://i.imgur.com/3Z6Qj0M.png' },
    { id: 4, name: 'BMW M4 Competition', category: 'vehicles', price: 12000, image: 'https://i.imgur.com/3Z6Qj0M.png' },
    { id: 5, name: 'Apartamento de Lujo', category: 'properties', price: 25000, image: 'https://i.imgur.com/3Z6Qj0M.png' },
    { id: 6, name: 'Nissan GTR', category: 'vehicles', price: 18000, image: 'https://i.imgur.com/3Z6Qj0M.png' },
]

export const ShopView = () => {
    const [activeCategory, setActiveCategory] = useState('all')
    const { addToCart } = useAppStore()
    const { t } = useLocales()

    const categories = [
        { id: 'all', label: t.shop.categories.all, icon: Tag },
        { id: 'vehicles', label: t.shop.categories.vehicles, icon: Car },
        { id: 'properties', label: t.shop.categories.properties, icon: Home },
        { id: 'garages', label: t.shop.categories.garages, icon: Warehouse },
    ]

    const filteredItems = activeCategory === 'all'
        ? dummyItems
        : dummyItems.filter(item => item.category === activeCategory)

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">{t.shop.title}</h2>
                    <p className="text-gray-400">{t.shop.subtitle}</p>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${activeCategory === cat.id ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20">
                {filteredItems.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group hover:bg-white/10 transition-colors"
                    >
                        <div className="aspect-video bg-black/50 relative overflow-hidden">
                            {/* Placeholder for real images */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 bg-gray-900">
                                <ShoppingBag size={40} className="opacity-20" />
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-blue-300 font-bold text-xl">{item.price.toLocaleString()} C</span>
                                <button
                                    onClick={() => addToCart(item)}
                                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-400 transition-colors"
                                >
                                    <ShoppingCart size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
