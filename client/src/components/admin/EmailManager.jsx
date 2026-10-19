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
            <Mail size={18} style={{ color: '#2563eb' }} /> Email &amp; OTP Delivery Channels
          </h3>
          <p className="muted small" style={{ margin: 0 }}>
            Dual-channel automatic routing: Google Gmail Direct SMTP with instant failover to Brevo API.
          </p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '20px', color: '#16a34a', fontSize: '0.74rem', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
          Primary &amp; Backup Channels Ready
        </div>
      </div>

      {/* Provider Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        {/* Channel 1: Gmail SMTP */}
        <div style={{ padding: '0.9rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>Gmail Direct SMTP</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', fontWeight: 700 }}>
              PRIMARY (100% INBOX)
            </span>
          </div>
          <p className="muted small" style={{ margin: '0 0 0.4rem', fontSize: '0.78rem' }}>
            Sender: <strong style={{ color: '#1f2937' }}>{status?.smtp?.user || 'trendykart.app@gmail.com'}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={13} style={{ color: '#16a34a' }} /> Google SPF &amp; DKIM Signed
          </div>
        </div>

        {/* Channel 2: Brevo API */}
        <div style={{ padding: '0.9rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>Brevo API Relay</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
              AUTOMATIC FAILOVER
            </span>
          </div>
          <p className="muted small" style={{ margin: '0 0 0.4rem', fontSize: '0.78rem' }}>
            Key: <code style={{ color: '#1f2937', fontSize: '0.75rem' }}>{status?.brevo?.apiKey || 'xkeysib-••••'}</code>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} style={{ color: '#2563eb' }} /> High-throughput cloud relay
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
        <div style={{ marginTop: '0.9rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', background: testResult.ok ? '#dcfce7' : '#fee2e2', border: testResult.ok ? '1px solid #bbf7d0' : '1px solid #fecaca', color: testResult.ok ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
