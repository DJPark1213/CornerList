import { sendEmail, appBaseUrl } from "./sendgrid";

export async function sendDjWelcomeEmail(to: string, stageName: string) {
  const base = appBaseUrl();
  return sendEmail({
    to,
    subject: "Welcome to CornerList",
    html: `<p>Hi ${escapeHtml(stageName)},</p>
      <p>Your DJ profile is live on CornerList.</p>
      <p><a href="${base}/djs">View search</a></p>`,
  });
}

export async function sendNewBookingRequestToDj(opts: {
  to: string;
  djName: string;
  djProfileId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}) {
  const base = appBaseUrl();
  return sendEmail({
    to: opts.to,
    subject: `New booking request — ${opts.eventDate}`,
    html: `<p>Hi ${escapeHtml(opts.djName)},</p>
      <p>You have a new booking request for <strong>${escapeHtml(opts.eventDate)}</strong>
      (${escapeHtml(opts.startTime)}–${escapeHtml(opts.endTime)}).</p>
      <p><a href="${base}/djs/${opts.djProfileId}">Open your profile</a> on CornerList to accept or decline (log in as your DJ account).</p>`,
  });
}

export async function sendBookingAcceptedToHost(opts: {
  to: string;
  hostName: string;
  stageName: string;
  djProfileId: string;
  bookingId: string;
}) {
  const base = appBaseUrl();
  return sendEmail({
    to: opts.to,
    subject: `${opts.stageName} accepted your booking`,
    html: `<p>Hi ${escapeHtml(opts.hostName)},</p>
      <p><strong>${escapeHtml(opts.stageName)}</strong> accepted your booking request.</p>
      <p><a href="${base}/djs/${opts.djProfileId}?pay=${encodeURIComponent(opts.bookingId)}">Pay now to confirm</a></p>`,
  });
}

export async function sendBookingDeclinedToHost(opts: {
  to: string;
  hostName: string;
  stageName: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Update on your booking request`,
    html: `<p>Hi ${escapeHtml(opts.hostName)},</p>
      <p><strong>${escapeHtml(opts.stageName)}</strong> is not available for that time. Try another DJ on CornerList.</p>`,
  });
}

export async function sendBookingCancelledEmails(opts: {
  hostEmail: string;
  hostName: string;
  djEmail: string;
  djName: string;
  eventDate: string;
  refunded: boolean;
}) {
  const base = appBaseUrl();
  const refundNote = opts.refunded ? " A refund has been issued to your original payment method." : "";
  await sendEmail({
    to: opts.hostEmail,
    subject: `Booking cancelled — ${opts.eventDate}`,
    html: `<p>Hi ${escapeHtml(opts.hostName)},</p>
      <p>Your booking with <strong>${escapeHtml(opts.djName)}</strong> on <strong>${escapeHtml(opts.eventDate)}</strong> has been cancelled.${refundNote}</p>
      <p><a href="${base}/search">Find another DJ</a></p>`,
  });
  await sendEmail({
    to: opts.djEmail,
    subject: `Booking cancelled — ${opts.eventDate}`,
    html: `<p>Hi ${escapeHtml(opts.djName)},</p>
      <p>The booking on <strong>${escapeHtml(opts.eventDate)}</strong> has been cancelled.</p>`,
  });
}

export async function sendPaymentConfirmedEmails(opts: {
  hostEmail: string;
  hostName: string;
  djEmail: string;
  djName: string;
  amountDisplay: string;
  eventDate: string;
}) {
  const html = `<p>Payment of <strong>${escapeHtml(opts.amountDisplay)}</strong> is confirmed for <strong>${escapeHtml(opts.eventDate)}</strong>.</p>`;
  await sendEmail({
    to: opts.hostEmail,
    subject: "Payment received — booking confirmed",
    html: `<p>Hi ${escapeHtml(opts.hostName)},</p>${html}`,
  });
  await sendEmail({
    to: opts.djEmail,
    subject: "Booking paid — you're confirmed",
    html: `<p>Hi ${escapeHtml(opts.djName)},</p>${html}`,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
