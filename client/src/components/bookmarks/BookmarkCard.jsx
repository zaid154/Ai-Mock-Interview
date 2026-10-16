import { useState } from 'react'
import { Trash2, Edit3, Copy, Check, Eye, EyeOff, Lightbulb } from 'lucide-react'
import FormattedPrompt from '../FormattedPrompt'

export default function BookmarkCard({
  bookmark: b,
  onDelete,
  onSaveNotes,
}) {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteText, setNoteText] = useState(b.notes || '')
  const [savingNote, setSavingNote] = useState(false)

  async function handleCopy() {
    const textToCopy = `Question: ${b.prompt}\n\nKey Concept Answer:\n${b.answer || 'No answer recorded.'}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
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
    <article className="panel" style={{ padding: '1.6rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px' }}>
      {/* Question Header & Role Tags */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="tag">{b.role || 'Question'}</span>
            {b.category && <span className="tag-soft">{b.category}</span>}
          </div>
          <h3 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.5, fontWeight: 600, color: '#f8fafc' }}>
            <FormattedPrompt text={b.prompt} />
          </h3>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleCopy}
            aria-label="Copy question and answer text"
            title="Copy question text"
          >
            {isCopied ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            className="history-del"
            onClick={() => onDelete(b._id)}
            aria-label={`Remove question: ${b.prompt.slice(0, 40)}...`}
            title="Remove Bookmark"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Answer Toggle Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem', background: 'var(--surface-2)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
        <span className="muted small" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Lightbulb size={14} style={{ color: 'var(--warn)' }} aria-hidden="true" /> Self-Assessment Review
        </span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setIsRevealed((prev) => !prev)}
          aria-expanded={isRevealed}
          style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}
        >
          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{isRevealed ? 'Hide Answer' : 'Reveal Model Answer'}</span>
        </button>
      </div>

      {/* Revealed Answer Content */}
      {isRevealed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
          {b.modelAnswer && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '10px', padding: '1rem' }}>
              <span className="muted small" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem', display: 'block', marginBottom: '0.4rem', color: '#c084fc' }}>
                Senior Engineer Reference Answer:
              </span>
              <div style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.6, color: '#f1f5f9' }}>
                <FormattedPrompt text={b.modelAnswer} />
              </div>
            </div>
          )}

          {b.answer && (!b.modelAnswer || b.answer !== b.modelAnswer) && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
              <span className="muted small" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem', display: 'block', marginBottom: '0.4rem', color: 'var(--accent-primary)' }}>
                Your Practice Response:
              </span>
              <div style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text)' }}>
                <FormattedPrompt text={b.answer} />
              </div>
            </div>
          )}

          {Array.isArray(b.talkingPoints) && b.talkingPoints.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {b.talkingPoints.map((tp, tpIdx) => (
                <span key={tpIdx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid var(--border-soft)' }}>
                  {tp}
                </span>
              ))}
            </div>
          )}

          {b.feedback && (
            <div style={{ borderLeft: '3px solid var(--accent-primary)', background: 'var(--surface-2)', padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Evaluation Takeaway: </strong>
              {b.feedback}
            </div>
          )}
        </div>
      )}

      {/* Revision Notes Section */}
      <div style={{ padding: '0.9rem', background: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <Edit3 size={13} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" /> Revision Notes
          </span>
          {!isEditingNote && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditingNote(true)}
              style={{ fontSize: '0.76rem', padding: '0.2rem 0.5rem' }}
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
              placeholder="Write key concepts, edge cases, or code patterns to remember..."
              autoFocus
              style={{ fontSize: '0.88rem', borderRadius: '8px', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditingNote(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={savingNote}>
                {savingNote ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.86rem', color: b.notes ? 'var(--text)' : 'var(--text-subtle)', fontStyle: b.notes ? 'normal' : 'italic', lineHeight: 1.5 }}>
            {b.notes || 'No custom notes recorded. Click "+ Add Note" to save recall takeaways.'}
          </p>
        )}
      </div>
    </article>
  )
}
