import { useState } from 'react'
import { Bookmark, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { normalizePrompt } from '../lib/text'
import FormattedPrompt from './FormattedPrompt'

export default function QuestionEvaluationList({
  questions = [],
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
          <div key={idx} className="panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="tag-soft mono" style={{ fontSize: '0.78rem' }}>Q{idx + 1}</span>
                <span className="score-chip" style={{ fontSize: '0.78rem' }}>
                  {q.score ?? 0} / 10 pts
                </span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onBookmarkQuestion(q)}
                title={isBookmarked ? 'Remove bookmark' : 'Save question to Bookmarks'}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} style={{ color: isBookmarked ? '#2563eb' : 'inherit' }} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            </div>

            <div style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '1rem', color: '#111827' }}>
              <FormattedPrompt text={q.prompt} />
            </div>

            {hasAnswer ? (
              <div style={{ marginBottom: '1rem' }}>
                <div className="subtle small uppercase" style={{ fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  Your Response
                </div>
                <div style={{ padding: '0.85rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
                  {q.answer}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#9ca3af', fontSize: '0.85rem' }}>
                No response was recorded for this question.
              </div>
            )}

            {q.feedback && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.15)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#2563eb', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <Lightbulb size={14} /> AI Evaluation
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: '1.55' }}>
                  {q.feedback}
                </p>
              </div>
            )}

            {q.idealAnswer && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleReveal(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#2563eb' }}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{isOpen ? 'Hide Ideal Solution' : 'Reveal Ideal Answer & Key Points'}</span>
                </button>

                {isOpen && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.88rem', lineHeight: '1.6', color: '#1f2937' }}>
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '0.4rem', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      Recommended Architecture &amp; Solution:
                    </div>
                    {q.idealAnswer}
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
