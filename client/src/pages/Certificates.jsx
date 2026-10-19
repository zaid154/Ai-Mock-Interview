import { useState, useEffect } from 'react'
import { CheckCircle2, Download, Lock, Loader2, Play, Award, ExternalLink, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import CertificateCard from '../components/CertificateCard'

// Used only when the API cannot be reached, so the page still renders something
// sensible offline. The real list is admin-managed and comes from the server.
const FALLBACK_TEMPLATES = [
  { key: 'm1', title: 'Interview Pioneer Certificate', description: 'Complete your first interview session with a score of 60% or higher.', reqCount: 1, reqMinScore: 60, reqScore: null, design: 'classic', accent: '#4f46e5' },
  { key: 'm3', title: 'Interview Specialist Certificate', description: 'Complete 3 interview sessions with a score of 70% or higher.', reqCount: 3, reqMinScore: 70, reqScore: null, design: 'modern', accent: '#0f766e' },
  { key: 'm5', title: 'Engineering Mastery Certificate', description: 'Complete 5 interview sessions with a score of 75% or higher.', reqCount: 5, reqMinScore: 75, reqScore: null, design: 'elegant', accent: '#7c3aed' },
  { key: 'm_score', title: 'High Performance Honours Certificate', description: 'Achieve a score of 85% or higher in any single session.', reqCount: 1, reqMinScore: 60, reqScore: 85, design: 'elegant', accent: '#b45309' },
]

export default function Certificates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [completedInterviews, setCompletedInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)

  const [signatoryName, setSignatoryName] = useState('Mohd Zaid')
  const [signatoryTitle, setSignatoryTitle] = useState('Assessment Director, MockMate AI')
  const [signatureImage, setSignatureImage] = useState('')

  useEffect(() => {
    let alive = true
    async function loadData() {
      try {
        setLoading(true)
        const [res, setRes, tplRes] = await Promise.all([
          api.get('/interviews'),
          api.get('/auth/verification-settings'),
          api.get('/certificates/templates').catch(() => null),
        ])
        if (!alive) return

        setCompletedInterviews((res.data?.interviews || []).filter((i) => i.status === 'completed'))

        if (setRes.data?.certSignatoryName) setSignatoryName(setRes.data.certSignatoryName)
        if (setRes.data?.certSignatoryTitle) setSignatoryTitle(setRes.data.certSignatoryTitle)
        if (setRes.data?.certSignatureImage) setSignatureImage(setRes.data.certSignatureImage)

        const list = tplRes?.data?.templates?.length ? tplRes.data.templates : FALLBACK_TEMPLATES
        setTemplates(list)
        setSelectedKey((k) => k || list[0]?.key || null)
      } catch (err) {
        if (!alive) return
        setTemplates(FALLBACK_TEMPLATES)
        setSelectedKey((k) => k || FALLBACK_TEMPLATES[0].key)
        console.warn('Error loading certificates data:', err)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadData()
    return () => {
      alive = false
    }
  }, [])

  const selected = templates.find((t) => t.key === selectedKey) || templates[0] || null

  // A template with reqScore set awards on a single high score; otherwise it
  // awards on reaching reqCount sessions that each cleared reqMinScore.
  function getQualifyingSession(t) {
    if (!t) return null
    if (t.reqScore != null) {
      return completedInterviews.find((i) => (i.overallScore || 0) >= t.reqScore) || null
    }
    const min = t.reqMinScore ?? 60
    const qualified = completedInterviews.filter((i) => (i.overallScore || 0) >= min)
    return qualified.length >= (t.reqCount ?? 1) ? qualified[(t.reqCount ?? 1) - 1] : null
  }

  const isUnlocked = (t) => Boolean(getQualifyingSession(t))

  function getProgressText(t) {
    if (t.reqScore != null) {
      const best = completedInterviews.reduce((m, i) => Math.max(m, i.overallScore || 0), 0)
      return `${best}% / ${t.reqScore}% score`
    }
    const min = t.reqMinScore ?? 60
    const n = completedInterviews.filter((i) => (i.overallScore || 0) >= min).length
    return `${Math.min(n, t.reqCount ?? 1)} / ${t.reqCount ?? 1} sessions`
  }

  function progressPercent(t) {
    if (t.reqScore != null) {
      const best = completedInterviews.reduce((m, i) => Math.max(m, i.overallScore || 0), 0)
      return Math.min(100, Math.round((best / t.reqScore) * 100))
    }
    const min = t.reqMinScore ?? 60
    const n = completedInterviews.filter((i) => (i.overallScore || 0) >= min).length
    return Math.min(100, Math.round((n / (t.reqCount ?? 1)) * 100))
  }

  const qualSession = getQualifyingSession(selected)
  const unlocked = Boolean(qualSession)

  const dateStr = new Date(qualSession?.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const certId = qualSession
    ? `MM-CERT-${String(qualSession._id).slice(-8).toUpperCase()}`
    : `MM-CERT-${String(user?.id || '8F3E92B1').slice(-8).toUpperCase()}`
  const verifyUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify-certificate/${certId}`
      : `/verify-certificate/${certId}`

  async function handleDownloadPDF() {
    if (!unlocked) {
      toast.error('This credential is locked. Meet the criteria to unlock it.')
      return
    }
    const el = document.querySelector('.official-cert-card')
    if (!el) return

    setDownloading(true)
    const id = toast.loading('Generating your certificate PDF…')
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pw / canvas.width, ph / canvas.height)
      const w = canvas.width * ratio
      const h = canvas.height * ratio
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h)
      pdf.save(`MockMate-Certificate-${(user?.name || 'Candidate').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`)
      toast.success('Certificate downloaded', { id })
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('Could not generate the PDF. Opening print instead.', { id })
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const [copiedLink, setCopiedLink] = useState(false)

  const copyVerifyUrl = () => {
    navigator.clipboard.writeText(verifyUrl)
    setCopiedLink(true)
    toast.success('Verification link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div className="section-head" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <div className="reflect-badge" style={{ margin: 0 }}>
            <Award size={12} style={{ color: '#2563eb' }} aria-hidden="true" />
            <span className="reflect-badge-text">Credentials</span>
          </div>
          <span className="tag-soft" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {completedInterviews.length} Completed {completedInterviews.length === 1 ? 'Interview' : 'Interviews'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
          Certificates of Completion
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: '60ch', margin: 0 }}>
          Earn verifiable certificates as you complete engineering mock interviews and speed quizzes.
        </p>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '250px' }}>Loading certificates…</div>
      ) : !selected ? (
        <div className="panel page-center" style={{ minHeight: '250px', textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Award size={36} className="muted" style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#111827' }}>No milestones configured</h3>
          <p className="muted small" style={{ margin: 0 }}>An administrator has not published any credentials yet.</p>
        </div>
      ) : (
        <div className="cert-page-grid">
          {/* Left Column: Milestone Picker */}
          <div className="milestone-list">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', padding: '0 0.15rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.04em' }}>
                Milestones
              </span>
              <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                {templates.filter(isUnlocked).length} of {templates.length} Unlocked
              </span>
            </div>

            {templates.map((t) => {
              const open = isUnlocked(t)
              const isSelected = selectedKey === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  className={`milestone-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedKey(t.key)}
                  style={{ '--cert-accent': t.accent || '#2563eb' }}
                >
                  <span className="milestone-swatch" style={{ background: t.accent || '#2563eb' }} />
                  <span className="milestone-body">
                    <strong>{t.title}</strong>
                    <span className="muted">{t.description}</span>
                    <span className={`milestone-state ${open ? 'is-open' : ''}`}>
                      {open ? '✓ Unlocked' : getProgressText(t)}
                    </span>
                  </span>
                  <span className="milestone-icon">
                    {open ? (
                      <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                    ) : (
                      <Lock size={15} style={{ color: '#9ca3af' }} />
                    )}
                  </span>
                </button>
              )
            })}

            <button
              type="button"
              className="reflect-btn-primary"
              onClick={handleDownloadPDF}
              disabled={downloading || !unlocked}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                marginTop: '0.75rem',
                fontSize: '0.86rem',
                opacity: !unlocked ? 0.6 : 1,
                cursor: !unlocked ? 'not-allowed' : 'pointer',
              }}
            >
              {downloading ? (
                <><Loader2 size={16} className="spin" /> Generating PDF…</>
              ) : unlocked ? (
                <><Download size={16} /> Download Certificate (PDF)</>
              ) : (
                <><Lock size={15} /> Complete Criteria to Unlock</>
              )}
            </button>
          </div>

          {/* Right Column: Certificate Preview or Locked State */}
          <div style={{ minWidth: 0 }}>
            {unlocked ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: '#f8fafc', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="tag" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.72rem' }}>
                      ✓ Verified &amp; Active
                    </span>
                    <span className="mono" style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      ID: {certId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={copyVerifyUrl}
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                      title="Copy Public Verification Link"
                    >
                      {copiedLink ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                      title="View Public Verification Page"
                    >
                      <ExternalLink size={13} />
                      <span>Verify</span>
                    </a>
                  </div>
                </div>

                <CertificateCard
                  design={selected.design}
                  accent={selected.accent}
                  title={selected.title}
                  subtitle={selected.subtitle}
                  candidateName={user?.name}
                  role={qualSession?.role || 'Technical Architecture'}
                  score={qualSession?.overallScore}
                  dateStr={dateStr}
                  certId={certId}
                  verifyUrl={verifyUrl}
                  signatoryName={signatoryName}
                  signatoryTitle={signatoryTitle}
                  signatureImage={signatureImage}
                />
              </div>
            ) : (
              <div className="panel cert-locked" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '3.5rem 2rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#fef3c7', color: '#d97706', marginBottom: '0.85rem' }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
                  {selected.title} Locked
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#6b7280', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
                  {selected.description}
                </p>

                <div style={{ width: '100%', maxWidth: '380px', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '1.75rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    <span>Qualification Progress</span>
                    <span className="mono" style={{ color: '#2563eb', fontWeight: 700 }}>{getProgressText(selected)}</span>
                  </div>
                  <div className="progress-track" style={{ margin: 0, height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                    <div className="progress-fill" style={{ width: `${progressPercent(selected)}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <Link to="/practice" className="reflect-btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.86rem', gap: '0.5rem' }}>
                  <Play size={15} /> Start Practice Session to Qualify
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
