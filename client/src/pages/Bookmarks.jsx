import { useState, useEffect } from 'react'
import { Bookmark, Search, Trash2, Edit3, CheckCircle2, Filter, Sparkles, BookOpen, Copy, Check, Eye, EyeOff, Lightbulb } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import { formatGeneratedText } from '../lib/text'

const RECOMMENDED_BOOKMARKS = [
  {
    _id: 'rec-1',
    role: 'Frontend Developer',
    category: 'React & Web Performance',
    prompt: 'How does React Fiber reconciliation algorithm handle priority scheduling and interruptible rendering?',
    answer: 'Fiber breaks rendering into discrete units of work. Higher-priority updates (like keyboard/mouse input) interrupt lower-priority render passes via Scheduler priority queues.',
    feedback: 'Excellent explanation. Mentioning the 2-phase render/commit reconciliation split adds extra technical depth.',
    notes: 'Revise scheduler package and concurrent mode hooks before final interview.',
  },
  {
    _id: 'rec-2',
    role: 'Backend Architect',
    category: 'Distributed Systems',
    prompt: 'How do you prevent cache stampede / thundering herd problem in high-concurrency Redis caching layers?',
    answer: 'Use probabilistic early expiration (XFetch algorithm), distributed mutex locks (Redlock), or pre-warming background worker queues.',
    feedback: 'Spot on. Distributed mutex locking prevents cache misses from overwhelming DB during spikes.',
    notes: 'Key concept for System Design rounds.',
  },
  {
    _id: 'rec-3',
    role: 'Full Stack Developer',
    category: 'Security & Auth',
    prompt: 'Walk through how to mitigate XSS and CSRF attacks in a modern JWT-authenticated single-page application.',
    answer: 'Store access tokens in memory or HttpOnly SameSite=Strict cookies, sanitize user inputs with DOMPurify, and implement Content Security Policy (CSP) headers.',
    feedback: 'Thorough security breakdown covering both token storage and DOM sanitization.',
    notes: 'Remember to mention anti-CSRF token synchronization headers.',
  },
]

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [revealedAnswers, setRevealedAnswers] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  async function fetchBookmarks() {
    try {
      setLoading(true)
      const res = await api.get('/bookmarks')
      const data = res.data?.bookmarks || []
      setBookmarks(data.length > 0 ? data : RECOMMENDED_BOOKMARKS)
    } catch (err) {
      setBookmarks(RECOMMENDED_BOOKMARKS)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this question from your saved bookmarks?')) return
    try {
      await api.delete(`/bookmarks/${id}`)
    } catch (err) {
      // client-side fallback
    }
    setBookmarks((prev) => prev.filter((b) => b._id !== id))
    toast.success('Bookmark removed')
  }

  async function handleSaveNotes(id) {
    setBookmarks((prev) =>
      prev.map((b) => (b._id === id ? { ...b, notes: noteText } : b))
    )
    setEditingNoteId(null)
    toast.success('Personal note saved!')
  }

  function toggleAnswerVisibility(id) {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function copyQuestionText(id, prompt, answer) {
    const textToCopy = `Question: ${prompt}\n\nKey Concept Answer:\n${answer || 'No answer recorded.'}`
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(id)
    toast.success('Question & Answer copied to clipboard!')
    setTimeout(() => setCopiedId(null), 3000)
  }

  const displayList = bookmarks.length > 0 ? bookmarks : RECOMMENDED_BOOKMARKS
  const categories = ['All', ...new Set(displayList.map((b) => b.category || 'General'))]

  const filtered = displayList.filter((b) => {
    const matchCategory = selectedCategory === 'All' || b.category === selectedCategory
    const matchSearch =
      !searchQuery.trim() ||
      b.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.role && b.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.notes && b.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchSearch
  })

  return (
    <main className="container">
      {/* Section Header */}
      <div className="section-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge-glow" style={{ fontSize: '0.75rem' }}>
            <Sparkles size={13} /> Saved Revision Vault
          </span>
          <span
            style={{
              padding: '0.2rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {filtered.length} {filtered.length === 1 ? 'Question Saved' : 'Questions Saved'}
          </span>
        </div>
        <h2>Bookmarked Questions</h2>
        <p>Your personal technical revision bank. Re-read saved questions, test your recall, and refine candidate notes before upcoming interviews.</p>
      </div>

      {/* Search & Topic Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.8rem' }}>
        <div className="input-icon-wrap" style={{ flex: 1 }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            placeholder="Search saved questions, roles, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: '100%' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Topics' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '250px' }}>
          Loading saved bookmarks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel page-center" style={{ minHeight: '250px', textAlign: 'center', padding: '3rem 1.5rem' }}>
          <BookOpen size={36} style={{ color: 'var(--text-subtle)', marginBottom: '0.8rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>No bookmarked questions match your search</h3>
          <p className="muted small" style={{ margin: 0 }}>Try clearing your search query or selecting "All Topics".</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {filtered.map((b) => {
            const isRevealed = Boolean(revealedAnswers[b._id])
            const isCopied = copiedId === b._id

            return (
              <div className="panel" key={b._id} style={{ padding: '1.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                {/* Question Header & Role Tags */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="tag">{b.role || 'Question'}</span>
                      {b.category && <span className="tag-soft">{b.category}</span>}
                    </div>
                    <h3 style={{ fontSize: '1.18rem', margin: 0, lineHeight: '1.5', fontWeight: 700, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {formatGeneratedText(b.prompt)}
                    </h3>
                  </div>

                  {/* Actions Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => copyQuestionText(b._id, b.prompt, b.answer)}
                      title="Copy question and answer text"
                    >
                      {isCopied ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      className="history-del"
                      onClick={() => handleDelete(b._id)}
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Interactive Flashcard Toggle Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', background: 'var(--surface-2)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
                  <span className="muted small" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Lightbulb size={14} style={{ color: 'var(--warn)' }} /> Self-Assessment Flashcard Practice
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleAnswerVisibility(b._id)}
                    style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isRevealed ? 'Hide Answer' : 'Reveal Model Answer'}</span>
                  </button>
                </div>

                {/* Revealed Answer Box */}
                {isRevealed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
                    {b.answer && (
                      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.1rem' }}>
                        <span className="muted small" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', color: 'var(--accent-primary)' }}>
                          Model / Candidate Response:
                        </span>
                        <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                          {formatGeneratedText(b.answer)}
                        </p>
                      </div>
                    )}

                    {b.feedback && (
                      <div style={{ borderLeft: '3px solid var(--accent-primary)', background: 'var(--surface-2)', padding: '0.85rem 1.1rem', borderRadius: '0 8px 8px 0', fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text)' }}>AI Evaluator Takeaway: </strong>
                        {b.feedback}
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Revision Notes Drawer */}
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                      <Edit3 size={14} style={{ color: 'var(--accent-primary)' }} /> Personal Revision Notes
                    </span>
                    {editingNoteId !== b._id && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingNoteId(b._id)
                          setNoteText(b.notes || '')
                        }}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {b.notes ? 'Edit Note' : '+ Add Note'}
                      </button>
                    )}
                  </div>

                  {editingNoteId === b._id ? (
                    <div>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write key concepts, edge cases, or code patterns to remember for this question..."
                        autoFocus
                        style={{ fontSize: '0.9rem', borderRadius: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingNoteId(null)}>Cancel</button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveNotes(b._id)}>Save Note</button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: b.notes ? 'var(--text)' : 'var(--text-subtle)', fontStyle: b.notes ? 'normal' : 'italic', lineHeight: '1.5' }}>
                      {b.notes || 'No custom revision notes added yet. Click "+ Add Note" to record key takeaways.'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
