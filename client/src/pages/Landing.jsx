import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, CheckCircle2, Terminal, Database, Network, BarChart3, Briefcase, Users, FileText, Mic, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CAREER_TRACKS = [
  {
    id: 'engineering',
    name: 'Software Engineering',
    icon: Code2,
    roles: 'Frontend, Backend, Fullstack, Mobile',
    sampleQuestion: 'A critical service is experiencing intermittent 504 gateway timeouts under sudden traffic surges. Walk through your systematic triage, log analysis, and architectural remediation.',
    evaluationFocus: ['Root Cause Isolation', 'Async Concurrency & I/O', 'Database Connection Pooling', 'Mitigation Trade-offs'],
    targetRole: 'Fullstack Developer',
    topic: 'React & Modern Web Architecture',
  },
  {
    id: 'product',
    name: 'Product & Program Management',
    icon: Briefcase,
    roles: 'Technical PM, Product Owner, Scrum Master',
    sampleQuestion: 'Two senior stakeholders present conflicting high-priority requirements two weeks before a scheduled quarterly release. How do you evaluate trade-offs, manage expectations, and determine scope?',
    evaluationFocus: ['Business Impact Prioritization', 'Stakeholder Negotiation', 'Data-Driven Trade-offs', 'Delivery Risk Mitigation'],
    targetRole: 'Technical Product Manager',
    topic: 'Product Strategy, Metrics & Trade-offs',
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    icon: BarChart3,
    roles: 'Data Analyst, BI Engineer, Data Scientist',
    sampleQuestion: 'Our weekly active user retention dropped 14% month-over-month while total sign-ups remained steady. What telemetry and dimensional metrics would you query first to diagnose the anomaly?',
    evaluationFocus: ['Funnel Telemetry Analysis', 'Cohort Segmentation', 'SQL Query Optimization', 'Actionable Business Insights'],
    targetRole: 'Data Analyst',
    topic: 'SQL, Data Analysis & Business Intelligence',
  },
  {
    id: 'systems',
    name: 'Systems & Cloud Architecture',
    icon: Network,
    roles: 'DevOps, SRE, Cloud Architect, Security',
    sampleQuestion: 'Design an idempotent payment webhook receiver that guarantees exactly-once processing semantics even during network retries and database failovers.',
    evaluationFocus: ['Distributed Locking & Idempotency', 'State Machine Consistency', 'Failure Recovery & Retries', 'Zero Data Loss Guarantees'],
    targetRole: 'System Design Architect',
    topic: 'System Design, Scalability & Caching',
  },
  {
    id: 'leadership',
    name: 'Operations & Leadership',
    icon: Users,
    roles: 'Engineering Manager, Operations Lead, Tech Lead',
    sampleQuestion: 'Describe a situation where a multi-month project fell behind schedule due to unexpected technical debt. How did you communicate with executive leadership and recalibrate team commitments?',
    evaluationFocus: ['Transparent Communication', 'Technical Debt Valuation', 'Team Morale & Velocity', 'Resource Reallocation'],
    targetRole: 'Engineering Manager',
    topic: 'Behavioral Leadership & Scenario Defense',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Select Role or Upload Resume',
    desc: 'Choose from pre-calibrated career tracks or attach a PDF resume to generate tailored questions matching your exact background.',
  },
  {
    step: '02',
    title: 'Interactive Assessment Session',
    desc: 'Respond naturally using voice speech recognition or the integrated editor, defending your decisions and edge-case handling.',
  },
  {
    step: '03',
    title: 'Rubric Scorecard & Analysis',
    desc: 'Receive structured scoring on domain accuracy, reasoning depth, and communication, with instant scorecard export.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [activeTrackId, setActiveTrackId] = useState(CAREER_TRACKS[0].id)
  const activeTrack = CAREER_TRACKS.find((t) => t.id === activeTrackId) || CAREER_TRACKS[0]

  return (
    <div className="flex-1 flex flex-col">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Interview Practice <br className="hidden sm:inline" />
            <span className="text-blue-600">for Any Career Track</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Simulate realistic interview rounds across engineering, product management, data analytics, and leadership.
            Answer via speech or text, defend trade-offs, and receive structured rubric feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
            >
              <span>{user ? 'Go to Dashboard' : 'Start Practicing'}</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to={user ? '/practice' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-sm px-5 py-2.5 rounded-lg transition"
            >
              <Code2 size={15} className="text-slate-500" />
              <span>Explore All Tracks</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Tailor to any role or resume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Real-time voice dictation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Industry rubric scorecards</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Multi-Career Tracks & Interactive Preview --- */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Explore Practice Domains &amp; Scenarios
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a discipline to preview realistic interview scenarios and evaluation rubrics.
            </p>
          </div>

          {/* Track Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist">
            {CAREER_TRACKS.map((t) => {
              const Icon = t.icon
              const isSelected = t.id === activeTrackId
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTrackId(t.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-white' : 'text-slate-500'} />
                  <span>{t.name}</span>
                </button>
              )
            })}
          </div>

          {/* Interactive Scenario Workbench Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium mb-3">
                  <span>Covered Roles:</span>
                  <strong className="text-slate-900 font-semibold">{activeTrack.roles}</strong>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Sample Interview Scenario
                </h3>
                <p className="text-xs text-slate-500">
                  Real-world prompt designed to assess technical reasoning, practical depth, and trade-off defense.
                </p>
              </div>

              <Link
                to={user ? `/practice?track=${encodeURIComponent(activeTrack.targetRole)}` : '/login'}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0"
              >
                <span>Practice This Track</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Prompt Box */}
            <div className="my-6 p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Interview Question:
              </span>
              <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                "{activeTrack.sampleQuestion}"
              </p>
            </div>

            {/* Evaluation Focus Points */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-3">
                Key Rubric Evaluation Areas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeTrack.evaluationFocus.map((focus) => (
                  <div key={focus} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-md">
                    <Check size={14} className="text-blue-600 shrink-0" />
                    <span>{focus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Universal Resume Callout */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-slate-400 shrink-0" />
                <span>Targeting a different role? Attach your PDF resume to calibrate questions to your specific career path.</span>
              </div>
              <Link
                to={user ? '/practice' : '/register'}
                className="font-medium text-blue-600 hover:underline shrink-0"
              >
                Upload Resume &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              How MockMate Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Prepare, practice, and review your technical reasoning in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded mb-3 inline-block">
                    Step {s.step}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Bottom CTA --- */}
      <section className="py-12 sm:py-14 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
            Ready to test your interview readiness?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            Select your discipline or upload your resume to start practicing with structured rubrics.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            <span>{user ? 'Open Dashboard' : 'Get Started'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
