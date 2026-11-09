const nodemailer = require('nodemailer')
const Setting = require('../models/settingModel')

let cachedTransporter = null
let lastConfigHash = ''

async function getEmailConfig() {
  const dbSettings = {}
  try {
    const mongoose = require('mongoose')
    if (mongoose.connection?.readyState === 1) {
      const docs = await Setting.find({
        key: { $in: ['smtp_user', 'smtp_pass', 'smtp_host', 'smtp_port', 'smtp_from', 'brevo_api_key', 'resend_api_key'] },
      }).lean()
      docs.forEach((d) => {
        dbSettings[d.key] = d.value
      })
    }
  } catch (_) {}

  const smtpUser = (process.env.SMTP_USER || dbSettings.smtp_user || '').trim()
  return {
    smtpUser,
    smtpPass: (process.env.SMTP_PASS || dbSettings.smtp_pass || '').trim(),
    smtpHost: (process.env.SMTP_HOST || dbSettings.smtp_host || 'smtp.gmail.com').trim(),
    smtpPort: Number(process.env.SMTP_PORT || dbSettings.smtp_port) || 587,
    smtpFrom: (process.env.SMTP_FROM || dbSettings.smtp_from || (smtpUser ? `MockMate AI <${smtpUser}>` : '')).trim(),
    brevoKey: (process.env.BREVO_API_KEY || dbSettings.brevo_api_key || '').trim(),
    resendKey: (process.env.RESEND_API_KEY || dbSettings.resend_api_key || '').trim(),
  }
}

function getTransporter(config, forcePort) {
  const port = forcePort || Number(config.smtpPort) || 587
  const hash = `${config.smtpHost}:${port}:${config.smtpUser}:${config.smtpPass}`
  if (cachedTransporter && lastConfigHash === hash) return cachedTransporter

  const isGmail = config.smtpHost === 'smtp.gmail.com' || config.smtpUser?.endsWith('@gmail.com')
  const host = isGmail ? 'smtp.gmail.com' : config.smtpHost

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    family: 4, // Enforce IPv4 to prevent ENETUNREACH on cloud hosts like Render
    auth: { user: config.smtpUser, pass: config.smtpPass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })
  lastConfigHash = hash
  return cachedTransporter
}

async function sendEmail(to, subject, text, html) {
  const config = await getEmailConfig()
  const errors = []

  // 1. Resend API (HTTP POST over 443 — works seamlessly across all cloud hosts including Render Free Tier)
  if (config.resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.smtpFrom || 'MockMate AI <onboarding@resend.dev>',
          to: [to.trim()],
          subject,
          text,
          html,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Resend HTTP ${res.status}`)
      }
      const data = await res.json().catch(() => ({}))
      return { success: true, provider: 'resend', messageId: data?.id }
    } catch (err) {
      console.error(`[Email Service] Resend error:`, err.message)
      errors.push(`Resend (${err.message})`)
    }
  }

  // 2. Automated Failover: Brevo API (HTTP POST over 443)
  if (config.brevoKey) {
    try {
      const senderEmail = config.smtpUser || 'noreply@mockmate.ai'
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { accept: 'application/json', 'api-key': config.brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'MockMate AI', email: senderEmail },
          to: [{ email: to.trim() }],
          subject,
          textContent: text,
          htmlContent: html,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || errData.code || `Brevo HTTP ${res.status}`)
      }
      const data = await res.json().catch(() => ({}))
      return { success: true, provider: 'brevo', messageId: data?.messageId }
    } catch (err) {
      console.error(`[Email Service] Brevo error:`, err.message)
      errors.push(`Brevo (${err.message})`)
    }
  }

  // 3. Direct Gmail / Custom SMTP (enforce IPv4, with fallback to 465 if 587 times out)
  if (config.smtpUser && config.smtpPass) {
    try {
      const tx = getTransporter(config, 587)
      const info = await tx.sendMail({
        from: config.smtpFrom || `MockMate AI <${config.smtpUser}>`,
        to: to.trim(),
        subject,
        text,
        html,
      })
      return { success: true, provider: 'smtp', messageId: info.messageId }
    } catch (err) {
      console.error(`[Email Service] SMTP (port 587) error:`, err.message)
      errors.push(`SMTP (${err.message})`)
      // Automatic port 465 SSL fallback if 587 is blocked
      try {
        const tx465 = getTransporter(config, 465)
        const info = await tx465.sendMail({
          from: config.smtpFrom || `MockMate AI <${config.smtpUser}>`,
          to: to.trim(),
          subject,
          text,
          html,
        })
        return { success: true, provider: 'smtp-465', messageId: info.messageId }
      } catch (err465) {
        console.error(`[Email Service] SMTP (port 465) fallback error:`, err465.message)
      }
    }
  }

  // 4. Fallback when no email provider is configured
  if (!config.smtpUser && !config.brevoKey && !config.resendKey) {
    console.warn(`[Email Service] No email credentials configured in environment. Code logged to console.`)
    return { success: true, provider: 'console-only' }
  }

  const err = new Error(`Email delivery failed via all configured channels: ${errors.join('; ')}`)
  err.status = 503
  throw err
}

async function getEmailStatus() {
  const c = await getEmailConfig()
  const maskEmail = (e) => (e && e.includes('@') ? `${e.slice(0, 3)}----@${e.split('@')[1]}` : '--------')
  const maskKey = (k) => (k && k.length > 10 ? `${k.slice(0, 8)}--------${k.slice(-4)}` : '--------')

  return {
    resend: {
      configured: Boolean(c.resendKey),
      apiKey: maskKey(c.resendKey),
      status: c.resendKey ? 'ready' : 'missing_key',
      provider: 'Resend API (Cloud Native / HTTPS 443)',
    },
    brevo: {
      configured: Boolean(c.brevoKey),
      apiKey: maskKey(c.brevoKey),
      status: c.brevoKey ? 'ready' : 'missing_key',
      provider: 'Brevo API (Failover / HTTPS 443)',
    },
    smtp: {
      configured: Boolean(c.smtpUser && c.smtpPass),
      host: c.smtpHost,
      port: c.smtpPort,
      user: maskEmail(c.smtpUser),
      status: c.smtpUser && c.smtpPass ? 'ready' : 'missing_credentials',
      provider: 'Gmail SMTP (Primary)',
    },
  }
}

async function testEmailDelivery(targetEmail) {
  const to = (targetEmail || '').trim()
  if (!to) throw new Error('Target email is required')
  const start = Date.now()
  const subject = 'MockMate AI - Live Email Delivery Test'
  const text = `This is a live test email from MockMate AI.\nTimestamp: ${new Date().toISOString()}\nDelivery channel verified.`
  const html = `<div style="font-family:sans-serif;background:#0b0720;color:#f8fafc;padding:24px;border-radius:12px;border:1px solid rgba(168,85,247,0.3)">
    <h2 style="color:#a855f7;margin-top:0">MockMate AI Email Delivery Test</h2>
    <p>Your email system is functioning properly and delivering messages directly to your inbox.</p>
    <p style="font-size:13px;color:#94a3b8">Timestamp: ${new Date().toISOString()}</p>
  </div>`

  const result = await sendEmail(to, subject, text, html)
  return { ok: true, latencyMs: Date.now() - start, ...result, to }
}

async function sendOtpEmail(to, code, purpose) {
  console.log(`\n[MOCKMATE OTP CODE for ${to} (${purpose})]: >>> ${code} <<<\n`)
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

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
  <body style="margin:0;padding:0;background:#0a0b12;color:#eceef5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0b12;padding:32px 16px;">
      <tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
        <tr><td style="padding:0 8px 18px;color:#f5f4ff;font-size:22px;font-weight:700;">MockMate<span style="color:#9b7cff;">AI</span></td></tr>
        <tr><td style="background:#151722;border:1px solid #2a2d3d;border-radius:18px;padding:36px 32px;">
          <div style="color:#a99dff;font-size:11px;font-weight:700;letter-spacing:1.25px;margin-bottom:14px;">${eyebrow}</div>
          <h1 style="margin:0 0 12px;color:#f6f5ff;font-size:28px;">${title}</h1>
          <p style="margin:0;color:#aeb3c7;font-size:16px;line-height:1.6;">Use the secure code below to ${action}.</p>
          <div style="margin:28px 0 20px;padding:18px 16px;background:linear-gradient(135deg,#2b2851,#201e40);border:1px solid #6458ca;border-radius:14px;text-align:center;">
            <div style="margin-bottom:7px;color:#bbb5eb;font-size:11px;font-weight:700;letter-spacing:1.1px;">ONE-TIME CODE</div>
            <div style="color:#fff;font-family:Consolas,'Courier New',monospace;font-size:34px;font-weight:700;letter-spacing:9px;">${code}</div>
          </div>
          <p style="margin:0;color:#c5c8d6;font-size:14px;line-height:1.6;"><strong style="color:#f3f2fa;">Expires in 10 minutes.</strong> Never share this code with anyone.</p>
          <div style="margin-top:26px;padding-top:20px;border-top:1px solid #2a2d3d;color:#858ba2;font-size:13px;">${footer}</div>
        </td></tr>
        <tr><td style="padding:20px 8px 0;color:#72788d;font-size:12px;text-align:center;">This is an automated security email from MockMate AI.</td></tr>
      </table></td></tr>
    </table></body></html>`
}

module.exports = { sendEmail, sendOtpEmail, getEmailStatus, testEmailDelivery }
