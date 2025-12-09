local QBCore = exports['qb-core']:GetCoreObject()

-- Archivo para guardar coins pendientes (jugadores offline)
local PENDING_FILE = GetResourcePath(GetCurrentResourceName()) .. '/pending_coins.json'

-- ============================================
-- UTILIDADES PARA COINS PENDIENTES (OFFLINE)
-- ============================================

local function LoadPendingCoins()
    local file = io.open(PENDING_FILE, 'r')
    if file then
        local content = file:read('*a')
        file:close()
        if content and content ~= '' then
            return json.decode(content) or {}
        end
    end
    return {}
end

local function SavePendingCoins(pending)
    local file = io.open(PENDING_FILE, 'w')
    if file then
        file:write(json.encode(pending))
        file:close()
    end
end

local function AddPendingCoins(identifier, amount)
    local pending = LoadPendingCoins()
    pending[identifier] = (pending[identifier] or 0) + amount
    SavePendingCoins(pending)
    print('[Caserio] Coins pendientes guardados: ' .. amount .. ' para ' .. identifier)
end

local function DeliverPendingCoins(playerId, identifier)
    local pending = LoadPendingCoins()
    
    for savedId, amount in pairs(pending) do
        if string.find(identifier, savedId) or string.find(savedId, identifier) then
            local Player = QBCore.Functions.GetPlayer(playerId)
            if Player then
                Player.Functions.AddMoney('coins', amount, "Tebex Purchase (Pendiente)")
                TriggerClientEvent('QBCore:Notify', playerId, '¡Recibiste ' .. amount .. ' Coins de tu compra pendiente!', 'success')
                TriggerClientEvent('caserio_marketplace:purchaseConfirmed', playerId)
                print('[Caserio] ✓ Coins pendientes entregados: ' .. amount)
                
                pending[savedId] = nil
                SavePendingCoins(pending)
            end
            return
        end
    end
end

-- ============================================
-- FUNCIONES DE TRANSACCIONES (AUDITORIA)
-- ============================================

local function GenerateUUID()
    local template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function(c)
        local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
        return string.format('%x', v)
    end)
end

local function CreateTransaction(citizenid, txnType, itemData, price)
    local txnId = GenerateUUID()
    
    MySQL.insert.await([[
        INSERT INTO caserio_transactions (txn_id, citizenid, type, item_data, price, status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')
    ]], {txnId, citizenid, txnType, json.encode(itemData), price})
    
    print('[Caserio] TXN Creada: ' .. txnId .. ' (' .. txnType .. ')')
    return txnId
end

local function CompleteTransaction(txnId)
    MySQL.update.await([[
        UPDATE caserio_transactions SET status = 'COMPLETED', completed_at = NOW() WHERE txn_id = ?
    ]], {txnId})
    print('[Caserio] TXN Completada: ' .. txnId)
end

local function FailTransaction(txnId, errorMsg)
    MySQL.update.await([[
        UPDATE caserio_transactions SET status = 'FAILED', error_message = ? WHERE txn_id = ?
    ]], {errorMsg, txnId})
    print('[Caserio] TXN Fallida: ' .. txnId .. ' - ' .. errorMsg)
end

-- ============================================
-- HELPERS
-- ============================================

local function UpdateClientUI(Player)
    if not Player then return end
    local src = Player.PlayerData.source
    
    TriggerClientEvent('caserio_marketplace:updateData', src, {
        name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
        money = Player.Functions.GetMoney('cash'),
        coins = Player.Functions.GetMoney('coins')
    })
end

local function ValidatePlate(plate)
    if not plate or #plate == 0 or #plate > 8 then
        return false, "La patente debe tener entre 1 y 8 caracteres"
    end
    if not string.match(plate, "^[A-Za-z0-9]+$") then
        return false, "La patente solo puede tener letras y números"
    end
    return true, nil
end

local function IsPlateAvailable(plate)
    local exists = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', {plate:upper()})
    return not exists
end

-- ============================================
-- EVENTOS DE UI
-- ============================================

RegisterNetEvent('caserio_marketplace:requestOpenShop', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        TriggerClientEvent('caserio_marketplace:openShopUI', src, {
            name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
            money = Player.Functions.GetMoney('cash'),
            coins = Player.Functions.GetMoney('coins')
        })
    end
end)

-- ============================================
-- COMANDO ADMIN / TEBEX: addcoins
-- ============================================

RegisterCommand('addcoins', function(source, args, rawCommand)
    local src = source
    local identifier = args[1]
    local amount = tonumber(args[2])
    
    print('[Caserio] addcoins - ID: ' .. tostring(identifier) .. ', Cantidad: ' .. tostring(amount))

    if src ~= 0 then
        if not QBCore.Functions.HasPermission(src, 'admin') then return end
    end

    if not identifier or not amount then
        print('[Caserio] Uso: addcoins [identifier] [cantidad]')
        return
    end

    -- Buscar jugador online
    local targetPlayer = QBCore.Functions.GetPlayerByCitizenId(identifier) or QBCore.Functions.GetPlayer(tonumber(identifier))
    
    if not targetPlayer then
        local players = QBCore.Functions.GetQBPlayers()
        for _, player in pairs(players) do
            if player then
                local allIdentifiers = GetPlayerIdentifiers(player.PlayerData.source)
                for _, id in ipairs(allIdentifiers) do
                    if string.find(id, identifier) or 
                       string.find(id, 'fivem:' .. identifier) or
                       string.find(identifier, id) then
                        targetPlayer = player
                        print('[Caserio] ✓ Jugador encontrado por identifier: ' .. id)
                        break
                    end
                end
                if targetPlayer then break end
            end
        end
    end

    if targetPlayer then
        local citizenid = targetPlayer.PlayerData.citizenid
        
        -- Crear transacción de auditoría
        local txnId = CreateTransaction(citizenid, 'tebex_coins', {coins = amount}, 0)
        
        targetPlayer.Functions.AddMoney('coins', amount, "Tebex/Admin AddCoins")
        
        CompleteTransaction(txnId)
        
        TriggerClientEvent('QBCore:Notify', targetPlayer.PlayerData.source, '¡Recibiste ' .. amount .. ' Ca$erio Coins!', 'success')
        TriggerClientEvent('caserio_marketplace:purchaseConfirmed', targetPlayer.PlayerData.source)
        UpdateClientUI(targetPlayer)
        print('[Caserio] ✓ ' .. amount .. ' coins añadidos a jugador online')
    else
        AddPendingCoins(identifier, amount)
        print('[Caserio] Jugador offline. Guardado como pendiente.')
    end
end)

-- ============================================
-- PLAYER LOADED: Entregar pendientes
-- ============================================

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    local src = source
    Wait(2000)
    
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        local steamHex = QBCore.Functions.GetIdentifier(src, 'steam') or ''
        local license = QBCore.Functions.GetIdentifier(src, 'license') or ''
        local citizenid = Player.PlayerData.citizenid
        
        DeliverPendingCoins(src, steamHex)
        DeliverPendingCoins(src, license)
        DeliverPendingCoins(src, citizenid)
    end
end)

-- ============================================
-- EXCHANGE: Cash -> Coins
-- ============================================

RegisterNetEvent('caserio_marketplace:exchangeMoney', function(amountGameMoney)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local amount = tonumber(amountGameMoney)

    if not Player or not amount then return end

    if Player.Functions.RemoveMoney('cash', amount, "Exchange to Coins") then
        local coinsToReceive = math.floor(amount / Config.ExchangeRate)
        
        if coinsToReceive > 0 then
            Player.Functions.AddMoney('coins', coinsToReceive, "Exchange from Cash")
            TriggerClientEvent('QBCore:Notify', src, 'Intercambio exitoso: ' .. coinsToReceive .. ' Coins.', 'success')
            UpdateClientUI(Player)
        else
            Player.Functions.AddMoney('cash', amount, "Exchange Revert")
            TriggerClientEvent('QBCore:Notify', src, 'Cantidad insuficiente.', 'error')
        end
    else
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficiente dinero en efectivo.', 'error')
    end
end)

-- ============================================
-- COMPRA DE VEHÍCULO (CON PATENTE PERSONALIZADA)
-- ============================================

RegisterNetEvent('caserio_marketplace:buyVehicle', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    local vehicleId = data.vehicleId
    local plate = data.plate and data.plate:upper() or nil
    
    -- Buscar vehículo en config
    local vehicleConfig = nil
    for _, v in ipairs(Config.ShopItems.vehicles) do
        if v.id == vehicleId then
            vehicleConfig = v
            break
        end
    end
    
    if not vehicleConfig then
        TriggerClientEvent('QBCore:Notify', src, 'Vehículo no encontrado.', 'error')
        return
    end
    
    local price = vehicleConfig.price
    local model = vehicleConfig.model
    local citizenid = Player.PlayerData.citizenid
    
    -- Validar patente
    local valid, errMsg = ValidatePlate(plate)
    if not valid then
        TriggerClientEvent('QBCore:Notify', src, errMsg, 'error')
        return
    end
    
    plate = plate:upper()
    
    -- Verificar patente disponible
    if not IsPlateAvailable(plate) then
        TriggerClientEvent('QBCore:Notify', src, 'Esa patente ya está en uso.', 'error')
        return
    end
    
    -- Verificar coins
    if Player.Functions.GetMoney('coins') < price then
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficientes Coins.', 'error')
        return
    end
    
    -- Crear transacción
    local txnId = CreateTransaction(citizenid, 'buy_vehicle', {
        model = model,
        plate = plate,
        price = price
    }, price)
    
    -- Quitar coins
    if not Player.Functions.RemoveMoney('coins', price, "Compra Vehículo: " .. model) then
        FailTransaction(txnId, "Error al quitar coins")
        TriggerClientEvent('QBCore:Notify', src, 'Error al procesar pago.', 'error')
        return
    end
    
    -- Insertar vehículo
    local hash = GetHashKey(model)
    local insertResult = MySQL.insert.await([[
        INSERT INTO player_vehicles (citizenid, vehicle, hash, plate, garage, state, fuel, engine, body)
        VALUES (?, ?, ?, ?, ?, 1, 100, 1000.0, 1000.0)
    ]], {citizenid, model, hash, plate, Config.DefaultGarage})
    
    if insertResult then
        CompleteTransaction(txnId)
        TriggerClientEvent('QBCore:Notify', src, '¡Compraste un ' .. vehicleConfig.label .. '! Patente: ' .. plate, 'success')
        UpdateClientUI(Player)
        print('[Caserio] Vehículo vendido: ' .. model .. ' a ' .. citizenid .. ' - Patente: ' .. plate)
    else
        -- Rollback: devolver coins
        Player.Functions.AddMoney('coins', price, "Rollback Compra Vehículo")
        FailTransaction(txnId, "Error al insertar vehículo en BD")
        TriggerClientEvent('QBCore:Notify', src, 'Error al registrar vehículo. Coins devueltos.', 'error')
    end
end)

-- ============================================
-- COMPRA DE ARMA (CON/SIN SKIN)
-- ============================================

RegisterNetEvent('caserio_marketplace:buyWeapon', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if not Player then return end
    
    local weaponId = data.weaponId
    
    -- Buscar arma en config
    local weaponConfig = nil
    for _, w in ipairs(Config.ShopItems.weapons) do
        if w.id == weaponId then
            weaponConfig = w
            break
        end
    end
    
    if not weaponConfig then
        TriggerClientEvent('QBCore:Notify', src, 'Arma no encontrada.', 'error')
        return
    end
    
    local price = weaponConfig.price
    local item = weaponConfig.item
    local citizenid = Player.PlayerData.citizenid
    
    -- Verificar coins
    if Player.Functions.GetMoney('coins') < price then
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficientes Coins.', 'error')
        return
    end
    
    -- Crear transacción
    local txnId = CreateTransaction(citizenid, 'buy_weapon', {
        item = item,
        tint = weaponConfig.tint,
        attachments = weaponConfig.attachments,
        price = price
    }, price)
    
    -- Quitar coins
    if not Player.Functions.RemoveMoney('coins', price, "Compra Arma: " .. item) then
        FailTransaction(txnId, "Error al quitar coins")
        TriggerClientEvent('QBCore:Notify', src, 'Error al procesar pago.', 'error')
        return
    end
    
    -- Preparar metadata del arma
    local weaponMeta = {
        serie = QBCore.Shared.RandomStr(8):upper(),
        quality = 100
    }
    
    if weaponConfig.tint then
        weaponMeta.tint = weaponConfig.tint
    end
    
    if weaponConfig.attachments then
        weaponMeta.attachments = {}
        for _, att in ipairs(weaponConfig.attachments) do
            table.insert(weaponMeta.attachments, { component = att })
        end
    end
    
    -- Agregar arma al inventario
    local success = Player.Functions.AddItem(item, 1, false, weaponMeta)
    
    if success then
        CompleteTransaction(txnId)
        TriggerClientEvent('inventory:client:ItemBox', src, QBCore.Shared.Items[item], 'add')
        TriggerClientEvent('QBCore:Notify', src, '¡Compraste ' .. weaponConfig.label .. '!', 'success')
        UpdateClientUI(Player)
        print('[Caserio] Arma vendida: ' .. item .. ' a ' .. citizenid)
    else
        -- Rollback
        Player.Functions.AddMoney('coins', price, "Rollback Compra Arma")
        FailTransaction(txnId, "Error al agregar arma al inventario")
        TriggerClientEvent('QBCore:Notify', src, 'Error al entregar arma. Coins devueltos.', 'error')
    end
end)

-- ============================================
-- COMPRA GENÉRICA (Legacy/Otros items)
-- ============================================

RegisterNetEvent('caserio_marketplace:buyItem', function(data)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local price = tonumber(data.price)
    local label = data.label

    if not Player or not price then return end

    if Player.Functions.RemoveMoney('coins', price, "Shop Purchase: " .. label) then
        TriggerClientEvent('QBCore:Notify', src, '¡Compraste ' .. label .. '!', 'success')
        UpdateClientUI(Player)
        print('[Caserio] Item comprado: ' .. label)
    else
        TriggerClientEvent('QBCore:Notify', src, 'No tienes suficientes Coins.', 'error')
    end
end)

-- ============================================
-- RECUPERACIÓN DE TRANSACCIONES PENDIENTES
-- ============================================

CreateThread(function()
    Wait(5000) -- Esperar a que cargue todo
    
    local pendingTxns = MySQL.query.await([[
        SELECT * FROM caserio_transactions WHERE status = 'PENDING'
    ]])
    
    if pendingTxns and #pendingTxns > 0 then
        print('[Caserio] Encontradas ' .. #pendingTxns .. ' transacciones pendientes. Recuperando...')
        
        for _, txn in ipairs(pendingTxns) do
            local itemData = json.decode(txn.item_data)
            
            if txn.type == 'buy_vehicle' then
                -- Verificar si el vehículo existe
                local exists = MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', {itemData.plate})
                if exists then
                    CompleteTransaction(txn.txn_id)
                    print('[Caserio] TXN Recuperada (vehículo existe): ' .. txn.txn_id)
                else
                    -- Reembolsar
                    local Player = QBCore.Functions.GetPlayerByCitizenId(txn.citizenid)
                    if Player then
                        Player.Functions.AddMoney('coins', txn.price, "Reembolso TXN Fallida")
                        FailTransaction(txn.txn_id, "Vehículo no encontrado - Reembolsado")
                        print('[Caserio] TXN Reembolsada: ' .. txn.txn_id)
                    end
                end
                
            elseif txn.type == 'tebex_coins' then
                -- Verificar si el jugador tiene los coins
                local Player = QBCore.Functions.GetPlayerByCitizenId(txn.citizenid)
                if Player then
                    CompleteTransaction(txn.txn_id)
                    print('[Caserio] TXN Tebex marcada como completada: ' .. txn.txn_id)
                end
            end
        end
    end
end)

-- ============================================
-- TRACKING / DEBUG
-- ============================================

RegisterNetEvent('caserio_marketplace:purchaseInitiated', function(packageId, amount, price)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        print('[Caserio] Compra iniciada por ' .. Player.PlayerData.charinfo.firstname .. ': ' .. packageId)
    end
end)

RegisterCommand('myid', function(source, args, rawCommand)
    local src = source
    if src == 0 then return end
    
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        print('=== TUS IDENTIFIERS ===')
        print('Server ID: ' .. src)
        print('Steam: ' .. (QBCore.Functions.GetIdentifier(src, 'steam') or 'N/A'))
        print('License: ' .. (QBCore.Functions.GetIdentifier(src, 'license') or 'N/A'))
        print('CitizenID: ' .. Player.PlayerData.citizenid)
        print('Coins: ' .. Player.Functions.GetMoney('coins'))
        print('========================')
    end
end)
