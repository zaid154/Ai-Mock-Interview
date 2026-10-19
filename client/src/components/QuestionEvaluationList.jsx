import { useState } from 'react'
import { Check, X, Bookmark, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { formatGeneratedText, normalizePrompt } from '../lib/text'
import FormattedPrompt from './FormattedPrompt'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionEvaluationList({
  questions = [],
  isQuiz = false,
  bookmarkedMap = {},
  onBookmarkQuestion,
}) {
  const [revealed, setRevealed] = useState({})

  const toggleReveal = (idx) => setRevealed((p) => ({ ...p, [idx]: !p[idx] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {questions.map((q, idx) => {
        const isBookmarked = Boolean(bookmarkedMap[normalizePrompt(q.prompt)])
        const hasAnswer = Boolean(q.answer?.trim())
        const isOpen = Boolean(revealed[idx])

        return (
          <div key={idx} className="panel" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="tag-soft mono" style={{ fontSize: '0.78rem' }}>Q{idx + 1}</span>
                <span className="score-chip" style={{ fontSize: '0.78rem' }}>
                  {isQuiz ? (q.score === 10 ? 'Correct (+10)' : 'Incorrect (0)') : `${q.score ?? 0} / 10 pts`}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onBookmarkQuestion(q)}
                title={isBookmarked ? 'Remove bookmark' : 'Save question to Bookmarks'}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} style={{ color: isBookmarked ? 'var(--accent-primary)' : 'inherit' }} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            </div>

            <div style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '1rem', color: '#111827' }}>
              <FormattedPrompt text={q.prompt} />
            </div>

            {isQuiz && Array.isArray(q.options) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex
                  const isPicked = optIdx === q.selectedIndex
                  return (
                    <div
                      key={optIdx}
                      style={{
                        padding: '0.7rem 0.9rem',
                        borderRadius: '8px',
                        border: `1px solid ${isCorrect ? 'var(--good)' : isPicked ? 'var(--bad)' : 'var(--border)'}`,
                        background: isCorrect ? 'var(--good-soft)' : isPicked ? 'var(--bad-soft)' : 'var(--surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.88rem',
                      }}
                    >
                      <span className="mono" style={{ fontWeight: 700 }}>{LETTERS[optIdx]}.</span>
                      <span style={{ flex: 1 }}><FormattedPrompt text={opt} /></span>
                      {isCorrect && <Check size={16} style={{ color: 'var(--good)' }} />}
                      {isPicked && !isCorrect && <X size={16} style={{ color: 'var(--bad)' }} />}
                    </div>
                  )
                })}
              </div>
            )}

            {!isQuiz && (
              <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700, color: '#6b7280' }}>Your Submitted Response:</span>
                <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0, color: hasAnswer ? '#111827' : '#9ca3af', fontStyle: hasAnswer ? 'normal' : 'italic' }}>
                  {hasAnswer ? q.answer : 'No answer was submitted for this question.'}
                </p>
              </div>
            )}

            <div style={{ padding: '0.9rem 1rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
              <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 700, color: '#2563eb' }}>
                Interviewer Feedback:
              </span>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0, color: '#1f2937' }}>
                {formatGeneratedText(q.feedback || 'No specific feedback recorded.')}
              </p>
            </div>

            {(q.modelAnswer || !isQuiz) && (
              <div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleReveal(idx)}
                  style={{ fontSize: '0.78rem', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.5rem' }}
                >
                  <Lightbulb size={14} style={{ color: '#2563eb' }} />
                  <span>{isOpen ? 'Hide Reference Answer' : 'View Reference Answer'}</span>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {isOpen && (
                  <div style={{ marginTop: '0.6rem', padding: '0.9rem 1rem', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.88rem', lineHeight: 1.6, color: '#1f2937' }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#2563eb', marginBottom: '0.35rem' }}>
                      Reference Answer:
                    </span>
                    <FormattedPrompt text={q.modelAnswer || 'A high-scoring answer clearly defines core concepts, details memory/runtime trade-offs, and explains failure recovery mechanisms.'} />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
