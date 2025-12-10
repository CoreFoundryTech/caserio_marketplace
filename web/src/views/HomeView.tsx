import { Coins, ShoppingBag, ArrowRightLeft } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useLocales } from '../hooks/useLocales'

export const HomeView = () => {
    const { user, setTab } = useAppStore()
    const { t } = useLocales()

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">{t.home.welcome} <span className="text-blue-400">{user.name}</span></h2>
                </div>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-800 p-8 text-white shadow-2xl shadow-blue-900/40">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Coins size={200} />
                </div>
                <div className="relative z-10">
                    <span className="text-blue-200 font-medium tracking-wider uppercase">{t.home.balance}</span>
                    <h1 className="text-6xl font-black mt-2 tracking-tight">{user.coins.toLocaleString()}</h1>
                    <div className="mt-4 flex items-center gap-2 text-blue-200">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">Caserio Coins</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {t.home.quick_access}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => setTab('coins')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Coins size={20} />
                        </div>
                        <h4 className="font-bold text-lg">{t.home.buy_coins}</h4>
                    </button>
                    <button onClick={() => setTab('shop')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={20} />
                        </div>
                        <h4 className="font-bold text-lg">{t.home.go_shop}</h4>
                    </button>
                    <button onClick={() => setTab('exchange')} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <ArrowRightLeft size={20} />
                        </div>
                        <h4 className="font-bold text-lg">{t.home.exchange_now}</h4>
                    </button>
                </div>
            </div>
        </div>
    )
}
