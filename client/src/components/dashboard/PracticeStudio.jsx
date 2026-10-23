import { HelpCircle, Briefcase, Code2, Upload, FileCheck, X, ArrowRight } from 'lucide-react'
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
    <div className="studio-card">
      <form onSubmit={createSession} className="studio-grid-form">
        {/* Left Column: Target Role & Seniority */}
        <div className="studio-col">
          <div className="studio-section">
            <label htmlFor="practice-role" className="studio-section-label">1. Target Role &amp; Seniority</label>
            <div className="input-icon-wrap">
              <Briefcase size={16} className="input-icon" aria-hidden="true" />
              <input
                id="practice-role"
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input input-with-icon"
                required
              />
            </div>
            <div className="preset-pill-cluster" role="group" aria-label="Role presets">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`preset-pill ${role === r.value ? 'active' : ''}`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '0.85rem' }}>
              <div className="preset-pill-cluster" role="radiogroup" aria-label="Experience level">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    role="radio"
                    aria-checked={difficulty === lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`preset-pill ${difficulty === lvl ? 'active' : ''}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Technical Focus Topic */}
          <div className="studio-section">
            <label htmlFor="practice-topic" className="studio-section-label">2. Focus Area</label>
            <div className="input-icon-wrap">
              <Code2 size={16} className="input-icon" aria-hidden="true" />
              <select
                id="practice-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input input-with-icon"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {topic === 'Custom Topic' && (
              <input
                type="text"
                placeholder="Enter specific topic (e.g. Docker & Kubernetes)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="input"
                style={{ marginTop: '0.5rem' }}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Right Column: Parameters & Launch */}
        <div className="studio-col">
          {/* 3. Session Parameters */}
          <div className="studio-section">
            <span className="studio-section-label">3. Interview Length &amp; Timer</span>
            <div className="studio-params-row">
              <div>
                <span className="param-sublabel">Questions</span>
                <div className="preset-pill-cluster" role="radiogroup" aria-label="Number of questions">
                  {COUNTS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      role="radio"
                      aria-checked={Number(numQuestions) === cnt}
                      onClick={() => setNumQuestions(String(cnt))}
                      className={`preset-pill ${Number(numQuestions) === cnt ? 'active' : ''}`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="param-sublabel">Time Limit</span>
                <div className="preset-pill-cluster" role="radiogroup" aria-label="Timer duration">
                  {TIMERS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={timerMinutes === t.value}
                      onClick={() => setTimerMinutes(t.value)}
                      className={`preset-pill ${timerMinutes === t.value ? 'active' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Optional Resume Upload */}
          <div className="studio-section">
            <span className="studio-section-label">4. Resume Tailoring (Optional)</span>
            {resumeFileName ? (
              <div className="resume-attached-card">
                <div className="resume-attached-info">
                  <FileCheck size={16} className="text-good" aria-hidden="true" />
                  <span className="resume-attached-name">{resumeFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="resume-remove-btn"
                  title="Remove attached resume"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="resume-dropzone">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Upload size={18} style={{ color: '#2563eb' }} aria-hidden="true" />
                <span>Upload PDF Resume to tailor questions</span>
              </label>
            )}
          </div>

          {/* Launch Action */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              {busy ? 'Preparing Interview...' : 'Start AI Interview'}
              {!busy && <ArrowRight size={16} style={{ marginLeft: '0.4rem' }} />}
            </button>
          </div>
        </div>
      </form>

      {progress && progress.active && <PracticeProgress progress={progress} />}
    </div>
  )
}
