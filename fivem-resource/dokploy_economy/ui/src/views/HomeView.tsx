import { motion } from 'framer-motion'
import { Coins, ShoppingBag, ArrowRightLeft } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export const HomeView = () => {
    const { setTab } = useAppStore()

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Bienvenido a Caserio Shop</h2>
                    <p className="text-blue-100 max-w-lg">
                        Adquiere monedas premium, compra vehículos exclusivos, propiedades y mejora tu experiencia en el servidor.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            </motion.div>

            <div className="grid grid-cols-3 gap-6">
                <div
                    onClick={() => setTab('coins')}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                        <Coins />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Comprar Coins</h3>
                    <p className="text-sm text-gray-400">Recarga saldo para gastar en la tienda.</p>
                </div>

                <div
                    onClick={() => setTab('shop')}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                        <ShoppingBag />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Ver Tienda</h3>
                    <p className="text-sm text-gray-400">Explora el catálogo de items premium.</p>
                </div>

                <div
                    onClick={() => setTab('exchange')}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                        <ArrowRightLeft />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Exchange</h3>
                    <p className="text-sm text-gray-400">Vende tus items o cambia divisas.</p>
                </div>
            </div>
        </div>
    )
}
