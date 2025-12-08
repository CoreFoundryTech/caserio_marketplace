import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

export const MarketplaceView = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-yellow-500"
            >
                <Construction size={48} />
            </motion.div>
            <div>
                <h2 className="text-3xl font-bold mb-2">Marketplace</h2>
                <p className="text-gray-400 max-w-md">
                    Pronto podrás vender y comprar items de otros jugadores de forma segura.
                </p>
            </div>
        </div>
    )
}
