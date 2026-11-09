import { Briefcase, Code2, Upload, FileCheck, X, ArrowRight, Sparkles, HelpCircle } from 'lucide-react'

const ROLE_PRESETS = [
  { label: 'Frontend Developer', value: 'Frontend Engineer' },
  { label: 'Backend Developer', value: 'Backend Developer' },
  { label: 'Fullstack Developer', value: 'Fullstack Developer' },
  { label: 'System Design', value: 'System Design Architect' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud Engineer' },
  { label: 'Product Manager', value: 'Technical Product Manager' },
  { label: 'Data Analyst', value: 'Data Analyst' },
]

const TOPIC_PRESETS = [
  'React & Modern Web Architecture',
  'Node.js, Express & Microservices',
  'MERN Architecture & Performance',
  'System Design, Scalability & Caching',
  'SQL, Data Analysis & Business Intelligence',
  'Cloud Infrastructure, CI/CD & DevOps',
  'Product Strategy, Metrics & Trade-offs',
  'Behavioral Leadership & Scenario Defense',
  'Data Structures & Algorithms',
  'Custom Topic',
]

const QUESTION_COUNTS = [3, 5, 7, 10]

const TIMER_OPTIONS = [
  { label: 'Untimed', value: '0' },
  { label: '5 min', value: '5' },
  { label: '10 min', value: '10' },
  { label: '15 min', value: '15' },
  { label: '20 min', value: '20' },
]

const SENIORITY_LEVELS = [
  { id: 'Junior', label: 'Junior', sub: '0-2 years' },
  { id: 'Intermediate', label: 'Mid-Level', sub: '2-5 years' },
  { id: 'Senior', label: 'Senior', sub: '5+ years' },
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
  onSwitchToPresets,
}) {
  const currentCount = Number(numQuestions) || 5
  const displayTopic = topic === 'Custom Topic' ? (customTopic.trim() || 'Custom Topic') : topic

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <form onSubmit={createSession} className="space-y-8">
        {/* Top Helper Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Custom Interview Configurator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your target role, focus topic, question depth, and time limits.
            </p>
          </div>
          {onSwitchToPresets && (
            <button
              type="button"
              onClick={onSwitchToPresets}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={13} />
              <span>Switch to Fast Track Presets</span>
            </button>
          )}
        </div>

        {/* 2-Column Main Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Role & Topic */}
          <div className="space-y-6">
            {/* STEP 1: Target Role & Seniority */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="practice-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Target Role &amp; Seniority
                </label>
                <span className="text-[11px] text-slate-400">Specify your target job title</span>
              </div>

              <div className="relative mb-3">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="practice-role"
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                />
              </div>

              {/* Quick Role Preset Chips */}
              <div className="mb-4">
                <span className="text-[11px] text-slate-500 block mb-1.5">Quick Select Role:</span>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Role presets">
                  {ROLE_PRESETS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition cursor-pointer ${
                        role === r.value
                          ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seniority Level Selector */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5">Experience Level:</span>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Seniority level">
                  {SENIORITY_LEVELS.map((lvl) => {
                    const isSelected = difficulty === lvl.id
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setDifficulty(lvl.id)}
                        className={`text-left p-2.5 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`block text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                          {lvl.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {lvl.sub}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* STEP 2: Technical Focus Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Technical Focus Area
                </label>
                <span className="text-[11px] text-slate-400">Choose key domain topic</span>
              </div>

              {/* Interactive Topic Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {TOPIC_PRESETS.map((t) => {
                  const isSelected = topic === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate">{t}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Custom Topic Input (if active) */}
              {topic === 'Custom Topic' && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
                  <label htmlFor="custom-topic" className="block text-xs font-semibold text-blue-900 mb-1">
                    Enter Your Custom Topic:
                  </label>
                  <input
                    id="custom-topic"
                    type="text"
                    placeholder="e.g. Distributed Caching in Redis, GraphQL Federation, or Next.js 14 App Router"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    required={topic === 'Custom Topic'}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Parameters, Resume & Actions */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* STEP 3: Interview Parameters */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  3. Interview Parameters
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  {/* Number of Questions */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-800 mb-2">
                      Questions Count
                    </span>
                    <div className="grid grid-cols-4 gap-1.5" role="radiogroup">
                      {QUESTION_COUNTS.map((cnt) => {
                        const isSelected = currentCount === cnt
                        return (
                          <button
                            key={cnt}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setNumQuestions(cnt)}
                            className={`py-1.5 rounded-lg border text-center text-xs transition cursor-pointer font-medium ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {cnt}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Timer Limit */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-800 mb-2">
                      Time Limit (Per Question)
                    </span>
                    <div className="grid grid-cols-5 gap-1" role="radiogroup">
                      {TIMER_OPTIONS.map((t) => {
                        const isSelected = String(timerMinutes) === t.value
                        return (
                          <button
                            key={t.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setTimerMinutes(t.value)}
                            className={`py-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer font-medium ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {t.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4: Resume Tailoring */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Resume Tailoring (Optional)
                  </span>
                  <span className="text-[11px] text-slate-400">PDF up to 5 MB</span>
                </div>

                {resumeFileName ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <FileCheck size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold block truncate">{resumeFileName}</span>
                        <span className="text-[11px] text-emerald-700">Resume attached &bull; Questions calibrated to your background</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                      title="Remove attached resume"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2.5 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 text-xs text-slate-600 transition cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload size={16} className="text-blue-600 shrink-0" />
                    <span>Upload your PDF resume to calibrate questions to your specific tech stack</span>
                  </label>
                )}
              </div>
            </div>

            {/* LIVE CONFIG SUMMARY & LAUNCH BUTTON */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="font-semibold text-slate-900">Selected:</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium truncate max-w-[180px]">
                  {role}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium truncate max-w-[200px]">
                  {displayTopic}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold">
                  {difficulty}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono">
                  {currentCount} Qs
                </span>
                {timerMinutes !== '0' && (
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono">
                    {timerMinutes}m timer
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Preparing Interview Session...' : <>Launch Simulated Interview <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
