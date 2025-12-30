import "server-only";

import nodemailer from "nodemailer";

type SendResult = {
  ok: boolean;
  error?: string;
};

function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getInviteUrl(token: string) {
  return `${getBaseUrl()}/accept-invite?token=${token}`;
}

function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "0");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendInvitationEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}): Promise<SendResult> {
  const from = process.env.MAIL_FROM;
  const mailer = getMailer();

  if (!from || !mailer) {
    return { ok: false, error: "MAIL_NOT_CONFIGURED" };
  }

  const inviteUrl = getInviteUrl(token);

  try {
    await mailer.sendMail({
      from,
      to,
      subject: "Invitation Business Sud de France",
      text: `Bonjour,\n\nVoici votre lien d'activation: ${inviteUrl}\n\nA bientot.`,
      html: `
        <p>Bonjour,</p>
        <p>Voici votre lien d'activation :</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>A bientot.</p>
      `,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "MAIL_SEND_FAILED" };
  }
}
