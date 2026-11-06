import { pool } from "../config/database.js";
import { sendNewRequestNotificationEmail } from "../service/mailService.js";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || undefined;
const CO_ADMIN_EMAIL =
  process.env.CO_ADMIN_EMAIL || undefined;

export const notifyAdminNewRequest = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT
         t.id, t.type, t.crypto, t.network, t.reference,
         t.amount_ariary, t.amount_crypto, t.wallet_address,
         t.status, t.created_at,
         w.name AS wallet_name,
         u.full_name AS client_name,
         u.phone_number,
         u.mobile_money_type,
         u.email AS client_email
       FROM transactions t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN wallets w ON t.wallet_id = w.id
       WHERE t.id = $1
         AND t.user_id = $2
         AND EXISTS (
           SELECT 1 FROM transaction_images ti
           WHERE ti.transaction_id = t.id
         )`,
      [transactionId, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }

    await sendNewRequestNotificationEmail({
      to: ADMIN_EMAIL,
      cc: CO_ADMIN_EMAIL,
      transaction: rows[0],
    });

    res.json({ message: "Notification envoyée" });
  } catch (err) {
    console.error("[Notify admin]", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'envoi de la notification" });
  }
};
