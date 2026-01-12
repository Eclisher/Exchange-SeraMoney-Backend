import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../config/mail.js";

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP ERROR:", error);
  } else {
    console.log("SMTP prêt à envoyer des emails");
  }
});
const isValidPhoneForMobileMoney = (phone, mobileMoneyType) => {
  const cleaned = phone.replace(/\s+/g, "");
  const patterns = {
    ORANGE: /^(?:\+261|0)(32|37)\d{7}$/,
    MVOLA: /^(?:\+261|0)(34|38)\d{7}$/,
  };

  const pattern = patterns[mobileMoneyType.toUpperCase()];
  if (!pattern) return false;

  return pattern.test(cleaned);
};
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


export const register = async (req, res) => {
  const { full_name, phone_number, email, mobile_money_type, password } =
    req.body;

  if (
    !full_name ||
    !phone_number ||
    !email ||
    !mobile_money_type ||
    !password
  ) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Adresse email invalide" });
  }

  if (!isValidPhoneForMobileMoney(phone_number, mobile_money_type)) {
    return res.status(400).json({
      message: "Numéro incohérent avec le type Mobile Money sélectionné",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
       (full_name, phone_number, email, mobile_money_type, password_hash)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        full_name,
        phone_number,
        email.toLowerCase(),
        mobile_money_type.toUpperCase(),
        hash,
      ]
    );

    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: "Numéro ou email déjà utilisé",
    });
  }
};


export const login = async (req, res) => {
  const { phone_number, email, full_name, password } = req.body;

  if ((!phone_number || !email || !full_name) && !password) {
    return res.status(400).json({ message: "Champs manquants" });
  }
  let result;

  try {
    if (phone_number) {
      result = await pool.query(
        "SELECT * FROM users WHERE phone_number = $1 AND is_active = true",
        [phone_number]
      );
    } else if (email) {
      result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND is_active = true",
        [email.toLowerCase()]
      );
    } else if (full_name) {
      result = await pool.query(
        "SELECT * FROM users WHERE full_name = $1 AND is_active = true",
        [full_name]
      );
    }

    if (!result.rows.length) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        phone_number,
        email,
        mobile_money_type,
        role,
        is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND is_active = true",
    [email.toLowerCase()]
  );

  if (!result.rows.length) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  const user = result.rows[0];

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 15 * 60 * 1000); 

  await pool.query(
    `UPDATE users 
     SET reset_password_token=$1, reset_password_expires=$2
     WHERE id=$3`,
    [token, expires, user.id]
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Support Crypto" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour ${user.full_name},</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ce lien expire dans 15 minutes.</p>
    `,
  });

  res.json({ message: "Email de réinitialisation envoyé" });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas" });
  }

  const result = await pool.query(
    `SELECT * FROM users 
     WHERE reset_password_token=$1 
     AND reset_password_expires > NOW()`,
    [token]
  );

  if (!result.rows.length) {
    return res.status(400).json({ message: "Token invalide ou expiré" });
  }

  const user = result.rows[0];
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `UPDATE users 
     SET password_hash=$1, 
         reset_password_token=NULL, 
         reset_password_expires=NULL
     WHERE id=$2`,
    [hash, user.id]
  );

  res.json({ message: "Mot de passe réinitialisé avec succès" });
};
