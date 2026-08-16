import { useState, useEffect } from 'react'
import { Award, CheckCircle2, Download, Lock, Zap, ShieldCheck, ExternalLink, Loader2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const MILESTONES = [
  { id: 'm1', title: 'Interview Pioneer Certificate', reqCount: 1, reqMinScore: 60, desc: 'Complete 1st interview session with score ≥ 60%.' },
  { id: 'm3', title: 'Interview Specialist Certificate', reqCount: 3, reqMinScore: 70, desc: 'Complete 3 interview sessions with score ≥ 70%.' },
  { id: 'm5', title: 'MockMate AI Master Certificate', reqCount: 5, reqMinScore: 75, desc: 'Complete 5 interview sessions with score ≥ 75%.' },
  { id: 'm_score', title: 'High Performance Honors Certificate', reqCount: 1, reqScore: 85, desc: 'Achieve a score of 85% or higher on any session.' },
]

export default function Certificates() {
  const { user } = useAuth()
  const [completedInterviews, setCompletedInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [selectedCert, setSelectedCert] = useState(MILESTONES[0])

  const [signatoryName, setSignatoryName] = useState('Mohd Zaid')
  const [signatoryTitle, setSignatoryTitle] = useState('Global Director of Candidate Assessments, MockMate AI')
  const [signatureImage, setSignatureImage] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [res, setRes] = await Promise.all([
          api.get('/interviews'),
          api.get('/auth/verification-settings'),
        ])
        const list = (res.data?.interviews || []).filter((i) => i.status === 'completed')
        setCompletedInterviews(list)

        if (setRes.data?.certSignatoryName) setSignatoryName(setRes.data.certSignatoryName)
        if (setRes.data?.certSignatoryTitle) setSignatoryTitle(setRes.data.certSignatoryTitle)
        if (setRes.data?.certSignatureImage) setSignatureImage(setRes.data.certSignatureImage)
      } catch (err) {
        console.warn('Error loading certificates data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  function getQualifyingSession(cert) {
    if (cert.reqScore) {
      return completedInterviews.find((i) => (i.overallScore || 0) >= cert.reqScore)
    }
    const minScore = cert.reqMinScore || 60
    const qualifiedList = completedInterviews.filter((i) => (i.overallScore || 0) >= minScore)
    if (qualifiedList.length >= cert.reqCount) {
      return qualifiedList[cert.reqCount - 1]
    }
    return null
  }

  function isUnlocked(cert) {
    return Boolean(getQualifyingSession(cert))
  }

  function getProgressText(cert) {
    if (cert.reqScore) {
      const highestScore = completedInterviews.reduce((max, i) => Math.max(max, i.overallScore || 0), 0)
      return `${highestScore}% / ${cert.reqScore}% Score`
    }
    const minScore = cert.reqMinScore || 60
    const qualifiedCount = completedInterviews.filter((i) => (i.overallScore || 0) >= minScore).length
    return `${Math.min(qualifiedCount, cert.reqCount)} / ${cert.reqCount} Sessions`
  }

  async function handleDownloadPDF() {
    if (!isUnlocked(selectedCert)) {
      toast.error('This milestone credential is locked! Complete the qualification criteria to unlock.')
      return
    }

    const certElement = document.querySelector('.official-cert-card')
    if (!certElement) return

    setDownloading(true)
    const toastId = toast.loading('Generating high-resolution official PDF certificate...')

    try {
      const canvas = await html2canvas(certElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

      const canvasWidth = imgWidth * ratio
      const canvasHeight = imgHeight * ratio

      const marginX = (pdfWidth - canvasWidth) / 2
      const marginY = (pdfHeight - canvasHeight) / 2

      pdf.addImage(imgData, 'JPEG', marginX, marginY, canvasWidth, canvasHeight)

      const candidateFullName = (user?.name || 'MOCKMATE-CANDIDATE').replace(/[^a-zA-Z0-9]/g, '-')
      const fileName = `MockMate-Official-Certificate-${candidateFullName}.pdf`

      pdf.save(fileName)
      toast.success('Official Credential PDF downloaded successfully!', { id: toastId })
    } catch (err) {
      console.error('Error generating PDF file download:', err)
      toast.error('Could not generate PDF file. Opening browser print fallback.', { id: toastId })
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  // Exact Candidate Name (no placeholder!)
  const candidateName = (user?.name || 'Candidate Name').toUpperCase()
  const qualSession = getQualifyingSession(selectedCert)
  const isCurrentUnlocked = Boolean(qualSession)

  const dateStr = qualSession
    ? new Date(qualSession.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const certId = qualSession
    ? `MM-CERT-${qualSession._id.toString().slice(-8).toUpperCase()}`
    : `MM-CERT-${(user?.id || '8F3E92B1').slice(-8).toUpperCase()}`

  return (
    <main className="container">
      {/* Section Head */}
      <div className="section-head">
        <h2>Official Milestone Credentials</h2>
        <p>Earn verified, ISO-standard milestone certificates as you complete technical mock interview sessions.</p>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '250px' }}>
          Loading credentials...
        </div>
      ) : (
        <div className="cert-page-grid">
          {/* Milestone Selection Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>
              Select Milestone
            </h3>
            {MILESTONES.map((m) => {
              const mUnlocked = isUnlocked(m)
              const selected = selectedCert?.id === m.id
              return (
                <button
                  key={m.id}
                  className={`milestone-btn ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedCert(m)}
                >
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.1rem' }}>{m.title}</div>
                    <div className="muted" style={{ fontSize: '0.76rem', lineHeight: '1.3' }}>{m.desc}</div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: mUnlocked ? 'var(--good)' : 'var(--warn)', marginTop: '0.35rem' }}>
                      {mUnlocked ? '✓ Unlocked' : getProgressText(m)}
                    </div>
                  </div>
                  <div style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                    {mUnlocked ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--good)' }} />
                    ) : (
                      <Lock size={15} style={{ color: 'var(--warn)', opacity: 0.8 }} />
                    )}
                  </div>
                </button>
              )
            })}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={handleDownloadPDF}
              disabled={downloading || !isCurrentUnlocked}
              style={{
                marginTop: '1rem',
                opacity: isCurrentUnlocked ? 1 : 0.6,
                cursor: isCurrentUnlocked ? 'pointer' : 'not-allowed',
              }}
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="spin" /> Generating PDF...
                </>
              ) : isCurrentUnlocked ? (
                <>
                  <Download size={18} /> Download Credential (PDF)
                </>
              ) : (
                <>
                  <Lock size={18} /> Credential Locked
                </>
              )}
            </button>
          </div>

          {/* Unlocked vs Locked Certificate Preview Pane */}
          {isCurrentUnlocked ? (
            /* Official Unlocked Certificate Card */
            <div className="official-cert-card">
              <div className="official-cert-frame">
                <div className="official-cert-grid">
                  {/* Left Main Body (75%) */}
                  <div className="official-cert-main">
                    {/* Brand Header */}
                    <div>
                      <div className="official-cert-header">
                        <div className="official-cert-logo-box">
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#ffffff',
                            }}
                          >
                            <Zap size={18} />
                          </div>
                          <span className="official-cert-brand-title">MockMate</span>
                        </div>
                        <div className="official-cert-date">{dateStr}</div>
                      </div>

                      {/* Candidate Name (Accurate logged-in user name!) */}
                      <div className="official-cert-recipient">
                        <h1 className="official-cert-recipient-name">{candidateName}</h1>
                        <p className="official-cert-subtext">has successfully completed technical qualification for</p>
                      </div>

                      {/* Milestone Title & Role */}
                      <div className="official-cert-title-block">
                        <h2 className="official-cert-course-title">{selectedCert.title}</h2>
                        <p className="official-cert-course-desc">
                          evaluated through Google Gemini AI in <strong>{qualSession?.role || 'Technical Architecture'}</strong> ({qualSession?.overallScore}% Score).
                        </p>
                      </div>
                    </div>

                    {/* Signature Block Bottom Left */}
                    <div className="official-cert-signature-wrap">
                      {signatureImage ? (
                        <img src={signatureImage} alt="Official Admin Signature" style={{ maxHeight: '42px', objectFit: 'contain', marginBottom: '0.2rem', maxWidth: '180px' }} />
                      ) : (
                        <svg className="official-cert-signature-svg" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 35C25 15 45 40 60 20C75 5 90 45 110 25C130 10 145 35 160 15C170 5 185 30 195 20"
                            stroke="#0f172a"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 40C50 38 120 42 180 39"
                            stroke="#0f172a"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      <div className="official-cert-sig-line" />
                      <div className="official-cert-sig-name">{signatoryName}</div>
                      <div className="official-cert-sig-title">{signatoryTitle}</div>
                    </div>
                  </div>

                  {/* Right Ribbon Sidebar (25%) */}
                  <div className="official-cert-sidebar">
                    <div className="official-cert-banner-tag">
                      COURSE<br />CERTIFICATE
                    </div>

                    {/* Circular Stamp Badge Seal */}
                    <div className="official-cert-stamp-badge">
                      <div className="official-cert-stamp-inner">
                        <ShieldCheck size={28} style={{ color: '#4f46e5', marginBottom: '0.2rem' }} />
                        <div className="official-cert-stamp-text">
                          MOCKMATE<br />VERIFIED
                        </div>
                      </div>
                    </div>

                    {/* Verification QR Code */}
                    <a
                      href={`/verify-certificate/${certId}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ margin: '0.4rem 0 0.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}
                      title="Scan or click to verify credential"
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                          typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${certId}` : `https://ai-mock-interview-three-pi.vercel.app/verify-certificate/${certId}`
                        )}&size=200x200&margin=2`}
                        alt="Real Scannable Verification QR Code"
                        crossOrigin="anonymous"
                        style={{
                          width: '60px',
                          height: '60px',
                          border: '1px solid #cbd5e1',
                          padding: '2px',
                          background: '#ffffff',
                          borderRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          objectFit: 'contain',
                        }}
                      />
                      <span style={{ fontSize: '0.55rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px', fontWeight: 800 }}>
                        SCAN TO VERIFY
                      </span>
                    </a>

                    {/* Minimalist Verified Credential Box */}
                    <div style={{ marginTop: '0.6rem', textAlign: 'center', background: '#f8fafc', padding: '0.45rem 0.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ fontSize: '0.56rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                        Credential Verification
                      </div>
                      <a
                        href={`/verify-certificate/${certId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: '#4f46e5',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '0.2rem',
                          textDecoration: 'none',
                        }}
                        className="hover-lift"
                        title="Click to verify credential"
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                        {certId} <ExternalLink size={10} />
                      </a>
                    </div>

                    <div style={{ fontSize: '0.56rem', color: '#64748b', marginTop: '0.4rem', textAlign: 'center', lineHeight: 1.25 }}>
                      Verified credential issued by <strong style={{ color: '#334155' }}>MockMate AI</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Strict Locked Credential Card */
            <div
              className="panel"
              style={{
                borderRadius: '24px',
                padding: '4rem 2rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                background: 'var(--surface-elevated)',
                border: '1px dashed var(--border-strong)',
                minHeight: '460px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--warn)',
                  marginBottom: '1.25rem',
                }}
              >
                <Lock size={30} />
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                {selectedCert.title} Locked
              </h3>
              <p className="muted" style={{ maxWidth: '44ch', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                {selectedCert.desc}
              </p>

              {/* Progress Indicator with Perfect Spacing */}
              <div style={{ background: 'var(--surface-2)', padding: '1.1rem 1.6rem', borderRadius: '14px', border: '1px solid var(--border-soft)', marginBottom: '2rem', minWidth: '320px', maxWidth: '420px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', fontSize: '0.86rem', fontWeight: 700, marginBottom: '0.65rem' }}>
                  <span style={{ color: 'var(--text)' }}>Qualification Progress</span>
                  <span style={{ color: 'var(--warn)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{getProgressText(selectedCert)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-soft)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: selectedCert.reqScore
                        ? `${Math.min(100, Math.round(((completedInterviews.reduce((m, i) => Math.max(m, i.overallScore || 0), 0)) / selectedCert.reqScore) * 100))}%`
                        : `${Math.min(100, Math.round((completedInterviews.filter((i) => (i.overallScore || 0) >= (selectedCert.reqMinScore || 60)).length / selectedCert.reqCount) * 100))}%`,
                      background: 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.85rem 2.4rem' }}>
                <Play size={17} /> Start Mock Session to Qualify
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
