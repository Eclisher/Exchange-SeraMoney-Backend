import { pool } from "../config/database.js";

export const getPendingTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.type,
        t.crypto,
        t.network,
        t.amount_ariary,
        t.amount_crypto,
        t.wallet_address,
        t.status,
        t.created_at,
        u.full_name,
        u.phone_number,
        u.mobile_money_type
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      WHERE t.status = 'EN_ATTENTE'
      ORDER BY t.created_at ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.type,
        t.crypto,
        t.network,
        t.amount_ariary,
        t.amount_crypto,
        t.wallet_address,
        t.status,
        t.notes,
        t.created_at,
        t.updated_at,
        u.full_name AS client_name,
        u.phone_number,
        u.mobile_money_type
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const updateTransactionStatus = async (req, res) => {
  const { transactionId } = req.params;
  const { status, notes } = req.body;
  const admin_id = req.user.id;

  const allowedStatus = ["PAYE", "CRYPTO_ENVOYEE", "TERMINE", "REFUSE"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Statut non autorisé" });
  }

  try {
    await pool.query(
      `UPDATE transactions
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, notes || "", transactionId]
    );
    await pool.query(
      `INSERT INTO admin_logs (admin_id, transaction_id, action)
       VALUES ($1, $2, $3)`,
      [admin_id, transactionId, `Statut changé → ${status}`]
    );

    res.json({ message: "Statut mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
