import { useState, useEffect } from 'react'
import { Plus, Trash2, Cpu, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'
import api, { apiError } from '../../lib/api'
import { toast } from 'react-hot-toast'

export default function ApiKeyManager({
  geminiKeys, newGeminiKey, setNewGeminiKey, newKeyLabel, setNewKeyLabel,
  addGeminiKey, removeGeminiKey, envKeysCount = 0,
}) {
  const [keysPool, setKeysPool] = useState([])
  const [testingAll, setTestingAll] = useState(false)
  const [testingId, setTestingId] = useState(null)
  const [keyResults, setKeyResults] = useState({})

  async function loadPoolStatus() {
    try {
      const { data } = await api.get('/admin/ai-keys/status')
      setKeysPool(data.keys || [])
    } catch (_) {}
  }

  useEffect(() => {
    loadPoolStatus()
  }, [geminiKeys, envKeysCount])

  async function testAll() {
    setTestingAll(true)
    try {
      const { data } = await api.post('/admin/ai-keys/test', {})
      const map = {}
      ;(data.results || []).forEach((r) => { map[r.id] = r })
      setKeyResults(map)
      const healthyCount = (data.results || []).filter((r) => r.ok).length
      toast.success(`${healthyCount}/${data.results?.length || 0} API Keys are healthy and active!`)
    } catch (err) {
      toast.error(apiError(err, 'Could not test API keys'))
    } finally {
      setTestingAll(false)
      loadPoolStatus()
    }
  }

  async function testOne(id) {
    setTestingId(id)
    try {
      const { data } = await api.post('/admin/ai-keys/test', { keyId: id })
      const res = data.result
      setKeyResults((prev) => ({ ...prev, [id]: res }))
      if (res.ok) toast.success(`${res.label || 'API Key'} is active (${res.latencyMs}ms)`)
      else toast.error(`${res.label}: ${res.message || 'Key failed'}`)
    } catch (err) {
      toast.error(apiError(err, 'Failed to test key'))
    } finally {
      setTestingId(null)
      loadPoolStatus()
    }
  }

  const totalKeys = (geminiKeys?.length || 0) + (envKeysCount || 0)

  return (
    <div className="panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem' }}>
            <Cpu size={18} style={{ color: '#c084fc' }} /> AI API Load Balancer &amp; Key Rotation
          </h3>
          <p className="muted small" style={{ margin: 0 }}>
            Round-Robin request balancing, live health verification, and 60-second cooldown failover.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={testAll} disabled={testingAll} title="Ping and verify all keys">
            <RefreshCw size={13} className={testingAll ? 'animate-spin' : ''} />
            {testingAll ? 'Testing Keys…' : 'Test All Keys'}
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.28)', borderRadius: '20px', color: '#4ade80', fontSize: '0.74rem', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
            Load Balancer Active ({totalKeys} in Pool)
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'rgba(239, 237, 253, 0.75)' }}>
        <span style={{ padding: '0.12rem 0.45rem', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 600 }}>
          {envKeysCount} in .env
        </span>
        <span>+ {geminiKeys.length} Custom DB = <strong>{totalKeys} keys in rotation pool</strong></span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); addGeminiKey(); }} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} placeholder="Key Name (e.g. Personal Key, Backup 1)" style={{ flex: 1, minWidth: '180px' }} />
        <input value={newGeminiKey} onChange={(e) => setNewGeminiKey(e.target.value)} placeholder="Gemini API Key (AIzaSy... / AQ.Ab8...)" style={{ flex: 2, minWidth: '220px', fontFamily: 'var(--font-mono)' }} required />
        <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Add Key</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {keysPool.map((item) => {
          const testRes = keyResults[item.id]
          const isBusy = testingId === item.id || testingAll
          const isHealthy = testRes ? testRes.ok : item.status === 'ready'
          const isCooldown = item.status === 'cooldown' || testRes?.status === 'cooldown'
          return (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.9rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.86rem' }}>{item.label}</span>
                <span style={{ fontSize: '0.66rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: item.source === 'env' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: item.source === 'env' ? '#c084fc' : '#38bdf8', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600 }}>
                  {item.source === 'env' ? '.env Key' : 'Custom DB'}
                </span>
                <span className="mono small" style={{ color: 'rgba(239, 237, 253, 0.55)', fontSize: '0.78rem' }}>{item.maskedKey}</span>
                {testRes ? (
                  testRes.ok ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                      <CheckCircle2 size={12} /> Active ({testRes.latencyMs}ms)
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                      <AlertCircle size={12} /> {testRes.message || 'Failed'}
                    </span>
                  )
                ) : isCooldown ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.12)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                    <Clock size={12} /> Cooldown ({item.cooldownRemainingSec}s)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', padding: '0.12rem 0.5rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(239, 237, 253, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Zap size={11} /> Ready
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }} onClick={() => testOne(item.id)} disabled={isBusy} title="Test this specific API key">
                  <RefreshCw size={11} className={testingId === item.id ? 'animate-spin' : ''} /> Test
                </button>
                {item.source === 'db' && (
                  <button type="button" className="admin-delete-btn" onClick={() => removeGeminiKey(item.dbIndex)} title="Remove API Key">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
