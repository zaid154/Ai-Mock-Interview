import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Search, ArrowRight } from 'lucide-react'
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
      toast.success('Question removed from bookmarks')
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1 flex flex-col w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Saved Questions
          </h1>
          <p className="text-xs text-slate-500">
            {bookmarks.length} {bookmarks.length === 1 ? 'question' : 'questions'} bookmarked for quick revision and study.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, role, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs text-slate-400 font-mono">
          Loading saved questions...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs my-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Bookmark size={26} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">
            No saved questions yet
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            While answering questions in Practice or Interview mode, click the bookmark icon to save questions here for revision.
          </p>
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
          >
            <span>Start Practice Session</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No questions match &ldquo;{search}&rdquo;. Try another search term.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map((b) => (
            <BookmarkCard key={b._id} bookmark={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}
