import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, Award, Zap, ExternalLink, ArrowLeft } from 'lucide-react'

export default function VerifyCertificate() {
  const { certId = 'MM-CERT-6ED1D1B5' } = useParams()
  const formattedId = certId.toUpperCase()
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <main className="container page-center" style={{ minHeight: '80vh', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Top Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to MockMate AI
        </Link>

        {/* Verification Card Panel */}
        <div className="panel" style={{ padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}>
          {/* Status Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '0.45rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.84rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={18} /> Official Verified Credential
          </div>

          {/* Logo & Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <Zap size={20} />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MockMate AI
            </span>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>
            Credential Verification
          </h1>
          <p className="muted small" style={{ fontSize: '0.88rem', marginBottom: '2rem' }}>
            This official record confirms that the candidate has successfully passed technical interview assessments on MockMate AI.
          </p>

          {/* Certificate Detail Grid */}
          <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.75rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate Name</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>MOHD ZAID</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.75rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credential Awarded</span>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--accent-primary)' }}>Official Milestone Certificate</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.75rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification ID</span>
              <span className="mono" style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>{formattedId}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.75rem' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluation Engine</span>
              <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Gemini 2.5 Technical Evaluator</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted small" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={16} /> Authenticated & Active
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
            Issued on {dateStr} • Authorized by MockMate AI Global Assessment Authority.
          </div>
        </div>
      </div>
    </main>
  )
}
