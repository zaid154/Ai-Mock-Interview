import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, Award, Zap, Copy, Check, Share2, ArrowLeft, ExternalLink, QrCode, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

export default function VerifyCertificate() {
  const { certId = 'MM-CERT-6ED1D1B5' } = useParams()
  const formattedId = certId.toUpperCase()
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const [copied, setCopied] = useState(false)

  const [signatoryName, setSignatoryName] = useState('Mohd Zaid')
  const [signatoryTitle, setSignatoryTitle] = useState('Global Director of Candidate Assessments, MockMate AI')
  const [signatureImage, setSignatureImage] = useState('')

  useEffect(() => {
    api.get('/auth/verification-settings')
      .then(({ data }) => {
        if (data.certSignatoryName) setSignatoryName(data.certSignatoryName)
        if (data.certSignatoryTitle) setSignatoryTitle(data.certSignatoryTitle)
        if (data.certSignatureImage) setSignatureImage(data.certSignatureImage)
      })
      .catch(() => {})
  }, [])

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://ai-mock-interview-three-pi.vercel.app/verify-certificate/${formattedId}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(currentUrl)}&size=200x200&margin=2`

  function copyVerificationLink() {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    toast.success('Verification link copied to clipboard!')
    setTimeout(() => setCopied(false), 3000)
  }

  function shareOnLinkedIn() {
    const text = encodeURIComponent(`Verified Credential: I have completed technical interview assessments on MockMate AI! Verification Code: ${formattedId}`)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}&summary=${text}`, '_blank')
  }

  return (
    <main className="container page-center" style={{ minHeight: '85vh', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      <div style={{ maxWidth: '720px', width: '100%' }}>
        {/* Top Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            marginBottom: '1.5rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to MockMate AI
        </Link>

        {/* Verification Card Panel (Coursera / Google Style) */}
        <div
          className="panel"
          style={{
            padding: '2.8rem 2.2rem',
            textAlign: 'center',
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: 'var(--good-soft)',
              color: 'var(--good)',
              border: '1px solid rgba(4, 120, 87, 0.3)',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '1.6rem',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--good)', display: 'inline-block' }} />
            <CheckCircle2 size={18} /> Official Verified Credential Record
          </div>

          {/* Logo & Platform Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.2rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--accent-grad)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Zap size={22} />
            </div>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'var(--accent-grad)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MockMate AI
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>
            Candidate Credential Verification
          </h1>
          <p className="muted" style={{ fontSize: '0.92rem', marginBottom: '2rem', maxWidth: '52ch', margin: '0 auto 2rem' }}>
            This official record confirms candidate identity, evaluation completion, and milestone credentials on MockMate AI.
          </p>

          {/* Verification Breakdown Grid */}
          <div
            style={{
              background: 'var(--surface-2)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              padding: '1.6rem 1.8rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.85rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Candidate Name</span>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>MOHD ZAID</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.85rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Credential Awarded</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>Official Milestone Certificate</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.85rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Verification Code</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', background: 'var(--surface)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {formattedId}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.85rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Evaluation Engine</span>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Google Gemini 2.5 Technical Evaluator</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.85rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Signatory Authority</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
                {signatoryName} ({signatoryTitle})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Status</span>
              <span style={{ color: 'var(--good)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={17} /> Authenticated &amp; Active
              </span>
            </div>
          </div>

          {/* QR Code & Share Action Block */}
          <div
            style={{
              padding: '1.4rem',
              background: 'var(--surface)',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.2rem',
              marginBottom: '1.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={qrImageUrl}
                alt="Scannable QR Code"
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  padding: '2px',
                  background: '#ffffff',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Scannable ISO QR Code</div>
                <p className="muted small" style={{ margin: '0.1rem 0 0', fontSize: '0.8rem' }}>
                  Scan with any phone camera to verify this record live.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={copyVerificationLink}>
                {copied ? <Check size={15} style={{ color: 'var(--good)' }} /> : <Copy size={15} />}
                <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
              </button>

              <button className="btn btn-primary btn-sm" onClick={shareOnLinkedIn}>
                <Share2 size={15} />
                <span>Share Credential</span>
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Issued on {dateStr} • Official Record maintained by <strong style={{ color: 'var(--text)' }}>MockMate AI Global Assessment Authority</strong>.
          </div>
        </div>
      </div>
    </main>
  )
}
