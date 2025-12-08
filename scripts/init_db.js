require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
};

async function initSchema() {
    console.log('🔄 Connecting to database to verify schema...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully.');

        // 1. Economy Metrics Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS economy_metrics (
                id INT PRIMARY KEY AUTO_INCREMENT,
                total_money_circulating BIGINT DEFAULT 0,
                optimal_money_sink BIGINT DEFAULT 100000000,
                factor_sensibility DECIMAL(10, 4) DEFAULT 0.0010,
                adjustment_rate DECIMAL(10, 4) DEFAULT 0.0000,
                global_min_wage INT DEFAULT 500,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "economy_metrics" verified.');

        // Initialize default metrics if empty
        const [rows] = await connection.query('SELECT * FROM economy_metrics WHERE id = 1');
        if (rows.length === 0) {
            await connection.query(`
                INSERT INTO economy_metrics (id, total_money_circulating, optimal_money_sink, factor_sensibility)
                VALUES (1, 0, 100000000, 0.0010)
            `);
            console.log('✅ Default economy metrics inserted.');
        }

        // 2. Dynamic Prices Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS dynamic_prices (
                id INT PRIMARY KEY AUTO_INCREMENT,
                item_name VARCHAR(255) NOT NULL,
                base_price INT NOT NULL,
                current_price INT NOT NULL,
                category VARCHAR(50),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "dynamic_prices" verified.');

        // 3. Transactions Table (Shark Cards / Payments)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(255) PRIMARY KEY,
                player_id VARCHAR(100) NOT NULL,
                provider_id VARCHAR(255),
                amount DECIMAL(10, 2),
                currency VARCHAR(10) DEFAULT 'USD',
                product_id VARCHAR(100),
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "transactions" verified.');

    } catch (error) {
        console.error('❌ Schema Initialization Failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

initSchema();
