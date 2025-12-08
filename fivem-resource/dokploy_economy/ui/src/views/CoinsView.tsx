import { motion } from 'framer-motion'
import { Check, Star, CreditCard } from 'lucide-react'
import { useLocales } from '../hooks/useLocales'

const CoinPackage = ({ amount, price, bonus, popular }: { amount: number, price: number, bonus?: number, popular?: boolean }) => {
    const { t } = useLocales()
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative p-6 rounded-2xl border ${popular ? 'bg-gradient-to-b from-blue-900/40 to-blue-900/10 border-blue-500/50' : 'bg-white/5 border-white/5'} flex flex-col items-center text-center overflow-hidden group hover:border-blue-500/30 transition-colors`}
        >
            {popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl text-white">
                    {t.coins.popular}
                </div>
            )}

            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 mb-4 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                <Star className="text-white w-10 h-10 fill-current" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{amount.toLocaleString()}</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">Caserio Coins</p>

            {bonus && (
                <div className="mb-4 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">
                    +{bonus.toLocaleString()} {t.coins.bonus}
                </div>
            )}

            <div className="mt-auto w-full">
                <p className="text-3xl font-bold text-white mb-4">${price}<span className="text-sm text-gray-400 font-normal"> {t.coins.usd}</span></p>
                <button
                    onClick={() => {
                        import('../utils/fetchNui').then(({ fetchNui }) => {
                            // En lugar de iniciar pago API, abrimos la tienda Tebex
                            fetchNui('openStore', { packageId: `coins_${amount}` })
                            if ((window as any).invokeNative) {
                                // Logic handled by client (Show notif)
                            } else {
                                window.open('https://tienda.example.com', '_blank')
                            }
                        })
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-blue-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
                    <CreditCard size={18} />
                    {t.coins.buy_btn}
                </button>
            </div>
        </motion.div>
    )
}

export const CoinsView = () => {
    const { t } = useLocales()
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold">{t.coins.title}</h2>
                <p className="text-gray-400">{t.coins.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CoinPackage amount={5000} price={5} />
                <CoinPackage amount={12000} price={10} bonus={2000} popular />
                <CoinPackage amount={25000} price={20} bonus={5000} />
                <CoinPackage amount={65000} price={50} bonus={15000} />
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5">
                <h3 className="text-xl font-bold mb-4">{t.coins.vip_title}</h3>
                <div className="grid grid-cols-3 gap-4">
                    {t.coins.vip_items.map((item: string, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <Check size={16} />
                            </div>
                            <span className="font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
