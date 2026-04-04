import "./load-env.js";
import app from "./app.js";
import { transporter, isMailConfigured } from "./config/mail.js";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(` Backend lancé sur http://localhost:${PORT}`);
  server.ref();

  if (isMailConfigured) {
    transporter.verify((error) => {
      if (error) {
        console.error("SMTP ERROR:", error);
      } else {
        console.log("SMTP prêt à envoyer des emails");
      }
    });
  } else {
    console.warn(
      "SMTP: MAIL_USER / MAIL_PASS absents — vérifiez votre fichier .env pour l’envoi d’emails."
    );
  }
});
