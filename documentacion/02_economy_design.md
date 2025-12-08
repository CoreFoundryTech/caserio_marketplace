Guía de Arquitectura: Sistema de Microtransacciones y Economía Dinámica (FiveM + Dokploy)
Este documento describe la arquitectura técnica y el flujo de datos necesarios para implementar un sistema de venta de moneda/ítems (imitando "Shark Cards") y un motor de economía dinámica con ajuste automático de inflación en un servidor de FiveM.
1. Visión General de la Arquitectura
La solución se basa en tres pilares que deben interactuar constantemente:
Cliente FiveM (LUA/NUI): Inicia la compra, muestra el estado económico y la interfaz de inversión/negocios.
Backend (Dokploy API): Gestiona los pagos, la lógica económica y es el puente de comunicación entre el Pago y FiveM.
Base de Datos (BD): Almacena el estado del jugador, las transacciones, las variables económicas globales y los datos de los negocios invertibles.
2. Fase I: Integración de Pagos (El Flujo de la "Shark Card")
El objetivo es que un jugador inicie una compra dentro del juego y que el sistema le acredite el ítem/dinero una vez que el pago se haya completado exitosamente con un proveedor externo (e.g., Stripe, Mercado Pago).
2.1. Lado del Cliente FiveM (LUA)
Paso
Componente
Descripción
1. Iniciación
Script LUA
El jugador interactúa con un menú o un comando (/buycard). El script captura el PlayerId o Source del servidor.
2. Redirección
NUI/LUA
Se utiliza la interfaz NUI de FiveM para abrir una URL específica en el navegador interno o externo del jugador.
3. Datos Enviados
URL
La URL debe incluir parámetros que identifiquen de forma única al jugador y la transacción.

Ejemplo: https://tudominio.com/api/initiate_payment?player_id=1234&product=gold_card

2.2. Lado del Servidor Dokploy (Backend API)
Tecnología Recomendada: Node.js (Express) o Python (Flask/Django)
Paso
Endpoint/Función
Descripción
1. Generar Transacción
/api/initiate_payment
Recibe player_id y product. Genera un transaction_id único y lo guarda en la BD en estado PENDIENTE. Redirige al jugador al portal de pago del proveedor.
2. Manejo del Pago
Proveedor de Pago
El jugador completa la transacción en el portal del proveedor (Stripe Checkout, etc.).
3. Webhook de Éxito (CRÍTICO)
/webhook/payment-success
Este es el punto clave. El proveedor de pago notifica automáticamente a esta URL.

1. Verificación: Autenticar el Webhook (secreto/firma).

2. Actualización BD: Busca el transaction_id en la BD y cambia su estado a COMPLETADO.

3. Notificación a FiveM: Procede inmediatamente a notificar al servidor de FiveM (ver Fase II).

3. Fase II: Notificación y Entrega en el Juego (Específico para ESX)
Una vez que el backend confirma el pago (vía Webhook), debe comunicarse de vuelta con el servidor de FiveM para ejecutar la lógica de entrega del ítem.
3.1. Comunicación Dokploy -> FiveM Server (Recomendación)
Mecanismo: El servidor de FiveM expone un endpoint HTTP seguro que solo el Dokploy API conoce y puede acceder (ej. usando un token secreto).
Paso
Componente
Descripción
1. Llamada Saliente
Dokploy API (En el Webhook)
Después de actualizar la BD, el backend hace una solicitud HTTP POST a la API de FiveM.
2. Payload
Datos de la Llamada
Debe incluir la información necesaria: player_id, item_to_grant, y un AUTH_TOKEN secreto.
3. Endpoint FiveM
Script Server-Side (C# o LUA)
Un listener en el servidor de FiveM recibe la solicitud. Verifica el AUTH_TOKEN para garantizar que la solicitud proviene del Dokploy API.

3.2. Lógica de Entrega (FiveM Server - ESX)
Una vez verificado, el servidor de FiveM ejecuta la lógica del juego. Dado que usas ESX, las funciones clave serán:
Busca la conexión del jugador (player_id) y su source.
Entrega de Dinero: Llama a ESX.GetPlayerFromId(source).addMoney(amount) o a la función correspondiente para dinero limpio/sucio.
Entrega de Ítems: Llama a ESX.GetPlayerFromId(source).addInventoryItem(itemName, count).
Dispara un evento al cliente del jugador (TriggerClientEvent) para mostrar una notificación en pantalla: "¡Tu compra ha sido acreditada!".
4. Fase III: Economía Dinámica y Motor de Gasto (Liviano)
La economía se centra en el ajuste de valores esenciales (salarios y precios) y la inversión en negocios de RP para mantener el gasto de capital y evitar el acaparamiento.
4.1. El Modelo de Economía (Anti-Acumulación y Anti-Wipe)
El sistema utiliza el TotalMoney como métrica principal para ajustar la equidad salarial y los precios.
Propósito:
Ajuste de Valores: Mantiene la PPA (Paridad de Poder Adquisitivo) para los no pagadores y hace que el dinero pierda valor para los pagadores (inflación), forzando el gasto en activos.
Impulso al Gasto: Los negocios actúan como un gran motor de demanda de capital que luego se redistribuye.
Variables Críticas de la BD:
Variable
Descripción
Uso
TotalMoney
Suma de todo el dinero de todos los jugadores en la BD.
Métrica principal para el cálculo de ajuste.
MoneySinkOptimal
Cantidad ideal de dinero que debería circular en el servidor.
Umbral de comparación.
BasePrices
Tabla con los precios iniciales de todos los ítems de tienda (autos, casas, yates).
Precio que se ajustará dinámicamente.
GlobalMinWage
El salario mínimo base que se ajustará.
Salario de referencia para trabajos.

4.2. Motor de Ajuste de Valores (Dokploy Cron Job)
Esta tarea programada se ejecuta automáticamente (e.g., cada 6 o 12 horas) para actualizar la inflación en el servidor.
Cálculo de la Tasa de Ajuste (Inflación/Deflación):$$\text{Tasa de Ajuste} = (\frac{\text{TotalMoney}}{\text{MoneySinkOptimal}} - 1) \times \text{Factor de Sensibilidad}$$
Actualización de Precios (Bienes, Autos, Casas):$$\text{Nuevo Precio} = \text{Precio Actual} \times (1 + \text{Tasa de Ajuste})$$
Salario Mínimo Dinámico: Para mantener la PPA de los no pagadores:$$\text{Nuevo Salario Mínimo} = \text{GlobalMinWage} \times (1 + \text{Tasa de Ajuste})$$
4.3. Sistemas de Negocios de RP (Inversión y Gasto de Capital)
Se establecen dos tipos de negocios para impulsar el gasto de capital (Money Sink inicial) y ofrecer oportunidades de inversión y RP.
A. Negocios de Lujo Nocturnos (Clubes Nocturnos)
Función: Motor de Inversión y Distribución de Capital. Permite a los jugadores con mucho capital invertir y a los propietarios obtener grandes beneficios, impulsando la compra de bienes de lujo.
Mecánica Dokploy: Un Cron Job diario/semanal calcula las ganancias y distribuye automáticamente a propietarios e inversores (ver 4.4).
Integración ESX: Usará ESX.GiveMoney para los pagos masivos calculados por Dokploy.
B. Negocios Diurnos (Food Trucks/Puestos de Comida)
Función: Motor de Micro-Gasto y RP Activo. Ideal para jugadores con menos capital o que buscan un ingreso activo de día.
Flujo: El precio de la licencia y el stock de ingredientes se ajusta con la Tasa de Ajuste. El jugador debe gastar su dinero para comprar ingredientes a un NPC/al servidor y luego vender los productos finales. Esto es un "soft-sink" constante.
Integración ESX: Se basa en funciones estándar de inventario y venta (P2P o P2NPC).
4.4. Flujo de Negocios Invertibles (Dokploy Cron Job Semanal/Diario)
Cálculo de la Ganancia Bruta: La API calcula la ganancia de cada negocio.$$\text{Ganancia Bruta} = \text{Base Profit Rate} \times (1 + \text{Tasa de Ajuste (Inflación)})$$
Distribución de Ganancias: La Ganancia Bruta se distribuye entre:
Propietario (50%): Acreditado directamente.
Inversores (50%): Distribuido entre todos los inversores en proporción a su porcentaje de participación.
Ejecución en FiveM: La API de Dokploy utiliza el endpoint seguro de FiveM (Fase II) para ejecutar las funciones ESX.GiveMoney a los propietarios e inversores.
4.5. Mecanismos de Control Esenciales y Livianos
Mecanismo
Descripción
Función Económica
Desgaste y Mantenimiento
Costos obligatorios y periódicos (semanales) para ítems de alto valor como vehículos (seguros), casas (impuesto predial) o el propio club nocturno/Food Truck.
Money Sink Constante: Retira dinero de la circulación de manera predecible y obligatoria, sin necesidad de impuestos variables.
Costo de Capital Inicial
El precio de compra de los clubes nocturnos debe ser muy alto (e.g., $50-$100 millones) y el precio de las inversiones debe ser considerable.
Money Sink de Capital: Retira sumas masivas de capital de la circulación (a través de pagos reales o juego intenso).

4.6. Reflejo en la UI del Jugador
Para la participación del jugador, el sistema debe comunicar el estado de la economía de forma simple:
FiveM Client (UI): Implementar un panel informativo o un elemento en el HUD.
Solicitud de Datos: El cliente solicita la Tasa de Ajuste y el estado económico actual al servidor de FiveM.
Indicador Visual: Muestra un estado claro y conciso:
Indicador: 🟢 (Estable) / 🟡 (Alerta - Subiendo) / 🔴 (Crisis - Inflación Alta).
Detalle: "Tasa de Ajuste: +X%"
5. Resumen de Pila Tecnológica
Rol
Tecnología
Comentario
Backend/API (Dokploy)
Node.js (Express)
Excelente para Webhooks, API y Cron Jobs.
Base de Datos
MySQL/MariaDB
Comúnmente usado en FiveM (ESX), ideal para transacciones y datos de jugador, precios y negocios.
Cliente FiveM
LUA, NUI (HTML/JS/CSS)
LUA para la lógica del juego, NUI para la interfaz de compra, HUD y la UI de Inversiones/Negocios.
Pago
Stripe, PayPal, MP
Proporcionan Webhooks robustos para notificar el éxito del pago.
Gestión del Servidor
Dokploy
Maneja el despliegue del Backend API y la ejecución de los Cron Jobs de forma automática.


