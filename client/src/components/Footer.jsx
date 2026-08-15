import { Link } from 'react-router-dom'
import { Zap, Github, Globe, Linkedin, Heart, Sparkles, Mail } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container" style={{ padding: '0' }}>
        <div className="footer-grid">
          {/* Brand & Author Creator Card */}
          <div className="footer-brand-col">
            <Link to="/" className="brand" style={{ fontSize: '1.35rem' }}>
              <div className="brand-icon-box" style={{ width: '34px', height: '34px' }}>
                <Zap size={18} />
              </div>
              <span>
                MockMate <span className="brand-accent">AI</span>
              </span>
            </Link>
            <p>
              Master technical engineering interviews with AI-driven practice sessions, instant line-by-line scoring, and verified credential certificates.
            </p>

            {/* NoteGenie Style Sleek Author Card */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.9rem 1.1rem',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-sm)',
                maxWidth: '340px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Author: <strong style={{ color: 'var(--text)', fontWeight: 700 }}>Mohd Zaid</strong>
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    background: 'var(--accent-grad-subtle)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Creator
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem' }}>
                <div>
                  <span className="muted">Contact: </span>
                  <a href="mailto:zaidm1323@gmail.com" style={{ color: 'var(--text)', fontWeight: 500 }}>
                    zaidm1323@gmail.com
                  </a>
                </div>
                <div>
                  <span className="muted">GitHub: </span>
                  <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    github.com/zaid154
                  </a>
                </div>
                <div>
                  <span className="muted">Portfolio: </span>
                  <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    portfolio-zeta-drab-97.vercel.app
                  </a>
                </div>
              </div>
            </div>

            <div className="social-links" style={{ marginTop: '1rem' }}>
              <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" aria-label="GitHub Profile" title="GitHub (@zaid154)">
                <Github size={18} />
              </a>
              <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" aria-label="Developer Portfolio" title="Portfolio (Mohd Zaid)">
                <Globe size={18} />
              </a>
              <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer" aria-label="LinkedIn Profile" title="LinkedIn (Mohd Zaid)">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/bookmarks">Saved Bookmarks</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/certificates">Certificates</Link>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <Link to="/">System Design Prep</Link>
            <Link to="/">Frontend Engineering</Link>
            <Link to="/">Backend Architecture</Link>
            <Link to="/">Behavioral Interview Guide</Link>
          </div>

          <div className="footer-links-col">
            <h4>Creator Profile</h4>
            <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer">
              Developer Portfolio ↗
            </a>
            <a href="https://github.com/zaid154" target="_blank" rel="noreferrer">
              GitHub Repository ↗
            </a>
            <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer">
              Connect on LinkedIn ↗
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0' }}>
          <p className="muted small" style={{ margin: 0 }}>
            © {year} MockMate AI. Crafted with <Heart size={13} style={{ color: 'var(--bad)', verticalAlign: 'middle', margin: '0 0.2rem' }} /> by{' '}
            <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'underline' }}>
              Mohd Zaid
            </a>.
          </p>
          <div className="badge-glow" style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>
            <Sparkles size={13} /> Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  )
}
