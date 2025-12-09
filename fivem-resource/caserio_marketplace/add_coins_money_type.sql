-- ============================================
-- AGREGAR TIPO DE DINERO "COINS" A QBCORE
-- Ejecutar este SQL una sola vez en tu base de datos
-- ============================================

-- 1. Agregar 'coins' con valor 0 a todos los jugadores existentes que no lo tengan
UPDATE players 
SET money = JSON_SET(money, '$.coins', 0) 
WHERE JSON_EXTRACT(money, '$.coins') IS NULL;

-- 2. Verificar que se agregó correctamente
SELECT citizenid, name, money FROM players LIMIT 10;

-- ============================================
-- NOTA IMPORTANTE:
-- También debes editar qb-core/shared/main.lua
-- para que nuevos jugadores tengan coins:
--
-- Busca: QBShared.MoneyTypes = { ... }
-- Agrega: 'coins' al array
--
-- Ejemplo:
-- QBShared.MoneyTypes = { 'cash', 'bank', 'crypto', 'coins' }
-- ============================================
