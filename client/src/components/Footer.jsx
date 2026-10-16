import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, Github, Globe, Linkedin, Sparkles, ArrowUpRight, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { goToSection } from '../lib/scrollToSection'

export default function Footer() {
  const year = new Date().getFullYear()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function scrollToSection(id) {
    goToSection(id, { pathname: location.pathname, navigate })
  }

  return (
    <footer className="footer">
      <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="footer-grid">
          {/* Brand & Creator Bio */}
          <div className="footer-brand-col">
            <Link to="/" className="reflect-brand">
              <div className="reflect-brand-icon" style={{ width: '30px', height: '30px' }}>
                <img src="/logo.png" alt="MockMate AI Logo" className="reflect-brand-img" />
              </div>
              <span className="reflect-brand-title">
                MockMate <span className="reflect-brand-badge">AI</span>
              </span>
            </Link>

            <p style={{ margin: '0.5rem 0 1rem', maxWidth: '38ch', fontSize: '0.86rem', lineHeight: '1.55', color: 'rgba(239, 237, 253, 0.65)' }}>
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f4f0ff',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <span>Created by <strong style={{ color: '#c084fc' }}>Mohd Zaid</strong></span>
                <ArrowUpRight size={12} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
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
            <h4>Platform &amp; Legal</h4>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/bookmarks">Bookmarks</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/certificates">Certificates</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </>
            ) : (
              <>
                <Link to="/">Home</Link>
                <Link to="/leaderboard">Leaderboard</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
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
              <Mail size={13} style={{ color: '#c084fc' }} /> zaidm1323@gmail.com
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
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(239, 237, 253, 0.55)' }}>
              © {year} MockMate AI. Built by <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: '#f8fafc' }}>Mohd Zaid</a>.
            </p>
            <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.78rem' }}>
              <Link to="/privacy" style={{ color: 'rgba(239, 237, 253, 0.65)' }}>Privacy</Link>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
              <Link to="/terms" style={{ color: 'rgba(239, 237, 253, 0.65)' }}>Terms</Link>
            </div>
          </div>
          <div className="reflect-badge" style={{ fontSize: '0.74rem', padding: '0.2rem 0.65rem', margin: 0 }}>
            <span className="reflect-badge-text">Powered by Google Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
