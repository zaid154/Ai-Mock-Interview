import { createContext, useContext, useEffect, useState } from 'react'

// A small promise-based confirm/prompt so we can replace the ugly native
// window.confirm / window.prompt with a styled modal. Usage:
//   const { confirm, promptText } = useConfirm()
//   if (await confirm({ message: 'Delete?', danger: true })) { ... }
//   const name = await promptText({ message: 'Rename to:', defaultValue: old })
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

  // Close on Escape.
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

  const title = dialog.title || (dialog.mode === 'prompt' ? 'Enter a value' : 'Are you sure?')

  return (
    // click on the backdrop cancels
    <div className="modal-overlay" onMouseDown={onCancel}>
      <form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{title}</h3>
        {dialog.message && <p className="muted">{dialog.message}</p>}
        {dialog.mode === 'prompt' && (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dialog.placeholder || ''}
          />
        )}
        <div className="modal-actions">
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
