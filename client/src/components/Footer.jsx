import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Github, Globe, Linkedin, Sparkles, ArrowUpRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function scrollToSection(id) {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="footer">
      <div className="container" style={{ padding: '0' }}>
        <div className="footer-grid" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 1fr' }}>
          {/* Brand & Creator Bio */}
          <div className="footer-brand-col">
            <Link to="/" className="brand" style={{ fontSize: '1.35rem' }}>
              <div className="brand-icon-box" style={{ width: '34px', height: '34px' }}>
                <Zap size={18} />
              </div>
              <span>
                MockMate <span className="brand-accent">AI</span>
              </span>
            </Link>

            <p style={{ margin: '0.6rem 0 1.2rem', maxWidth: '36ch', fontSize: '0.9rem', lineHeight: '1.6' }}>
              AI-driven technical engineering interviews, real-time feedback, and verified milestone certificates.
            </p>

            {/* Premium Minimalist Creator Pill, Email & Socials */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a
                href="https://portfolio-zeta-drab-97.vercel.app/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Created by <strong style={{ color: 'var(--accent-primary)' }}>Mohd Zaid</strong></span>
                <ArrowUpRight size={13} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a
                href="mailto:zaidm1323@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
                title="Send Direct Email"
              >
                <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>zaidm1323@gmail.com</span>
              </a>

              <div className="social-links" style={{ margin: 0 }}>
                <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" title="GitHub (@zaid154)">
                  <Github size={16} />
                </a>
                <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" title="Portfolio">
                  <Globe size={16} />
                </a>
                <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer" title="LinkedIn">
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="footer-links-col">
            <h4>Platform</h4>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/bookmarks">Saved Bookmarks</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/certificates">Certificates</Link>
                <Link to="/profile">Profile Settings</Link>
              </>
            ) : (
              <>
                <button type="button" onClick={() => scrollToSection('overview')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>Overview</button>
                <button type="button" onClick={() => scrollToSection('benefits')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>Benefits</button>
                <button type="button" onClick={() => scrollToSection('specifications')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>Specifications</button>
                <button type="button" onClick={() => scrollToSection('how-it-works')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, font: 'inherit', cursor: 'pointer', textAlign: 'left' }}>How-to</button>
                <Link to="/leaderboard">Leaderboard</Link>
              </>
            )}
          </div>

          <div className="footer-links-col">
            <h4>Prep Tracks</h4>
            <Link to={user ? '/dashboard' : '/register'}>Frontend Engineering</Link>
            <Link to={user ? '/dashboard' : '/register'}>Backend Architecture</Link>
            <Link to={user ? '/dashboard' : '/register'}>Fullstack &amp; MERN</Link>
            <Link to={user ? '/dashboard' : '/register'}>System Design &amp; SQL</Link>
          </div>

          <div className="footer-links-col">
            <h4>Connect &amp; Author</h4>
            <a href="mailto:zaidm1323@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={14} style={{ color: 'var(--accent-primary)' }} /> zaidm1323@gmail.com
            </a>
            <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer">
              Portfolio Site ↗
            </a>
            <a href="https://github.com/zaid154" target="_blank" rel="noreferrer">
              GitHub Profile ↗
            </a>
            <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer">
              LinkedIn Network ↗
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0' }}>
          <p className="muted small" style={{ margin: 0 }}>
            © {year} MockMate AI. Built by <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--text)' }}>Mohd Zaid</a> (<a href="mailto:zaidm1323@gmail.com" style={{ color: 'var(--accent-primary)' }}>zaidm1323@gmail.com</a>).
          </p>
          <div className="badge-glow" style={{ fontSize: '0.75rem', padding: '0.25rem 0.7rem' }}>
            <Sparkles size={13} /> Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  )
}
