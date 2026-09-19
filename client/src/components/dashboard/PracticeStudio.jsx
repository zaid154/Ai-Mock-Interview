import {
  HelpCircle,
  Layers,
  Briefcase,
  Code2,
  Upload,
  FileCheck,
  X,
  ArrowRight,
} from 'lucide-react'

// Suggested roles for 1-click selection
const ROLE_PRESETS = [
  'Fullstack Developer',
  'Frontend Engineer',
  'Backend Developer',
  'System Design Architect',
  'DevOps & Cloud Engineer',
]

// Technical domains available for interview practice
const TOPIC_OPTIONS = [
  'React & Modern Web Architecture',
  'Node.js, Express & Microservices',
  'System Design, Scalability & Caching',
  'Data Structures & Algorithms',
  'DevOps, Docker, Kubernetes & CI/CD',
  'SQL, NoSQL & Database Optimization',
  'Full Stack Application Architecture',
  'Custom Topic',
]

const QUESTION_COUNTS = [3, 5, 7, 10]

const TIMER_OPTIONS = [
  { label: 'Untimed', value: '0' },
  { label: '5m', value: '5' },
  { label: '10m', value: '10' },
  { label: '15m', value: '15' },
  { label: '20m', value: '20' },
]

/**
 * PracticeStudio Component
 * 
 * Handles interview setup parameters:
 * 1. Format: Q&A mock vs MCQ quiz
 * 2. Role & Seniority level
 * 3. Technical domain or custom topic
 * 4. Question volume & countdown timer
 * 5. PDF resume upload for personalized question context
 */
export default function PracticeStudio({
  mode,
  setMode,
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
}) {
  return (
    <div className="studio-card">
      <div className="studio-card-header">
        <div>
          <h2 className="studio-title">Practice Studio</h2>
          <p className="studio-subtitle">
            Set up evaluation parameters to simulate real technical hiring loops.
          </p>
        </div>
      </div>

      <form onSubmit={createSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1: Practice Format (Q&A vs Quiz) */}
        <div className="studio-section">
          <span className="studio-section-label">1. Practice Mode</span>
          <div className="mode-selection-grid">
            <button
              type="button"
              className={`mode-selector-card ${mode === 'questions' ? 'active' : ''}`}
              onClick={() => setMode('questions')}
            >
              <div className="mode-icon-box">
                <HelpCircle size={18} />
              </div>
              <div className="mode-card-content">
                <div className="mode-card-title">Q&amp;A Interview</div>
                <div className="mode-card-desc">
                  Verbal &amp; technical scenario questions with AI evaluation.
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`mode-selector-card ${mode === 'quiz' ? 'active' : ''}`}
              onClick={() => setMode('quiz')}
            >
              <div className="mode-icon-box">
                <Layers size={18} />
              </div>
              <div className="mode-card-content">
                <div className="mode-card-title">Speed MCQ Quiz</div>
                <div className="mode-card-desc">
                  Rapid-fire technical multiple-choice assessments.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Target Role & Seniority */}
        <div className="studio-section">
          <span className="studio-section-label">2. Target Role &amp; Seniority</span>
          <div className="input-icon-wrap">
            <Briefcase size={15} className="input-icon" />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </div>

          <div className="preset-pills-row">
            {ROLE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`preset-pill ${role === p ? 'active' : ''}`}
                onClick={() => setRole(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '0.45rem' }}>
            <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
              Seniority Level
            </span>
            <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {['Junior', 'Intermediate', 'Senior'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`pill-select-btn ${difficulty === lvl ? 'active' : ''}`}
                  onClick={() => setDifficulty(lvl)}
                >
                  {lvl === 'Junior' && 'Junior (0-2 YOE)'}
                  {lvl === 'Intermediate' && 'Mid-Level (2-5 YOE)'}
                  {lvl === 'Senior' && 'Senior (5+ YOE)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Domain & Topic */}
        <div className="studio-section">
          <span className="studio-section-label">3. Technical Domain</span>
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              if (e.target.value !== 'Custom Topic') setCustomTopic('')
            }}
          >
            {TOPIC_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {topic === 'Custom Topic' && (
            <div className="input-icon-wrap" style={{ marginTop: '0.35rem' }}>
              <Code2 size={15} className="input-icon" />
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter custom topic (e.g. Distributed Caching, GraphQL, WebSockets)"
                required
              />
            </div>
          )}
        </div>

        {/* Step 4: Questions Count & Timer */}
        <div className="studio-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                Question Volume
              </span>
              <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    className={`pill-select-btn ${numQuestions === cnt ? 'active' : ''}`}
                    onClick={() => setNumQuestions(cnt)}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="field-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                Session Timer
              </span>
              <div className="pill-button-group" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`pill-select-btn ${timerMinutes === opt.value ? 'active' : ''}`}
                    onClick={() => setTimerMinutes(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Resume Upload */}
        <div className="studio-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="studio-section-label">4. Resume Intelligence</span>
            <span className="muted small" style={{ fontSize: '0.72rem' }}>Optional</span>
          </div>

          <label className={`resume-studio-zone ${resumeFileName ? 'attached' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
              {resumeFileName ? (
                <FileCheck size={20} style={{ color: 'var(--good)', flexShrink: 0 }} />
              ) : (
                <Upload size={18} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: resumeFileName ? 'var(--good)' : 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {resumeFileName ? resumeFileName : 'Attach Resume PDF (Tailor Questions)'}
                </div>
                <div className="muted small" style={{ fontSize: '0.75rem' }}>
                  {resumeFileName
                    ? 'Questions will personalize to your project tech stack & experience'
                    : 'Upload your CV to generate questions matching your background'}
                </div>
              </div>
            </div>

            {resumeFileName ? (
              <button
                type="button"
                onClick={handleRemoveResume}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', height: 'auto', flexShrink: 0 }}
                title="Remove attached resume"
              >
                <X size={13} /> Remove
              </button>
            ) : (
              <span className="tag-soft" style={{ fontSize: '0.74rem', flexShrink: 0 }}>
                Browse PDF
              </span>
            )}
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Launch Action */}
        <button type="submit" className="studio-launch-btn" disabled={busy}>
          {busy ? (
            'Preparing Assessment Environment…'
          ) : (
            <>
              Start {mode === 'quiz' ? 'MCQ Drill' : 'Mock Interview'} ({numQuestions} Qs • {difficulty})
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
