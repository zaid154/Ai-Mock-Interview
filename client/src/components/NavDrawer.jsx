import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { X, LogOut, LayoutDashboard, Code2, Bookmark, User, Home } from 'lucide-react'

export default function NavDrawer({ isOpen, onClose, user, logout }) {
  if (!isOpen) return null

  function handleLogout() {
    onClose()
    if (logout) logout()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-72 bg-white shadow-2xl border-l border-slate-200 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 p-0.5 bg-white">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm">
                  MockMate <span className="text-blue-600 font-extrabold text-[11px]">AI</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="mt-5 flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <LayoutDashboard size={16} className="text-slate-400" /> Dashboard
                  </Link>
                  <Link
                    to="/practice"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <Code2 size={16} className="text-slate-400" /> Practice
                  </Link>
                  <Link
                    to="/bookmarks"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <Bookmark size={16} className="text-slate-400" /> Bookmarks
                  </Link>
                  <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User size={16} className="text-slate-400" /> Profile &amp; Settings
                  </Link>
                </>
              ) : (
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                >
                  <Home size={16} className="text-slate-400" /> Home
                </Link>
              )}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
              >
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full text-center px-3 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="w-full text-center px-3 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
