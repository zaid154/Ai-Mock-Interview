import { HelpCircle, Layers, Briefcase, Code2, Upload, FileCheck, X, ArrowRight } from 'lucide-react'
import PracticeProgress from './PracticeProgress'

const ROLES = [
  { label: 'Fullstack', value: 'Fullstack Developer' },
  { label: 'Frontend', value: 'Frontend Engineer' },
  { label: 'Backend', value: 'Backend Developer' },
  { label: 'System Design', value: 'System Design Architect' },
  { label: 'DevOps & Cloud', value: 'DevOps & Cloud Engineer' }
]
const TOPICS = ['React & Modern Web Architecture', 'Node.js, Express & Microservices', 'System Design, Scalability & Caching', 'Data Structures & Algorithms', 'DevOps & Cloud', 'SQL & Database Optimization', 'Custom Topic']
const COUNTS = [3, 5, 7, 10]
const TIMERS = [{ label: 'Untimed', value: '0' }, { label: '5m', value: '5' }, { label: '10m', value: '10' }, { label: '15m', value: '15' }, { label: '20m', value: '20' }]
const LEVELS = ['Junior', 'Intermediate', 'Senior']

export default function PracticeStudio({
  mode, setMode, role, setRole, topic, setTopic, customTopic, setCustomTopic,
  numQuestions, setNumQuestions, difficulty, setDifficulty, timerMinutes, setTimerMinutes,
  resumeFileName, handleFileUpload, handleRemoveResume, createSession, busy, progress,
}) {
  return (
    <div className="studio-card">
      <form onSubmit={createSession} className="studio-grid-form">
        {/* Left Column: Format, Target Role & Seniority */}
        <div className="studio-col">
          {/* 1. Practice Mode */}
          <div className="studio-section">
            <span className="studio-section-label">1. Practice Mode</span>
            <div className="mode-selection-grid" role="radiogroup" aria-label="Practice Mode">
              <button type="button" role="radio" aria-checked={mode === 'questions'} className={`mode-selector-card ${mode === 'questions' ? 'active' : ''}`} onClick={() => setMode('questions')}>
                <div className="mode-icon-box"><HelpCircle size={18} aria-hidden="true" /></div>
                <div className="mode-card-content">
                  <div className="mode-card-title">Q&amp;A Interview</div>
                  <div className="mode-card-desc">Verbal &amp; technical scenarios with AI evaluation.</div>
                </div>
              </button>
              <button type="button" role="radio" aria-checked={mode === 'quiz'} className={`mode-selector-card ${mode === 'quiz' ? 'active' : ''}`} onClick={() => setMode('quiz')}>
                <div className="mode-icon-box"><Layers size={18} aria-hidden="true" /></div>
                <div className="mode-card-content">
                  <div className="mode-card-title">Speed MCQ Quiz</div>
                  <div className="mode-card-desc">Rapid-fire technical multiple-choice assessments.</div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Target Role & Seniority */}
          <div className="studio-section">
            <label htmlFor="practice-role" className="studio-section-label">2. Target Role &amp; Seniority</label>
            <div className="input-icon-wrap">
              <Briefcase size={15} className="input-icon" aria-hidden="true" />
              <input
                id="practice-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>

            <div className="preset-pills-row" aria-label="Preset Roles">
              {ROLES.map((r) => (
                <button key={r.value} type="button" className={`preset-pill ${role === r.value ? 'active' : ''}`} onClick={() => setRole(r.value)}>
                  {r.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '0.45rem' }}>
              <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Seniority Level</span>
              <div className="pill-button-group" role="radiogroup" aria-label="Seniority Level" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    role="radio"
                    aria-checked={difficulty === lvl}
                    className={`pill-select-btn ${difficulty === lvl ? 'active' : ''}`}
                    onClick={() => setDifficulty(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Technical Domain, Drill Parameters, Resume & Launch */}
        <div className="studio-col">
          {/* 3. Domain & Custom Topic */}
          <div className="studio-section">
            <label htmlFor="practice-topic" className="studio-section-label">3. Technical Domain</label>
            <select
              id="practice-topic"
              value={topic}
              onChange={(e) => { setTopic(e.target.value); if (e.target.value !== 'Custom Topic') setCustomTopic('') }}
            >
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {topic === 'Custom Topic' && (
              <div className="input-icon-wrap" style={{ marginTop: '0.35rem' }}>
                <Code2 size={15} className="input-icon" aria-hidden="true" />
                <input
                  id="practice-custom-topic"
                  aria-label="Custom Topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter custom topic (e.g. Docker, GraphQL, WebSockets)"
                  required
                />
              </div>
            )}
          </div>

          {/* 4. Question Count & Duration */}
          <div className="studio-section">
            <span className="studio-section-label">4. Questions &amp; Duration</span>
            <div className="studio-params-row">
              <div>
                <span className="field-label" style={{ marginBottom: '0.3rem', display: 'block' }}>Questions</span>
                <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {COUNTS.map((cnt) => (
                    <button key={cnt} type="button" className={`pill-select-btn ${numQuestions === cnt ? 'active' : ''}`} onClick={() => setNumQuestions(cnt)}>
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="field-label" style={{ marginBottom: '0.3rem', display: 'block' }}>Timer</span>
                <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                  {TIMERS.map((opt) => (
                    <button key={opt.value} type="button" className={`pill-select-btn ${timerMinutes === opt.value ? 'active' : ''}`} onClick={() => setTimerMinutes(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Resume Context */}
          <div className="studio-section">
            <span className="studio-section-label">5. Resume PDF Context (Optional)</span>
            <div className={`resume-studio-zone ${resumeFileName ? 'attached' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                {resumeFileName ? <FileCheck size={18} style={{ color: '#4ade80' }} aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {resumeFileName || 'Attach Resume PDF (Tailors questions to projects)'}
                  </span>
                  {resumeFileName && (
                    <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>
                      ✓ Saved resume context available
                    </span>
                  )}
                </div>
              </div>
              {resumeFileName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem', cursor: 'pointer' }}>
                    Replace <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                  <button type="button" onClick={handleRemoveResume} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.45rem', fontSize: '0.72rem' }}>
                    <X size={12} aria-hidden="true" /> Remove
                  </button>
                </div>
              ) : (
                <label className="tag-soft" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', cursor: 'pointer' }}>
                  Browse <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {progress?.active ? (
            <PracticeProgress
              statusText={progress.statusText} percent={progress.percent}
              isRetrying={progress.isRetrying} errorMessage={progress.errorMessage}
              onRetry={progress.onRetry} onCancel={progress.onCancel}
            />
          ) : (
            <button type="submit" className="studio-launch-btn" disabled={busy} style={{ marginTop: '0.25rem' }}>
              Start {mode === 'quiz' ? 'MCQ Drill' : 'Mock Interview'} <ArrowRight size={17} aria-hidden="true" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
