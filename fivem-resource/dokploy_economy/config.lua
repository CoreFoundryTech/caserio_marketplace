Config = {}

Config.BackendUrl = "http://localhost:3000" -- Cambiar por URL real en producción
Config.BackendToken = "change_me_to_secure_token" -- Debe coincidir con .env FIVEM_SECRET_TOKEN

-- Tasa de cambio: Cuánto dinero del juego cuesta 1 Coin
Config.ExchangeRate = 1000 -- $1000 Dinero Juego = 1 Caserio Coin

-- Paquetes de Monedas (Real Money -> Coins)
Config.CoinPackages = {
    ['coins_5000'] = {
        label = "Paquete Básico",
        price = 5, -- USD
        reward_coins = 5000,
        description = "5,000 Caserio Coins"
    },
    ['coins_12000'] = {
        label = "Paquete Popular",
        price = 10, -- USD
        reward_coins = 12000,
        description = "12,000 Caserio Coins (+2000 Bonus)"
    },
    ['coins_25000'] = {
        label = "Paquete Pro",
        price = 20, -- USD
        reward_coins = 25000,
        description = "25,000 Caserio Coins (+5000 Bonus)"
    },
    ['coins_65000'] = {
        label = "Paquete Élite",
        price = 50, -- USD
        reward_coins = 65000,
        description = "65,000 Caserio Coins (+15000 Bonus)"
    }
}
