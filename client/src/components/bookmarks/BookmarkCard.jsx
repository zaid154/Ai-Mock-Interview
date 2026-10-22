import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function BookmarkCard({ bookmark: b, onDelete }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const answer = b.modelAnswer || b.answer

  return (
    <div className="panel" style={{ padding: '1.15rem 1.25rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="tag" style={{ fontSize: '0.72rem' }}>{b.role || 'Question'}</span>
          {b.category && b.category !== 'General' && (
            <span className="tag-soft" style={{ fontSize: '0.72rem' }}>{b.category}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(b._id)}
          className="btn btn-ghost btn-sm"
          title="Remove"
          style={{ padding: '0.2rem 0.4rem', color: '#9ca3af' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.96rem', color: '#111827', lineHeight: 1.5, margin: '0 0 0.65rem' }}>
        {b.prompt}
      </div>

      {answer && (
        <div>
          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.76rem', padding: '0.2rem 0.5rem', color: '#2563eb', gap: '0.3rem' }}
          >
            <span>{showAnswer ? 'Hide Answer' : 'Show Answer'}</span>
            {showAnswer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showAnswer && (
            <div style={{ marginTop: '0.6rem', padding: '0.85rem 1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {answer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
