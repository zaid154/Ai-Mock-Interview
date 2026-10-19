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
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {isComplete ? (
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          ) : isRetrying || errorMessage ? (
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
          ) : (
            <Loader2 size={18} className="animate-spin" style={{ color: '#2563eb' }} />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }} aria-live="polite">
            {isComplete ? 'Assessment Ready ✓' : 'Preparing Assessment…'}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: isComplete ? '#16a34a' : '#2563eb',
            padding: '0.15rem 0.5rem',
            background: '#dbeafe',
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
          background: '#e5e7eb',
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
              ? '#16a34a'
              : '#2563eb',
            boxShadow: 'none',
            transition: 'width 0.35s ease',
            borderRadius: '999px',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: errorMessage ? '#dc2626' : '#4b5563' }}>
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
                color: '#6b7280',
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
