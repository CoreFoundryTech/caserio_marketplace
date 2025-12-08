local QBCore = exports['qb-core']:GetCoreObject()
local isMenuOpen = false

local function toggleNuiFrame(shouldShow)
    isMenuOpen = shouldShow
    SetNuiFocus(shouldShow, shouldShow)
    SendNUIMessage({
        action = 'setVisible',
        data = shouldShow
    })
end

RegisterCommand('openshop', function()
    -- Get Player Data from QBCore directly
    local PlayerData = QBCore.Functions.GetPlayerData()
    local money = PlayerData.money['cash']
    local coins = PlayerData.money['coins'] or 0 -- Assumes 'coins' money type exists in QB

    -- Update UI
    SendNUIMessage({
        action = 'updatePlayerData',
        data = {
            name = PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname,
            money = money,
            coins = coins
        }
    })
    
    toggleNuiFrame(true)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    toggleNuiFrame(false)
    cb({})
end)

RegisterNUICallback('openStore', function(data, cb)
    SendNUIMessage({
        action = 'openUrl',
        url = Config.StoreUrl
    })
    QBCore.Functions.Notify('Visita nuestra tienda oficial para adquirir Coins.', 'primary')
    cb({})
end)

RegisterNUICallback('exchangeMoney', function(data, cb)
    TriggerServerEvent('dokploy_economy:exchangeMoney', data.amount)
    cb({})
end)

RegisterNUICallback('buyItem', function(data, cb)
    TriggerServerEvent('dokploy_economy:buyItem', data)
    cb({})
end)

RegisterNetEvent('dokploy_economy:updateData', function()
    if isMenuOpen then
        local PlayerData = QBCore.Functions.GetPlayerData()
        SendNUIMessage({
            action = 'updatePlayerData',
            data = {
                name = PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname,
                money = PlayerData.money['cash'],
                coins = PlayerData.money['coins'] or 0
            }
        })
    end
end)
