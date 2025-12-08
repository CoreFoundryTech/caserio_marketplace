local QBCore = exports['qb-core']:GetCoreObject()

-- 1. Comando ADMIN para dar Coins (Usado por Tebex)
-- Uso: addcoins [id_jugador] [cantidad]
RegisterCommand('addcoins', function(source, args, rawCommand)
    local src = source
    local targetId = tonumber(args[1])
    local amount = tonumber(args[2])

    -- Si source != 0, verificar permisos de admin
    if src ~= 0 then
        if not QBCore.Functions.HasPermission(src, 'admin') then
            return 
        end
    end

    if targetId and amount then
        local Player = QBCore.Functions.GetPlayer(targetId)
        if Player then
            Player.Functions.AddMoney('coins', amount, "Tebex Purchase")
            TriggerClientEvent('QBCore:Notify', targetId, '¡Has recibido ' .. amount .. ' Caserio Coins!', 'success')
            print('Se han añadido ' .. amount .. ' coins al ID ' .. targetId)
            
            -- Update Client UI logic if open
            TriggerClientEvent('dokploy_economy:updateData', targetId)
        else
            print('Jugador no encontrado: ' .. targetId)
        end
    else
        print('Uso incorrecto: addcoins [id] [cantidad]')
    end
end)

-- 2. Exchange (Dinero Juego -> Coins)
RegisterNetEvent('dokploy_economy:exchangeMoney', function(amountGameMoney)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local amount = tonumber(amountGameMoney)

    if not Player or not amount then return end

    if Player.Functions.RemoveMoney('cash', amount, "Exchange to Coins") then
        local coinsToReceive = math.floor(amount / Config.ExchangeRate)
        if coinsToReceive > 0 then
            Player.Functions.AddMoney('coins', coinsToReceive, "Exchange from Cash")
            TriggerClientEvent('QBCore:Notify', src, 'Has intercambiado $' .. amount .. ' por ' .. coinsToReceive .. ' Coins.', 'success')
            TriggerClientEvent('dokploy_economy:updateData', src)
        else
            -- Revertir si no alcanza para 1 coin (aunque la UI no debería dejarlo)
             Player.Functions.AddMoney('cash', amount, "Exchange Revert")
             TriggerClientEvent('QBCore:Notify', src, 'Cantidad insuficiente.', 'error')
        end
    else
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficiente dinero.', 'error')
    end
end)

-- 3. Compra de Items (Usando Coins)
RegisterNetEvent('dokploy_economy:buyItem', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local price = tonumber(data.price)
    local label = data.label

    if not Player or not price then return end

    if Player.Functions.GetMoney('coins') >= price then
        if Player.Functions.RemoveMoney('coins', price, "Shop Purchase: " .. label) then
            TriggerClientEvent('QBCore:Notify', src, '¡Has comprado ' .. label .. ' por ' .. price .. ' Coins!', 'success')
            print('Item comprado: ' .. label .. ' por ' .. Player.PlayerData.charinfo.firstname)
            
            -- Lógica placeholder de entrega
            -- Aquí podrías usar exports['qb-vehicleshop']:GenerateVehicle(...) etc.
            
            TriggerClientEvent('dokploy_economy:updateData', src)
        end
    else
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficientes Coins.', 'error')
    end
end)
