Resumen de Decisiones Clave de Arquitectura y Lógica (FiveM)
Este documento consolida las decisiones tomadas sobre la interacción del Cliente FiveM (LUA/NUI), los sistemas de negocios y los componentes base necesarios para el servidor, facilitando el desarrollo de los sistemas de economía dinámica y microtransacciones.
1. Interfaz de Usuario (UI) y Lenguajes
La implementación de la interfaz de usuario se basará en el modelo NUI de FiveM (HTML/CSS/JS) para una máxima flexibilidad y customización.


Componente
Lenguaje/Tecnología
Función
Lógica del Juego
LUA (Server-Side y Client-Side)
Motor de eventos, manejo de datos del jugador, interacción con la Dokploy API (backend) y activación de la UI.
Interfaz de Usuario (UI)
NUI (HTML, CSS, JavaScript)
Renderizado de todos los menús personalizados, como la interfaz de Inversiones, el menú de Food Trucks y las notificaciones.
Flujo de Comunicación
LUA y JavaScript
Comunicación bidireccional usando SendNUIMessage (LUA a JS) y RegisterNUICallback (JS a LUA) para sincronizar la lógica del juego con la UI web.

Decisión Clave de UI: Reutilizaremos los componentes base de ESX (HUD, Inventario) pero crearemos una UI completamente personalizada (NUI) para los sistemas de Inversión y Economía Dinámica.
2. Componentes Fundamentales de RP (Recomendaciones)
Para un servidor RP básico, funcional y orientado a la rentabilidad, se recomienda reutilizar scripts base de ESX y modificarlos para que interactúen con la lógica económica de Dokploy.
Componente
Estado Recomendado
Modificación Necesaria
ESX Base & Dependencias
Usar Existente
Mantener una versión estable y bien documentada de ESX.
Inventario & HUD
Reutilizar y Modificar
Modificar el HUD para mostrar un indicador claro de la Tasa de Ajuste de la Economía (inflación/deflación) para informar a los jugadores.
Sistema de Casas/Propiedades
Usar Existente y Modificar
CRÍTICO: Los precios de compra de propiedades y activos deben leer la tabla dinámica BasePrices (ajustada por Dokploy) en lugar de un valor fijo en el script.
Trabajos (Jobs) Básicos
Usar Existente y Modificar
CRÍTICO: El pago de los trabajos debe leer el GlobalMinWage (ajustado por Dokploy) para garantizar que el poder adquisitivo se mantenga.
Teléfono (Cell Phone)
Reutilizar y Extender
Añadir una nueva aplicación al teléfono que sirva como puerta de acceso principal a la UI de "Inversiones y Negocios".

3. Sistemas de Negocios y Gasto de Capital
Los negocios de RP son el principal motor de gasto de capital y el reemplazo de los sistemas de impuestos complejos.
Negocio
Rol Económico
Implementación Sugerida
Clubes Nocturnos
Motor de Inversión (Alto Capital)
Permite la compra del negocio y la inversión de capital por otros jugadores. El Cron Job de Dokploy calcula y distribuye las ganancias pasivas.
Food Trucks / Puestos de Comida
Motor de RP Activo (Micro-Gasto)
El jugador debe comprar el stock y los ingredientes a precios dinámicos (Money Sink recurrente) y luego vender el producto final.
Garajes de Tuning/Customización
Motor de Gasto de Lujo (Servicio P2P)
Negocios de alto valor de compra. Los propietarios ganan dinero al ofrecer servicios a otros jugadores, impulsando la transferencia de dinero y el gasto en vehículos.


