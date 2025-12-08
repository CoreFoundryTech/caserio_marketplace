require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const axios = require('axios'); // Para comunicar con FiveM
const crypto = require('crypto'); // Para validar firmas

const app = express();
app.use(bodyParser.json());

// Configuración de conexión
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
};

const pool = mysql.createPool(dbConfig);

// Middleware de Autenticación Simple (API Key)
const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
};

// ==========================================
// 1. MOTOR DE ECONOMÍA (CRON JOB)
// ==========================================
async function calculateEconomy() {
    console.log('📈 Iniciando cálculo de inflación...');
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Calcular dinero total (Bank + Money de users)
        // NOTA: Si usas ESX Legacy nuevo, accounts es un JSON.
        const [users] = await connection.query(`SELECT accounts FROM users`);
        let totalMoney = 0;

        users.forEach(u => {
            if (u.accounts) {
                try {
                    const acc = JSON.parse(u.accounts);
                    totalMoney += (Number(acc.money) || 0) + (Number(acc.bank) || 0);
                } catch (e) {}
            }
        });

        // 2. Leer métricas actuales
        const [metrics] = await connection.query('SELECT * FROM economy_metrics WHERE id = 1');
        if (metrics.length === 0) {
            console.log('⚠️ No hay métricas inicializadas.');
            await connection.rollback();
            return;
        }
        const metric = metrics[0];

        // 3. Calcular Tasa de Ajuste
        // Fórmula: (DineroActual / DineroOptimo - 1) * Sensibilidad
        let rate = (totalMoney / metric.optimal_money_sink - 1) * metric.factor_sensibility;
        
        // Tope de seguridad (+/- 5%)
        if (rate > 0.05) rate = 0.05;
        if (rate < -0.05) rate = -0.05;

        console.log(`💰 Dinero Total: $${totalMoney.toLocaleString()} | Tasa Calculada: ${(rate*100).toFixed(4)}%`);

        // 4. Actualizar Base de Datos
        const newGlobalRate = Number(metric.adjustment_rate) + rate;
        
        // Actualizar métrica global
        await connection.query('UPDATE economy_metrics SET total_money_circulating = ?, adjustment_rate = ? WHERE id = 1', [totalMoney, newGlobalRate]);
        
        // Actualizar precios de productos (Autos, Casas, Negocios)
        await connection.query('UPDATE dynamic_prices SET current_price = CAST(base_price * (1 + ?) AS UNSIGNED)', [newGlobalRate]);
        
        // Actualizar salario mínimo
        await connection.query('UPDATE economy_metrics SET global_min_wage = CAST(500 * (1 + ?) AS UNSIGNED) WHERE id = 1', [newGlobalRate]);

        await connection.commit();
        console.log(`✅ Economía actualizada. Nueva Inflación Acumulada: ${(newGlobalRate*100).toFixed(2)}%`);

    } catch (e) {
        await connection.rollback();
        console.error('❌ Error calculando economía:', e);
    } finally {
        connection.release();
    }
}

// Ejecutar cada 6 horas automáticamente
cron.schedule('0 */6 * * *', calculateEconomy);

// Endpoint para forzar actualización manual (Protegido)
app.post('/api/force-update', authMiddleware, async (req, res) => {
    await calculateEconomy();
    res.json({ status: 'ok', message: 'Cálculo forzado ejecutado' });
});

// ==========================================
// 2. SISTEMA DE PAGOS (WEBHOOKS - MERCADO PAGO)
// ==========================================
app.post('/api/webhook/payment', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type; // Mercado Pago envía 'topic' o 'type'

    // 1. Validar Origen (Básico) - En producción usar validación de firma x-signature
    // const signature = req.headers['x-signature']; 
    // if (!isValidSignature(signature)) return res.status(401).send();

    console.log('🔔 Webhook de Mercado Pago recibido:', topic);

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];
            
            // 2. Consultar estado real a Mercado Pago (Doble verificación recomendada)
            // const payment = await mercadopago.payment.findById(paymentId);
            // const status = payment.body.status;
            // const externalReference = payment.body.external_reference; // Aquí guardamos el player_id

            // MOCK para el ejemplo (Asumimos que viene en el body o lo simulamos)
            const status = 'approved'; 
            const externalReference = req.body.data ? req.body.data.id : 'REF_MOCK'; 
            
            if (status === 'approved') {
                const connection = await pool.getConnection();
                try {
                    // 3. Actualizar BD
                    // await connection.query(...)

                    // 4. Notificar a FiveM (Fase II)
                    const fivemUrl = process.env.FIVEM_SERVER_URL + '/deliver-asset';
                    const fivemToken = process.env.FIVEM_SECRET_TOKEN;

                    // await axios.post(fivemUrl, ...)
                    console.log(`✅ Pago ${paymentId} aprobado. Notificando a FiveM...`);

                } catch (dbError) {
                    console.error('❌ Error DB:', dbError);
                } finally {
                    connection.release();
                }
            }
        }
    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
    }

    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('🚀 Economy API lista en puerto 3000');
    // Ejecutar cálculo inicial al arrancar para verificar conexión
    calculateEconomy(); 
});