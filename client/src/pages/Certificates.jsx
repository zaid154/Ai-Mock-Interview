import { useState, useEffect } from 'react'
import { CheckCircle2, Download, Lock, Loader2, Play, Award } from 'lucide-react'
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
  { key: 'm5', title: 'MockMate AI Master Certificate', description: 'Complete 5 interview sessions with a score of 75% or higher.', reqCount: 5, reqMinScore: 75, reqScore: null, design: 'elegant', accent: '#7c3aed' },
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
  const [signatoryTitle, setSignatoryTitle] = useState('Global Director of Candidate Assessments, MockMate AI')
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

  return (
    <main className="container">
      <div className="section-head">
        <h2>Official Milestone Credentials</h2>
        <p>Earn verified certificates as you complete technical mock interview sessions.</p>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '250px' }}>Loading credentials…</div>
      ) : !selected ? (
        <div className="panel page-center" style={{ minHeight: '250px' }}>
          <Award size={34} className="muted" />
          <h3 style={{ marginTop: '0.8rem' }}>No milestones configured</h3>
          <p className="muted small" style={{ margin: 0 }}>An admin has not published any credentials yet.</p>
        </div>
      ) : (
        <div className="cert-page-grid">
          <div className="milestone-list">
            <h3 className="milestone-list-head">Select milestone</h3>

            {templates.map((t) => {
              const open = isUnlocked(t)
              return (
                <button
                  key={t.key}
                  className={`milestone-btn ${selectedKey === t.key ? 'selected' : ''}`}
                  onClick={() => setSelectedKey(t.key)}
                  style={{ '--cert-accent': t.accent || '#4f46e5' }}
                >
                  <span className="milestone-swatch" />
                  <span className="milestone-body">
                    <strong>{t.title}</strong>
                    <span className="muted">{t.description}</span>
                    <span className={`milestone-state ${open ? 'is-open' : ''}`}>
                      {open ? '✓ Unlocked' : getProgressText(t)}
                    </span>
                  </span>
                  <span className="milestone-icon">
                    {open ? <CheckCircle2 size={18} /> : <Lock size={15} />}
                  </span>
                </button>
              )
            })}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={handleDownloadPDF}
              disabled={downloading || !unlocked}
              style={{ marginTop: '1rem' }}
            >
              {downloading ? (
                <><Loader2 size={18} className="spin" /> Generating…</>
              ) : unlocked ? (
                <><Download size={18} /> Download certificate</>
              ) : (
                <><Lock size={18} /> Credential locked</>
              )}
            </button>
          </div>

          {unlocked ? (
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
          ) : (
            <div className="panel cert-locked">
              <span className="cert-locked-icon"><Lock size={28} /></span>
              <h3>{selected.title} locked</h3>
              <p className="muted">{selected.description}</p>

              <div className="cert-locked-progress">
                <div className="cert-locked-progress-head">
                  <span>Qualification progress</span>
                  <span className="mono">{getProgressText(selected)}</span>
                </div>
                <div className="progress-track" style={{ margin: 0 }}>
                  <div className="progress-fill" style={{ width: `${progressPercent(selected)}%` }} />
                </div>
              </div>

              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <Play size={17} /> Start a session to qualify
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
