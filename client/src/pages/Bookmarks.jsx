import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search } from 'lucide-react'
import api, { apiError } from '../lib/api'
import toast from 'react-hot-toast'
import BookmarkCard from '../components/bookmarks/BookmarkCard'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/bookmarks')
      .then((res) => setBookmarks(res.data?.bookmarks || []))
      .catch((err) => toast.error(apiError(err, 'Could not load bookmarks')))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(id) {
    try {
      await api.delete(`/bookmarks/${id}`)
      setBookmarks((prev) => prev.filter((b) => b._id !== id))
      toast.success('Question removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not remove question'))
    }
  }

  const filtered = bookmarks.filter((b) =>
    !search.trim() ||
    b.prompt?.toLowerCase().includes(search.toLowerCase()) ||
    b.role?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="container" style={{ maxWidth: '820px', paddingBottom: '3.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.2rem', color: '#111827' }}>
          Saved Questions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.86rem', margin: 0 }}>
          {bookmarks.length} {bookmarks.length === 1 ? 'question' : 'questions'} saved for quick revision.
        </p>
      </div>

      {bookmarks.length > 0 && (
        <div className="input-icon-wrap" style={{ marginBottom: '1.25rem' }}>
          <Search size={15} className="input-icon" />
          <input
            type="text"
            placeholder="Search saved questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </div>
      )}

      {loading ? (
        <p className="muted small mono text-center" style={{ padding: '2rem 0' }}>Loading saved questions...</p>
      ) : bookmarks.length === 0 ? (
        <div className="panel text-center" style={{ padding: '3rem 1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <Bookmark size={32} style={{ color: '#9ca3af', marginBottom: '0.65rem' }} />
          <h2 style={{ fontSize: '1.15rem', color: '#111827', margin: '0 0 0.35rem' }}>No saved questions yet</h2>
          <p className="muted small" style={{ margin: '0 auto 1.25rem', maxWidth: '380px' }}>
            Click the bookmark icon during an interview or quiz to save questions here.
          </p>
          <Link to="/practice" className="reflect-btn-primary" style={{ fontSize: '0.84rem' }}>
            Start Practice
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel text-center" style={{ padding: '2rem 1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
          <p className="muted small" style={{ margin: 0 }}>No questions match &quot;{search}&quot;</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((b) => (
            <BookmarkCard key={b._id} bookmark={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}
