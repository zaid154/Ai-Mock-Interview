import { Link } from 'react-router-dom'
import { Shield, Lock, FileText, Database, Eye, CheckCircle2 } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <main className="container" style={{ maxWidth: '840px', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="reflect-badge" style={{ marginBottom: '0.75rem' }}>
          <Shield size={12} style={{ color: '#c084fc' }} />
          <span className="reflect-badge-text">Privacy &amp; Data Governance</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f8fafc' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(239, 237, 253, 0.65)', fontSize: '0.9rem', margin: 0 }}>
          Last updated: October 2026 • MockMate AI Technical Interview Practice Platform
        </p>
      </div>

      <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} style={{ color: '#a855f7' }} /> 1. Overview &amp; Scope
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            MockMate AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;) provides technical interview practice tools for software engineers. This Privacy Policy describes how candidate information is collected, processed, and safeguarded when you create an account, complete interview drills, or upload resume documents.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: '#a855f7' }} /> 2. Information We Collect
          </h2>
          <ul style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.25rem' }}>
            <li><strong>Account Identity:</strong> Name, email address, password hash (salted using bcrypt), and optional bio/avatar selections.</li>
            <li><strong>Practice Telemetry:</strong> Interview responses, multiple-choice quiz picks, candidate study notes, and diagnostic scores.</li>
            <li><strong>Resume Context:</strong> When you optionally upload a PDF resume, extracted technical skills and project summaries are indexed solely to tailor interview scenarios. Original PDF binaries are processed in-memory and not shared with third-party advertisers.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} style={{ color: '#a855f7' }} /> 3. Third-Party AI Processing
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            MockMate AI integrates with Google Gemini API to generate interview questions and construct diagnostic rubrics. Only prompt parameters and sanitized question responses are sent to the AI API for immediate real-time evaluation. We do not sell candidate data to external brokers.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} style={{ color: '#a855f7' }} /> 4. Data Retention &amp; Candidate Rights
          </h2>
          <p style={{ color: 'rgba(239, 237, 253, 0.8)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            You maintain full ownership of your data. You may delete individual practice sessions, bookmarks, or attached resume profiles at any time via your dashboard. To request complete deletion of your account and associated records, email our team directly.
          </p>
          <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600 }}>Privacy Inquiries: </span>
            <a href="mailto:zaidm1323@gmail.com" style={{ fontSize: '0.85rem', color: '#f8fafc', textDecoration: 'underline' }}>zaidm1323@gmail.com</a>
          </div>
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
