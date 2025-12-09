import { useState } from 'react'
import { CreditCard, Copy, Check, Loader2, X } from 'lucide-react'
import { useLocales } from '../hooks/useLocales'
import { useNuiEvent } from '../hooks/useNuiEvent'
import CaserioCoin from '../assets/Caserio_Coin.svg'

// Purchase states
type PurchaseState = 'idle' | 'showUrl' | 'waiting' | 'success' | 'error'

interface PurchaseModalProps {
    isOpen: boolean
    state: PurchaseState
    url: string
    packageName: string
    onClose: () => void
}

const PurchaseModal = ({ isOpen, state, url, packageName, onClose }: PurchaseModalProps) => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for CEF
            const input = document.createElement('input')
            input.value = url
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center gpu-layer"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
        >
            <div
                className="relative w-full max-w-lg p-8 rounded-3xl border border-white/10 gpu-layer"
                style={{
                    background: 'rgba(15, 15, 20, 0.98)',
                    opacity: 1,
                    transform: 'scale(1)',
                    WebkitTransition: 'all 0.3s ease-out',
                    transition: 'all 0.3s ease-out',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full cef-transition"
                    style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                    <X size={20} className="text-gray-400" />
                </button>

                {/* Content based on state */}
                {state === 'showUrl' && (
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <img src={CaserioCoin} alt="Coin" className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Comprar {packageName}</h3>
                        <p className="text-gray-400 mb-6">
                            Copia el enlace y pégalo en tu navegador para completar la compra.
                        </p>

                        {/* URL Box */}
                        <div
                            className="relative p-4 rounded-xl mb-4 text-left"
                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <p className="text-sm text-blue-400 break-all pr-10">{url}</p>
                            <button
                                onClick={handleCopy}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg cef-transition"
                                style={{ background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}
                            >
                                {copied ? (
                                    <Check size={18} className="text-green-400" />
                                ) : (
                                    <Copy size={18} className="text-blue-400" />
                                )}
                            </button>
                        </div>

                        <button
                            onClick={handleCopy}
                            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 cef-transition mb-4"
                            style={{
                                background: copied ? 'rgba(34, 197, 94, 1)' : 'rgba(59, 130, 246, 1)',
                                color: '#fff'
                            }}
                        >
                            {copied ? (
                                <>
                                    <Check size={20} />
                                    ¡Copiado! Pégalo en tu navegador
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    Copiar enlace
                                </>
                            )}
                        </button>

                        {/* Spinner esperando pago */}
                        <div className="flex items-center justify-center gap-3 py-4 rounded-xl mb-4" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <Loader2 size={20} className="animate-spin text-blue-400" />
                            <span className="text-sm text-blue-400">Esperando confirmación de pago...</span>
                        </div>

                        <p className="text-xs text-gray-500">
                            Tus coins se acreditarán automáticamente después de pagar.
                        </p>
                    </div>
                )}

                {state === 'waiting' && (
                    <div className="text-center py-8">
                        <Loader2 size={48} className="animate-spin text-blue-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">Esperando confirmación...</h3>
                        <p className="text-gray-400">
                            Completa el pago en tu navegador.<br />
                            Esta pantalla se actualizará automáticamente.
                        </p>
                    </div>
                )}

                {state === 'success' && (
                    <div className="text-center py-8">
                        <div
                            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                        >
                            <Check size={40} className="text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">¡Compra Exitosa!</h3>
                        <p className="text-gray-400 mb-6">
                            Tus coins han sido acreditados a tu cuenta.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl font-bold cef-transition"
                            style={{ background: 'rgba(34, 197, 94, 1)', color: '#fff' }}
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {state === 'error' && (
                    <div className="text-center py-8">
                        <div
                            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                        >
                            <X size={40} className="text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Error en la compra</h3>
                        <p className="text-gray-400 mb-6">
                            Hubo un problema procesando tu pago. Intenta de nuevo.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl font-bold cef-transition"
                            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

interface CoinPackageProps {
    amount: number
    price: number
    bonus?: number
    popular?: boolean
    onBuy: (amount: number, price: number) => void
}

const CoinPackage = ({ amount, price, bonus, popular, onBuy }: CoinPackageProps) => {
    const { t } = useLocales()

    return (
        <div
            className="relative p-6 rounded-2xl border flex flex-col items-center text-center overflow-hidden gpu-layer cef-transition"
            style={{
                background: popular
                    ? 'linear-gradient(to bottom, rgba(30, 58, 138, 0.4), rgba(30, 58, 138, 0.1))'
                    : 'rgba(255, 255, 255, 0.05)',
                borderColor: popular ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.05)',
            }}
        >
            {popular && (
                <div
                    className="absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl text-white"
                    style={{ background: 'rgba(59, 130, 246, 1)' }}
                >
                    {t.coins.popular}
                </div>
            )}

            <div className="w-24 h-24 mb-4 flex items-center justify-center cef-transition">
                <img src={CaserioCoin} alt="Caserio Coin" className="w-full h-full object-contain" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-1">{amount.toLocaleString()}</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">Caserio Coins</p>

            {bonus && (
                <div
                    className="mb-4 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        borderColor: 'rgba(34, 197, 94, 0.2)',
                    }}
                >
                    +{bonus.toLocaleString()} {t.coins.bonus}
                </div>
            )}

            <div className="mt-auto w-full">
                <p className="text-3xl font-bold text-white mb-4">
                    ${price}<span className="text-sm text-gray-400 font-normal"> {t.coins.usd}</span>
                </p>
                <button
                    onClick={() => onBuy(amount, price)}
                    className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cef-transition"
                    style={{
                        background: 'rgba(255, 255, 255, 1)',
                        color: '#000',
                    }}
                >
                    <CreditCard size={18} />
                    {t.coins.buy_btn}
                </button>
            </div>
        </div>
    )
}

export const CoinsView = () => {
    const { t } = useLocales()
    const [modalOpen, setModalOpen] = useState(false)
    const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle')
    const [purchaseUrl, setPurchaseUrl] = useState('')
    const [packageName, setPackageName] = useState('')

    // Listen for purchase confirmation from server
    useNuiEvent('purchaseConfirmed', () => {
        setPurchaseState('success')
    })

    useNuiEvent('purchaseError', () => {
        setPurchaseState('error')
    })

    const handleBuy = async (amount: number, price: number) => {
        // Get URL from server (dynamic import)
        const { fetchNui } = await import('../utils/fetchNui')
        const response = await fetchNui<{ url: string }>('getStoreUrl', {
            packageId: `coins_${amount}`
        }, {
            url: `https://caserio-rp.tebex.io/package/7158766` // Mock for browser
        })

        setPurchaseUrl(response.url || 'https://caserio-rp.tebex.io')
        setPackageName(`${amount.toLocaleString()} Coins ($${price})`)
        setPurchaseState('showUrl')
        setModalOpen(true)

        // Notify server that user initiated purchase
        fetchNui('purchaseInitiated', { packageId: `coins_${amount}`, amount, price })
    }

    const handleCloseModal = () => {
        setModalOpen(false)
        setPurchaseState('idle')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold">{t.coins.title}</h2>
                <p className="text-gray-400">{t.coins.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CoinPackage amount={5000} price={5} onBuy={handleBuy} />
                <CoinPackage amount={12000} price={10} bonus={2000} popular onBuy={handleBuy} />
                <CoinPackage amount={25000} price={20} bonus={5000} onBuy={handleBuy} />
                <CoinPackage amount={65000} price={50} bonus={15000} onBuy={handleBuy} />
            </div>

            <PurchaseModal
                isOpen={modalOpen}
                state={purchaseState}
                url={purchaseUrl}
                packageName={packageName}
                onClose={handleCloseModal}
            />
        </div>
    )
}
