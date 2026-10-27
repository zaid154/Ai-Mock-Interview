import { useState } from 'react'
import { Bookmark, ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from 'lucide-react'
import { normalizePrompt } from '../lib/text'
import FormattedPrompt from './FormattedPrompt'

export default function QuestionEvaluationList({
  questions = [],
  bookmarkedMap = {},
  onBookmarkQuestion,
}) {
  const [revealed, setRevealed] = useState({})

  const toggleReveal = (idx) => setRevealed((p) => ({ ...p, [idx]: !p[idx] }))

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, idx) => {
        const isBookmarked = Boolean(bookmarkedMap[normalizePrompt(q.prompt)])
        const hasAnswer = Boolean(q.answer?.trim())
        const isOpen = Boolean(revealed[idx])
        const score = q.score ?? 0

        return (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            {/* Header: Question Number & Score Badge */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  Question {idx + 1}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  score >= 8 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  score >= 5 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {score} / 10 pts
                </span>
              </div>

              <button
                type="button"
                onClick={() => onBookmarkQuestion(q)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Save question to Bookmarks'}
              >
                <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {/* Prompt */}
            <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              <FormattedPrompt text={q.prompt} />
            </div>

            {/* Candidate Response */}
            {hasAnswer ? (
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Response
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {q.answer}
                </div>
              </div>
            ) : (
              <div className="text-xs italic text-slate-400 p-3 rounded-lg bg-slate-50 border border-slate-100">
                No response recorded for this question.
              </div>
            )}

            {/* AI Evaluation */}
            {q.feedback && (
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb size={14} />
                  <span>Engineering Rubric &amp; Trade-off Analysis</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed m-0">
                  {q.feedback}
                </p>
              </div>
            )}

            {/* Ideal Solution Accordion */}
            {q.idealAnswer && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleReveal(idx)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{isOpen ? 'Hide Ideal Solution' : 'Reveal Recommended Architecture & Solution'}</span>
                </button>

                {isOpen && (
                  <div className="mt-2.5 p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap animate-in fade-in">
                    <div className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 size={13} />
                      <span>Recommended Technical Architecture</span>
                    </div>
                    {q.idealAnswer}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
