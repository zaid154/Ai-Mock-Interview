import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { apiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from '../components/ConfirmDialog'
import PerformanceHub from '../components/dashboard/PerformanceHub'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { confirm } = useConfirm()

  const [sessions, setSessions] = useState([])
  const [fetchingSessions, setFetchingSessions] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    try {
      const { data } = await api.get('/interviews')
      setSessions(data.interviews || data.sessions || [])
    } catch (err) {
      toast.error(apiError(err, 'Could not load past sessions'))
    } finally {
      setFetchingSessions(false)
    }
  }

  async function deleteSession(id, e) {
    e.stopPropagation()
    const ok = await confirm({
      title: 'Delete Practice Session?',
      message: 'This session and its evaluation transcript will be permanently removed.',
      confirmText: 'Delete Session',
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/interviews/${id}`)
      setSessions((prev) => prev.filter((s) => s._id !== id))
      toast.success('Session removed')
    } catch (err) {
      toast.error(apiError(err, 'Could not delete session'))
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overallScore || s.totalScore || 0), 0) / completedSessions.length)
    : 0
  const filteredSessions = sessions.filter((s) =>
    !searchFilter.trim() ||
    [s.role, s.category, s.topic].some(v => v?.toLowerCase().includes(searchFilter.toLowerCase()))
  )

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col w-full">
      <PerformanceHub
        user={user}
        sessions={sessions}
        completedSessions={completedSessions}
        avgScore={avgScore}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        filteredSessions={filteredSessions}
        fetchingSessions={fetchingSessions}
        deleteSession={deleteSession}
        navigate={navigate}
        onOpenStudio={() => navigate('/practice')}
      />
    </main>
  )
}
