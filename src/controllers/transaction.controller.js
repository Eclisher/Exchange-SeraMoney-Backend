import { pool } from "../config/database.js";

export const createTransaction = async (req, res) => {
  const {
    type,
    crypto,
    network,
    amount_crypto,
    amount_ariary,
    wallet_address,
    notes,
  } = req.body;
  const user_id = req.user.id;

  if (!type || !crypto || (!amount_crypto && !amount_ariary)) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, crypto, network, amount_crypto, amount_ariary, wallet_address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        user_id,
        type,
        crypto,
        network,
        amount_crypto,
        amount_ariary,
        wallet_address,
        notes || "",
      ]
    );

    res
      .status(201)
      .json({
        message: "Transaction enregistrée",
        transaction: result.rows[0],
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUserTransactions = async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
