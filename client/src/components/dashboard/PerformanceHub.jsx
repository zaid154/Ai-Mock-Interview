import { Clock, Trash2, Search, ArrowRight, Plus } from 'lucide-react'

export default function PerformanceHub({
  user, sessions, completedSessions, avgScore, searchFilter, setSearchFilter,
  filteredSessions, fetchingSessions, deleteSession, navigate, onOpenStudio,
}) {
  const firstName = user?.name?.split(' ')[0] || 'Candidate'
  const targetRole = user?.targetRole || 'Fullstack Developer'

  return (
    <div className="flex flex-col gap-6">
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-0.5">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 m-0">
            Welcome back, {firstName}. Track your interview preparation and past sessions.
          </p>
        </div>

        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>New Practice Session</span>
          </button>
        )}
      </div>

      {/* ── Key Metrics Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Completed Sessions
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {completedSessions.length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Average Score
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-mono ${avgScore >= 75 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {avgScore}%
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {avgScore >= 80 ? 'Proficient' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
            Target Track
          </span>
          <div className="text-sm font-bold text-slate-900 truncate mt-1">
            {targetRole}
          </div>
        </div>
      </div>

      {/* ── Recent Practice History ── */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 m-0">
            Recent Practice History
          </h2>

          {sessions.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by topic or role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>
          )}
        </div>

        {fetchingSessions ? (
          <div className="text-center py-12 text-xs text-slate-400 font-mono">
            Loading practice history…
          </div>
        ) : filteredSessions.length === 0 ? (
          sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                You haven&apos;t started any practice sessions yet. Pick a track and simulate your first technical screen.
              </p>
              {onOpenStudio && (
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  <Plus size={14} /> Start Practice Session
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No sessions match &ldquo;{searchFilter}&rdquo;
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            {filteredSessions.map((session) => {
              const isDone = session.status === 'completed'
              const score = session.overallScore ?? session.totalScore
              const dateStr = session.createdAt
                ? new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently'

              return (
                <div
                  key={session._id}
                  onClick={() => navigate(isDone ? `/results/${session._id}` : `/interview/${session._id}`)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 transition cursor-pointer gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {session.difficulty || 'Medium'}
                      </span>
                      {session.timerMinutes > 0 && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {session.timerMinutes}m
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                      {session.role || 'Software Engineer'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {session.category || session.topic || 'General'}
                      <span> &bull; {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        isDone
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isDone ? (score !== undefined ? `${score}%` : 'Completed') : 'In Progress'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete Session"
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
