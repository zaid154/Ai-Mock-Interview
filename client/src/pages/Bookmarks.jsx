import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, Filter, BookOpen } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/bookmarks/BookmarkCard'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    fetchBookmarks()
  }, [])

  async function fetchBookmarks() {
    try {
      setLoading(true)
      const res = await api.get('/bookmarks')
      setBookmarks(res.data?.bookmarks || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load bookmarks'))
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks((prev) => prev.filter((b) => b._id !== id))
      toast.success('Bookmark removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not remove bookmark'))
    }
  }

  async function handleSaveNotes(id, text) {
    try {
      await api.patch(`/bookmarks/${id}/notes`, { notes: text })
      setBookmarks((prev) =>
        prev.map((b) => (b._id === id ? { ...b, notes: text } : b))
      )
      toast.success('Note saved')
    } catch (err) {
      toast.error(apiError(err, 'Could not save note'))
      throw err
    }
  }

  const categories = ['All', ...new Set(bookmarks.map((b) => b.category || 'General'))]

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
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div className="section-head" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <div className="reflect-badge" style={{ margin: 0 }}>
            <Bookmark size={12} style={{ color: '#c084fc' }} aria-hidden="true" />
            <span className="reflect-badge-text">Study Vault</span>
          </div>
          <span className="tag-soft" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#f8fafc' }}>
          Bookmarked Questions
        </h1>
        <p style={{ color: 'rgba(239, 237, 253, 0.7)', fontSize: '0.9rem', maxWidth: '60ch', margin: 0 }}>
          Review saved technical questions, test recall with hidden model answers, and manage custom study notes.
        </p>
      </div>

      {/* Search & Topic Filter Bar */}
      {bookmarks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div className="input-icon-wrap" style={{ margin: 0 }}>
            <Search size={15} className="input-icon" aria-hidden="true" />
            <input
              type="text"
              id="bookmark-search"
              aria-label="Search saved questions"
              placeholder="Search by keyword, role, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <select
              id="bookmark-category"
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map((n) => (
            <div key={n} className="panel" style={{ padding: '2rem', minHeight: '140px', background: 'var(--surface-2)', opacity: 0.6 }}>
              <div style={{ width: '30%', height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '1rem' }} />
              <div style={{ width: '75%', height: '18px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="panel page-center" style={{ minHeight: '260px', textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Bookmark size={36} style={{ color: 'var(--text-subtle)', marginBottom: '0.85rem', opacity: 0.6 }} aria-hidden="true" />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#f8fafc' }}>No bookmarked questions yet</h3>
          <p className="muted small" style={{ maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            While taking practice interviews or quizzes, click the Bookmark icon on any question to save it here for revision and recall practice.
          </p>
          <Link to="/practice" className="reflect-btn-primary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.85rem' }}>
            Start a Practice Session
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel page-center" style={{ minHeight: '220px', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <BookOpen size={32} style={{ color: 'var(--text-subtle)', marginBottom: '0.65rem' }} aria-hidden="true" />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', color: '#f8fafc' }}>No questions match your filter</h3>
          <p className="muted small" style={{ margin: 0 }}>Try clearing your search query or selecting &quot;All Categories&quot;.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((b) => (
            <BookmarkCard
              key={b._id}
              bookmark={b}
              onDelete={handleDelete}
              onSaveNotes={handleSaveNotes}
            />
          ))}
        </div>
      )}
    </main>
  )
}
