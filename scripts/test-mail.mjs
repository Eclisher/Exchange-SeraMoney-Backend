import dotenv from "dotenv";
import { Resend } from "resend";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const resendApiKey = process.env.RESEND_API_KEY;
const mailFrom = process.env.MAIL_FROM;

if (!resendApiKey) {
  console.error("RESEND_API_KEY manquant dans le .env");
  process.exit(1);
}

if (!mailFrom) {
  console.error("MAIL_FROM manquant dans le .env");
  process.exit(1);
}

const resend = new Resend(resendApiKey);

try {
  const response = await resend.emails.send({
    from: mailFrom,
    to: ["hei.harizo@gmail.com"],
    subject: "Test Resend depuis Seramoney",
    html: `
      <h1>Test réussi 🎉</h1>
      <p>Votre configuration Resend fonctionne correctement.</p>
    `,
  });

  if (response?.error) {
    throw response.error;
  }

  console.log("✓ Email envoyé avec succès");
  console.log(response);
} catch (error) {
  console.error("✗ Erreur Resend");
  console.error(error);
  process.exit(1);
}
