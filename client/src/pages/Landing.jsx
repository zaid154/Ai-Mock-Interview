import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  CheckCircle2,
  Database,
  Network,
  Users,
  FileText,
  Mic,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CAREER_TRACKS = [
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    icon: Code2,
    targetRole: 'Frontend Developer',
    topic: 'React & Modern Web Architecture',
    challengeTitle: 'Component Rendering & State Architecture',
    sampleQuestion:
      'How does React’s reconciliation algorithm work under the hood, and how do keys optimize list rendering? When can useMemo or useCallback actually hurt performance instead of helping?',
    topics: ['Virtual DOM Reconciliation', 'Key Prop Mechanics', 'Memoization Trade-offs', 'State Colocation'],
  },
  {
    id: 'backend',
    name: 'Backend & APIs',
    icon: Database,
    targetRole: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    challengeTitle: 'Authentication & Connection Management',
    sampleQuestion:
      'How do you design a secure JWT authentication flow with access and refresh tokens? Where should tokens be stored to protect against XSS and CSRF, and how do you handle token rotation?',
    topics: ['HttpOnly Cookie Storage', 'Refresh Token Rotation', 'Connection Pooling', 'CORS & CSRF Mitigation'],
  },
  {
    id: 'fullstack',
    name: 'MERN Fullstack',
    icon: Layers,
    targetRole: 'Fullstack Developer',
    topic: 'MERN Architecture & Performance',
    challengeTitle: 'End-to-End Latency & Query Optimization',
    sampleQuestion:
      'Walk through how you would diagnose and fix a slow dashboard page where an API endpoint takes over 3 seconds to return aggregated user data to a React client.',
    topics: ['Database Indexing & Explain Plans', 'Pagination & Aggregation Pipelines', 'Network Waterfall Analysis', 'Optimistic UI Updates'],
  },
  {
    id: 'systems',
    name: 'System Design',
    icon: Network,
    targetRole: 'System Design Architect',
    topic: 'Distributed Systems & Scalability',
    challengeTitle: 'High-Availability URL Shortener',
    sampleQuestion:
      'How would you design a scalable URL shortener like Bitly? Walk through the API design, database choice, Base62 hashing strategy, and cache-aside invalidation.',
    topics: ['Base62 / Hash Collisions', 'Cache-Aside with Redis', 'Read-Heavy Sharding', 'Rate Limiting & Backpressure'],
  },
  {
    id: 'behavioral',
    name: 'Behavioral & Leadership',
    icon: Users,
    targetRole: 'Engineering Lead / Team Member',
    topic: 'STAR Framework & Conflict Resolution',
    challengeTitle: 'Technical Conflict & Project Deadlines',
    sampleQuestion:
      'Tell me about a time you strongly disagreed with a teammate or lead on a technical architectural decision. How did you handle the discussion and reach a final agreement?',
    topics: ['Situation & Task Framing', 'Objective Data & Trade-offs', 'Team Empathy & Collaboration', 'Quantifiable Project Result'],
  },
]

export default function Landing() {
  const { user } = useAuth()
  const [activeTrackId, setActiveTrackId] = useState(CAREER_TRACKS[0].id)
  const [heroMockMode, setHeroMockMode] = useState('workbench') // 'workbench' | 'scorecard'
  const activeTrack = CAREER_TRACKS.find((t) => t.id === activeTrackId) || CAREER_TRACKS[0]

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* =========================================================================
          HERO SECTION: Clean, High-End Developer Studio
         ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 bg-white border-b border-slate-200">
        {/* Subtle Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 60%), linear-gradient(to right, rgba(226, 232, 240, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.6) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-mono font-medium shadow-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI-Powered Technical Interview Practice Studio</span>
          </div>

          {/* Genuine Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.14] mb-4">
            Master Your Technical Interviews. <br className="hidden sm:inline" />
            <span className="text-blue-600">With Real-Time AI Feedback.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-7">
            Prepare for your upcoming technical rounds. Practice real-world coding scenarios,
            system design questions, and STAR behavioral prompts. Answer using live speech dictation
            or text, and receive structured rubric evaluations to sharpen your delivery.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition cursor-pointer"
            >
              <span>{user ? 'Go to Dashboard' : 'Start Practicing Free'}</span>
              <ArrowRight size={15} />
            </Link>
            <a
              href="#tracks"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow-2xs transition"
            >
              <Code2 size={15} className="text-slate-500" />
              <span>Explore Role Tracks</span>
            </a>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 mb-12">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Resume-based question generation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Speech-to-text live dictation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>STAR framework answer structure &amp; scoring</span>
            </div>
          </div>

          {/* =========================================================================
              LIVE HERO PRODUCT PREVIEW
             ========================================================================= */}
          <div className="w-full max-w-4xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_rgba(37,99,235,0.08)] overflow-hidden text-left transition-all">
            {/* Window Chrome Header Bar */}
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 pl-2 hidden sm:inline">
                  mockmate://session/practice-studio
                </span>
              </div>

              {/* HUD Status Badges */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">
                  <Clock size={11} /> 14:22 remaining
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  <ShieldCheck size={11} /> Practice Mode
                </span>
              </div>
            </div>

            {/* Interactive Mode Toggle Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => setHeroMockMode('workbench')}
                  className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    heroMockMode === 'workbench'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic size={12} />
                  <span>Candidate Workbench</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeroMockMode('scorecard')}
                  className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    heroMockMode === 'scorecard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award size={12} />
                  <span>AI Evaluation Scorecard</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
                Role: <strong className="text-slate-700 font-semibold">Backend Developer</strong>
              </div>
            </div>

            {/* View A: Candidate Workbench */}
            {heroMockMode === 'workbench' ? (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Question Prompt */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span className="font-semibold text-blue-600 uppercase tracking-wider">
                      Question 2 of 5 &bull; Distributed Systems &amp; APIs
                    </span>
                    <span className="text-slate-400">Technical Scenario</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    &ldquo;How do you design an idempotent payment webhook processor that prevents duplicate ledger debits when network retries deliver the same event concurrently?&rdquo;
                  </p>
                </div>

                {/* Candidate Dictation & Waveform Bar */}
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-mono text-[11px] font-bold text-rose-700 uppercase">Live Voice Stream:</span>
                    <span className="text-slate-700 italic text-[11px] line-clamp-1">
                      &ldquo;We acquire a Redis distributed lock with an idempotency key hash and TTL...&rdquo;
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-1 bg-blue-600 rounded-full animate-bounce h-3" />
                    <div className="w-1 bg-blue-500 rounded-full animate-bounce h-4 [animation-delay:0.1s]" />
                    <div className="w-1 bg-blue-600 rounded-full animate-bounce h-2 [animation-delay:0.2s]" />
                    <div className="w-1 bg-blue-500 rounded-full animate-bounce h-3.5 [animation-delay:0.15s]" />
                  </div>
                </div>

                {/* STAR Response Breakdown Card */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Layers size={13} className="text-blue-600" />
                      STAR Framework Structured Response
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      184 Words &bull; High Depth
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans m-0">
                    <strong className="text-slate-900 font-semibold">[Action]:</strong> Wrap the payment execution in a Redis distributed lock keyed by <code className="text-blue-700 font-mono text-[11px]">idempotencyKey</code> with a 5000ms TTL. If the key exists, return HTTP 200 with the cached receipt. Otherwise, execute the debit inside a database transaction with <code className="text-blue-700 font-mono text-[11px]">SELECT FOR UPDATE</code> to ensure pessimistic row locking.
                  </p>
                </div>
              </div>
            ) : (
              /* View B: AI Evaluation Scorecard */
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                      Overall Evaluation Score
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-emerald-400">9.2</span>
                      <span className="text-xs text-slate-400">/ 10</span>
                      <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                        Proficient
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 font-mono">
                    Evaluated via AI Assessment Rubric
                  </div>
                </div>

                {/* Multidimensional Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-700 font-medium">Technical Depth &amp; Locking</span>
                      <span className="font-bold text-emerald-600">9.5 / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-700 font-medium">Edge Cases &amp; Retries</span>
                      <span className="font-bold text-emerald-600">9.0 / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>

                {/* AI Assessment Feedback */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-semibold text-amber-800 flex items-center gap-1.5 text-[11px]">
                    <Sparkles size={12} className="text-amber-600" />
                    AI Assessment Feedback &amp; Trade-off Analysis:
                  </div>
                  <p className="text-[11px] text-amber-950 leading-relaxed m-0">
                    &ldquo;Strong identification of race conditions in concurrent webhook retries. Demonstrated clear understanding of Redis distributed locking vs database row-level locks. Recommended expanding on exponential backoff jitter in retry queues during follow-ups.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Preview Footer CTA Bar */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Ready to practice your own voice delivery and architecture answers?
              </span>
              <Link
                to={user ? '/practice' : '/register'}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>Launch Practice Studio</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ROLE TRACKS & PRACTICE QUESTIONS
         ========================================================================= */}
      <section id="tracks" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Practice Questions by Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a discipline to preview sample interview questions and key evaluation areas.
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
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer border ${
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

          {/* Clean Interview Question Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                    {activeTrack.targetRole}
                  </span>
                  <span className="text-xs text-slate-500">
                    Topic: <strong className="text-slate-700 font-medium">{activeTrack.topic}</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeTrack.challengeTitle}
                </h3>
              </div>

              <Link
                to={user ? `/practice?track=${encodeURIComponent(activeTrack.targetRole)}` : '/register'}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition shrink-0 cursor-pointer"
              >
                <span>Practice This Track</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Question Box */}
            <div className="my-5 p-4 sm:p-5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Sample Interview Question:
              </span>
              <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                &ldquo;{activeTrack.sampleQuestion}&rdquo;
              </p>
            </div>

            {/* Key Topics */}
            <div className="mb-6">
              <span className="text-xs font-semibold text-slate-700 block mb-2.5">
                Key Topics Evaluated:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeTrack.topics.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600 mr-1.5 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* How You Practice Banner */}
            <div className="pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Mic size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">Voice or Text Input</strong>
                  <span>Speak answers with live mic dictation or type directly in the editor.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">STAR Framework</strong>
                  <span>Structure responses with Situation, Task, Action, and Result.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileText size={15} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">Resume Calibration</strong>
                  <span>Upload your resume PDF to generate questions tailored to your experience.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: BOTTOM CTA
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-950 text-white text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Ready to sharpen your interview skills?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-7 leading-relaxed">
            Choose your target discipline or attach your resume to generate relevant questions and receive structured feedback.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <span>{user ? 'Return to Dashboard' : 'Start Practicing Now'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
