ESX = nil
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

-- Callback para obtener datos del jugador (Dinero y Coins)
ESX.RegisterServerCallback('dokploy_economy:getPlayerData', function(source, cb)
    local xPlayer = ESX.GetPlayerFromId(source)
    local money = xPlayer.getMoney()
    
    -- Asumimos que existe una cuenta 'coins', si no usar 'black_money' para test o columna SQL custom
    local coinsAccount = xPlayer.getAccount('coins') 
    local coins = 0
    
    if coinsAccount then
        coins = coinsAccount.money
    end

    cb({
        name = xPlayer.getName(),
        money = money,
        coins = coins
    })
end)

-- 1. Iniciar Compra de Coins (Real Money)
RegisterNetEvent('dokploy_economy:initiatePurchase')
AddEventHandler('dokploy_economy:initiatePurchase', function(packageId)
    local _source = source
    local xPlayer = ESX.GetPlayerFromId(_source)
    local package = Config.CoinPackages[packageId]

    if not package then return end

    -- Llamada al Backend Mock/Real
    -- Aquí simplificamos para el ejemplo. En prod: PerformHttpRequest a MercadoPago/Stripe
    print('Iniciando compra para: ' .. xPlayer.getName() .. ' - Paquete: ' .. packageId)
    
    -- Simulamos retorno de URL de pago
    TriggerClientEvent('dokploy_economy:openUrl', _source, {
        url = "https://mercadopago.com/checkout/mock/" .. packageId,
        title = package.label,
        price = package.price
    })
end)

-- 2. Exchange (Dinero Juego -> Coins)
RegisterNetEvent('dokploy_economy:exchangeMoney')
AddEventHandler('dokploy_economy:exchangeMoney', function(amountGameMoney)
    local _source = source
    local xPlayer = ESX.GetPlayerFromId(_source)
    
    if xPlayer.getMoney() >= amountGameMoney then
        local coinsToReceive = math.floor(amountGameMoney / Config.ExchangeRate)
        
        if coinsToReceive > 0 then
            xPlayer.removeMoney(amountGameMoney)
            xPlayer.addAccountMoney('coins', coinsToReceive)
            
            xPlayer.showNotification('Has intercambiado $' .. amountGameMoney .. ' por ' .. coinsToReceive .. ' Coins.')
            
            -- Actualizar UI
            TriggerClientEvent('dokploy_economy:updateData', _source)
        else
            xPlayer.showNotification('Cantidad insuficiente para comprar al menos 1 Coin.')
        end
    else
        xPlayer.showNotification('No tienes suficiente dinero.')
    end
end)

-- 3. Compra de Items (Usando Coins)
RegisterNetEvent('dokploy_economy:buyItem')
AddEventHandler('dokploy_economy:buyItem', function(data)
    local _source = source
    local xPlayer = ESX.GetPlayerFromId(_source)
    local price = tonumber(data.price)
    local label = data.label
    
    local coinsAccount = xPlayer.getAccount('coins')
    local currentCoins = 0
    if coinsAccount then currentCoins = coinsAccount.money end

    if currentCoins >= price then
        xPlayer.removeAccountMoney('coins', price)
        xPlayer.showNotification('¡Has comprado ' .. label .. ' por ' .. price .. ' Coins!')

        -- Lógica de entrega del item (Vehículo, Casa, etc.)
        -- Aquí iría la integración con esx_vehicleshop, qb-housing, etc.
        -- Por ahora, solo descontamos coins y notificamos.
        print('Item comprado: ' .. label .. ' por ' .. xPlayer.getName())
        
        -- Actualizar UI
        TriggerClientEvent('dokploy_economy:updateData', _source)
    else
        xPlayer.showNotification('No tienes suficientes Coins.')
    end
end)
