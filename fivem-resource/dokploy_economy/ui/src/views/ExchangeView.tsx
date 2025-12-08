import { useState } from 'react'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export const ExchangeView = () => {
    const { user } = useAppStore()
    const [amount, setAmount] = useState<number>(0)

    // Rate: 1000 Game Money = 1 Coin (Example)
    const RATE = 1000

    const estimatedCoins = Math.floor(amount / RATE)

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Exchange de Divisas</h2>
                <p className="text-gray-400">Intercambia tu dinero del juego por Caserio Coins.</p>
            </div>

            <div className="w-full bg-white/5 border border-white/5 rounded-3xl p-8 relative">
                <div className="flex items-center justify-between gap-8">
                    <div className="flex-1 text-left space-y-2">
                        <label className="text-sm text-gray-400 font-medium ml-1">Vendes (Dinero Juego)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-white/10"
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-500">USD</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-1">Disponible: ${user.money.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-center pt-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                            <ArrowRight />
                        </div>
                    </div>

                    <div className="flex-1 text-left space-y-2">
                        <label className="text-sm text-gray-400 font-medium ml-1">Recibes (Coins)</label>
                        <div className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 text-2xl font-bold text-blue-300 flex items-center justify-between">
                            <span>{estimatedCoins.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-1">Tasa: ${RATE} = 1 Coin</p>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={() => {
                            if (amount > 0) {
                                import('../utils/fetchNui').then(({ fetchNui }) => {
                                    fetchNui('exchangeMoney', { amount })
                                })
                            }
                        }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2">
                        <RefreshCw size={20} />
                        Confirmar Intercambio
                    </button>
                    <p className="mt-4 text-xs text-gray-500">
                        Al confirmar, el dinero será descontado de tu cuenta bancaria del juego inmediatamente. Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
        </div>
    )
}
