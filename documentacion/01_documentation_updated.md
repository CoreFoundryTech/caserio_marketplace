# Documentación Oficial: Dokploy Economy (React + Tebex)

Este recurso implementa un sistema de economía premium y tienda visual para servidores FiveM, utilizando una interfaz moderna en **React** y preparado para integración comercial con **Tebex**.

## 1. Características Principales
- **Interfaz Moderna**: Construida con React, Vite, TailwindCSS y Framer Motion.
- **Sistema de Monedas (Coins)**: Moneda premium paralela al dinero del juego.
- **Tienda (Shop)**: Compra de vehículos, propiedades y garajes con Coins.
- **Exchange**: Intercambio de dinero in-game por Coins (configurable).
- **Integración Tebex**: Comando administrativo `addcoins` listo para automatización de pagos.

## 2. Instalación y Configuración

### 2.1 Requisitos Previos
- Servidor FiveM con **ESX Legacy** (o compatible).
- Base de datos MySQL.
- **Columna/Cuenta `coins`**: Asegúrate de que tu base de datos (tabla `users` o `addon_account_data`) soporte la cuenta `coins` o `premium`.

### 2.2 Configuración (`config.lua`)
Edita `fivem-resource/dokploy_economy/config.lua`:

```lua
Config.StoreUrl = "https://tienda.tuserver.com" -- Tu tienda Tebex
Config.ExchangeRate = 1000 -- Costo de 1 Coin en dinero del juego
```

### 2.3 Comandos
- `/openshop`: Abre la interfaz visual (UI).
- `addcoins <id> <cantidad>`: (Admin/Consola) Otorga coins a un jugador. **Este es el comando que debes usar en Tebex**.

## 3. Integración con Tebex (Venta Real)
Para vender Coins por dinero real y entregarlas automáticamente:

1.  Crea un **Módulo/Paquete** en tu tienda Tebex (ej. "5000 Coins").
2.  En la sección **Commands** del paquete, añade:
    ```bash
    addcoins {sid} 5000
    ```
    *(Nota: `{sid}` es la variable de Tebex para el ID del jugador en el servidor).*
3.  Cuando el jugador pague, Tebex ejecutará este comando en la consola de tu servidor y el jugador recibirá los Coins instantáneamente.

## 4. Estructura del Código

### Frontend (`ui/`)
- Desarrollado en **React + TypeScript**.
- **Build**: Ejecuta `npm run build` para generar la carpeta `dist`.
- **Modificación**: Edita los archivos en `src/` y reconstruye.

### Backend (`server/main.lua`)
- Gestiona la lógica segura:
    - `dokploy_economy:getPlayerData`: Sincroniza saldo.
    - `dokploy_economy:buyItem`: Valida y procesa compras.
    - `dokploy_economy:exchangeMoney`: Exchange seguro servidor-lados.

## 5. Solución de Problemas
- **La UI no abre**: Revisa si hay errores en la consola F8 (`script error`).
- **No recibo Coins**: Verifica que el comando `addcoins` funcione ejecutándolo manualmente desde la consola del servidor (`addcoins 1 100`).
