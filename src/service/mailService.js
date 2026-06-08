import { resend, isMailConfigured, mailSenderAddress } from "../config/mail.js";

function row(label, value) {
  return `
  <tr>
    <td style="padding:8px 0;color:#64748b;font-size:13px;vertical-align:top;width:45%;">${label}</td>
    <td style="padding:8px 0;font-size:13px;vertical-align:top;width:55%;">${value}</td>
  </tr>`;
}

function buildTransactionEmail(transaction) {
  const {
    client_name,
    reference,
    type,
    crypto,
    network,
    amount_crypto,
    amount_ariary,
    wallet_address,
    wallet_name,
    mobile_money_type,
    phone_number,
    notes,
    updated_at,
  } = transaction;

  const isAchat = type === "ACHAT";
  const typeLabel = isAchat ? "Achat" : "Vente";
  const typeColor = isAchat ? "#22c55e" : "#3b82f6";

  const formattedDate = new Date(updated_at || Date.now()).toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const mobileMoney = mobile_money_type
    ? { MVOLA: "MVola", ORANGE: "OrangeMoney" }[
        mobile_money_type.toUpperCase()
      ] || mobile_money_type
    : null;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Transaction terminée – SéraMoney</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1d2e 0%,#12151f 100%);border-radius:20px 20px 0 0;padding:40px 40px 32px;text-align:center;border:1px solid #2a2d3e;border-bottom:none;">
            <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:14px 24px;margin-bottom:24px;">
              <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:1px;">💱 SéraMoney</span>
            </div>
            <br/>
            <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#22c55e25,#16a34a15);border:2px solid #22c55e50;border-radius:50%;line-height:72px;margin:12px auto;">
            </div>
            <h1 style="color:#f8fafc;font-size:24px;font-weight:700;margin:16px 0 8px;">Transaction Terminée !</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0;">Votre échange a été complété avec succès.</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#12151f;padding:32px 40px;border:1px solid #2a2d3e;border-top:none;border-bottom:none;">

            <p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Bonjour <strong style="color:#f8fafc;">${client_name}</strong>,<br/><br/>
              Nous avons le plaisir de vous confirmer que votre transaction est
              <strong style="color:#22c55e;">terminée</strong>.
              Voici le récapitulatif complet de votre échange :
            </p>

            <!-- Recap card -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#1a1d2e;border-radius:16px;border:1px solid #2a2d3e;margin-bottom:24px;">
              <tr>
                <td style="background:linear-gradient(90deg,#6366f115,#8b5cf610);
                           padding:14px 24px;border-bottom:1px solid #2a2d3e;
                           border-radius:16px 16px 0 0;">
                  <span style="color:#a5b4fc;font-size:11px;font-weight:700;
                               text-transform:uppercase;letter-spacing:1.5px;">
                    📋 Récapitulatif
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${row("Référence", `<span style="font-family:monospace;color:#a5b4fc;font-size:12px;">${reference}</span>`)}
                    ${row("Type", `<span style="background:${typeColor}25;color:${typeColor};padding:3px 14px;border-radius:20px;font-size:12px;font-weight:700;">${typeLabel}</span>`)}
                    ${row("Cryptomonnaie", `<strong style="color:#f8fafc;">${crypto}</strong>&nbsp;<span style="color:#475569;font-size:12px;">(${network})</span>`)}
                    ${row("Montant crypto", `<strong style="color:#f8fafc;font-size:15px;">${parseFloat(amount_crypto)} ${crypto}</strong>`)}
                    ${row("Montant Ariary", `<strong style="color:#f8fafc;font-size:15px;">${parseFloat(amount_ariary).toLocaleString("fr-FR")} Ar</strong>`)}
                    ${wallet_name ? row("Portefeuille", `<span style="color:#94a3b8;">${wallet_name}</span>`) : ""}
                    ${wallet_address ? row("Adresse", `<span style="font-family:monospace;font-size:11px;color:#64748b;word-break:break-all;">${wallet_address}</span>`) : ""}
                    ${mobileMoney ? row("Mobile Money", `<span style="color:#94a3b8;">${mobileMoney}</span>`) : ""}
                    ${phone_number ? row("Téléphone", `<span style="color:#94a3b8;">${phone_number}</span>`) : ""}
                    ${row("Finalisé le", `<span style="color:#94a3b8;">${formattedDate}</span>`)}
                    ${notes ? row("Notes", `<span style="color:#94a3b8;font-style:italic;">${notes}</span>`) : ""}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Status badge -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#22c55e12,#16a34a08);
                     border:1px solid #22c55e30;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 24px;text-align:center;">
                  <span style="color:#22c55e;font-size:14px;font-weight:700;">
                    ● Statut : TERMINÉ
                  </span>
                </td>
              </tr>
            </table>

            <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0;">
              Pour toute question concernant cette transaction, contactez notre support
              en indiquant votre référence <span style="font-family:monospace;color:#a5b4fc;">${reference}</span>.<br/><br/>
              Merci de votre confiance en <strong style="color:#f8fafc;">SéraMoney</strong>.
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d0f18;border-radius:0 0 20px 20px;
                     padding:24px 40px;text-align:center;
                     border:1px solid #2a2d3e;border-top:1px solid #1e2030;">
            <p style="color:#334155;font-size:12px;margin:0 0 6px;">
              © ${new Date().getFullYear()} SéraMoney — Plateforme d'échange de cryptomonnaies à Madagascar
            </p>
            <p style="color:#1e293b;font-size:11px;margin:0;">
              Cet email est généré automatiquement, merci de ne pas y répondre.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendTransactionCompletedEmail(toEmail, transaction) {
  if (!isMailConfigured) {
    console.warn("[Mail] Resend non configuré — email non envoyé.");
    return;
  }

  await resend.emails.send({
    from: mailSenderAddress,
    to: toEmail,
    subject: `Transaction terminée – Réf. ${transaction.reference}`,
    html: buildTransactionEmail(transaction),
  });

  console.log(`[Mail] ✓ Envoyé à ${toEmail} — réf: ${transaction.reference}`);
}

export async function sendPasswordResetEmail(toEmail, user, resetLink) {
  if (!isMailConfigured) {
    console.warn("[Mail] Resend non configuré — email de réinitialisation non envoyé.");
    return;
  }

  await resend.emails.send({
    from: mailSenderAddress,
    to: toEmail,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour ${user.full_name},</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ce lien expire dans 15 minutes.</p>
    `,
  });

  console.log(`[Mail] ✓ Envoi de réinitialisation à ${toEmail}`);
}
