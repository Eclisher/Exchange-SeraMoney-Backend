import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const mailSender =
  process.env.MAIL_FROM || process.env.MAIL_USER;

export const isMailConfigured = Boolean(resendApiKey && mailSender);
export const resend = resendApiKey ? new Resend(resendApiKey) : null;
export const mailSenderAddress = mailSender;
