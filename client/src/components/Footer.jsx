import { Link } from 'react-router-dom'
import { Zap, Github, Twitter, Linkedin, Heart, Sparkles } from 'lucide-react'

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
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
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
            <h4>Legal &amp; Privacy</h4>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
            <Link to="/">Security Overview</Link>
            <Link to="/">Contact Support</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0' }}>
          <p className="muted small" style={{ margin: 0 }}>
            © {year} MockMate AI Platform. Built with <Heart size={13} style={{ color: 'var(--bad)', verticalAlign: 'middle', margin: '0 0.2rem' }} /> for developers worldwide.
          </p>
          <div className="badge-glow" style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}>
            <Sparkles size={13} /> Powered by Google Gemini AI
          </div>
        </div>
      </div>
    </footer>
  )
}
