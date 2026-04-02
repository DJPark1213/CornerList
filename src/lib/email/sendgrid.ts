import sgMail from "@sendgrid/mail";

let configured = false;

function ensureConfigured() {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!key || !from) {
    return null;
  }
  if (!configured) {
    sgMail.setApiKey(key);
    configured = true;
  }
  return from;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends email via SendGrid. If env is missing, logs and resolves (dev-friendly).
 */
export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<{ ok: boolean; skipped?: boolean }> {
  const from = ensureConfigured();
  if (!from) {
    console.warn(
      "[email] SENDGRID_API_KEY or SENDGRID_FROM_EMAIL not set; skipping send to",
      to
    );
    return { ok: true, skipped: true };
  }

  try {
    await sgMail.send({
      to,
      from,
      subject,
      html,
    });
    return { ok: true };
  } catch (e) {
    console.error("[email] SendGrid error", e);
    return { ok: false };
  }
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
