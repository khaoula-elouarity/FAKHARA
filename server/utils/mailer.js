import env from "../config/env.js";

function buildResetEmail({ name, resetUrl }) {
  const safeName = name ? name.replace(/[<>&"]/g, "") : "client FAKHARA";

  return `
    <div style="font-family:Arial,sans-serif;color:#173f3b;background:#f7f3eb;padding:32px">
      <div style="max-width:560px;margin:auto;background:#fffdf7;border:1px solid #ded5c5;padding:32px">
        <p style="letter-spacing:4px;color:#bd985d;font-size:11px;margin:0 0 12px">FAKHARA</p>
        <h1 style="font-size:24px;font-weight:500;margin:0 0 18px">Réinitialisation du mot de passe</h1>
        <p>Bonjour ${safeName},</p>
        <p>Vous avez demandé à réinitialiser le mot de passe de votre espace client FAKHARA.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="display:inline-block;background:#123f3b;color:#fff;padding:14px 24px;text-decoration:none">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="font-size:12px;color:#85877d">Ce lien est valable pendant 30 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
        <p style="font-size:12px;color:#85877d;word-break:break-all">${resetUrl}</p>
      </div>
    </div>
  `;
}

/**
 * Sends the password reset email through Resend when it is configured.
 * Without an email provider the link is printed in the server console so
 * the flow remains usable in local development.
 */
export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!env.resendApiKey || !env.mailFrom) {
    console.info(`[FAKHARA] Password reset link for ${to}: ${resetUrl}`);
    return { delivered: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.mailFrom,
        to: [to],
        subject: "FAKHARA - Réinitialisation de votre mot de passe",
        html: buildResetEmail({ name, resetUrl }),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(
        `[FAKHARA] Could not send the password reset email: ${response.status} ${details}`
      );
      return { delivered: false };
    }

    return { delivered: true };
  } catch (error) {
    console.error(
      `[FAKHARA] Could not send the password reset email: ${error.message}`
    );
    return { delivered: false };
  }
}

export default sendPasswordResetEmail;
