import nodemailer from "nodemailer";

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

export const isMailConfigured = Boolean(mailUser && mailPass);

const transportOptions = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  ...(isMailConfigured && {
    auth: { user: mailUser, pass: mailPass },
  }),
};

export const transporter = nodemailer.createTransport(transportOptions);
