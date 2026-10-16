import { useState } from 'react'
import { Check, X, Bookmark, ChevronDown, ChevronUp, Lightbulb, Shield, Layers, MessageSquare, Award } from 'lucide-react'
import { formatGeneratedText, normalizePrompt } from '../lib/text'
import FormattedPrompt from './FormattedPrompt'

const LETTERS = ['A', 'B', 'C', 'D']

const RUBRIC_PILLARS = [
  { key: 'technicalAccuracy', label: 'Tech Accuracy', max: 3, color: '#38bdf8', Icon: Shield },
  { key: 'depthAndTradeoffs', label: 'Architecture Depth', max: 3, color: '#c084fc', Icon: Layers },
  { key: 'structureAndFlow', label: 'STAR Structure', max: 2, color: '#34d399', Icon: Award },
  { key: 'communication', label: 'Communication', max: 2, color: '#fbbf24', Icon: MessageSquare },
]

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
        const r = q.rubric || {
          technicalAccuracy: hasAnswer ? Number((q.score * 0.3).toFixed(1)) : 0,
          depthAndTradeoffs: hasAnswer ? Number((q.score * 0.3).toFixed(1)) : 0,
          structureAndFlow: hasAnswer ? Number((q.score * 0.2).toFixed(1)) : 0,
          communication: hasAnswer ? Number((q.score * 0.2).toFixed(1)) : 0,
        }

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

            <div style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.5', marginBottom: '1rem', color: '#f8fafc' }}>
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
              <div style={{ marginBottom: '1rem', padding: '0.9rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700 }}>Your Submitted Response:</span>
                <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0, color: hasAnswer ? 'var(--text)' : 'var(--text-subtle)', fontStyle: hasAnswer ? 'normal' : 'italic' }}>
                  {hasAnswer ? q.answer : 'No answer was submitted for this question.'}
                </p>
              </div>
            )}

            {!isQuiz && hasAnswer && (
              <div style={{ marginBottom: '1rem', padding: '0.9rem 1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent-primary)' }}>
                    Evaluation Rubric Breakdown (Score: {q.score}/10)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Calculated across 4 core engineering criteria</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {RUBRIC_PILLARS.map(({ key, label, max, color, Icon }) => {
                    const val = r[key] ?? 0
                    return (
                      <div key={key} style={{ background: 'var(--surface-2)', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Icon size={12} style={{ color }} /> {label}
                          </span>
                          <span className="mono bold" style={{ fontSize: '0.8rem', color }}>{val} / {max}</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {Array.isArray(q.talkingPoints) && q.talkingPoints.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-subtle)' }}>Talking Points Audit:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {q.talkingPoints.map((tp, tpIdx) => {
                        const isPositive = tp.startsWith('✓') || tp.toLowerCase().includes('strong') || tp.toLowerCase().includes('good')
                        return (
                          <span
                            key={tpIdx}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: isPositive ? 'rgba(52, 211, 153, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: isPositive ? '#6ee7b7' : '#fcd34d',
                              border: isPositive ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                            }}
                          >
                            {tp}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: '0.9rem', borderRadius: '8px', background: 'var(--accent-grad-subtle)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '0.75rem' }}>
              <span className="subtle small uppercase" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Interviewer Feedback &amp; Suggestions:</span>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', margin: 0 }}>
                {formatGeneratedText(q.feedback || 'No specific feedback recorded.')}
              </p>
            </div>

            {(q.modelAnswer || !isQuiz) && (
              <div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleReveal(idx)}
                  style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Lightbulb size={14} style={{ color: 'var(--warn)' }} />
                  <span>{isOpen ? 'Hide Model 10/10 Answer' : 'Compare with Model 10/10 Answer'}</span>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {isOpen && (
                  <div style={{ marginTop: '0.6rem', padding: '0.9rem 1rem', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid rgba(168, 85, 247, 0.25)', fontSize: '0.88rem', lineHeight: 1.6, color: '#e2e8f0' }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#c084fc', marginBottom: '0.35rem' }}>
                      Senior Engineering Reference Answer:
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
