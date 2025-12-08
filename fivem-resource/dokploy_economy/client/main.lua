local function toggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendNUIMessage({
    action = 'setVisible',
    data = shouldShow
  })
end

RegisterCommand('openshop', function()
  -- Request latest player data from server before opening
  ESX.TriggerServerCallback('dokploy_economy:getPlayerData', function(data)
      SendNUIMessage({
          action = 'updatePlayerData',
          data = data
      })
      toggleNuiFrame(true)
  end)
end)

RegisterNUICallback('hideFrame', function(_, cb)
  toggleNuiFrame(false)
  cb({})
end)

RegisterNUICallback('buyCoins', function(data, cb)
  -- data.packageId (e.g., 'coins_5000')
  TriggerServerEvent('dokploy_economy:initiatePurchase', data.packageId)
  cb({})
end)

RegisterNUICallback('exchangeMoney', function(data, cb)
  -- data.amount
  TriggerServerEvent('dokploy_economy:exchangeMoney', data.amount)
  cb({})
end)

RegisterNUICallback('buyItem', function(data, cb)
  TriggerServerEvent('dokploy_economy:buyItem', data)
  cb({})
end)

RegisterNetEvent('dokploy_economy:openUrl')
AddEventHandler('dokploy_economy:openUrl', function(data)
    -- En un entorno real, usaríamos una función para abrir navegador overlay o steam
    -- Por ahora, copiamos al portapapeles o usamos SendNUIMessage si la UI tiene modal de pago
    SendNUIMessage({
        action = 'openPaymentUrl',
        data = data
    })
    
    -- Opcional: Abrir en navegador externo del usuario
    ESX.ShowNotification('Por favor completa el pago en el navegador abierto.')
    -- ExecuteCommand('start ' .. data.url) -- No funciona en clients streams, usar guia de usuario
end)
