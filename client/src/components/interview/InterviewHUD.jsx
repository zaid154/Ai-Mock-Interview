import Timer from '../Timer'

export default function InterviewHUD({
  interview,
  current,
  total,
  answeredCount,
  answers,
  onSelectQuestion,
  onTimeUp,
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* -- Top Meta Bar -- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              Live Technical Round
            </span>
            <span className="text-xs font-bold text-slate-900">
              {interview.role}
            </span>
            {interview.category && interview.category !== 'General' && (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {interview.category}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 m-0">
            <span className="capitalize font-semibold text-slate-700">{interview.difficulty || 'Medium'}</span> difficulty &bull;{' '}
            <strong className="text-slate-900 font-semibold">{answeredCount}</strong> of {total} questions answered
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          {interview.timerMinutes > 0 && <Timer minutes={interview.timerMinutes} onTimeUp={onTimeUp} />}
          <div className="text-right">
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
              {current + 1} <span className="text-slate-400 text-sm font-normal">/ {total}</span>
            </span>
          </div>
        </div>
      </div>

      {/* -- Question Quick-Jump Palette -- */}
      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-xs flex-wrap" role="toolbar" aria-label="Question Quick Jump">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Questions:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {interview.questions.map((q, idx) => {
            const isCurrent = idx === current
            const isAnswered = Boolean(answers[idx]?.trim())
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={`relative w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
                title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
              >
                {idx + 1}
                {isAnswered && !isCurrent && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* -- Progress Meter -- */}
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
