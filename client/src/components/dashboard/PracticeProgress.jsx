import { Loader2, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react'

export default function PracticeProgress({
  statusText = 'Preparing Assessment…',
  percent = 0,
  isRetrying = false,
  errorMessage = null,
  onRetry = null,
  onCancel = null,
}) {
  const isComplete = percent >= 100

  return (
    <div className="p-4 sm:p-5 mt-4 rounded-xl bg-blue-50/70 border border-blue-200/80 animate-in fade-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : isRetrying || errorMessage ? (
            <AlertCircle size={18} className="text-rose-600" />
          ) : (
            <Loader2 size={18} className="animate-spin text-blue-600" />
          )}
          <span className="text-xs sm:text-sm font-semibold text-slate-900" aria-live="polite">
            {isComplete ? 'Assessment Ready ✓' : 'Preparing Assessment…'}
          </span>
        </div>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
          isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2.5"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-600' : 'bg-blue-600'}`}
          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
        />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <p className={`m-0 ${errorMessage ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
          {errorMessage || statusText}
        </p>

        <div className="flex items-center gap-2">
          {errorMessage && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw size={12} /> Retry Batch
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <XCircle size={14} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
