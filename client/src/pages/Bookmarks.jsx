import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, X, BookOpen, Layers, Lightbulb, Play } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/bookmarks/BookmarkCard'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandAll, setExpandAll] = useState(false)

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
      toast.success('Question removed from bookmarks')
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

  // Calculate unique categories with counts
  const categoryStats = useMemo(() => {
    const counts = { All: bookmarks.length }
    bookmarks.forEach((b) => {
      const cat = b.category || 'General'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [bookmarks])

  const categories = Object.keys(categoryStats)

  const filtered = bookmarks.filter((b) => {
    const matchCategory = selectedCategory === 'All' || (b.category || 'General') === selectedCategory
    const matchSearch =
      !searchQuery.trim() ||
      b.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  function resetFilters() {
    setSearchQuery('')
    setSelectedCategory('All')
  }

  return (
    <main className="container" style={{ paddingBottom: '4rem' }}>
      {/* ── Section Header ── */}
      <div className="section-head" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <div className="reflect-badge" style={{ margin: 0 }}>
            <Bookmark size={12} style={{ color: '#2563eb' }} aria-hidden="true" />
            <span className="reflect-badge-text">Study Vault</span>
          </div>
          <span className="tag-soft" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {bookmarks.length} {bookmarks.length === 1 ? 'Question' : 'Questions'} Saved
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
          Saved Questions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: '60ch', margin: 0 }}>
          Review technical questions saved from your mock interviews and quizzes. Test your recall and study reference answers.
        </p>
      </div>

      {/* ── Search & Filter Controls ── */}
      {bookmarks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
          {/* Search Input Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="input-icon-wrap" style={{ margin: 0, flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={15} className="input-icon" aria-hidden="true" />
              <input
                type="text"
                id="bookmark-search"
                aria-label="Search saved questions"
                placeholder="Search by question, keyword, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.86rem', paddingRight: searchQuery ? '2rem' : '0.75rem' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Action: Expand/Collapse All */}
            {filtered.length > 0 && (
              <button
                type="button"
                onClick={() => setExpandAll(!expandAll)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Lightbulb size={13} style={{ color: '#2563eb' }} />
                <span>{expandAll ? 'Collapse All Solutions' : 'Expand All Solutions'}</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills (LeetCode style) */}
          {categories.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginRight: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                <Layers size={13} /> Topics:
              </span>
              {categories.map((cat) => {
                const count = categoryStats[cat] || 0
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.28rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 600 : 500,
                      background: isSelected ? '#2563eb' : '#f3f4f6',
                      color: isSelected ? '#ffffff' : '#374151',
                      border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{cat}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '0.05rem 0.35rem',
                        borderRadius: '999px',
                        background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                        color: isSelected ? '#ffffff' : '#6b7280',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Content States ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="panel" style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
              <div style={{ width: '25%', height: '14px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.75rem' }} />
              <div style={{ width: '80%', height: '18px', background: '#f3f4f6', borderRadius: '4px', marginBottom: '0.5rem' }} />
              <div style={{ width: '50%', height: '14px', background: '#f3f4f6', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        /* Empty State: First-time user */
        <div className="panel page-center" style={{ minHeight: '300px', textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#eff6ff', color: '#2563eb', marginBottom: '1rem' }}>
            <Bookmark size={26} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.35rem', color: '#111827' }}>
            No Saved Questions Yet
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
            While taking practice interviews or quizzes, click the Bookmark icon on any tricky question to save it here for later revision.
          </p>
          <Link to="/practice" className="reflect-btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.86rem', gap: '0.45rem' }}>
            <Play size={15} /> Start Practice Session
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State: Filter mismatch */
        <div className="panel page-center" style={{ minHeight: '220px', textAlign: 'center', padding: '3rem 1.5rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px' }}>
          <BookOpen size={32} style={{ color: '#9ca3af', marginBottom: '0.65rem' }} aria-hidden="true" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.25rem', color: '#111827' }}>
            No questions found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.84rem', margin: '0 0 1.25rem' }}>
            No saved questions match your search or selected topic.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={resetFilters}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Active Questions List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.15rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500 }}>
              Showing {filtered.length} of {bookmarks.length} {bookmarks.length === 1 ? 'question' : 'questions'}
            </span>
          </div>

          {filtered.map((b, idx) => (
            <BookmarkCard
              key={b._id}
              bookmark={b}
              index={idx}
              defaultExpanded={expandAll}
              onDelete={handleDelete}
              onSaveNotes={handleSaveNotes}
            />
          ))}
        </div>
      )}
    </main>
  )
}
