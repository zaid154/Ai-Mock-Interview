import { createContext, useContext, useEffect, useState } from 'react'
import { AlertTriangle, HelpCircle, Info } from 'lucide-react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  function confirm(opts) {
    return new Promise((resolve) =>
      setDialog({ mode: 'confirm', confirmText: 'Confirm', danger: false, ...opts, resolve }),
    )
  }
  function promptText(opts) {
    return new Promise((resolve) =>
      setDialog({ mode: 'prompt', confirmText: 'Save', defaultValue: '', ...opts, resolve }),
    )
  }
  function finish(result) {
    if (dialog) dialog.resolve(result)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm, promptText }}>
      {children}
      {dialog && (
        <Dialog
          dialog={dialog}
          onCancel={() => finish(dialog.mode === 'prompt' ? null : false)}
          onOk={(result) => finish(result)}
        />
      )}
    </ConfirmContext.Provider>
  )
}

function Dialog({ dialog, onCancel, onOk }) {
  const [value, setValue] = useState(dialog.defaultValue || '')

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function submit(e) {
    e.preventDefault()
    onOk(dialog.mode === 'prompt' ? value : true)
  }

  const title = dialog.title || (dialog.mode === 'prompt' ? 'Enter value' : 'Are you sure?')

  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              background: dialog.danger ? 'var(--bad-soft)' : 'var(--accent-grad-subtle)',
              color: dialog.danger ? 'var(--bad)' : 'var(--accent-primary)',
              border: dialog.danger ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
              flexShrink: 0,
            }}
          >
            {dialog.danger ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
          </div>
        </div>

        {dialog.message && (
          <p className="muted" style={{ fontSize: '0.94rem', margin: '0 0 1.25rem', lineHeight: '1.55' }}>
            {dialog.message}
          </p>
        )}

        {dialog.mode === 'prompt' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={dialog.placeholder || ''}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`}>
            {dialog.confirmText}
          </button>
        </div>
      </form>
    </div>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider')
  return ctx
}
