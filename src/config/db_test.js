import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(" PostgreSQL connecté avec succès");
    console.log(" Heure DB :", result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error(" Erreur de connexion PostgreSQL");
    console.error(error.message);
    process.exit(1);
  }
})();
