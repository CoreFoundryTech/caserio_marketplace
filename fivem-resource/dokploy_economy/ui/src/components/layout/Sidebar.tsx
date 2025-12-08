import { motion } from 'framer-motion'
import { Coins, Home, ShoppingBag, ArrowRightLeft, Users } from 'lucide-react'
import { useAppStore, type Tab } from '../../store/useAppStore'
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

    const tabs = [
        { id: 'home', label: 'Inicio', icon: Home },
        { id: 'coins', label: 'Caserio Coins', icon: Coins },
        { id: 'shop', label: 'Tienda Oficial', icon: ShoppingBag },
        { id: 'exchange', label: 'Exchange', icon: ArrowRightLeft },
        { id: 'marketplace', label: 'Marketplace', icon: Users },
    ]

    return (
        <div className="w-64 h-full bg-[#121216]/95 border-r border-white/5 flex flex-col p-4 backdrop-blur-md">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-lg font-bold">C</span>
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg leading-tight">Caserio Shop</h1>
                    <p className="text-xs text-blue-300 font-medium">{user.coins.toLocaleString()} Coins</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                {tabs.map((t) => (
                    <NavItem
                        key={t.id}
                        tab={t.id as Tab}
                        icon={t.icon}
                        label={t.label}
                        active={currentTab === t.id}
                        onClick={() => setTab(t.id as Tab)}
                    />
                ))}
            </nav>

            <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Tu billetera</p>
                <p className="text-xl font-bold text-emerald-400">$ {user.money.toLocaleString()}</p>
            </div>
        </div>
    )
}
