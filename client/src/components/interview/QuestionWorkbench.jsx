import { useState, useEffect, useRef } from 'react'
import { Check, Copy, Bookmark, FileText, RotateCcw, Edit3, Mic, MicOff, Layers, HelpCircle, MessageSquarePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import FormattedPrompt from '../FormattedPrompt'

const STAR_SECTIONS = [
  { key: 'situation', label: 'Situation (Context)', rows: 2, placeholder: 'e.g. In our microservices platform, the payment service had high latency spikes during peak sales...' },
  { key: 'task', label: 'Task (Objective)', rows: 2, placeholder: 'e.g. My goal was to redesign the query path and implement an idempotent caching layer...' },
  { key: 'action', label: 'Action (Technical Steps)', rows: 3, placeholder: 'e.g. I introduced Redis with cache-aside pattern, added compound B-tree indexes...' },
  { key: 'result', label: 'Result (Quantifiable Outcome)', rows: 2, placeholder: 'e.g. p99 latency dropped from 850ms to 45ms, eliminating timeout errors completely...' },
]

export default function QuestionWorkbench({
  question,
  current,
  total,
  answer,
  note,
  wordCount,
  isBookmarked,
  copiedPrompt,
  onUpdateAnswer,
  onUpdateNote,
  onClearAnswer,
  onCopyPrompt,
  onBookmark,
  onProbeFollowUp,
  probing = false,
  followUpPrompt = '',
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
      toast('Voice recording paused', { icon: '🎙️' })
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onstart = () => { setIsListening(true); toast.success('Microphone active! Speak naturally.') }
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col gap-5">
      {/* ── Workbench Header & Action Controls ── */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-wrap">
        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
          Question {current + 1} of {total}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopyPrompt(question.prompt)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Copy question text"
          >
            {copiedPrompt ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => onBookmark(question.prompt)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
              isBookmarked
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Bookmark this question"
          >
            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* ── Question Text ── */}
      <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
        <FormattedPrompt text={question.prompt} />
      </div>

      {/* ── Follow-Up Probe Alert ── */}
      {(followUpPrompt || question.followUpPrompt) && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
            <MessageSquarePlus size={15} />
            <span>Interviewer Follow-Up Probe</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed m-0 font-medium">
            {followUpPrompt || question.followUpPrompt}
          </p>
        </div>
      )}

      {/* ── Answer Mode Switcher & Tools ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('freeform')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'freeform'
                ? 'bg-white text-blue-600 shadow-xs'
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
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            STAR Framework
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onProbeFollowUp && (
            <button
              type="button"
              disabled={probing || !answer.trim()}
              onClick={onProbeFollowUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
              title="Request interviewer follow-up probe"
            >
              <MessageSquarePlus size={14} className="text-blue-600" />
              <span>{probing ? 'Probing…' : 'Ask Follow-Up'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isListening
                ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
            }`}
            title="Dictate response via microphone"
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} className="text-blue-600" />}
            <span>{isListening ? 'Stop Mic' : 'Voice Dictate'}</span>
          </button>
        </div>
      </div>

      {isListening && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Microphone active — speak clearly. Your dictation will appear below in real-time.</span>
        </div>
      )}

      {/* ── Editor Body ── */}
      {activeTab === 'star' ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers size={14} className="text-blue-600" /> STAR Structured Response Builder
            </span>
            <button
              type="button"
              onClick={() => setShowStarGuide(!showStarGuide)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              <HelpCircle size={13} /> {showStarGuide ? 'Hide Guide' : 'What is STAR?'}
            </button>
          </div>

          {showStarGuide && (
            <div className="text-xs bg-white border border-slate-200 p-3 rounded-lg text-slate-600 leading-relaxed">
              <strong>STAR Framework:</strong> <strong>Situation</strong> (context), <strong>Task</strong> (objective), <strong>Action</strong> (technical steps taken), <strong>Result</strong> (quantifiable outcome).
            </div>
          )}

          {STAR_SECTIONS.map((sec) => (
            <div key={sec.key}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {sec.label}
              </label>
              <textarea
                rows={sec.rows}
                value={star[sec.key]}
                onChange={(e) => setStar({ ...star, [sec.key]: e.target.value })}
                placeholder={sec.placeholder}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              />
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('freeform')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyStar}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Insert into Response
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={answer}
            onChange={(e) => onUpdateAnswer(e.target.value)}
            placeholder="Type or voice-dictate your structured response here. Explain your architecture logic, trade-offs, algorithms, code implementations, or edge cases..."
            rows={10}
            className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white font-sans leading-relaxed text-slate-800"
          />

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-mono flex items-center gap-1 font-semibold text-slate-700">
                <FileText size={13} className="text-slate-400" />
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              {wordCount > 0 && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  wordCount < 30 ? 'bg-amber-50 text-amber-700' : wordCount < 120 ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {wordCount < 30 ? '• Recommend more detail' : wordCount < 120 ? '• Good depth' : '• Thorough detailed response'}
                </span>
              )}
            </div>

            {answer.trim() && (
              <button
                type="button"
                onClick={onClearAnswer}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 text-xs cursor-pointer transition"
              >
                <RotateCcw size={12} /> Clear Answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Candidate Scratchpad ── */}
      <div className="pt-3 border-t border-slate-100">
        <label htmlFor="workbench-note" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
          <Edit3 size={13} className="text-blue-600" />
          <span>Candidate Scratchpad / Personal Notes</span>
        </label>
        <input
          id="workbench-note"
          type="text"
          value={note}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Jot down quick reminders or trade-offs for this question..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>
    </div>
  )
}
