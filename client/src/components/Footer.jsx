import { Link } from 'react-router-dom'
import { Zap, Github, Globe, Linkedin, Heart, Sparkles } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container" style={{ padding: '0' }}>
        <div className="footer-grid">
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
            <div className="social-links">
              <a href="https://github.com/zaid154" target="_blank" rel="noreferrer" aria-label="GitHub Profile" title="GitHub (@zaid154)"><Github size={18} /></a>
              <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" aria-label="Developer Portfolio" title="Portfolio (Mohd Zaid)"><Globe size={18} /></a>
              <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer" aria-label="LinkedIn Profile" title="LinkedIn (Mohd Zaid)"><Linkedin size={18} /></a>
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
            <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer">Developer Portfolio ↗</a>
            <a href="https://github.com/zaid154" target="_blank" rel="noreferrer">GitHub Repository ↗</a>
            <a href="https://www.linkedin.com/in/mohd-zaid-794090231/" target="_blank" rel="noreferrer">Connect on LinkedIn ↗</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0' }}>
          <p className="muted small" style={{ margin: 0 }}>
            © {year} MockMate AI. Engineered &amp; Developed with <Heart size={13} style={{ color: 'var(--bad)', verticalAlign: 'middle', margin: '0 0.2rem' }} /> by <a href="https://portfolio-zeta-drab-97.vercel.app/" target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'underline' }}>Mohd Zaid</a>.
          </p>
          <div className="badge-glow" style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>
            <Sparkles size={13} /> Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  )
}
