import { Link } from 'react-router-dom'
import { FileCheck, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react'

export default function TermsOfService() {
  return (
    <main className="container" style={{ maxWidth: '840px', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
          <FileCheck size={12} style={{ color: '#c084fc' }} />
          <span className="reflect-badge-text">User Agreement</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
          Terms of Service
        </h1>
        <p style={{ color: 'rgba(239, 237, 253, 0.65)', fontSize: '0.9rem', margin: 0 }}>
          Effective: October 2026 • MockMate AI Technical Interview Practice Platform
        </p>
      </div>

      <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} style={{ color: '#a855f7' }} /> 1. Acceptance of Terms
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            By registering an account or accessing MockMate AI, you agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, please discontinue use of the platform immediately.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} style={{ color: '#a855f7' }} /> 2. Nature of the Service &amp; AI Disclaimer
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            MockMate AI is an educational simulation tool designed to assist candidates with technical self-study and preparation. Interview assessments, Big-O critiques, and scoring rubrics are generated via artificial intelligence algorithms. They do not constitute certified hiring recommendations, official employer endorsement, or employment guarantees.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: '#a855f7' }} /> 3. Fair Use &amp; Acceptable Behavior
          </h2>
          <ul style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.25rem' }}>
            <li>You agree not to abuse, reverse engineer, or flood the API generation endpoints with automated scraping bots.</li>
            <li>You agree not to upload malicious payloads, illicit binaries, or confidential non-public enterprise materials in resume uploads.</li>
            <li>All generated milestone credentials and verification links are intended for personal portfolio demonstration. Falsifying or modifying signed hash values is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: '#a855f7' }} /> 4. Service Availability &amp; Modifications
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            We continuously refine our evaluation algorithms and curriculum tracks. We reserve the right to modify or temporarily suspend features with reasonable notice. For support or dispute inquiries, contact our team.
          </p>
        </section>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/" className="reflect-btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
          Back to Home
        </Link>
      </div>
    </main>
  )
}
