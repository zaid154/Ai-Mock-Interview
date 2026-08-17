import { useEffect, useState } from 'react'
import { Award, Plus, Trash2, Save, RotateCcw, Eye, EyeOff, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useConfirm } from './ConfirmDialog'
import CertificateCard from './CertificateCard'

const DESIGNS = [
  { id: 'classic', label: 'Classic', hint: 'Two columns with a ribbon sidebar and seal' },
  { id: 'modern', label: 'Modern', hint: 'Full-bleed accent bar, large sans-serif name' },
  { id: 'elegant', label: 'Elegant', hint: 'Framed and centred, serif, formal' },
]

const SWATCHES = ['#4f46e5', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1', '#15803d', '#334155']

const BLANK = {
  key: '',
  title: '',
  description: '',
  subtitle: 'has successfully completed technical qualification for',
  reqCount: 1,
  reqMinScore: 60,
  reqScore: '',
  design: 'classic',
  accent: '#4f46e5',
  enabled: true,
}

export default function CertificateManager() {
  const { confirm } = useConfirm()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | { ...template } | BLANK for new
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/certificate-templates')
      setTemplates(data.templates || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load milestones'))
    } finally {
      setLoading(false)
    }
  }

  function startNew() {
    setEditing({ ...BLANK })
  }

  function startEdit(t) {
    setEditing({ ...t, reqScore: t.reqScore ?? '' })
  }

  async function save(e) {
    e.preventDefault()
    if (!editing.title?.trim()) return toast.error('A title is required')

    const payload = {
      title: editing.title.trim(),
      description: (editing.description || '').trim(),
      subtitle: (editing.subtitle || '').trim(),
      reqCount: Number(editing.reqCount) || 1,
      reqMinScore: Number(editing.reqMinScore) || 0,
      reqScore: editing.reqScore === '' || editing.reqScore === null ? null : Number(editing.reqScore),
      design: editing.design,
      accent: editing.accent,
      enabled: Boolean(editing.enabled),
    }
    if (editing.key?.trim()) payload.key = editing.key.trim()

    setSaving(true)
    try {
      if (editing._id) {
        await api.patch(`/admin/certificate-templates/${editing._id}`, payload)
        toast.success('Milestone updated')
      } else {
        await api.post('/admin/certificate-templates', payload)
        toast.success('Milestone created')
      }
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(apiError(err, 'Could not save the milestone'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled(t) {
    try {
      await api.patch(`/admin/certificate-templates/${t._id}`, { enabled: !t.enabled })
      setTemplates((prev) => prev.map((x) => (x._id === t._id ? { ...x, enabled: !x.enabled } : x)))
    } catch (err) {
      toast.error(apiError(err, 'Could not change visibility'))
    }
  }

  async function remove(t) {
    const ok = await confirm({
      title: 'Delete milestone?',
      message: `"${t.title}" will no longer be offered to candidates. Certificates already downloaded are unaffected.`,
      confirmText: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/admin/certificate-templates/${t._id}`)
      setTemplates((prev) => prev.filter((x) => x._id !== t._id))
      if (editing?._id === t._id) setEditing(null)
      toast.success('Milestone deleted')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete'))
    }
  }

  async function resetAll() {
    const ok = await confirm({
      title: 'Restore the default milestones?',
      message: 'Every milestone you have added or edited is replaced by the four shipped credentials.',
      confirmText: 'Restore defaults',
      danger: true,
    })
    if (!ok) return
    try {
      await api.post('/admin/certificate-templates/reset')
      setEditing(null)
      await load()
      toast.success('Defaults restored')
    } catch (err) {
      toast.error(apiError(err, 'Could not restore defaults'))
    }
  }

  return (
    <section className="panel" style={{ marginBottom: '1.5rem' }}>
      <div className="admin-section-head">
        <div>
          <h3 className="panel-title"><Award size={17} /> Certificate milestones</h3>
          <p className="muted small" style={{ margin: 0 }}>
            Create credentials, tune what earns them, and pick the layout each one prints in.
          </p>
        </div>
        <div className="admin-row-actions">
          <button className="btn btn-ghost btn-sm" onClick={resetAll}>
            <RotateCcw size={14} /> Defaults
          </button>
          <button className="btn btn-primary btn-sm" onClick={startNew}>
            <Plus size={14} /> New milestone
          </button>
        </div>
      </div>

      {loading ? (
        <p className="muted small" style={{ margin: '1rem 0 0' }}>Loading milestones…</p>
      ) : templates.length === 0 ? (
        <p className="muted small" style={{ margin: '1rem 0 0' }}>
          No milestones yet. Create one, or restore the defaults.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.1rem' }}>
          {templates.map((t) => (
            <div key={t._id} className="admin-row cert-manager-row" style={{ '--cert-accent': t.accent }}>
              <div className="admin-row-main">
                <span className="milestone-swatch" style={{ minHeight: 38 }} />
                <div className="admin-row-name">
                  <strong>
                    {t.title}
                    <span className="pill">{t.design}</span>
                    {!t.enabled && <span className="pill pill-bad">Hidden</span>}
                  </strong>
                  <span className="admin-row-email">
                    {t.reqScore != null
                      ? `Any session at ${t.reqScore}% or above`
                      : `${t.reqCount} session${t.reqCount === 1 ? '' : 's'} at ${t.reqMinScore}% or above`}
                    {' · '}
                    <code className="mono">{t.key}</code>
                  </span>
                </div>
              </div>

              <div className="admin-row-actions">
                <button
                  className="icon-btn"
                  onClick={() => toggleEnabled(t)}
                  title={t.enabled ? 'Hide from candidates' : 'Show to candidates'}
                  aria-label={t.enabled ? 'Hide milestone' : 'Show milestone'}
                >
                  {t.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)}>Edit</button>
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => remove(t)}
                  title="Delete milestone"
                  aria-label={`Delete ${t.title}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="cert-editor">
          <div className="cert-editor-head">
            <h4>{editing._id ? 'Edit milestone' : 'New milestone'}</h4>
            <button className="icon-btn" onClick={() => setEditing(null)} aria-label="Close editor">
              <X size={15} />
            </button>
          </div>

          <div className="cert-editor-grid">
            <form onSubmit={save}>
              <div className="field">
                <span className="field-label">Title</span>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Interview Specialist Certificate"
                  required
                />
              </div>

              <div className="field">
                <span className="field-label">Description shown in the picker</span>
                <textarea
                  rows={2}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Complete 3 sessions with a score of 70% or higher."
                />
              </div>

              <div className="field">
                <span className="field-label">Line printed above the milestone name</span>
                <input
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <span className="field-label">Sessions required</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editing.reqCount}
                    onChange={(e) => setEditing({ ...editing, reqCount: e.target.value })}
                    disabled={editing.reqScore !== '' && editing.reqScore !== null}
                  />
                </div>
                <div className="field">
                  <span className="field-label">Minimum score each</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editing.reqMinScore}
                    onChange={(e) => setEditing({ ...editing, reqMinScore: e.target.value })}
                    disabled={editing.reqScore !== '' && editing.reqScore !== null}
                  />
                </div>
              </div>

              <div className="field">
                <span className="field-label">Or award on a single score (leave blank to use the rule above)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editing.reqScore}
                  onChange={(e) => setEditing({ ...editing, reqScore: e.target.value })}
                  placeholder="e.g. 85"
                />
              </div>

              <div className="field">
                <span className="field-label">Layout</span>
                <div className="design-picker">
                  {DESIGNS.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      className={`design-option ${editing.design === d.id ? 'selected' : ''}`}
                      onClick={() => setEditing({ ...editing, design: d.id })}
                    >
                      <span className={`design-thumb design-thumb-${d.id}`} style={{ '--cert-accent': editing.accent }} />
                      <strong>{d.label}</strong>
                      <span className="subtle small">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <span className="field-label">Accent colour</span>
                <div className="swatch-row">
                  {SWATCHES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`swatch ${editing.accent === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setEditing({ ...editing, accent: c })}
                      aria-label={`Use ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    className="swatch-custom"
                    value={editing.accent}
                    onChange={(e) => setEditing({ ...editing, accent: e.target.value })}
                    aria-label="Custom accent colour"
                  />
                </div>
              </div>

              <label className="switch-row" style={{ marginBottom: '1.1rem' }}>
                <span className="switch">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.enabled)}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  />
                  <span className="switch-track" />
                </span>
                <span className="switch-copy">
                  <strong>Visible to candidates</strong>
                  <span className="muted small">Turn off to retire a credential without deleting it.</span>
                </span>
              </label>

              <div className="admin-row-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={15} /> {saving ? 'Saving…' : editing._id ? 'Save changes' : 'Create milestone'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>

            {/* Renders the real component, so what the admin sees here is exactly
                what a candidate downloads. */}
            <div className="cert-preview-pane">
              <span className="field-label">Live preview</span>
              <div className="cert-preview-scaler">
                <CertificateCard
                  design={editing.design}
                  accent={editing.accent}
                  title={editing.title || 'Milestone title'}
                  subtitle={editing.subtitle}
                  candidateName="Aarav Sharma"
                  role="Senior Fullstack Engineer"
                  score={88}
                  dateStr="Aug 17, 2026"
                  certId="MM-CERT-PREVIEW"
                  verifyUrl="https://example.com/verify-certificate/MM-CERT-PREVIEW"
                  signatoryName="Mohd Zaid"
                  signatoryTitle="Global Director of Candidate Assessments, MockMate AI"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
