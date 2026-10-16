import { useState, useEffect, useRef } from 'react'
import { Check, Copy, Bookmark, FileText, RotateCcw, Edit3, Mic, MicOff, Sparkles, HelpCircle, MessageSquarePlus } from 'lucide-react'
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
      recognition.onstart = () => { setIsListening(true); toast.success('Microphone active! Speak your answer naturally.') }
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
    <div className="interview-workbench">
      <div className="interview-workbench-head">
        <span className="mono bold interview-q-badge">Question {current + 1} of {total}</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCopyPrompt(question.prompt)} title="Copy question text">
            {copiedPrompt ? <Check size={14} style={{ color: 'var(--good)' }} /> : <Copy size={14} />}
            <span>{copiedPrompt ? 'Copied' : 'Copy'}</span>
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onBookmark(question.prompt)} title="Bookmark this question">
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} style={{ color: isBookmarked ? 'var(--accent-primary)' : 'inherit' }} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      <div className="question-text interview-question-text">
        <FormattedPrompt text={question.prompt} />
      </div>

      {(followUpPrompt || question.followUpPrompt) && (
        <div style={{ marginBottom: '1rem', padding: '0.9rem 1.1rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', fontSize: '0.82rem', fontWeight: 700 }}>
            <MessageSquarePlus size={15} />
            <span>INTERVIEWER FOLLOW-UP PROBE</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5, color: '#f1f5f9' }}>
            {followUpPrompt || question.followUpPrompt}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button type="button" className={`btn btn-sm ${activeTab === 'freeform' ? 'btn-secondary' : 'btn-ghost'}`} style={{ fontSize: '0.78rem', padding: '0.25rem 0.7rem' }} onClick={() => setActiveTab('freeform')}>
            Standard Answer
          </button>
          <button type="button" className={`btn btn-sm ${activeTab === 'star' ? 'btn-secondary' : 'btn-ghost'}`} style={{ fontSize: '0.78rem', padding: '0.25rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setActiveTab('star')}>
            <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>STAR Framework</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onProbeFollowUp && (
            <button type="button" className="btn btn-ghost btn-sm" disabled={probing || !answer.trim()} onClick={onProbeFollowUp} title="Request follow-up probe" style={{ fontSize: '0.78rem' }}>
              <MessageSquarePlus size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>{probing ? 'Probing…' : 'Interviewer Probe'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            title="Dictate response via microphone"
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} style={{ color: 'var(--accent-primary)' }} />}
            <span>{isListening ? 'Stop Recording' : 'Voice Dictate'}</span>
          </button>
        </div>
      </div>

      {isListening && (
        <div style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span>Listening… speak your answer clearly. Text will appear below in real-time.</span>
        </div>
      )}

      {activeTab === 'star' ? (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem', marginBottom: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={15} /> STAR Method Answer Builder
            </span>
            <button type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={() => setShowStarGuide(!showStarGuide)}>
              <HelpCircle size={13} /> {showStarGuide ? 'Hide Guide' : 'What is STAR?'}
            </button>
          </div>

          {showStarGuide && (
            <div style={{ fontSize: '0.78rem', background: 'var(--surface)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.5, color: 'var(--text-subtle)' }}>
              <strong>STAR Framework:</strong> <strong>Situation</strong> (context), <strong>Task</strong> (objective), <strong>Action</strong> (technical steps taken), <strong>Result</strong> (quantifiable outcome).
            </div>
          )}

          {STAR_SECTIONS.map((sec) => (
            <div key={sec.key}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>{sec.label}</label>
              <textarea
                rows={sec.rows}
                value={star[sec.key]}
                onChange={(e) => setStar({ ...star, [sec.key]: e.target.value })}
                placeholder={sec.placeholder}
                className="interview-textarea"
                style={{ fontSize: '0.86rem' }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.2rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('freeform')}>Cancel</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyStar}>Insert into Response</button>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%' }}>
          <textarea
            value={answer}
            onChange={(e) => onUpdateAnswer(e.target.value)}
            placeholder="Type or voice-dictate your structured response here. Explain your architecture logic, trade-offs, step-by-step algorithms, or code implementations..."
            rows={9}
            className="interview-textarea"
          />

          <div className="interview-word-count-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <span className="mono">
                <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              {wordCount > 0 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: wordCount < 30 ? 'var(--warn)' : wordCount < 120 ? 'var(--accent-primary)' : 'var(--good)' }}>
                  {wordCount < 30 ? '• Recommend more detail' : wordCount < 120 ? '• Good depth' : '• Thorough detailed response'}
                </span>
              )}
            </div>

            {answer.trim() && (
              <button type="button" onClick={onClearAnswer} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.4rem' }}>
                <RotateCcw size={13} /> Clear Answer
              </button>
            )}
          </div>
        </div>
      )}

      <div className="interview-scratchpad-drawer">
        <span className="field-label" style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
          <Edit3 size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <span>Candidate Scratchpad / Personal Notes</span>
        </span>
        <input
          type="text"
          value={note}
          onChange={(e) => onUpdateNote(e.target.value)}
          placeholder="Jot down personal reminders or key terms for this question..."
          className="interview-scratchpad-input"
        />
      </div>
    </div>
  )
}
