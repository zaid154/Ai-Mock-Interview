import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Github, Globe, Linkedin, Sparkles, ArrowUpRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function scrollToSection(id) {
    if (id === 'overview') {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 80
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    } else {
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="footer">
      <div className="container" style={{ padding: '0 1rem' }}>
        <div className="footer-grid">
          {/* Brand & Creator Bio */}
          <div className="footer-brand-col">
            <Link to="/" className="brand" style={{ fontSize: '1.3rem' }}>
              <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
                <Zap size={17} />
              </div>
              <span>
                MockMate <span className="brand-accent">AI</span>
              </span>
            </Link>

            <p style={{ margin: '0.5rem 0 1rem', maxWidth: '38ch', fontSize: '0.86rem', lineHeight: '1.55', color: 'var(--text-muted)' }}>
              AI-driven technical engineering interviews, real-time feedback, and verified milestone credentials.
            </p>

            {/* Creator Badge & Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="https://portfolio-zeta-drab-97.vercel.app/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>Created by <strong style={{ color: 'var(--accent-primary)' }}>Mohd Zaid</strong></span>
                <ArrowUpRight size={12} style={{ color: 'var(--text-muted)' }} />
              </a>

              <div className="social-links" style={{ margin: 0 }}>
                <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" title="GitHub (@zaid154)">
                  <Github size={15} />
                </a>
                <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" title="Portfolio">
                  <Globe size={15} />
                </a>
                <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer" title="LinkedIn">
                  <Linkedin size={15} />
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
                <Link to="/bookmarks">Bookmarks</Link>
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
              <Mail size={13} style={{ color: 'var(--accent-primary)' }} /> zaidm1323@gmail.com
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
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', padding: '0 1rem' }}>
          <p className="muted small" style={{ margin: 0, fontSize: '0.8rem' }}>
            © {year} MockMate AI. Built by <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--text)' }}>Mohd Zaid</a> (<a href="mailto:zaidm1323@gmail.com" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>zaidm1323@gmail.com</a>).
          </p>
          <div className="badge-glow" style={{ fontSize: '0.74rem', padding: '0.2rem 0.65rem' }}>
            <Sparkles size={12} /> Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  )
}
