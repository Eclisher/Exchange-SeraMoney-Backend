-- ================================
-- SERAMONEY EXCHANGE - DATABASE V1
-- PostgreSQL
-- ================================

-- 1️⃣ Création de la base de données
CREATE DATABASE seramoney;

-- Se connecter à la base (à exécuter automatiquement selon l’outil)
\c seramoney;

-- 2️⃣ Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- 3️⃣ TABLE : users
-- Clients et Admins
-- ================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    mobile_money_type VARCHAR(20) NOT NULL, -- MVola | OrangeMoney
    role VARCHAR(10) NOT NULL DEFAULT 'CLIENT', -- CLIENT | ADMIN
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- 4️⃣ TABLE : transactions
-- Achat / Vente crypto
-- ================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL, -- ACHAT | VENTE
    crypto VARCHAR(10) NOT NULL, -- USDT | BTC | TRX | LTC
    network VARCHAR(10) NOT NULL, -- TRC20 | BEP20
    amount_crypto NUMERIC(18,8),
    amount_ariary NUMERIC(18,2),
    wallet_address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ================================
-- 5️⃣ TABLE : admin_logs
-- Logs des actions admin
-- ================================
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    transaction_id UUID,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin
        FOREIGN KEY (admin_id)
        REFERENCES users(id),

    CONSTRAINT fk_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
);

-- ================================
-- 6️⃣ INDEXES (performance)
-- ================================
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ================================
-- 7️⃣ ENUM LOGIQUE (commentaire)
-- ================================
-- Status possibles pour transactions :
-- EN_ATTENTE
-- PAYE
-- CRYPTO_ENVOYEE
-- TERMINE
-- REFUSE


