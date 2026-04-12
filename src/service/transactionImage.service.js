import { pool } from "../config/database.js";

export const addTransactionImage = async ({
  transaction_id,
  base64,
  title,
}) => {
  const result = await pool.query(
    `
    INSERT INTO transaction_images (transaction_id, image_base64, title)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [transaction_id, base64, title]
  );

  return result.rows[0];
};

export const getImagesByTransaction = async (transaction_id) => {
  const result = await pool.query(
    `
    SELECT id, image_base64, title, created_at
    FROM transaction_images
    WHERE transaction_id = $1
    ORDER BY created_at DESC
  `,
    [transaction_id]
  );

  return result.rows;
};