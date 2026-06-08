import "./load-env.js";
import app from "./app.js";
import { isMailConfigured } from "./config/mail.js";

const PORT = Number(process.env.PORT);

const server = app.listen(PORT, () => {
  console.log(` Backend lancé sur http://localhost:${PORT}`);
  server.ref();

  if (isMailConfigured) {
    console.log("Resend prêt à envoyer des emails");
  } else {
    console.warn(
      "Resend: RESEND_API_KEY ou MAIL_FROM absents — vérifiez votre fichier .env pour l’envoi d’emails.",
    );
  }
});
