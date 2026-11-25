import { useState, useEffect, useRef } from 'react'
import {
  Bookmark,
  FileText,
  RotateCcw,
  Edit3,
  Mic,
  MicOff,
  Layers,
  Sparkles,
  HelpCircle,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import FormattedPrompt from '../FormattedPrompt'

const STAR_SECTIONS = [
  {
    key: 'situation',
    label: 'Situation (Context)',
    rows: 2,
    placeholder: 'e.g. In our microservices platform, the payment service had high latency spikes during peak sales...',
  },
  {
    key: 'task',
    label: 'Task (Objective)',
    rows: 2,
    placeholder: 'e.g. My goal was to redesign the query path and implement an idempotent caching layer...',
  },
  {
    key: 'action',
    label: 'Action (Technical Steps)',
    rows: 3,
    placeholder: 'e.g. I introduced Redis with cache-aside pattern, added compound B-tree indexes, and optimized connection pooling...',
  },
  {
    key: 'result',
    label: 'Result (Quantifiable Outcome)',
    rows: 2,
    placeholder: 'e.g. p99 latency dropped from 850ms to 45ms, eliminating timeout errors completely...',
  },
]

export default function QuestionWorkbench({
  question,
  current,
  total,
  answer,
  note,
  wordCount,
  isBookmarked,
  onUpdateAnswer,
  onUpdateNote,
  onClearAnswer,
  onBookmark,
  onProbeFollowUp,
  probing = false,
  followUpPrompt = '',
  onPrevious,
  onNext,
  onSubmit,
  isLast,
  submitting,
}) {
  const [isListening, setIsListening] = useState(false)
  const [activeTab, setActiveTab] = useState('freeform')
  const [showStarGuide, setShowStarGuide] = useState(false)
  const [star, setStar] = useState({ situation: '', task: '', action: '', result: '' })
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [current])

  function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      return toast.error('Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.')
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      toast('Voice recording paused')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onstart = () => {
        setIsListening(true)
        toast.success('Microphone active! Speak naturally.')
      }
      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' '
        }
        if (transcript.trim()) {
          onUpdateAnswer((prev) => (prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()))
        }
      }
      recognition.onerror = (err) => {
        setIsListening(false)
        if (err.error === 'not-allowed') toast.error('Microphone access denied. Please enable mic permissions.')
      }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  function handleApplyStar() {
    const parts = STAR_SECTIONS.filter((s) => star[s.key].trim()).map(
      (s) => `**${s.label.split(' ')[0]}:** ${star[s.key].trim()}`
    )
    if (!parts.length) return toast.error('Fill in at least one STAR section before inserting.')
    onUpdateAnswer(parts.join('\n\n'))
    setActiveTab('freeform')
    toast.success('STAR framework response assembled!')
  }

  if (!question) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
      {/* ================= LEFT COLUMN: Question & Interviewer Context ================= */}
      <div className="col-span-1 lg:col-span-5 space-y-4">
        {/* Main Question Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Question {current + 1} of {total}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onBookmark(question.prompt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question for post-interview review'}
              >
                <Bookmark size={12} fill={isBookmarked ? 'currentColor' : 'none'} />
                <span>{isBookmarked ? 'Bookmarked' : 'Save Question'}</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
            <FormattedPrompt text={question.prompt} />
          </div>

          {/* AI Follow-Up Probe (if triggered) */}
          {(followUpPrompt || question.followUpPrompt) && (
            <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200/80 flex flex-col gap-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
                <MessageSquarePlus size={13} />
                <span>Interviewer Follow-Up Probe</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium m-0">
                {followUpPrompt || question.followUpPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Interview Guidance & STAR Helper */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-600" /> Evaluation Focus
            </span>
            <button
              type="button"
              onClick={() => setShowStarGuide(!showStarGuide)}
              className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
            >
              {showStarGuide ? 'Hide STAR tips' : 'STAR framework'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 m-0 leading-relaxed">
            Aim for real architectural trade-offs, operational constraints, and measurable impact. Avoid abstract textbook definitions.
          </p>
          {showStarGuide && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-600 animate-in fade-in">
              <p>
                <strong className="text-slate-800">Situation:</strong> Set the context and business/technical bottleneck.
              </p>
              <p>
                <strong className="text-slate-800">Task:</strong> Your specific responsibility or engineering goal.
              </p>
              <p>
                <strong className="text-slate-800">Action:</strong> Technical choices, data models, patterns, or tools used.
              </p>
              <p>
                <strong className="text-slate-800">Result:</strong> Measured impact (p99 latency, cost reduction, reliability).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: Candidate Response Workbench ================= */}
      <div className="col-span-1 lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col gap-4">
        {/* Workbench Header: Mode Toggle + Voice + Follow-Up */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('freeform')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'freeform'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard Answer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('star')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'star'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              STAR Builder
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onProbeFollowUp && (
              <button
                type="button"
                disabled={probing || !answer.trim()}
                onClick={onProbeFollowUp}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                title="Request AI follow-up probe based on your answer"
              >
                <MessageSquarePlus size={13} className="text-blue-600" />
                <span>{probing ? 'Probing...' : 'Ask Follow-Up'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                isListening
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
              }`}
              title="Dictate response via microphone"
            >
              {isListening ? <MicOff size={13} /> : <Mic size={13} className="text-blue-600" />}
              <span>{isListening ? 'Stop Mic' : 'Voice Dictate'}</span>
            </button>
          </div>
        </div>

        {isListening && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span>Microphone active — speak clearly. Your speech is transcribed in real-time.</span>
          </div>
        )}

        {/* Main Answer Area (or STAR Builder) */}
        {activeTab === 'star' ? (
          <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-600" /> STAR Response Builder
              </span>
            </div>

            {STAR_SECTIONS.map((sec) => (
              <div key={sec.key}>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {sec.label}
                </label>
                <textarea
                  rows={sec.rows}
                  value={star[sec.key]}
                  onChange={(e) => setStar({ ...star, [sec.key]: e.target.value })}
                  placeholder={sec.placeholder}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('freeform')}
                className="px-3 py-1 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyStar}
                className="px-3.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs cursor-pointer"
              >
                Insert into Response
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={answer}
              onChange={(e) => onUpdateAnswer(e.target.value)}
              placeholder="Type or voice-dictate your structured response here... Explain architecture trade-offs, algorithms, code implementation patterns, or production edge cases."
              rows={11}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs sm:text-sm font-sans leading-relaxed text-slate-800 transition bg-slate-50/30 focus:bg-white resize-y"
            />

            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
                  <FileText size={12} className="text-slate-400" />
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                {wordCount > 0 && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      wordCount < 30
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : wordCount < 120
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {wordCount < 30 ? 'Add more depth' : wordCount < 120 ? 'Good depth' : 'Thorough response'}
                  </span>
                )}
              </div>

              {answer.trim() && (
                <button
                  type="button"
                  onClick={onClearAnswer}
                  className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scratchpad */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Edit3 size={12} className="text-slate-400" />
            <label htmlFor="workbench-note" className="text-[11px] font-semibold text-slate-600">
              Private Scratchpad / Candidate Notes
            </label>
          </div>
          <input
            id="workbench-note"
            type="text"
            value={note}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder="Jot down quick reminders, bullet points, or edge cases..."
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
          <button
            type="button"
            onClick={onPrevious}
            disabled={current === 0}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : <><span>Finish &amp; Score</span><CheckCircle2 size={14} /></>}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
