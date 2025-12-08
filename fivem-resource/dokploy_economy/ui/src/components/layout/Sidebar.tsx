import { motion } from 'framer-motion'
import { Coins, Home, ShoppingBag, ArrowRightLeft, Users } from 'lucide-react'
import { useAppStore, type Tab } from '../../store/useAppStore'
import { useLocales } from '../../hooks/useLocales'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const NavItem = ({ icon: Icon, label, active, onClick }: { tab: Tab, icon: any, label: string, active: boolean, onClick: () => void }) => (

    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
            active ? "bg-white/10 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute left-0 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
            />
        )}
        <Icon className={cn("w-5 h-5", active ? "text-blue-300" : "group-hover:text-blue-200")} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
    </button>
)

export const Sidebar = () => {
    const { currentTab, setTab, user } = useAppStore()
    const { t } = useLocales()

    return (
        <div className="w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 relative z-50">
            {/* Logo area */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Coins className="text-white" size={24} />
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

            <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Tu billetera</p>
                <p className="text-xl font-bold text-emerald-400">$ {user.money.toLocaleString()}</p>
            </div>
        </div>
    )
}
