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

  if (!type || !crypto || !network) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  if (type === "ACHAT") {
    if (!amount_ariary || !wallet_address) {
      return res.status(400).json({
        message:
          "Pour un ACHAT, le montant en Ariary et l'adresse wallet sont obligatoires",
      });
    }
  }

  if (type === "VENTE") {
    if (!amount_crypto) {
      return res.status(400).json({
        message: "Pour une VENTE, le montant crypto est obligatoire",
      });
    }
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
        amount_crypto || null,
        amount_ariary || null,
        type === "ACHAT" ? wallet_address : null,
        notes || "",
      ]
    );

    const transaction = result.rows[0];
    if (type === "ACHAT") {
      return res.status(201).json({
        message: "Demande d'achat enregistrée",
        data: {
          id: transaction.id,
          type: transaction.type,
          crypto: transaction.crypto,
          network: transaction.network,
          amount_ariary: transaction.amount_ariary,
          wallet_address: transaction.wallet_address,
          status: transaction.status,
        },
      });
    }
    const userResult = await pool.query(
      "SELECT phone_number, mobile_money_type FROM users WHERE id = $1",
      [user_id]
    );

    const user = userResult.rows[0];

    return res.status(201).json({
      message: "Demande de retrait enregistrée",
      data: {
        id: transaction.id,
        type: transaction.type,
        crypto: transaction.crypto,
        network: transaction.network,
        amount_crypto: transaction.amount_crypto,
        mobile_money: {
          phone_number: user.phone_number,
          type: user.mobile_money_type,
        },
        status: transaction.status,
      },
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
