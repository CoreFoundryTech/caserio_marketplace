-- ============================================
-- CASERIO MARKETPLACE - TRANSACTION AUDIT TABLE
-- ============================================
-- Ejecutar este script en tu base de datos FiveM
-- ============================================

CREATE TABLE IF NOT EXISTS caserio_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    txn_id VARCHAR(64) UNIQUE NOT NULL COMMENT 'ID único de transacción (UUID o Tebex TXN)',
    citizenid VARCHAR(50) NOT NULL COMMENT 'ID del jugador',
    type ENUM('tebex_coins', 'buy_vehicle', 'buy_weapon', 'buy_house') NOT NULL COMMENT 'Tipo de transacción',
    item_data JSON NOT NULL COMMENT 'Datos del item: {model, plate, attachments, etc}',
    price INT DEFAULT 0 COMMENT 'Precio en coins (0 si es Tebex)',
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING' COMMENT 'Estado de la transacción',
    error_message TEXT NULL COMMENT 'Mensaje de error si falló',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Momento de creación',
    completed_at TIMESTAMP NULL COMMENT 'Momento de finalización',
    
    INDEX idx_status (status),
    INDEX idx_citizenid (citizenid),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- SELECT * FROM caserio_transactions LIMIT 10;
