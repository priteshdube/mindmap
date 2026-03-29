import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email is optional; missing key must never break API routes.
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendLowMoodEmail(name: string, email: string) {
  const resend = getResendClient();
  if (!resend) return;

  const firstName = name.split(" ")[0];

  try {
    await resend.emails.send({
      from: "MindPath <onboarding@resend.dev>",
      to: email,
      subject: `We're here when you're ready, ${firstName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f7f5ef;font-family:'Nunito',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5ef;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;border:1px solid #d9e4e0;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-size:20px;font-weight:700;color:#1f2d2b;">
                <span style="color:#2f9b87;">Mind</span>Path
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              <h1 style="margin:0 0 16px 0;font-size:22px;color:#1f2d2b;font-weight:600;">
                Hey ${firstName}
              </h1>
              <p style="margin:0 0 8px 0;font-size:15px;color:#6f7d79;line-height:1.6;">
                We noticed you might be going through a tough time.
              </p>
              <p style="margin:0 0 8px 0;font-size:15px;color:#6f7d79;line-height:1.6;">
                You don't have to navigate this alone — we've got some resources that might help.
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;color:#6f7d79;line-height:1.6;">
                Take things at your own pace. We're here whenever you're ready.
              </p>
              <!-- CTA -->
              <a href="${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'https://mindpath.app' : 'http://localhost:3000'}/support"
                 style="display:inline-block;background-color:#2f9b87;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;">
                Get Support →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #d9e4e0;">
              <p style="margin:0;font-size:12px;color:#6f7d79;line-height:1.5;">
                If you're in crisis, please call or text <strong style="color:#1f2d2b;">988</strong>. You matter.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
  } catch (error) {
    console.error("Email send error:", error);
    // Fail silently — email must never block the mood save
  }
}
