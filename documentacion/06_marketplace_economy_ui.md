# 06. Marketplace y Sistema de Economía UI

Este documento detalla la implementación del nuevo sistema de economía y marketplace basado en **React**, diseñado para ofrecer una experiencia visual "Premium" y una gestión eficiente de activos in-game.

## 1. Visión General
La interfaz ha sido migrada completamente de HTML/JS Vanilla a **React + Vite**, utilizando **TailwindCSS** para el diseño y **Framer Motion** para animaciones fluidas. El objetivo es centralizar todas las transacciones premium y de alto valor en una sola aplicación in-game (`/openshop`).

## 2. Sistema de "Caserio Coins"
La economía premium se basa en una moneda paralela llamada **Caserio Coins**.

### 2.1 Compra de Coins (Dinero Real)
- **Interfaz**: `CoinsView.tsx`
- **Funcionalidad**: Permite a los usuarios adquirir paquetes de monedas usando dinero real.
- **Flujo Técnico**:
    1. Usuario selecciona paquete (ej. 5,000 Coins por $5 USD).
    2. NUI envía evento `buyCoins` al cliente Lua.
    3. Cliente Lua notifica al servidor (`initiatePurchase`).
    4. Servidor genera una preferencia de pago (MercadoPago/Stripe) y devuelve una URL.
    5. Usuario completa el pago en el navegador (mock en desarrollo).
    6. Webhook del proveedor confirma pago y asigna Coins al usuario (DB).

### 2.2 Exchange (Dinero In-Game -> Coins)
- **Interfaz**: `ExchangeView.tsx`
- **Funcionalidad**: Permite a los jugadores "grinders" convertir su dinero del juego en Coins Premium, democratizando el acceso a ítems exclusivos.
- **Configuración**: Tasa de cambio definida en `config.lua` (Ej. $1,000 Dinero In-Game = 1 Coin).
- **Validación**: Se verifica el saldo bancario del jugador antes de la transacción.

## 3. Tienda Oficial (Shop)
- **Interfaz**: `ShopView.tsx`
- **Categorías**:
    - **Vehículos**: Autos exclusivos de donación.
    - **Propiedades**: Mansiones y casas de alto nivel.
    - **Garajes**: Espacios extra para vehículos.
- **Lógica de Compra**:
    - El usuario navega por las categorías.
    - Al hacer clic en "Comprar", se envía `buyItem` a Lua.
    - El servidor verifica el saldo de **Coins**.
    - Si es suficiente, se descuenta el saldo y se triggered el evento de entrega del ítem (ej. `esx_vehicleshop:giveVehicle`).

## 4. Estructura Técnica
### Frontend (React)
- **State Management**: `Zustand` (`useAppStore`) maneja el saldo del usuario y la navegación.
- **Routing**: Navegación basada en pestañas (no router completo de historial) para agilidad en NUI.
- **Communicación NUI**:
    - `fetchNui`: Wrapper para `fetch` post a `https://resource_name/event`. detecta entorno navegador vs FiveM.
    - `useNuiEvent`: Hook para escuchar updates desde Lua (`updatePlayerData`).

### Backend (Lua)
- **Eventos Principales**:
    - `dokploy_economy:getPlayerData`: Sincroniza dinero/coins al abrir la UI.
    - `dokploy_economy:initiatePurchase`: Maneja integración con pasarelas de pago.
    - `dokploy_economy:exchangeMoney`: Lógica transaccional de conversión.
    - `dokploy_economy:buyItem`: Validación y entrega de productos.

## 5. Roadmap: Marketplace P2P
*Estado Actual: Placeholder (Coming Soon)*

La pestaña **Marketplace** está diseñada para futura expansión, permitiendo el comercio entre jugadores:
- **Listar Ítems**: Jugadores podrán poner en venta sus autos/propiedades por Coins.
- **Compra Directa**: Otros jugadores compran listados.
- **Tax**: El servidor retiene un % de la transacción como "tax" para control de inflación.
