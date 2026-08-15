import { useState, useEffect } from 'react'
import { Bookmark, Search, Trash2, Edit3, CheckCircle2, Filter, Sparkles, BookOpen } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'

const RECOMMENDED_BOOKMARKS = [
  {
    _id: 'rec-1',
    role: 'Frontend Developer',
    category: 'React & Web Performance',
    prompt: 'How does React Fiber reconciliation algorithm handle priority scheduling and interruptible rendering?',
    answer: 'Fiber breaks work into units of work. Higher priority updates (like user input) interrupt lower priority render passes via requestIdleCallback/scheduler.',
    feedback: 'Excellent explanation. Mentioning the 2-phase render/commit split adds extra architectural depth.',
    notes: 'Revise scheduler package and concurrent mode hooks before final interview.',
  },
  {
    _id: 'rec-2',
    role: 'Backend Architect',
    category: 'Distributed Systems',
    prompt: 'How do you prevent cache stampede / thundering herd problem in high-concurrency Redis caching layers?',
    answer: 'Use probabilistic early expiration (XFetch algorithm), distributed mutex locks, or pre-warming background worker queues.',
    feedback: 'Spot on. Distributed mutex locking prevents cache misses from overwhelming DB.',
    notes: 'Key concept for System Design rounds.',
  },
]

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [noteText, setNoteText] = useState('')

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
    if (!window.confirm('Remove this bookmarked question?')) return
    setBookmarks((prev) => prev.filter((b) => b._id !== id))
    toast.success('Bookmark removed')
  }

  async function handleSaveNotes(id) {
    setBookmarks((prev) =>
      prev.map((b) => (b._id === id ? { ...b, notes: noteText } : b))
    )
    setEditingNoteId(null)
    toast.success('Notes saved')
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
      <div className="section-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span className="badge-glow" style={{ fontSize: '0.75rem' }}>
            <Bookmark size={13} /> Saved Revision Bank
          </span>
        </div>
        <h2>Bookmarked Questions</h2>
        <p>Review and revise your saved interview questions, feedback, and personal candidate notes.</p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="input-icon-wrap">
          <Search size={16} className="input-icon" />
          <input
            type="text"
            placeholder="Search saved questions, roles, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Topics' : cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="panel page-center muted" style={{ minHeight: '250px' }}>
          Loading saved bookmarks...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((b) => (
            <div key={b._id} className="glass-card" style={{ padding: '1.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="tag">{b.role || 'Question'}</span>
                    {b.category && <span className="tag-soft">{b.category}</span>}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', margin: '0.4rem 0 0', lineHeight: '1.5' }}>{b.prompt}</h3>
                </div>
                <button
                  className="history-del"
                  onClick={() => handleDelete(b._id)}
                  title="Remove Bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {b.answer && (
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '0.8rem' }}>
                  <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Your Answer:</span>
                  <p style={{ margin: 0, fontSize: '0.94rem' }}>{b.answer}</p>
                </div>
              )}

              {b.feedback && (
                <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1rem' }}>
                  <strong style={{ color: 'var(--text)' }}>Feedback: </strong>
                  {b.feedback}
                </div>
              )}

              {/* Personal Notes Box */}
              <div className="glass-card" style={{ padding: '1rem', background: 'var(--surface-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="field-label" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Edit3 size={15} style={{ color: 'var(--accent-primary)' }} /> Personal Revision Notes
                  </span>
                  {editingNoteId !== b._id && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingNoteId(b._id)
                        setNoteText(b.notes || '')
                      }}
                    >
                      {b.notes ? 'Edit Note' : 'Add Note'}
                    </button>
                  )}
                </div>

                {editingNoteId === b._id ? (
                  <div>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write your key points to remember..."
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingNoteId(null)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSaveNotes(b._id)}>Save Note</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.92rem', color: b.notes ? 'var(--text)' : 'var(--text-subtle)', fontStyle: b.notes ? 'normal' : 'italic' }}>
                    {b.notes || 'No custom notes added.'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
