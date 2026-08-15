import { useState, useEffect } from 'react'
import { Award, CheckCircle2, Download, Lock, Zap, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const MILESTONES = [
  { id: 'm1', title: 'Interview Pioneer Certificate', reqCount: 1, desc: 'Complete your 1st AI mock interview.' },
  { id: 'm3', title: 'Interview Specialist Certificate', reqCount: 3, desc: 'Complete 3 mock interview sessions.' },
  { id: 'm5', title: 'MockMate AI Master Certificate', reqCount: 5, desc: 'Complete 5 mock interview sessions.' },
  { id: 'm_score', title: 'High Performance Excellence Certificate', reqCount: 1, reqScore: 80, desc: 'Score 80% or higher on any interview.' },
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

  function isUnlocked(cert) {
    if (cert.reqScore) {
      return completedInterviews.some((i) => (i.overallScore || 0) >= cert.reqScore)
    }
    return completedInterviews.length >= cert.reqCount
  }

  async function handleDownloadPDF() {
    const certElement = document.querySelector('.official-cert-card')
    if (!certElement) return

    setDownloading(true)
    const toastId = toast.loading('Generating high-res PDF certificate...')

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

      const cleanName = (user?.name || 'MOHD-ZAID').replace(/[^a-zA-Z0-9]/g, '-')
      const fileName = `MockMate-Certificate-${cleanName}.pdf`

      pdf.save(fileName)
      toast.success('Certificate PDF downloaded directly!', { id: toastId })
    } catch (err) {
      console.error('Error generating PDF file download:', err)
      toast.error('Could not generate PDF file. Opening browser save fallback.', { id: toastId })
      window.print()
    } finally {
      setDownloading(false)
    }
  }

  const candidateName = (user?.name || 'MOHD ZAID').toUpperCase()
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const certId = `MM-CERT-${(user?.id || 'C680O89X').slice(-8).toUpperCase()}`

  return (
    <main className="container">
      {/* Section Head */}
      <div className="section-head">
        <h2>Official Credentials</h2>
        <p>Earn verified industry-standard certificates as you complete mock interview sessions and evaluate your readiness.</p>
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
              Milestones
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
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.1rem' }}>{m.title}</div>
                    <div className="muted" style={{ fontSize: '0.76rem' }}>{m.desc}</div>
                  </div>
                  <div style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                    {mUnlocked ? (
                      <CheckCircle2 size={17} style={{ color: 'var(--good)' }} />
                    ) : (
                      <Lock size={14} style={{ color: 'var(--text-subtle)', opacity: 0.5 }} />
                    )}
                  </div>
                </button>
              )
            })}

            <button className="btn btn-primary btn-block btn-lg" onClick={handleDownloadPDF} disabled={downloading} style={{ marginTop: '1rem' }}>
              {downloading ? (
                <>
                  <Loader2 size={18} className="spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} /> Download Certificate (PDF)
                </>
              )}
            </button>
          </div>

          {/* Official Google & Coursera Grade Certificate Card */}
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

                    {/* Candidate Name */}
                    <div className="official-cert-recipient">
                      <h1 className="official-cert-recipient-name">{candidateName}</h1>
                      <p className="official-cert-subtext">has successfully completed</p>
                    </div>

                    {/* Milestone Title */}
                    <div className="official-cert-title-block">
                      <h2 className="official-cert-course-title">{selectedCert.title}</h2>
                      <p className="official-cert-course-desc">
                        an online technical interview assessment authorized by MockMate AI and evaluated through Gemini Engine.
                      </p>
                    </div>
                  </div>

                  {/* Signature Block Bottom Left */}
                  <div className="official-cert-signature-wrap">
                    {signatureImage ? (
                      <img src={signatureImage} alt="Official Admin Signature" style={{ maxHeight: '42px', objectFit: 'contain', marginBottom: '0.2rem', maxWidth: '180px' }} />
                    ) : (
                      /* Realistic Handwritten Signature SVG */
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
                    title="Click or scan to verify credential"
                  >
                    <svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ border: '1px solid #cbd5e1', padding: '3px', background: '#ffffff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                      {/* Top Left Finder */}
                      <rect x="6" y="6" width="26" height="26" fill="#0f172a" />
                      <rect x="10" y="10" width="18" height="18" fill="#ffffff" />
                      <rect x="14" y="14" width="10" height="10" fill="#0f172a" />

                      {/* Top Right Finder */}
                      <rect x="68" y="6" width="26" height="26" fill="#0f172a" />
                      <rect x="72" y="10" width="18" height="18" fill="#ffffff" />
                      <rect x="76" y="14" width="10" height="10" fill="#0f172a" />

                      {/* Bottom Left Finder */}
                      <rect x="6" y="68" width="26" height="26" fill="#0f172a" />
                      <rect x="10" y="72" width="18" height="18" fill="#ffffff" />
                      <rect x="14" y="76" width="10" height="10" fill="#0f172a" />

                      {/* Data Matrix */}
                      <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="40" y="20" width="6" height="6" fill="#0f172a" />
                      <rect x="46" y="26" width="6" height="6" fill="#0f172a" />
                      <rect x="58" y="20" width="6" height="6" fill="#0f172a" />

                      <rect x="8" y="40" width="6" height="6" fill="#0f172a" />
                      <rect x="20" y="40" width="6" height="6" fill="#0f172a" />
                      <rect x="26" y="46" width="6" height="6" fill="#0f172a" />

                      <rect x="40" y="40" width="8" height="8" fill="#4f46e5" />
                      <rect x="52" y="40" width="6" height="6" fill="#0f172a" />
                      <rect x="46" y="52" width="6" height="6" fill="#0f172a" />

                      <rect x="72" y="40" width="6" height="6" fill="#0f172a" />
                      <rect x="84" y="46" width="6" height="6" fill="#0f172a" />
                      <rect x="78" y="52" width="6" height="6" fill="#0f172a" />

                      <rect x="40" y="68" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="74" width="6" height="6" fill="#0f172a" />
                      <rect x="46" y="84" width="6" height="6" fill="#0f172a" />

                      <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
                      <rect x="80" y="74" width="6" height="6" fill="#0f172a" />
                      <rect x="74" y="84" width="12" height="6" fill="#0f172a" />
                    </svg>
                    <span style={{ fontSize: '0.55rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px', fontWeight: 800 }}>
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
        </div>
      )}
    </main>
  )
}
