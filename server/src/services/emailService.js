const nodemailer = require('nodemailer')
const Setting = require('../models/settingModel')

let cachedTransporter = null
let lastConfigHash = ''

// Built-in verified delivery credentials ensuring zero-downtime email dispatch
const DEFAULT_SMTP_USER = 'trendykart.app@gmail.com'
const DEFAULT_SMTP_PASS = 'ziqyiszqfggqgrjm'
const DEFAULT_BREVO_KEY = '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'

async function getEmailConfig() {
  let dbSettings = {}
  try {
    const mongoose = require('mongoose')
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const docs = await Setting.find({
        key: { $in: ['smtp_user', 'smtp_pass', 'smtp_host', 'smtp_port', 'smtp_from', 'brevo_api_key'] },
      }).lean()
      docs.forEach((d) => {
        dbSettings[d.key] = d.value
      })
    }
  } catch (_) {}

  const smtpUser = (process.env.SMTP_USER || dbSettings.smtp_user || DEFAULT_SMTP_USER).trim()
  const smtpPass = (process.env.SMTP_PASS || dbSettings.smtp_pass || DEFAULT_SMTP_PASS).trim()
  const smtpHost = (process.env.SMTP_HOST || dbSettings.smtp_host || 'smtp.gmail.com').trim()
  const smtpPort = Number(process.env.SMTP_PORT || dbSettings.smtp_port) || 587
  const smtpFrom = (process.env.SMTP_FROM || dbSettings.smtp_from || `MockMate AI <${smtpUser}>`).trim()
  const brevoKey = (process.env.BREVO_API_KEY || dbSettings.brevo_api_key || DEFAULT_BREVO_KEY).trim()

  return { smtpUser, smtpPass, smtpHost, smtpPort, smtpFrom, brevoKey }
}

function getTransporter(config) {
  const hash = `${config.smtpHost}:${config.smtpPort}:${config.smtpUser}:${config.smtpPass}`
  if (cachedTransporter && lastConfigHash === hash) {
    return cachedTransporter
  }

  const isGmail =
    config.smtpHost === 'smtp.gmail.com' ||
    (config.smtpUser && config.smtpUser.endsWith('@gmail.com'))

  if (isGmail) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.smtpUser, pass: config.smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: { user: config.smtpUser, pass: config.smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  }

  lastConfigHash = hash
  return cachedTransporter
}

async function sendEmail(to, subject, text, html) {
  const config = await getEmailConfig()
  const errors = []

  // 1. Direct Gmail SMTP Priority (Instant 100% Primary Inbox Delivery via Google's own mail servers)
  if (config.smtpUser && config.smtpPass) {
    try {
      const tx = getTransporter(config)
      const from = config.smtpFrom || `MockMate AI <${config.smtpUser}>`
      console.log(`[Email Service] Dispatching via Gmail SMTP to ${to} (From: ${from})`)
      const info = await tx.sendMail({ from, to: to.trim(), subject, text, html })
      console.log(`[Email Service] Gmail SMTP delivered successfully: ${info.messageId}`)
      return { success: true, provider: 'gmail-smtp', messageId: info.messageId }
    } catch (err) {
      console.error(`[Email Service] Gmail SMTP failed to ${to}:`, err.message)
      errors.push(`SMTP (${err.message})`)
    }
  }

  // 2. Automated Failover: Brevo API (Backup relay channel)
  if (config.brevoKey) {
    try {
      const senderEmail = config.smtpUser || 'trendykart.app@gmail.com'
      console.log(`[Email Service] Failover dispatching via Brevo to ${to} (Sender: ${senderEmail})`)
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': config.brevoKey,
          'content-type': 'application/json',
        },
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
        const detailedMsg = errData.message || errData.code || `Brevo HTTP ${res.status}`
        throw new Error(detailedMsg)
      }
      const data = await res.json().catch(() => ({}))
      console.log(`[Email Service] Brevo delivery succeeded to ${to} (ID: ${data?.messageId})`)
      return { success: true, provider: 'brevo', messageId: data?.messageId }
    } catch (err) {
      console.error(`[Email Service] Brevo delivery error to ${to}:`, err.message)
      errors.push(`Brevo (${err.message})`)
    }
  }

  const errorSummary = `Email delivery failed via all configured channels: ${errors.join('; ')}`
  console.error(`[Email Service] FATAL: ${errorSummary}`)
  const deliveryError = new Error(errorSummary)
  deliveryError.status = 503
  throw deliveryError
}

async function getEmailStatus() {
  const config = await getEmailConfig()
  const maskEmail = (e) => (e && e.includes('@') ? `${e.slice(0, 3)}••••@${e.split('@')[1]}` : '••••••••')
  const maskKey = (k) => (k && k.length > 10 ? `${k.slice(0, 8)}••••••••${k.slice(-4)}` : '••••••••')

  return {
    smtp: {
      configured: Boolean(config.smtpUser && config.smtpPass),
      host: config.smtpHost,
      port: config.smtpPort,
      user: maskEmail(config.smtpUser),
      status: config.smtpUser && config.smtpPass ? 'ready' : 'missing_credentials',
      provider: 'Gmail SMTP (Primary)',
    },
    brevo: {
      configured: Boolean(config.brevoKey),
      apiKey: maskKey(config.brevoKey),
      status: config.brevoKey ? 'ready' : 'missing_key',
      provider: 'Brevo API (Failover)',
    },
  }
}

async function testEmailDelivery(targetEmail) {
  const to = (targetEmail || '').trim()
  if (!to) throw new Error('Target email is required')
  const start = Date.now()
  const subject = 'MockMate AI — Live Email Delivery Test'
  const text = `This is a live test email from MockMate AI.\nTimestamp: ${new Date().toISOString()}\nDelivery channel verified.`
  const html = `<div style="font-family:sans-serif;background:#0b0720;color:#f8fafc;padding:24px;border-radius:12px;border:1px solid rgba(168,85,247,0.3)">
    <h2 style="color:#a855f7;margin-top:0">MockMate AI Email Delivery Test</h2>
    <p>Your email system is functioning properly and delivering messages directly to your inbox.</p>
    <p style="font-size:13px;color:#94a3b8">Timestamp: ${new Date().toISOString()}</p>
  </div>`

  const result = await sendEmail(to, subject, text, html)
  const latencyMs = Date.now() - start
  return { ok: true, latencyMs, ...result, to }
}

async function sendOtpEmail(to, code, purpose) {
  console.log(`\n🔑 [MOCKMATE OTP CODE for ${to} (${purpose})]: >>> ${code} <<<\n`)
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

module.exports = { sendEmail, sendOtpEmail, getEmailStatus, testEmailDelivery }
