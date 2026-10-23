import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, BookmarkCheck } from 'lucide-react'

export default function BookmarkCard({ bookmark: b, onDelete }) {
  const [showAnswer, setShowAnswer] = useState(false)
  const answer = b.modelAnswer || b.answer

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition flex flex-col gap-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            {b.role || 'Question'}
          </span>
          {b.category && b.category !== 'General' && (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {b.category}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(b._id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          title="Remove Bookmark"
          aria-label="Remove Bookmark"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Question Prompt */}
      <div className="font-semibold text-slate-900 text-sm leading-relaxed">
        {b.prompt}
      </div>

      {/* Answer Drawer Toggle */}
      {answer && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            <span>{showAnswer ? 'Hide Ideal Answer' : 'Show Ideal Answer'}</span>
            {showAnswer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showAnswer && (
            <div className="mt-2.5 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                <BookmarkCheck size={13} />
                <span>Calibrated Model Answer</span>
              </div>
              {answer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
