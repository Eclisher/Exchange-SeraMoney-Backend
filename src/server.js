import "./load-env.js";
import app from "./app.js";
import { transporter, isMailConfigured } from "./config/mail.js";

const PORT = Number(process.env.PORT);

const server = app.listen(PORT, () => {
  console.log(` Backend lancé sur http://localhost:${PORT}`);
  server.ref();

  if (isMailConfigured) {
    transporter.verify((error) => {
      if (error) {
        console.error("SMTP ERROR:", error);
        console.error(
          `SMTP config: host=${process.env.MAIL_HOST || "smtp.gmail.com"} port=${
            process.env.MAIL_PORT || 587
          } secure=${process.env.MAIL_SECURE === "true"} forceIPv4=${
            process.env.MAIL_FORCE_IPV4 === "true"
          }`,
        );
      } else {
        console.log("SMTP prêt à envoyer des emails");
      }
    });
  } else {
    console.warn(
      "SMTP: MAIL_USER / MAIL_PASS absents — vérifiez votre fichier .env pour l’envoi d’emails.",
    );
  }
});
