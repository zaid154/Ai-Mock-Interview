import { useState, useEffect } from 'react'
import { Mail, RefreshCw, Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react'
import api, { apiError } from '../../lib/api'
import { toast } from 'react-hot-toast'

export default function EmailManager() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testResult, setTestResult] = useState(null)

  async function loadStatus() {
    try {
      const { data } = await api.get('/admin/email/status')
      setStatus(data.status || null)
    } catch (_) {}
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  async function handleTest(e) {
    e.preventDefault()
    const target = testEmail.trim()
    if (!target) return toast.error('Enter an email address to test delivery')
    setTesting(true)
    setTestResult(null)
    try {
      const { data } = await api.post('/admin/email/test', { to: target })
      setTestResult(data.result)
      toast.success(`Test email delivered to ${target} via ${data.result?.provider || 'SMTP'} (${data.result?.latencyMs}ms)!`)
    } catch (err) {
      toast.error(apiError(err, 'Email test delivery failed'))
      setTestResult({ ok: false, error: apiError(err, 'Delivery failed') })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem' }}>
            <Mail size={18} style={{ color: '#a855f7' }} /> Email &amp; OTP Delivery Channels
          </h3>
          <p className="muted small" style={{ margin: 0 }}>
            Dual-channel automatic routing: Google Gmail Direct SMTP with instant failover to Brevo API.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.28)', borderRadius: '20px', color: '#4ade80', fontSize: '0.74rem', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
          Primary &amp; Backup Channels Ready
        </div>
      </div>

      {/* Provider Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {/* Channel 1: Gmail SMTP */}
        <div style={{ padding: '0.9rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border-soft)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>Gmail Direct SMTP</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>
              PRIMARY (100% INBOX)
            </span>
          </div>
          <p className="muted small" style={{ margin: '0 0 0.4rem', fontSize: '0.78rem' }}>
            Sender: <strong style={{ color: '#e2e8f0' }}>{status?.smtp?.user || 'trendykart.app@gmail.com'}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} style={{ color: '#34d399' }} /> Google SPF &amp; DKIM Signed
          </div>
        </div>

        {/* Channel 2: Brevo API */}
        <div style={{ padding: '0.9rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border-soft)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>Brevo API Relay</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontWeight: 700 }}>
              AUTOMATIC FAILOVER
            </span>
          </div>
          <p className="muted small" style={{ margin: '0 0 0.4rem', fontSize: '0.78rem' }}>
            Key: <code style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>{status?.brevo?.apiKey || 'xkeysib-••••'}</code>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} style={{ color: '#c084fc' }} /> High-throughput cloud relay
          </div>
        </div>
      </div>

      {/* Live Test Form */}
      <form onSubmit={handleTest} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Test email address (e.g. savezonix@gmail.com)"
          style={{ flex: 1, minWidth: '220px', fontSize: '0.88rem' }}
          required
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={testing || !testEmail.trim()}>
          {testing ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
          {testing ? 'Sending Test…' : 'Send Test Email'}
        </button>
      </form>

      {/* Test Result Feedback Banner */}
      {testResult && (
        <div style={{ marginTop: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', background: testResult.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: testResult.ok ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: testResult.ok ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {testResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>
            {testResult.ok
              ? `Delivered to ${testResult.to} via ${testResult.provider} in ${testResult.latencyMs}ms! (ID: ${testResult.messageId || 'OK'})`
              : `Delivery failed: ${testResult.error}`}
          </span>
        </div>
      )}
    </div>
  )
}
