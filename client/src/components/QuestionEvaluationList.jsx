import { Check, X, Bookmark } from 'lucide-react'
import { formatGeneratedText } from '../lib/text'
import FormattedPrompt from './FormattedPrompt'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionEvaluationList({
  questions = [],
  isQuiz = false,
  bookmarkedMap = {},
  onBookmarkQuestion,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {questions.map((q, idx) => {
        const isBookmarked = Boolean(bookmarkedMap[q.prompt])
        const hasAnswer = Boolean(q.answer && q.answer.trim())

        return (
          <div key={idx} className="panel" style={{ padding: '1.5rem' }}>
            {/* Question Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="tag-soft mono" style={{ fontSize: '0.78rem' }}>Q{idx + 1}</span>
                <span className="score-chip" style={{ fontSize: '0.78rem' }}>
                  {isQuiz ? (q.score === 10 ? 'Correct (+10)' : 'Incorrect (0)') : `${q.score ?? 0} / 10`}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onBookmarkQuestion(q)}
                title="Save question"
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Saved' : 'Bookmark'}
              </button>
            </div>

            {/* Prompt */}
            <div style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '1rem' }}>
              <FormattedPrompt text={q.prompt} />
            </div>

            {/* Quiz Mode: Multiple Choice Options with answers */}
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
                        border: isCorrect
                          ? '1px solid var(--good)'
                          : isPicked
                          ? '1px solid var(--bad)'
                          : '1px solid var(--border)',
                        background: isCorrect
                          ? 'var(--good-soft)'
                          : isPicked
                          ? 'var(--bad-soft)'
                          : 'var(--surface-2)',
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

            {/* Interview Mode: Candidate's Response */}
            {!isQuiz && (
              <div style={{ marginBottom: '1rem', padding: '0.9rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>
                  Your Response:
                </span>
                <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0, color: hasAnswer ? 'var(--text)' : 'var(--text-subtle)', fontStyle: hasAnswer ? 'normal' : 'italic' }}>
                  {hasAnswer ? q.answer : 'No answer was submitted for this question.'}
                </p>
              </div>
            )}

            {/* AI Qualitative Feedback */}
            <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                AI Feedback &amp; Suggestions:
              </span>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0 }}>
                {formatGeneratedText(q.feedback || 'No specific feedback recorded.')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
