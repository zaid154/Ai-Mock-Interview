import { Clock, Trash2, Search, ArrowRight, MessageSquare, Bookmark, Layers, TrendingUp } from 'lucide-react'

const STEPS = [
  { num: '01', title: 'Choose Track', desc: 'Select Frontend, Backend, Fullstack, or System Design.' },
  { num: '02', title: 'Answer Scenarios', desc: 'Speak or type your answers with live AI evaluation.' },
  { num: '03', title: 'Review Rubric', desc: 'Check 4-pillar rubric scores and bookmark tough questions.' },
]

export default function PerformanceHub({
  user, sessions, completedSessions, avgScore, searchFilter, setSearchFilter,
  filteredSessions, fetchingSessions, deleteSession, navigate, onOpenStudio,
}) {
  const firstName = user?.name?.split(' ')[0] || 'Candidate'
  const targetRole = user?.targetRole || 'Fullstack Developer'

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Welcome, {firstName}
          </h1>
          <p className="text-xs text-slate-500">
            Candidate overview, skill assessments, and recent practice history.
          </p>
        </div>
        {onOpenStudio && (
          <button
            type="button"
            onClick={onOpenStudio}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <span>Start Practice</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* ── Quick Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/practice')}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Technical Mock Interview
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Simulate real engineering hiring rounds with speech dictation and calibrated AI rubrics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
            <span>Launch Studio</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/bookmarks')}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <Bookmark size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Saved Bookmarks
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review saved tricky interview questions and calibrated model answers before real rounds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
            <span>View Saved Questions</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ── Key Metrics Row ── */}
      {completedSessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed Interviews
            </span>
            <div className="text-xl font-bold text-slate-900">
              {completedSessions.length} <span className="text-xs font-normal text-slate-500">sessions</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Average Score
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${avgScore >= 75 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {avgScore}%
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {avgScore >= 80 ? 'Proficient' : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Target Track
            </span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {targetRole}
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Practice History ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Layers size={16} className="text-blue-600" />
            <span>Recent Practice History</span>
          </div>

          {sessions.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by topic or role..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
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
            <div className="text-center py-8">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                How It Works
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Simulate technical interviews tailored to your target engineering track and get instant rubric feedback.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6 text-left">
                {STEPS.map((s) => (
                  <div key={s.num} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <span className="text-lg font-bold text-blue-600 block mb-1 font-mono">{s.num}</span>
                    <span className="text-xs font-bold text-slate-900 block mb-1">{s.title}</span>
                    <span className="text-[11px] text-slate-500 leading-relaxed block">{s.desc}</span>
                  </div>
                ))}
              </div>
              {onOpenStudio && (
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Start Your First Interview
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              No sessions matching &ldquo;{searchFilter}&rdquo;
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2.5">
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
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition cursor-pointer gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {session.difficulty || 'Medium'}
                      </span>
                      {session.timerMinutes > 0 && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {session.timerMinutes}m
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {session.role || 'Software Engineer'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {session.category || session.topic || 'General'}
                      <span> &bull; {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isDone
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isDone ? (score !== undefined ? `${score}%` : 'Completed') : 'In Progress'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => deleteSession(session._id, e)}
                      title="Delete Session"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={14} />
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
