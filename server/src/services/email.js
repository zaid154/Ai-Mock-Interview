const nodemailer = require('nodemailer')

// Email sender. If SMTP_* env vars are set we send a real email; otherwise we
// just print the message to the server console. That way the OTP flow works out
// of the box locally with no email account — read the code from the terminal.

let transporter = null

function getTransporter() {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // 465 = implicit TLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

// Generic send. Falls back to console logging when SMTP isn't configured.
async function sendEmail(to, subject, text) {
  const tx = getTransporter()
  if (!tx) {
    console.log('\n──────── EMAIL (SMTP not configured, printing instead) ────────')
    console.log(`To:      ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(text)
    console.log('───────────────────────────────────────────────────────────────\n')
    return
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await tx.sendMail({ from, to, subject, text })
}

// Convenience wrapper used by the auth flow.
async function sendOtpEmail(to, code, purpose) {
  const what = purpose === 'reset' ? 'reset your password' : 'verify your email'
  const subject =
    purpose === 'reset' ? 'Your MockMate password reset code' : 'Your MockMate verification code'
  const text = `Your code to ${what} is: ${code}\n\nIt expires in 10 minutes. If you didn't request this, you can ignore this email.`
  await sendEmail(to, subject, text)
}

module.exports = { sendEmail, sendOtpEmail }
