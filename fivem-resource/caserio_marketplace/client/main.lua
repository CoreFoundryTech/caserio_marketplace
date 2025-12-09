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
    -- Request authoritative data from server
    TriggerServerEvent('caserio_marketplace:requestOpenShop')
end)

RegisterNetEvent('caserio_marketplace:openShopUI', function(data)
    -- Update UI with server data
    SendNUIMessage({
        action = 'updatePlayerData',
        data = {
            name = data.name,
            money = data.money,
            coins = data.coins
        }
    })
    
    toggleNuiFrame(true)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    toggleNuiFrame(false)
    cb({})
end)

-- Get store URL for package
RegisterNUICallback('getStoreUrl', function(data, cb)
    local url = Config.StoreUrl
    local pkgId = data.packageId

    if pkgId and Config.CoinPackages[pkgId] and Config.CoinPackages[pkgId].tebex_package_id then
        url = Config.StoreUrl .. "package/" .. Config.CoinPackages[pkgId].tebex_package_id
    end

    cb({ url = url })
end)

-- User initiated purchase - can be used for tracking
RegisterNUICallback('purchaseInitiated', function(data, cb)
    -- Optional: Log to server for analytics
    TriggerServerEvent('caserio_marketplace:purchaseInitiated', data.packageId, data.amount, data.price)
    cb({})
end)

-- Legacy openStore - kept for compatibility
RegisterNUICallback('openStore', function(data, cb)
    local url = Config.StoreUrl
    local pkgId = data.packageId

    if pkgId and Config.CoinPackages[pkgId] and Config.CoinPackages[pkgId].tebex_package_id then
        url = Config.StoreUrl .. "package/" .. Config.CoinPackages[pkgId].tebex_package_id
    end

    cb({ url = url })
end)

RegisterNUICallback('exchangeMoney', function(data, cb)
    TriggerServerEvent('caserio_marketplace:exchangeMoney', data.amount)
    cb({})
end)

RegisterNUICallback('buyItem', function(data, cb)
    TriggerServerEvent('caserio_marketplace:buyItem', data)
    cb({})
end)

RegisterNUICallback('buyVehicle', function(data, cb)
    TriggerServerEvent('caserio_marketplace:buyVehicle', {
        vehicleId = data.vehicleId,
        plate = data.plate
    })
    cb({})
end)

RegisterNUICallback('buyWeapon', function(data, cb)
    TriggerServerEvent('caserio_marketplace:buyWeapon', {
        weaponId = data.weaponId
    })
    cb({})
end)

-- Server triggers this when Tebex confirms payment
RegisterNetEvent('caserio_marketplace:purchaseConfirmed', function()
    SendNUIMessage({ action = 'purchaseConfirmed' })
    -- Also refresh player data
    TriggerEvent('caserio_marketplace:updateData')
end)

RegisterNetEvent('caserio_marketplace:updateData', function(data)
    if isMenuOpen then
        -- Server sends authoritative data
        local money = data and data.money or 0
        local coins = data and data.coins or 0
        local name = data and data.name or "Player"

        SendNUIMessage({
            action = 'updatePlayerData',
            data = {
                name = name,
                money = money,
                coins = coins
            }
        })
    end
end)
