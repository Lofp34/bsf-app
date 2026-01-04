type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult = {
  ok: boolean;
  error?: string;
};

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "Business Sud de France";

  if (!apiKey || !senderEmail) {
    return { ok: false, error: "MISSING_BREVO_CONFIG" };
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    return { ok: false, error: errorBody || "BREVO_ERROR" };
  }

  return { ok: true };
}

export async function sendBulkEmail(
  recipients: string[],
  build: (email: string) => Omit<SendEmailInput, "to">,
) {
  const uniqueRecipients = Array.from(new Set(recipients.filter(Boolean)));
  const results: SendEmailResult[] = [];

  for (const email of uniqueRecipients) {
    const payload = build(email);
    results.push(
      await sendEmail({
        to: email,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    );
  }

  return results;
}

export function getAppUrl(request?: Request) {
  const envUrl = process.env.APP_URL?.replace(/\/+$/, "");
  if (envUrl) return envUrl;
  if (!request) return "";

  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return "";

  return `${proto}://${host}`;
}

export function buildInvitationEmail(inviteLink: string) {
  const subject = "Invitation Business Sud de France";
  const text = [
    "Bonjour,",
    "",
    "Vous avez ete invite a rejoindre Business Sud de France.",
    `Lien d'activation: ${inviteLink}`,
    "",
    "Ce lien expire dans 7 jours.",
    "Si vous n'etes pas concerne, ignorez ce message.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2320;">
      <p>Bonjour,</p>
      <p>Vous avez ete invite a rejoindre Business Sud de France.</p>
      <p>
        <a href="${inviteLink}" style="display:inline-block;padding:10px 16px;border-radius:16px;background:#1f5f3b;color:#fff;text-decoration:none;">
          Activer mon compte
        </a>
      </p>
      <p style="font-size:12px;color:#6b6b6b;">Ce lien expire dans 7 jours.</p>
      <p style="font-size:12px;color:#6b6b6b;">Si vous n'etes pas concerne, ignorez ce message.</p>
    </div>
  `;

  return { subject, text, html };
}

export function buildRecommendationStatusEmail(params: {
  status: string;
  recipientName: string;
  link: string;
}) {
  const statusLabel = formatRecommendationStatus(params.status);
  const subject = `Statut de recommandation: ${statusLabel}`;
  const text = [
    "Bonjour,",
    "",
    `Le statut de votre recommandation pour ${params.recipientName} est passe a: ${statusLabel}.`,
    `Voir la recommandation: ${params.link}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2320;">
      <p>Bonjour,</p>
      <p>Le statut de votre recommandation pour <strong>${params.recipientName}</strong> est passe a:</p>
      <p style="font-weight:600;">${statusLabel}</p>
      <p>
        <a href="${params.link}" style="display:inline-block;padding:10px 16px;border-radius:16px;background:#1f5f3b;color:#fff;text-decoration:none;">
          Voir la recommandation
        </a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

export function buildEventInviteEmail(params: {
  title: string;
  startAt: Date;
  location: string;
  link: string;
}) {
  const formattedDate = formatDate(params.startAt);
  const subject = `Invitation: ${params.title}`;
  const text = [
    "Bonjour,",
    "",
    `Vous etes invite a l'activite: ${params.title}.`,
    `Date: ${formattedDate}`,
    `Lieu: ${params.location}`,
    `Voir l'activite: ${params.link}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2320;">
      <p>Bonjour,</p>
      <p>Vous etes invite a l'activite <strong>${params.title}</strong>.</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Lieu:</strong> ${params.location}</p>
      <p>
        <a href="${params.link}" style="display:inline-block;padding:10px 16px;border-radius:16px;background:#1f5f3b;color:#fff;text-decoration:none;">
          Voir l'activite
        </a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

export function buildEventCanceledEmail(params: {
  title: string;
  startAt: Date;
  location: string;
  link: string;
}) {
  const formattedDate = formatDate(params.startAt);
  const subject = `Activite annulee: ${params.title}`;
  const text = [
    "Bonjour,",
    "",
    `L'activite suivante a ete annulee: ${params.title}.`,
    `Date: ${formattedDate}`,
    `Lieu: ${params.location}`,
    `Details: ${params.link}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2320;">
      <p>Bonjour,</p>
      <p>L'activite suivante a ete annulee:</p>
      <p><strong>${params.title}</strong></p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Lieu:</strong> ${params.location}</p>
      <p>
        <a href="${params.link}" style="display:inline-block;padding:10px 16px;border-radius:16px;background:#1f5f3b;color:#fff;text-decoration:none;">
          Details
        </a>
      </p>
    </div>
  `;

  return { subject, text, html };
}

function formatRecommendationStatus(status: string) {
  switch (status) {
    case "SENT":
      return "Envoyee";
    case "IN_PROGRESS":
      return "En cours";
    case "VALIDATED":
      return "Validee";
    case "ABANDONED":
      return "Abandonnee";
    default:
      return status;
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
