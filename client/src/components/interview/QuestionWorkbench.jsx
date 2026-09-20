import { Check, Copy, Bookmark, FileText, RotateCcw, Edit3 } from 'lucide-react'
import { formatGeneratedText } from '../../lib/text'

export default function QuestionWorkbench({
  question,
  current,
  total,
  answer,
  note,
  wordCount,
  isBookmarked,
  copiedPrompt,
  onUpdateAnswer,
  onUpdateNote,
  onClearAnswer,
  onCopyPrompt,
  onBookmark,
}) {
  return (
    <div className="panel interview-workbench-panel">
      {/* Header bar: Question index badge + action buttons */}
      <div className="interview-workbench-head">
        <span className="tag-soft" style={{ fontFamily: 'var(--font-mono)' }}>
          QUESTION {current + 1} OF {total}
        </span>

        <div className="interview-workbench-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onCopyPrompt(question.prompt)}
            title="Copy question prompt"
          >
            {copiedPrompt ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
            <span>{copiedPrompt ? 'Copied' : 'Copy Question'}</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onBookmark(question.prompt)}
            title="Bookmark this question"
          >
            <Bookmark
              size={14}
              fill={isBookmarked ? 'currentColor' : 'none'}
              style={{ color: isBookmarked ? 'var(--accent-primary)' : 'inherit' }}
            />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Question Text */}
      <p className="question-text interview-question-text">
        {formatGeneratedText(question.prompt)}
      </p>

      {/* Answer Input Area */}
      <div style={{ position: 'relative', width: '100%' }}>
        <textarea
          value={answer}
          onChange={(e) => onUpdateAnswer(e.target.value)}
          placeholder="Type your structured response here. Explain your architecture logic, trade-offs, step-by-step algorithms, or code implementations..."
          rows={9}
          className="interview-textarea"
        />

        {/* Word Count & Depth Feedback */}
        <div className="interview-word-count-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span className="mono">
              <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>

            {wordCount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: wordCount < 30 ? 'var(--warn)' : wordCount < 120 ? 'var(--accent-primary)' : 'var(--good)',
                }}
              >
                {wordCount < 30 ? '• Recommend more detail' : wordCount < 120 ? '• Good depth' : '• Thorough detailed response'}
              </span>
            )}
          </div>

          {answer.trim() && (
            <button
              type="button"
              onClick={onClearAnswer}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.4rem',
              }}
            >
              <RotateCcw size={13} /> Clear Answer
            </button>
          )}
        </div>
      </div>

      {/* Candidate Scratchpad Drawer */}
      <div className="interview-scratchpad-drawer">
        <span
          className="field-label"
          style={{
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
          }}
        >
          <Edit3 size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <span>Candidate Scratchpad / Personal Notes</span>
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Jot down personal reminders or key terms for this question..."
          className="interview-scratchpad-input"
        />
      </div>
    </div>
  )
}
