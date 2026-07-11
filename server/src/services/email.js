const nodemailer = require('nodemailer')

// OTPs must only be delivered through email. Never log them or return them in
// an API response, including when SMTP is not configured.
let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

async function sendEmail(to, subject, text, html) {
  const tx = getTransporter()
  if (!tx) {
    const err = new Error('Email delivery is not configured. Please contact support.')
    err.status = 503
    throw err
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await tx.sendMail({ from, to, subject, text, html })
}

async function sendOtpEmail(to, code, purpose) {
  const isReset = purpose === 'reset'
  const action = isReset ? 'reset your password' : 'verify your email address'
  const title = isReset ? 'Reset your password' : 'Verify your email'
  const subject = isReset ? 'Reset your MockMate password' : 'Verify your MockMate email'
  const text = [
    `${title}\n`,
    `Use this one-time code to ${action}: ${code}`,
    'This code expires in 10 minutes and can only be used once.',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n\n')
  const html = otpEmailTemplate({ code, title, action, isReset })
  await sendEmail(to, subject, text, html)
}

function otpEmailTemplate({ code, title, action, isReset }) {
  const eyebrow = isReset ? 'ACCOUNT SECURITY' : 'WELCOME TO MOCKMATE AI'
  const footer = isReset
    ? 'If you did not request a password reset, no action is needed. Your password remains unchanged.'
    : 'If you did not create a MockMate account, you can safely ignore this email.'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0b12;color:#eceef5;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Your MockMate AI one-time verification code is ready.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0b12;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
          <tr><td style="padding:0 8px 18px;color:#f5f4ff;font-size:22px;font-weight:700;letter-spacing:-0.4px;">MockMate<span style="color:#9b7cff;">AI</span></td></tr>
          <tr><td style="background:#151722;border:1px solid #2a2d3d;border-radius:18px;padding:36px 32px;">
            <div style="color:#a99dff;font-size:11px;font-weight:700;letter-spacing:1.25px;margin-bottom:14px;">${eyebrow}</div>
            <h1 style="margin:0 0 12px;color:#f6f5ff;font-size:28px;line-height:1.2;letter-spacing:-0.5px;">${title}</h1>
            <p style="margin:0;color:#aeb3c7;font-size:16px;line-height:1.6;">Use the secure code below to ${action}.</p>
            <div style="margin:28px 0 20px;padding:18px 16px;background:linear-gradient(135deg,#2b2851,#201e40);border:1px solid #6458ca;border-radius:14px;text-align:center;">
              <div style="margin-bottom:7px;color:#bbb5eb;font-size:11px;font-weight:700;letter-spacing:1.1px;">ONE-TIME CODE</div>
              <div style="color:#ffffff;font-family:Consolas,'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:9px;line-height:1.15;">${code}</div>
            </div>
            <p style="margin:0;color:#c5c8d6;font-size:14px;line-height:1.6;"><strong style="color:#f3f2fa;">Expires in 10 minutes.</strong> For your security, never share this code with anyone.</p>
            <div style="margin-top:26px;padding-top:20px;border-top:1px solid #2a2d3d;color:#858ba2;font-size:13px;line-height:1.55;">${footer}</div>
          </td></tr>
          <tr><td style="padding:20px 8px 0;color:#72788d;font-size:12px;line-height:1.5;text-align:center;">This is an automated security email from MockMate AI.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

module.exports = { sendEmail, sendOtpEmail }
