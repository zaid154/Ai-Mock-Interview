import { createContext, useContext, useEffect, useState } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in" onMouseDown={onCancel}>
      <form
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="flex items-center gap-3.5 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            dialog.danger ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {dialog.danger ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">{title}</h3>
          </div>
        </div>

        {dialog.message && (
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {dialog.message}
          </p>
        )}

        {dialog.mode === 'prompt' && (
          <div className="mb-4">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={dialog.placeholder || ''}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition cursor-pointer ${
              dialog.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside a ConfirmProvider')
  return ctx
}
