import { Briefcase, Code2, Upload, FileCheck, X, ArrowRight, Clock, HelpCircle } from 'lucide-react'
import PracticeProgress from './PracticeProgress'

const ROLES = [
  { label: 'Fullstack', value: 'Fullstack Developer' },
  { label: 'Frontend', value: 'Frontend Engineer' },
  { label: 'Backend', value: 'Backend Developer' },
  { label: 'System Design', value: 'System Design Architect' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud Engineer' }
]
const TOPICS = [
  'React & Modern Web Architecture',
  'Node.js, Express & Microservices',
  'System Design, Scalability & Caching',
  'Data Structures & Algorithms',
  'DevOps & Cloud',
  'SQL & Database Optimization',
  'Custom Topic'
]
const COUNTS = [3, 5, 7, 10]
const TIMERS = [
  { label: 'Untimed', value: '0' },
  { label: '5m', value: '5' },
  { label: '10m', value: '10' },
  { label: '15m', value: '15' },
  { label: '20m', value: '20' }
]
const LEVELS = ['Junior', 'Intermediate', 'Senior']

export default function PracticeStudio({
  role, setRole, topic, setTopic, customTopic, setCustomTopic,
  numQuestions, setNumQuestions, difficulty, setDifficulty, timerMinutes, setTimerMinutes,
  resumeFileName, handleFileUpload, handleRemoveResume, createSession, busy, progress,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
      <form onSubmit={createSession} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Role & Topic */}
        <div className="flex flex-col gap-6">
          {/* 1. Target Role & Seniority */}
          <div>
            <label htmlFor="practice-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Target Role &amp; Seniority
            </label>
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

            {/* Quick Role Preset Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3" role="group" aria-label="Role presets">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition cursor-pointer ${
                    role === r.value
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Seniority Level */}
            <div className="flex gap-1.5" role="radiogroup" aria-label="Experience level">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`flex-1 text-xs py-1.5 text-center rounded-lg border transition cursor-pointer font-medium ${
                    difficulty === lvl
                      ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Technical Focus Topic */}
          <div>
            <label htmlFor="practice-topic" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Technical Focus Area
            </label>
            <div className="relative">
              <Code2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                id="practice-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white cursor-pointer"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {topic === 'Custom Topic' && (
              <input
                type="text"
                placeholder="Enter specific topic (e.g. Distributed Caching in Redis)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mt-2 px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Right Column: Length, Timer, Resume & Launch */}
        <div className="flex flex-col justify-between gap-6">
          {/* 3. Session Parameters */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                3. Interview Parameters
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5 font-medium">Questions</span>
                  <div className="flex gap-1.5" role="radiogroup">
                    {COUNTS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        role="radio"
                        aria-checked={Number(numQuestions) === cnt}
                        onClick={() => setNumQuestions(String(cnt))}
                        className={`flex-1 text-xs py-1.5 rounded-lg border text-center transition cursor-pointer font-medium ${
                          Number(numQuestions) === cnt
                            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-500 mb-1.5 font-medium">Timer Limit</span>
                  <div className="flex gap-1 flex-wrap" role="radiogroup">
                    {TIMERS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={timerMinutes === t.value}
                        onClick={() => setTimerMinutes(t.value)}
                        className={`text-xs px-2 py-1.5 rounded-lg border text-center transition cursor-pointer font-medium ${
                          timerMinutes === t.value
                            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Resume Attachment */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                4. Resume Tailoring (Optional)
              </span>

              {resumeFileName ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{resumeFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove attached resume"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 text-xs text-slate-600 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload size={16} className="text-blue-600" />
                  <span>Upload PDF resume to tailor questions</span>
                </label>
              )}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Preparing Interview Session…' : <>Launch Simulated Interview <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      </form>

      {progress && progress.active && <PracticeProgress {...progress} />}
    </div>
  )
}
