import { useState, useRef, useEffect } from 'react'
import { Briefcase, Code2, Upload, FileCheck, X, ArrowRight, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react'

const POPULAR_ROLES = [
  { short: 'Frontend', full: 'Frontend Engineer' },
  { short: 'Backend', full: 'Backend Developer' },
  { short: 'Fullstack', full: 'Fullstack Developer' },
  { short: 'System Design', full: 'System Design Architect' },
  { short: 'DevOps', full: 'DevOps & Cloud Engineer' },
  { short: 'Data Analyst', full: 'Data Analyst' },
]

const TOPIC_OPTIONS = [
  'React & Modern Web Architecture',
  'Node.js, Express & Microservices',
  'MERN Architecture & Performance',
  'System Design, Scalability & Caching',
  'SQL, Data Analysis & Business Intelligence',
  'Cloud Infrastructure, CI/CD & DevOps',
  'Product Strategy, Metrics & Trade-offs',
  'Behavioral Leadership & Conflict Resolution',
  'Data Structures & Algorithms',
  'Custom Topic',
]

const POPULAR_TOPICS = [
  { label: 'React', value: 'React & Modern Web Architecture' },
  { label: 'Node.js', value: 'Node.js, Express & Microservices' },
  { label: 'MERN', value: 'MERN Architecture & Performance' },
  { label: 'System Design', value: 'System Design, Scalability & Caching' },
  { label: 'SQL & Data', value: 'SQL, Data Analysis & Business Intelligence' },
  { label: 'Custom +', value: 'Custom Topic' },
]

const QUESTION_COUNTS = [3, 5, 7, 10]

const TIMER_OPTIONS = [
  { label: 'Untimed', value: '0' },
  { label: '5m', fullLabel: '5 min', value: '5' },
  { label: '10m', fullLabel: '10 min', value: '10' },
  { label: '15m', fullLabel: '15 min', value: '15' },
  { label: '20m', fullLabel: '20 min', value: '20' },
]

const SENIORITY_LEVELS = [
  { id: 'Junior', label: 'Junior', sub: '0–2y' },
  { id: 'Intermediate', label: 'Mid-Level', sub: '2–5y' },
  { id: 'Senior', label: 'Senior', sub: '5+y' },
]

export default function PracticeStudio({
  role,
  setRole,
  topic,
  setTopic,
  customTopic,
  setCustomTopic,
  numQuestions,
  setNumQuestions,
  difficulty,
  setDifficulty,
  timerMinutes,
  setTimerMinutes,
  resumeFileName,
  handleFileUpload,
  handleRemoveResume,
  createSession,
  busy,
  onCancel,
}) {
  const currentCount = Number(numQuestions) || 5
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Smooth click-outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <div className="relative bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Sleek High-End Generation Overlay (Zero Layout Shift) */}
      {busy && (
        <div className="absolute inset-0 z-30 bg-white/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
          <div className="relative mb-3">
            <div className="w-11 h-11 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Synthesizing Technical Interview
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Calibrating {currentCount} questions for <span className="font-medium text-slate-700">{role || 'Fullstack Developer'}</span>
          </p>
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mt-3.5">
            <div className="h-full w-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-full animate-shimmer-line" />
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium mt-3.5 cursor-pointer transition"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <form onSubmit={createSession}>
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
          {/* ================= LEFT COLUMN: Role & Experience ================= */}
          <div className="space-y-4">
            {/* Target Role with Clear Affordance to Type Custom */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="practice-role" className="text-xs font-semibold text-slate-700">
                  Target Role
                </label>
                <span className="text-[11px] text-blue-600 font-medium">
                  Type custom or pick below
                </span>
              </div>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="practice-role"
                  type="text"
                  placeholder="Type any role (e.g. iOS Developer, ML Engineer, SRE)..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
                {role && (
                  <button
                    type="button"
                    onClick={() => setRole('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    title="Clear to type custom role"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Symmetrical 3x2 Grid for Quick Presets */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {POPULAR_ROLES.map((r) => {
                  const isSelected =
                    role.toLowerCase().includes(r.short.toLowerCase()) ||
                    role.toLowerCase().includes(r.full.toLowerCase())
                  return (
                    <button
                      key={r.short}
                      type="button"
                      onClick={() => setRole(r.full)}
                      className={`text-[11px] py-1 px-1.5 rounded-md border text-center transition cursor-pointer font-medium truncate ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={r.full}
                    >
                      {r.short}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Experience Level: 3 Columns matching exactly */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Seniority level">
                {SENIORITY_LEVELS.map((lvl) => {
                  const isSelected = difficulty === lvl.id
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setDifficulty(lvl.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-xs font-semibold leading-tight">{lvl.label}</span>
                      <span className={`block text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {lvl.sub}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Topic, Pills, Questions & Timer ================= */}
          <div className="space-y-4">
            {/* Topic & Focus Area - Custom FoodNinja Style Popover */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Topic &amp; Focus Area
                </label>
                <span className="text-[11px] text-blue-600 font-medium">
                  Select or choose Custom
                </span>
              </div>

              {/* Trigger Input Box (FoodNinja Style) with relative positioning directly on it */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-medium transition cursor-pointer text-left bg-white shadow-2xs ${
                    dropdownOpen
                      ? 'border-blue-500 ring-2 ring-blue-500/20 text-slate-900'
                      : 'border-slate-300 text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <span className="truncate pr-2">{topic}</span>
                  {dropdownOpen ? (
                    <ChevronUp size={15} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown size={15} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {/* FoodNinja Style Floating Dropdown Menu (Directly Below Input with ZERO Gap) */}
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-slate-50">
                    {TOPIC_OPTIONS.map((t) => {
                      const isSelected = topic === t
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTopic(t)
                            setDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-2 text-xs text-left transition cursor-pointer truncate ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Symmetrical 3x2 Grid for Topic Pills: Including Custom + */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {POPULAR_TOPICS.map((pt) => {
                  const isSelected = topic === pt.value
                  return (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => {
                        setTopic(pt.value)
                        setDropdownOpen(false)
                      }}
                      className={`text-[11px] py-1 px-1.5 rounded-md border text-center transition cursor-pointer font-medium truncate ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={pt.value}
                    >
                      {pt.label}
                    </button>
                  )
                })}
              </div>

              {/* Custom Topic field if chosen */}
              {topic === 'Custom Topic' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Type custom focus topic (e.g. Next.js 14, Redis Caching, Kafka, WebSockets)"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    required={topic === 'Custom Topic'}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Questions & Timer: Compact & Aligned */}
            <div className="grid grid-cols-12 gap-2.5 pt-0.5">
              {/* Questions (4 Columns) - col-span-4 */}
              <div className="col-span-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Questions
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {currentCount} Qs
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1" role="radiogroup">
                  {QUESTION_COUNTS.map((cnt) => {
                    const isSelected = currentCount === cnt
                    return (
                      <button
                        key={cnt}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setNumQuestions(cnt)}
                        className={`py-1.5 rounded-md border text-center text-xs transition cursor-pointer font-semibold ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cnt}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Timer / Question (5 Buttons) - col-span-8 with generous breathing room */}
              <div className="col-span-8">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Timer / Question
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {timerMinutes === '0' ? 'Untimed' : `${timerMinutes} min/q`}
                  </span>
                </div>
                <div className="flex gap-1" role="radiogroup">
                  {TIMER_OPTIONS.map((t) => {
                    const isSelected = String(timerMinutes) === t.value
                    const isUntimed = t.value === '0'
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        title={t.fullLabel || t.label}
                        onClick={() => setTimerMinutes(t.value)}
                        className={`py-1.5 rounded-md border text-center text-xs transition cursor-pointer font-medium whitespace-nowrap ${
                          isUntimed ? 'px-2.5 shrink-0' : 'flex-1'
                        } ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isUntimed ? 'Untimed' : t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COMPACT FOOTER ACTION BAR ================= */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-200/80 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Resume Upload / Badge */}
          <div className="w-full sm:w-auto">
            {resumeFileName ? (
              <div className="inline-flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                <FileCheck size={14} className="text-emerald-600 shrink-0" />
                <span className="font-medium truncate max-w-[200px]">{resumeFileName}</span>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                  title="Remove resume"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload size={13} className="text-slate-400" />
                <span>Attach Resume (Optional PDF)</span>
              </label>
            )}
          </div>

          {/* Start Action Button */}
          <button
            type="submit"
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Preparing Session...</span>
              </>
            ) : (
              <>
                <span>Start Interview</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
