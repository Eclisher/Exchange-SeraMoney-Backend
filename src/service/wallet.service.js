import { pool } from "../config/database.js";

async function createWallet(data) {
  const { lien, name, address = [] } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const walletResult = await client.query(
      `INSERT INTO wallets (lien, name, address)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [lien, name, address],
    );
    const wallet = walletResult.rows[0];
    
    await client.query("COMMIT");
    return wallet;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
  async function getAllWallets() {
    const result = await pool.query(`
      SELECT * FROM wallets
    `);
    return result.rows;
  }

  async function getWalletById(id) {
    const result = await pool.query(`
      SELECT * FROM wallets
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  async function updateWallet(id, data) {
    const { lien, name, address } = data;
    const result = await pool.query(`
      UPDATE wallets
      SET lien = $1, name = $2, address = $3
      WHERE id = $4
      RETURNING *
    `, [lien, name, address, id]);
    return result.rows[0];
  }

  async function deleteWallet(id) {
    const result = await pool.query(`
      DELETE FROM wallets
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }


export { createWallet, getAllWallets, getWalletById, updateWallet, deleteWallet };