import { MessagesSquare } from 'lucide-react'

// Simple site footer shown on every page.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <MessagesSquare size={18} />
          <span>
            MockMate<span className="brand-accent">AI</span>
          </span>
        </div>
        <p className="muted small">
          Practice interviews with AI — questions, quizzes, and instant feedback.
        </p>
        <div className="footer-meta muted small">
          <span>© {year} MockMate AI</span>
          <span className="dot">·</span>
          <span>Powered by Google Gemini</span>
        </div>
      </div>
    </footer>
  )
}
