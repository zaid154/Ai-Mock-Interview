import { useState, useEffect } from 'react'
import { Bookmark, Search, Trash2, Edit3, CheckCircle2, Filter } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'

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
      setBookmarks(res.data?.bookmarks || [])
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this bookmarked question?')) return
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks((prev) => prev.filter((b) => b._id !== id))
      toast.success('Bookmark removed')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  async function handleSaveNotes(id) {
    try {
      const res = await api.patch(`/bookmarks/${id}/notes`, { notes: noteText })
      setBookmarks((prev) =>
        prev.map((b) => (b._id === id ? { ...b, notes: res.data?.bookmark?.notes } : b))
      )
      setEditingNoteId(null)
      toast.success('Notes saved')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  // Derive available categories
  const categories = ['All', ...new Set(bookmarks.map((b) => b.category || 'General'))]

  // Filter bookmarks by search and category
  const filtered = bookmarks.filter((b) => {
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
        <h2>Bookmarked Questions</h2>
        <p>Review and revise your saved interview questions, model feedback, and personal notes.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search saved questions, roles, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="panel center muted" style={{ padding: '3rem 1rem' }}>
          Loading your bookmarks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty panel center">
          <Bookmark size={36} className="muted" style={{ marginBottom: '0.8rem' }} />
          <h3>No bookmarked questions found</h3>
          <p className="muted small">
            {bookmarks.length === 0
              ? 'Bookmark important questions during or after mock interviews to practice them later.'
              : 'No bookmarks match your search filters.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {filtered.map((b) => (
            <div key={b._id} className="answer-card">
              <div className="answer-head">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="tag-soft">{b.role || 'Interview Question'}</span>
                    {b.category && <span className="tag">{b.category}</span>}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.3rem 0' }}>{b.prompt}</h3>
                </div>
                <button
                  className="history-del"
                  onClick={() => handleDelete(b._id)}
                  title="Delete bookmark"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {b.answer && (
                <div className="your-answer">
                  <span className="muted small" style={{ display: 'block', fontWeight: 600, marginBottom: '0.2rem' }}>Your Answer:</span>
                  {b.answer}
                </div>
              )}

              {b.feedback && (
                <div className="feedback">
                  <span className="muted small" style={{ fontWeight: 600 }}>Feedback: </span>
                  {b.feedback}
                </div>
              )}

              {/* Quiz options if available */}
              {b.options && b.options.length > 0 && (
                <div style={{ marginTop: '0.8rem' }}>
                  <span className="muted small" style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Options:</span>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {b.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          background: i === b.correctIndex ? 'rgba(70, 214, 160, 0.14)' : 'var(--surface-2)',
                          border: i === b.correctIndex ? '1px solid var(--good)' : '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                        {i === b.correctIndex && <CheckCircle2 size={14} style={{ color: 'var(--good)', marginLeft: 'auto' }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Notes Box */}
              <div className="notes-box">
                <div className="notes-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Edit3 size={14} /> Personal Notes
                  </span>
                  {editingNoteId !== b._id && (
                    <button
                      className="link-btn btn-sm"
                      onClick={() => {
                        setEditingNoteId(b._id)
                        setNoteText(b.notes || '')
                      }}
                    >
                      {b.notes ? 'Edit' : 'Add Note'}
                    </button>
                  )}
                </div>

                {editingNoteId === b._id ? (
                  <div>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write your key points or code snippets to remember..."
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingNoteId(null)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSaveNotes(b._id)}>Save Note</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.92rem', color: b.notes ? 'var(--text)' : 'var(--muted)', fontStyle: b.notes ? 'normal' : 'italic' }}>
                    {b.notes || 'No notes added yet.'}
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
