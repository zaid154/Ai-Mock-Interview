import { Link } from 'react-router-dom'
import { ChevronLeft, FileCheck, CheckCircle2 } from 'lucide-react'
import Timer from '../Timer'

export default function InterviewHUD({
  interview,
  current,
  total,
  answeredCount,
  answers,
  onSelectQuestion,
  onTimeUp,
  onFinish,
  submitting,
  tabSwitches = 0,
}) {
  const displayRole =
    interview.role && interview.role !== 'Resume-based Interview'
      ? interview.role
      : 'Fullstack Developer'

  return (
    <header className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:px-4 sm:py-2.5 mb-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Role Info & Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/practice"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs font-medium mr-0.5 transition cursor-pointer"
            title="Exit to Practice Studio"
          >
            <ChevronLeft size={15} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            {displayRole}
          </h1>

          {interview.category && interview.category !== 'General' && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
              {interview.category}
            </span>
          )}

          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            {interview.difficulty || 'Medium'}
          </span>

          {interview.usesResume && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <FileCheck size={11} className="text-emerald-600" />
              <span>Resume Tailored</span>
            </span>
          )}

          {tabSwitches > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md animate-pulse"
              title="Tab switches detected"
            >
              <span>Tab switches: {tabSwitches}</span>
            </span>
          )}
        </div>

        {/* Center: Question Switcher Pills */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] font-medium text-slate-400 hidden xl:inline">
            Questions:
          </span>
          <div className="flex items-center gap-1">
            {interview.questions.map((_, idx) => {
              const isCurrent = idx === current
              const isAnswered = Boolean(answers[idx]?.trim())
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <span className="text-[11px] font-medium text-slate-400 font-mono ml-1">
            ({answeredCount}/{total} answered)
          </span>
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {interview.timerMinutes > 0 ? (
            <Timer minutes={interview.timerMinutes} onTimeUp={onTimeUp} />
          ) : (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60 hidden sm:inline">
              Untimed
            </span>
          )}

          {onFinish && (
            <button
              type="button"
              onClick={onFinish}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              <span>{submitting ? 'Submitting...' : 'Finish Round'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
