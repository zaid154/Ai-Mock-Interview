import { BarChart3, Layers, Target, TrendingUp } from 'lucide-react'

function StatTile({ icon: Icon, label, value, tone }) {
  return (
    <div className={`stat-tile${tone ? ` stat-tile-${tone}` : ''}`}>
      <span className="stat-tile-icon">
        <Icon size={16} />
      </span>
      <span className="stat-tile-value mono">{value}</span>
      <span className="stat-tile-label">{label}</span>
    </div>
  )
}

/**
 * ProfileOverview Component
 * 
 * Displays candidate stats grid (Q&A sessions, MCQ quizzes, average and highest scores)
 * and the bio summary card.
 */
export default function ProfileOverview({ stats, bio, setActiveTab }) {
  return (
    <>
      <div className="stat-row">
        <StatTile icon={BarChart3} label="Q&A sessions" value={stats.totalInterviews} />
        <StatTile icon={Layers} label="MCQ quizzes" value={stats.totalQuizzes} />
        <StatTile icon={Target} label="Average score" value={`${stats.avgScore}%`} tone="good" />
        <StatTile icon={TrendingUp} label="Highest score" value={`${stats.highestScore}%`} tone="accent" />
      </div>

      <div className="panel">
        <h3 className="panel-title">About</h3>
        {bio ? (
          <p className="muted profile-bio">{bio}</p>
        ) : (
          <p className="subtle profile-bio">
            No bio yet.{' '}
            <button type="button" className="link-btn" onClick={() => setActiveTab('edit')}>
              Add one
            </button>{' '}
            so recruiters know what you are targeting.
          </p>
        )}
      </div>
    </>
  )
}
