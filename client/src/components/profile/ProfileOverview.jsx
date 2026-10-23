import { BarChart3, CheckCircle2, Target, TrendingUp, Edit3 } from 'lucide-react'

function StatTile({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
          <Icon size={15} />
        </div>
      </div>
      <div className={`text-2xl font-black font-mono ${colorClass || 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  )
}

export default function ProfileOverview({ stats, bio, setActiveTab, onEditBio }) {
  const handleEdit = onEditBio || (() => setActiveTab && setActiveTab('edit'))

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={BarChart3} label="Interviews" value={stats.totalInterviews} />
        <StatTile icon={CheckCircle2} label="Completed" value={stats.totalCompleted || stats.totalInterviews} />
        <StatTile icon={Target} label="Average Score" value={`${stats.avgScore}%`} colorClass="text-emerald-600" />
        <StatTile icon={TrendingUp} label="Highest Score" value={`${stats.highestScore}%`} colorClass="text-blue-600" />
      </div>

      {/* About Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            About &amp; Target Roles
          </h2>
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <Edit3 size={13} /> Edit
          </button>
        </div>

        {bio ? (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap m-0">
            {bio}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic m-0">
            No bio provided yet. Add your target roles and tech stack so the AI interviewer can personalize questions.
          </p>
        )}
      </div>
    </div>
  )
}
