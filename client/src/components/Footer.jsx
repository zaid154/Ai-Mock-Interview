import { Link } from 'react-router-dom'
import { MessagesSquare, Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-grid container">
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <MessagesSquare size={24} />
              <span>
                MockMate<span className="accent">AI</span>
              </span>
            </Link>
            <p className="muted">
              Master your tech interviews with AI-driven mock sessions, real-time feedback, and targeted skill assessments.
            </p>
            <div className="social-links">
              <a href="#" aria-label="GitHub"><Github size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-col">
            <h4>Product</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/register">Mock Interviews</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/certificates">Certificates</Link>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <Link to="/">Help Center</Link>
            <Link to="/">Interview Guides</Link>
            <Link to="/">Blog</Link>
            <Link to="/">API Docs</Link>
          </div>

          <div className="footer-links-col">
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Contact</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="muted small">
            © {year} MockMate AI. Built with <Heart size={12} className="heart-icon" /> for developers.
          </p>
          <div className="footer-meta muted small">
            <span>Powered by <span className="accent-strong">Google Gemini</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
