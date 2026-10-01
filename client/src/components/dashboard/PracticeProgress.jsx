import { Loader2, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react'

/**
 * PracticeProgress: Fluid live progress feedback for batch question generation.
 * Keeps the page responsive and shows real-time progress percentages.
 */
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
    <div
      className="panel"
      style={{
        padding: '1.1rem 1.25rem',
        marginTop: '0.4rem',
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(99, 102, 241, 0.05))',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {isComplete ? (
            <CheckCircle2 size={18} style={{ color: '#4ade80' }} />
          ) : isRetrying || errorMessage ? (
            <AlertCircle size={18} style={{ color: '#f87171' }} />
          ) : (
            <Loader2 size={18} className="animate-spin" style={{ color: '#c084fc' }} />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }} aria-live="polite">
            {isComplete ? 'Assessment Ready ✓' : 'Preparing Assessment…'}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: isComplete ? '#4ade80' : '#c084fc',
            padding: '0.15rem 0.5rem',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}
        >
          {percent}%
        </span>
      </div>

      {/* Animated Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Question generation progress"
        style={{
          height: '7px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          margin: '0.45rem 0 0.65rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(5, percent))}%`,
            background: isComplete
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : 'linear-gradient(90deg, #9333ea, #a855f7, #6366f1)',
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
            transition: 'width 0.35s ease',
            borderRadius: '999px',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: errorMessage ? '#f87171' : 'rgba(239, 237, 253, 0.8)' }}>
          {errorMessage || statusText}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {errorMessage && onRetry && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRetry}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.74rem' }}
            >
              <RefreshCw size={12} /> Retry Batch
            </button>
          )}
          {!isComplete && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(239, 237, 253, 0.45)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <XCircle size={12} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
