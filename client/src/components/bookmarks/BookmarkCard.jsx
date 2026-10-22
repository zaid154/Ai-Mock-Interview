import { useState, useEffect } from 'react'
import { Trash2, Edit3, Copy, Check, ChevronDown, ChevronUp, Lightbulb, FileText } from 'lucide-react'
import FormattedPrompt from '../FormattedPrompt'

const LETTERS = ['A', 'B', 'C', 'D']

export default function BookmarkCard({
  bookmark: b,
  index,
  onDelete,
  onSaveNotes,
  defaultExpanded = false,
}) {
  const [showSolution, setShowSolution] = useState(defaultExpanded)
  const [showMyAnswer, setShowMyAnswer] = useState(false)
  const [showNotes, setShowNotes] = useState(Boolean(b.notes?.trim()))
  const [isCopied, setIsCopied] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteText, setNoteText] = useState(b.notes || '')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    setShowSolution(defaultExpanded)
  }, [defaultExpanded])

  const isQuiz = Array.isArray(b.options) && b.options.length > 0
  const hasSolution = Boolean(b.modelAnswer?.trim() || b.answer?.trim() || isQuiz)
  const hasMyAnswer = Boolean(b.answer?.trim() && b.modelAnswer && b.answer.trim() !== b.modelAnswer.trim())

  async function handleCopy() {
    const solutionText = b.modelAnswer || b.answer || (isQuiz && b.options && b.correctIndex != null ? `Correct Option: ${LETTERS[b.correctIndex]}. ${b.options[b.correctIndex]}` : '')
    const textToCopy = `Question: ${b.prompt}${solutionText ? `\n\nSolution:\n${solutionText}` : ''}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {}
  }

  async function handleSave() {
    setSavingNote(true)
    try {
      await onSaveNotes(b._id, noteText)
      setIsEditingNote(false)
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <article
      className="panel"
      style={{
        padding: '1.25rem 1.4rem',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* ── Top Meta Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {index != null && (
            <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '5px', background: '#f3f4f6', color: '#4b5563' }}>
              #{index + 1}
            </span>
          )}
          <span className="tag" style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>
            {b.role || 'Software Engineer'}
          </span>
          {b.category && b.category !== 'General' && (
            <span className="tag-soft" style={{ fontSize: '0.72rem' }}>
              {b.category}
            </span>
          )}
          {isQuiz && (
            <span className="tag-soft" style={{ fontSize: '0.72rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              MCQ Quiz
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            title="Copy question text"
            style={{ fontSize: '0.76rem', padding: '0.25rem 0.55rem', gap: '0.3rem', color: '#4b5563' }}
          >
            {isCopied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(b._id)}
            title="Remove from saved questions"
            style={{ fontSize: '0.76rem', padding: '0.25rem 0.45rem', color: '#9ca3af' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Question Prompt ── */}
      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', lineHeight: 1.5, marginBottom: isQuiz ? '0.85rem' : '1rem' }}>
        <FormattedPrompt text={b.prompt} />
      </div>

      {/* ── If MCQ Quiz question: render options cleanly ── */}
      {isQuiz && Array.isArray(b.options) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.45rem', marginBottom: '1rem' }}>
          {b.options.map((opt, optIdx) => {
            const isCorrect = optIdx === b.correctIndex
            return (
              <div
                key={optIdx}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: isCorrect ? '1.5px solid #16a34a' : '1px solid #e5e7eb',
                  background: isCorrect ? '#f0fdf4' : '#f9fafb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.85rem',
                  color: isCorrect ? '#15803d' : '#374151',
                }}
              >
                <span className="mono" style={{ fontWeight: 700, fontSize: '0.8rem' }}>{LETTERS[optIdx]}.</span>
                <span style={{ flex: 1 }}><FormattedPrompt text={opt} /></span>
                {isCorrect && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    <Check size={12} /> Correct Answer
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Interactive Action Buttons Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {hasSolution && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="btn btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '0.25rem 0.65rem',
                gap: '0.35rem',
                background: showSolution ? '#eff6ff' : '#f8fafc',
                color: showSolution ? '#2563eb' : '#374151',
                border: showSolution ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
                fontWeight: 600,
              }}
            >
              <Lightbulb size={13} style={{ color: '#2563eb' }} />
              <span>{showSolution ? 'Hide Solution' : 'View Solution'}</span>
              {showSolution ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          {hasMyAnswer && (
            <button
              type="button"
              onClick={() => setShowMyAnswer(!showMyAnswer)}
              className="btn btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '0.25rem 0.65rem',
                gap: '0.35rem',
                background: showMyAnswer ? '#f1f5f9' : '#f8fafc',
                color: showMyAnswer ? '#0f172a' : '#4b5563',
                border: '1px solid #e5e7eb',
              }}
            >
              <FileText size={13} />
              <span>My Answer</span>
              {showMyAnswer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="btn btn-sm"
            style={{
              fontSize: '0.78rem',
              padding: '0.25rem 0.65rem',
              gap: '0.35rem',
              background: showNotes ? '#f1f5f9' : '#f8fafc',
              color: b.notes ? '#2563eb' : '#4b5563',
              border: '1px solid #e5e7eb',
            }}
          >
            <Edit3 size={13} style={{ color: b.notes ? '#2563eb' : 'inherit' }} />
            <span>{b.notes ? 'Notes' : '+ Add Note'}</span>
            {b.notes && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded Solution Box ── */}
      {showSolution && (
        <div style={{ marginTop: '0.85rem', padding: '0.95rem 1.1rem', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.88rem', lineHeight: 1.6, color: '#1f2937' }}>
          <div style={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#2563eb', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lightbulb size={13} /> Reference Solution &amp; Key Concepts
          </div>
          <FormattedPrompt text={b.modelAnswer || b.answer || 'A solid answer clearly defines core concepts, outlines trade-offs, and provides concrete real-world examples.'} />

          {b.feedback && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed #bfdbfe', fontSize: '0.82rem', color: '#4b5563' }}>
              <strong style={{ color: '#111827' }}>Feedback Takeaway: </strong> {b.feedback}
            </div>
          )}
        </div>
      )}

      {/* ── Expanded My Answer Box ── */}
      {showMyAnswer && (
        <div style={{ marginTop: '0.85rem', padding: '0.95rem 1.1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.88rem', lineHeight: 1.6, color: '#1f2937' }}>
          <div style={{ fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileText size={13} /> Your Practice Response
          </div>
          <FormattedPrompt text={b.answer} />
        </div>
      )}

      {/* ── Expanded / Editable Personal Notes Box ── */}
      {showNotes && (
        <div style={{ marginTop: '0.85rem', padding: '0.85rem 1.1rem', borderRadius: '10px', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#4b5563', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Edit3 size={12} style={{ color: '#2563eb' }} /> Personal Revision Notes
            </span>
            {!isEditingNote && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditingNote(true)}
                style={{ fontSize: '0.74rem', padding: '0.15rem 0.5rem', color: '#2563eb' }}
              >
                {b.notes ? 'Edit' : '+ Add Note'}
              </button>
            )}
          </div>

          {isEditingNote ? (
            <div>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write reminders, code patterns, or edge cases to remember..."
                autoFocus
                style={{ fontSize: '0.86rem', borderRadius: '8px', width: '100%', padding: '0.6rem 0.75rem', background: '#ffffff', border: '1px solid #d1d5db' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.45rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingNote(false)}>Cancel</button>
                <button type="button" className="reflect-btn-primary" onClick={handleSave} disabled={savingNote} style={{ padding: '0.3rem 0.85rem', fontSize: '0.78rem' }}>
                  {savingNote ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.86rem', color: b.notes ? '#1f2937' : '#9ca3af', fontStyle: b.notes ? 'normal' : 'italic', lineHeight: 1.55 }}>
              {b.notes || 'No custom notes recorded. Click "Edit" to jot down your recall takeaways.'}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
