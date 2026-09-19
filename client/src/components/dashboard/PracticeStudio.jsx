import { HelpCircle, Layers, Briefcase, Code2, Upload, FileCheck, X, ArrowRight } from 'lucide-react'

const ROLES = ['Fullstack Developer', 'Frontend Engineer', 'Backend Developer', 'System Design Architect', 'DevOps & Cloud Engineer']
const TOPICS = ['React & Modern Web Architecture', 'Node.js, Express & Microservices', 'System Design, Scalability & Caching', 'Data Structures & Algorithms', 'DevOps & Cloud', 'SQL & Database Optimization', 'Custom Topic']
const COUNTS = [3, 5, 7, 10]
const TIMERS = [{ label: 'Untimed', value: '0' }, { label: '5m', value: '5' }, { label: '10m', value: '10' }, { label: '15m', value: '15' }, { label: '20m', value: '20' }]
const LEVELS = ['Junior', 'Intermediate', 'Senior']

/**
 * PracticeStudio: Clean setup form for mock sessions (Q&A / MCQ Quiz).
 */
export default function PracticeStudio({
  mode, setMode, role, setRole, topic, setTopic, customTopic, setCustomTopic,
  numQuestions, setNumQuestions, difficulty, setDifficulty, timerMinutes, setTimerMinutes,
  resumeFileName, handleFileUpload, handleRemoveResume, createSession, busy,
}) {
  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <div>
          <h2 className="studio-title">Practice Studio</h2>
          <p className="studio-subtitle">Configure parameters to simulate real technical hiring rounds.</p>
        </div>
      </div>

      <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. Practice Mode */}
        <div className="studio-section">
          <span className="studio-section-label">1. Practice Mode</span>
          <div className="mode-selection-grid">
            <button type="button" className={`mode-selector-card ${mode === 'questions' ? 'active' : ''}`} onClick={() => setMode('questions')}>
              <div className="mode-icon-box"><HelpCircle size={18} /></div>
              <div className="mode-card-content">
                <div className="mode-card-title">Q&amp;A Interview</div>
                <div className="mode-card-desc">Verbal &amp; technical scenarios with AI evaluation.</div>
              </div>
            </button>
            <button type="button" className={`mode-selector-card ${mode === 'quiz' ? 'active' : ''}`} onClick={() => setMode('quiz')}>
              <div className="mode-icon-box"><Layers size={18} /></div>
              <div className="mode-card-content">
                <div className="mode-card-title">Speed MCQ Quiz</div>
                <div className="mode-card-desc">Rapid-fire technical multiple-choice assessments.</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Target Role & Seniority */}
        <div className="studio-section">
          <span className="studio-section-label">2. Target Role &amp; Seniority</span>
          <div className="input-icon-wrap">
            <Briefcase size={15} className="input-icon" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" required />
          </div>

          <div className="preset-pills-row">
            {ROLES.map((r) => (
              <button key={r} type="button" className={`preset-pill ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                {r}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.45rem' }}>
            <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Seniority Level</span>
            <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {LEVELS.map((lvl) => (
                <button key={lvl} type="button" className={`pill-select-btn ${difficulty === lvl ? 'active' : ''}`} onClick={() => setDifficulty(lvl)}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Domain & Custom Topic */}
        <div className="studio-section">
          <span className="studio-section-label">3. Technical Domain</span>
          <select value={topic} onChange={(e) => { setTopic(e.target.value); if (e.target.value !== 'Custom Topic') setCustomTopic('') }}>
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {topic === 'Custom Topic' && (
            <div className="input-icon-wrap" style={{ marginTop: '0.35rem' }}>
              <Code2 size={15} className="input-icon" />
              <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Enter custom topic (e.g. Docker, GraphQL, WebSockets)" required />
            </div>
          )}
        </div>

        {/* 4. Question Count & Duration */}
        <div className="studio-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Questions</span>
              <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {COUNTS.map((cnt) => (
                  <button key={cnt} type="button" className={`pill-select-btn ${numQuestions === cnt ? 'active' : ''}`} onClick={() => setNumQuestions(cnt)}>
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>Timer</span>
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
          <span className="studio-section-label">4. Resume PDF Context (Optional)</span>
          <label className={`resume-studio-zone ${resumeFileName ? 'attached' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
              {resumeFileName ? <FileCheck size={20} style={{ color: 'var(--good)' }} /> : <Upload size={18} />}
              <span style={{ fontSize: '0.84rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {resumeFileName || 'Attach Resume PDF (Tailors questions to your projects)'}
              </span>
            </div>
            {resumeFileName ? (
              <button type="button" onClick={handleRemoveResume} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
                <X size={13} /> Remove
              </button>
            ) : (
              <span className="tag-soft">Browse</span>
            )}
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <button type="submit" className="studio-launch-btn" disabled={busy}>
          {busy ? 'Preparing Assessment…' : <>Start {mode === 'quiz' ? 'MCQ Drill' : 'Mock Interview'} <ArrowRight size={17} /></>}
        </button>
      </form>
    </div>
  )
}
