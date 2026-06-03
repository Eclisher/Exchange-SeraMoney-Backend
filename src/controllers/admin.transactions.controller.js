import { pool } from "../config/database.js";
import { sendTransactionCompletedEmail } from "../service/mailService.js";

// ── inchangé ──────────────────────────────────────────────────────────────────
export const getPendingTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, t.type, t.crypto, t.network,
        t.amount_ariary, t.amount_crypto,
        t.wallet_address, t.status, t.created_at,
        w.name AS wallet_name,
        w.lien AS wallet_lien,
        u.full_name,
        u.phone_number,
        u.mobile_money_type
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      WHERE t.status = 'EN_ATTENTE'
      ORDER BY t.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── inchangé ──────────────────────────────────────────────────────────────────
export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id, t.type, t.crypto, t.network,
        t.amount_ariary, t.amount_crypto,
        t.wallet_address, t.status, t.notes,
        t.reference, t.created_at, t.updated_at,
        w.name AS wallet_name,
        w.lien AS wallet_lien,
        u.full_name AS client_name,
        u.phone_number,
        u.mobile_money_type
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ── modifié : ajout email ──────────────────────────────────────────────────────
export const updateTransactionStatus = async (req, res) => {
  const { transactionId } = req.params;
  const { status, notes } = req.body;
  const admin_id = req.user.id;

  const allowedStatus = ["PAYE", "CRYPTO_ENVOYEE", "TERMINE", "REFUSE"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Statut non autorisé" });
  }

  try {
    // 1. Récupérer les infos complètes + email du client
    const { rows } = await pool.query(
      `SELECT
         t.id, t.type, t.crypto, t.network, t.reference,
         t.amount_ariary, t.amount_crypto, t.wallet_address,
        u.mobile_money_type,
         w.name  AS wallet_name,
         u.full_name  AS client_name,
         u.phone_number,
         u.email AS client_email
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN wallets w ON t.wallet_id = w.id
       WHERE t.id = $1`,
      [transactionId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }

    const transaction = rows[0];

    // 2. Mettre à jour le statut
    await pool.query(
      `UPDATE transactions
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, notes || "", transactionId],
    );

    // 3. Log admin
    await pool.query(
      `INSERT INTO admin_logs (admin_id, transaction_id, action)
       VALUES ($1, $2, $3)`,
      [admin_id, transactionId, `Statut changé → ${status}`],
    );

    // 4. Email uniquement si TERMINE et email disponible
    if (status === "TERMINE" && transaction.client_email) {
      sendTransactionCompletedEmail(transaction.client_email, {
        ...transaction,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      }).catch((err) => console.error("[Mail] Échec envoi:", err.message));
    }

    res.json({ message: "Statut mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
