import { Coins, Home, ShoppingBag, ArrowRightLeft, Users } from 'lucide-react'
import { useAppStore, type Tab } from '../../store/useAppStore'
import { useLocales } from '../../hooks/useLocales'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import CaserioCoin from '../../assets/Caserio_Coin.svg'

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const NavItem = ({ icon: Icon, label, active, onClick }: { tab: Tab, icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl relative overflow-hidden cef-transition",
            active ? "text-white" : "text-gray-400 hover:text-white"
        )}
        style={{
            background: active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0)',
            WebkitTransition: 'background 0.2s ease-out, color 0.2s ease-out',
            transition: 'background 0.2s ease-out, color 0.2s ease-out',
        }}
    >
        {active && (
            <div
                className="absolute left-0 w-1 h-6 rounded-r-full"
                style={{ background: 'linear-gradient(to bottom, #60a5fa, #a855f7)' }}
            />
        )}
        <Icon className={cn("w-5 h-5", active ? "text-blue-300" : "")} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
    </button>
)

export const Sidebar = () => {
    const { currentTab, setTab, user } = useAppStore()
    const { t } = useLocales()

    return (
        <div
            className="w-64 h-full border-r border-white/5 flex flex-col p-4 relative z-50 gpu-layer"
            style={{
                background: 'rgba(0, 0, 0, 0.6)',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
            }}
        >
            {/* Logo area */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-12 h-12 flex items-center justify-center">
                    <img src={CaserioCoin} alt="Caserio" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold text-xl text-white tracking-tight">Caserio</h1>
                    <span className="text-xs font-medium text-blue-400 tracking-wider uppercase">Economy</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                <NavItem tab="home" icon={Home} label={t.sidebar.home} active={currentTab === 'home'} onClick={() => setTab('home')} />
                <NavItem tab="coins" icon={Coins} label={t.sidebar.coins} active={currentTab === 'coins'} onClick={() => setTab('coins')} />
                <NavItem tab="shop" icon={ShoppingBag} label={t.sidebar.shop} active={currentTab === 'shop'} onClick={() => setTab('shop')} />
                <NavItem tab="exchange" icon={ArrowRightLeft} label={t.sidebar.exchange} active={currentTab === 'exchange'} onClick={() => setTab('exchange')} />
                <NavItem tab="marketplace" icon={Users} label={t.sidebar.marketplace} active={currentTab === 'marketplace'} onClick={() => setTab('marketplace')} />
            </nav>

            <div
                className="mt-auto p-4 rounded-2xl border border-white/5"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
                <p className="text-xs text-gray-400 mb-1">Tu billetera</p>
                <p className="text-lg font-bold text-emerald-400">$ {user.money.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                    <img src={CaserioCoin} alt="Coins" className="w-5 h-5" />
                    <p className="text-lg font-bold text-yellow-400">{user.coins.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
