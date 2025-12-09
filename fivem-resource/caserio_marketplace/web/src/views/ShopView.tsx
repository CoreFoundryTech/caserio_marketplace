import { useState } from 'react'
import { Car, Crosshair, Tag, ShoppingCart, X, Loader2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useLocales } from '../hooks/useLocales'
import { fetchNui } from '../utils/fetchNui'

// Vehicle and Weapon types
interface Vehicle {
    id: string
    label: string
    price: number
    model: string
    category: string
}

interface Weapon {
    id: string
    label: string
    price: number
    item: string
    tint?: number
    attachments?: string[]
}

// Sample data - in production this would come from config via NUI
const VEHICLES: Vehicle[] = [
    { id: 'adder', label: 'Adder', price: 50000, model: 'adder', category: 'supercar' },
    { id: 'zentorno', label: 'Zentorno', price: 45000, model: 'zentorno', category: 'supercar' },
    { id: 'insurgent', label: 'Insurgent', price: 80000, model: 'insurgent', category: 'military' },
    { id: 'sultanrs', label: 'Sultan RS', price: 25000, model: 'sultanrs', category: 'sports' },
]

const WEAPONS: Weapon[] = [
    { id: 'pistol', label: 'Pistola', price: 500, item: 'weapon_pistol' },
    { id: 'smg', label: 'SMG', price: 2000, item: 'weapon_smg' },
    { id: 'carbine', label: 'Carabina', price: 5000, item: 'weapon_carbinerifle' },
    { id: 'pistol_gold', label: 'Pistola Dorada', price: 3000, item: 'weapon_pistol', tint: 5 },
    { id: 'pistol_pink', label: 'Pistola Rosa', price: 2500, item: 'weapon_pistol', tint: 6 },
    { id: 'smg_silenced', label: 'SMG Silenciada', price: 4000, item: 'weapon_smg', attachments: ['Silenciador'] },
    { id: 'carbine_tactical', label: 'Carabina Táctica', price: 10000, item: 'weapon_carbinerifle', attachments: ['Silenciador', 'Linterna', 'Mira'], tint: 1 },
]

export const ShopView = () => {
    const [activeCategory, setActiveCategory] = useState<'vehicles' | 'weapons'>('vehicles')
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null)
    const [customPlate, setCustomPlate] = useState('')
    const [plateError, setPlateError] = useState('')
    const [purchasing, setPurchasing] = useState(false)
    const { user } = useAppStore()
    const { t } = useLocales()

    const categories = [
        { id: 'vehicles' as const, label: 'Vehículos', icon: Car },
        { id: 'weapons' as const, label: 'Armas', icon: Crosshair },
    ]

    const validatePlate = (plate: string): boolean => {
        if (plate.length === 0) {
            setPlateError('Ingresa una patente')
            return false
        }
        if (plate.length > 8) {
            setPlateError('Máximo 8 caracteres')
            return false
        }
        if (!/^[A-Za-z0-9]+$/.test(plate)) {
            setPlateError('Solo letras y números')
            return false
        }
        setPlateError('')
        return true
    }

    const handleBuyVehicle = async () => {
        if (!selectedVehicle) return
        if (!validatePlate(customPlate)) return

        if (user.coins < selectedVehicle.price) {
            setPlateError('No tienes suficientes coins')
            return
        }

        setPurchasing(true)
        try {
            await fetchNui('buyVehicle', {
                vehicleId: selectedVehicle.id,
                plate: customPlate.toUpperCase()
            })
            setSelectedVehicle(null)
            setCustomPlate('')
        } catch (e) {
            console.error(e)
        }
        setPurchasing(false)
    }

    const handleBuyWeapon = async () => {
        if (!selectedWeapon) return

        if (user.coins < selectedWeapon.price) {
            return
        }

        setPurchasing(true)
        try {
            await fetchNui('buyWeapon', {
                weaponId: selectedWeapon.id
            })
            setSelectedWeapon(null)
        } catch (e) {
            console.error(e)
        }
        setPurchasing(false)
    }

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">{t.shop.title}</h2>
                    <p className="text-gray-400">{t.shop.subtitle}</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-400">Tu saldo:</span>
                    <p className="text-2xl font-bold text-yellow-400">{user.coins.toLocaleString()} 🪙</p>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                        style={{
                            background: activeCategory === cat.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.05)',
                            color: activeCategory === cat.id ? '#000' : '#9ca3af',
                            fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
                        }}
                    >
                        <cat.icon size={20} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Vehicles Grid */}
            {activeCategory === 'vehicles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20 custom-scrollbar">
                    {VEHICLES.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                                <Car size={60} className="text-blue-400/30" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{vehicle.label}</h3>
                                <p className="text-xs text-gray-500 uppercase">{vehicle.category}</p>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-yellow-400 font-bold text-xl">{vehicle.price.toLocaleString()} 🪙</span>
                                    <button
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
                                    >
                                        <ShoppingCart size={16} />
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Weapons Grid */}
            {activeCategory === 'weapons' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20 custom-scrollbar">
                    {WEAPONS.map(weapon => (
                        <div
                            key={weapon.id}
                            className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <div className="aspect-video bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center relative">
                                <Crosshair size={60} className="text-red-400/30" />
                                {weapon.tint && (
                                    <span className="absolute top-2 right-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                                        SKIN
                                    </span>
                                )}
                                {weapon.attachments && weapon.attachments.length > 0 && (
                                    <span className="absolute top-2 left-2 px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">
                                        +{weapon.attachments.length} MODS
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{weapon.label}</h3>
                                {weapon.attachments && (
                                    <p className="text-xs text-gray-500">{weapon.attachments.join(', ')}</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-yellow-400 font-bold text-xl">{weapon.price.toLocaleString()} 🪙</span>
                                    <button
                                        onClick={() => setSelectedWeapon(weapon)}
                                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-2"
                                    >
                                        <ShoppingCart size={16} />
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vehicle Purchase Modal */}
            {selectedVehicle && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Comprar {selectedVehicle.label}</h3>
                            <button onClick={() => setSelectedVehicle(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                <span className="text-gray-400">Precio:</span>
                                <span className="text-yellow-400 font-bold text-2xl">{selectedVehicle.price.toLocaleString()} 🪙</span>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Patente personalizada:</label>
                                <input
                                    type="text"
                                    value={customPlate}
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase().slice(0, 8)
                                        setCustomPlate(val)
                                        if (val) validatePlate(val)
                                    }}
                                    placeholder="Ej: JERKZAEN"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xl font-mono tracking-wider text-center uppercase focus:outline-none focus:border-blue-500"
                                    maxLength={8}
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">Máximo 8 caracteres, solo letras y números</p>
                                {plateError && (
                                    <p className="text-red-400 text-sm mt-2 text-center">{plateError}</p>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBuyVehicle}
                                    disabled={purchasing || !customPlate}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {purchasing ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Weapon Purchase Modal */}
            {selectedWeapon && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Comprar {selectedWeapon.label}</h3>
                            <button onClick={() => setSelectedWeapon(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                <span className="text-gray-400">Precio:</span>
                                <span className="text-yellow-400 font-bold text-2xl">{selectedWeapon.price.toLocaleString()} 🪙</span>
                            </div>

                            {selectedWeapon.tint && (
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-yellow-400 text-sm">✨ Incluye skin especial</p>
                                </div>
                            )}

                            {selectedWeapon.attachments && selectedWeapon.attachments.length > 0 && (
                                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <p className="text-purple-400 text-sm font-bold mb-1">Modificaciones:</p>
                                    <ul className="text-purple-300 text-sm">
                                        {selectedWeapon.attachments.map((att, i) => (
                                            <li key={i}>• {att}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {user.coins < selectedWeapon.price && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-sm">No tienes suficientes coins</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setSelectedWeapon(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBuyWeapon}
                                    disabled={purchasing || user.coins < selectedWeapon.price}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {purchasing ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
