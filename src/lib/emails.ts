import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLowMoodEmail(name: string, email: string) {
  const firstName = name.split(" ")[0];

  try {
    await resend.emails.send({
      from: "MindPath <onboarding@resend.dev>",
      to: email,
      subject: `We're here when you're ready, ${firstName} 💙`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f0f13;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f13;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#1a1a24;border-radius:16px;border:1px solid #2e2e3e;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <div style="font-size:20px;font-weight:700;color:#e8e8f0;">
                <span style="color:#7c6ff7;">Mind</span>Path
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              <h1 style="margin:0 0 16px 0;font-size:22px;color:#e8e8f0;font-weight:600;">
                Hey ${firstName} 💙
              </h1>
              <p style="margin:0 0 8px 0;font-size:15px;color:#a0a0b0;line-height:1.6;">
                We noticed you might be going through a tough time.
              </p>
              <p style="margin:0 0 8px 0;font-size:15px;color:#a0a0b0;line-height:1.6;">
                You don't have to navigate this alone — we've got some resources that might help.
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;color:#a0a0b0;line-height:1.6;">
                Take things at your own pace. We're here whenever you're ready.
              </p>
              <!-- CTA -->
              <a href="${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'https://mindpath.app' : 'http://localhost:3000'}/support"
                 style="display:inline-block;background-color:#7c6ff7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:14px;">
                Get Support →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #2e2e3e;">
              <p style="margin:0;font-size:12px;color:#6b6b80;line-height:1.5;">
                If you're in crisis, please call or text <strong style="color:#e8e8f0;">988</strong>. You matter.
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
