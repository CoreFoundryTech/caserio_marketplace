require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
};

const pool = mysql.createPool(dbConfig);

// Health Check & DB Verify
app.get('/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        console.error('❌ DB Connection Error:', error);
        res.status(500).json({ status: 'error', db: error.message || 'Unknown error' });
    }
});

const mercadopago = require('mercadopago');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuración Mercado Pago
const client = new mercadopago.MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
const preference = new mercadopago.Preference(client);

// ... (DB Config remains the same)

// ==========================================
// SHARK CARDS / PAGOS
// ==========================================

// 1. Crear Preferencia de Pago
app.post('/api/create-preference', async (req, res) => {
    const { title, price, playerId, productId } = req.body;
    const transactionId = uuidv4();

    try {
        const body = {
            items: [
                {
                    id: productId,
                    title: title,
                    quantity: 1,
                    unit_price: Number(price),
                    currency_id: 'CLP', // Ajustar moneda según necesidad
                },
            ],
            back_urls: {
                success: "https://tuserver.com/success",
                failure: "https://tuserver.com/failure",
                pending: "https://tuserver.com/pending",
            },
            auto_return: "approved",
            external_reference: transactionId, // Usamos esto para rastrear la transacción
            metadata: {
                player_id: playerId,
                product_id: productId
            },
            notification_url: `${process.env.WEBHOOK_URL}/api/webhook/payment` // URL pública de tu API (ngrok o dominio real)
        };

        const result = await preference.create({ body });

        // Guardar transacción PENDIENTE en BD
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO transactions (id, player_id, amount, product_id, status) VALUES (?, ?, ?, ?, ?)',
            [transactionId, playerId, price, productId, 'PENDING']
        );
        connection.release();

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('❌ Error creando preferencia:', error);
        res.status(500).json({ error: 'Error al crear pago' });
    }
});

// 2. Webhook Mercado Pago
app.post('/api/webhook/payment', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;

    console.log('🔔 Webhook recibido:', topic, query.id || query['data.id']);

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];

            // Consultar estado real a Mercado Pago
            // const payment = await new mercadopago.Payment(client).get({ id: paymentId });
            // const status = payment.status;
            // const transactionId = payment.external_reference;

            // MOCK para desarrollo (Asumimos aprobado si llega el webhook)
            // En producción, DESCOMENTAR la consulta real arriba
            const status = 'approved';
            // Necesitamos el external_reference (transactionId) que guardamos al crear la preferencia.
            // En el mock no lo tenemos directo sin consultar a MP, así que simularemos:
            // OJO: En producción esto DEBE venir de la consulta a MP.

            if (status === 'approved') {
                // Aquí deberíamos actualizar la BD usando el transactionId real
                // Como es un ejemplo sin consulta real, solo logueamos.
                console.log(`✅ Pago ${paymentId} aprobado. Procesando entrega...`);

                // Lógica de entrega a FiveM (Fase 4)
                // await deliverAssetToFiveM(playerId, productId);
            }
        }
    } catch (error) {
        console.error('❌ Error webhook:', error);
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
