import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, CheckCircle2, Database, Network, Users, FileText, Mic, Layers } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CAREER_TRACKS = [
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    icon: Code2,
    targetRole: 'Frontend Developer',
    topic: 'React & Modern Web Architecture',
    challengeTitle: 'Component Rendering & State Architecture',
    sampleQuestion: 'How does React’s reconciliation algorithm work under the hood, and how do keys optimize list rendering? When can useMemo or useCallback actually hurt performance instead of helping?',
    topics: ['Virtual DOM Reconciliation', 'Key Prop Mechanics', 'Memoization Trade-offs', 'State Colocation'],
  },
  {
    id: 'backend',
    name: 'Backend & APIs',
    icon: Database,
    targetRole: 'Backend Developer',
    topic: 'Node.js, Express & Microservices',
    challengeTitle: 'Authentication & Connection Management',
    sampleQuestion: 'How do you design a secure JWT authentication flow with access and refresh tokens? Where should tokens be stored to protect against XSS and CSRF, and how do you handle token rotation?',
    topics: ['HttpOnly Cookie Storage', 'Refresh Token Rotation', 'Connection Pooling', 'CORS & CSRF Mitigation'],
  },
  {
    id: 'fullstack',
    name: 'MERN Fullstack',
    icon: Layers,
    targetRole: 'Fullstack Developer',
    topic: 'MERN Architecture & Performance',
    challengeTitle: 'End-to-End Latency & Query Optimization',
    sampleQuestion: 'Walk through how you would diagnose and fix a slow dashboard page where an API endpoint takes over 3 seconds to return aggregated user data to a React client.',
    topics: ['Database Indexing & Explain Plans', 'Pagination & Aggregation Pipelines', 'Network Waterfall Analysis', 'Optimistic UI Updates'],
  },
  {
    id: 'systems',
    name: 'System Design',
    icon: Network,
    targetRole: 'System Design Architect',
    topic: 'Distributed Systems & Scalability',
    challengeTitle: 'High-Availability URL Shortener',
    sampleQuestion: 'How would you design a scalable URL shortener like Bitly? Walk through the API design, database choice, Base62 hashing strategy, and cache-aside invalidation.',
    topics: ['Base62 / Hash Collisions', 'Cache-Aside with Redis', 'Read-Heavy Sharding', 'Rate Limiting & Backpressure'],
  },
  {
    id: 'behavioral',
    name: 'Behavioral & Leadership',
    icon: Users,
    targetRole: 'Engineering Lead / Team Member',
    topic: 'STAR Framework & Conflict Resolution',
    challengeTitle: 'Technical Conflict & Project Deadlines',
    sampleQuestion: 'Tell me about a time you strongly disagreed with a teammate or lead on a technical architectural decision. How did you handle the discussion and reach a final agreement?',
    topics: ['Situation & Task Framing', 'Objective Data & Trade-offs', 'Team Empathy & Collaboration', 'Quantifiable Project Result'],
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Select Role or Upload Resume',
    desc: 'Choose your track or attach your resume to generate relevant questions matching your specific background.',
  },
  {
    step: '02',
    title: 'Practice Your Answers',
    desc: 'Answer naturally using speech recognition or the built-in editor, with the STAR framework to guide your thoughts.',
  },
  {
    step: '03',
    title: 'Review Detailed Feedback',
    desc: 'Get actionable suggestions on technical accuracy, structure, and points you might have missed.',
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
            Practice Real Technical Interviews <br className="hidden sm:inline" />
            <span className="text-blue-600">With Instant Feedback</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Practice questions asked in real engineering interviews. Answer using your microphone or keyboard,
            structure your answers with the STAR method, and get clear feedback to improve before the real round.
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
              <span>Tailor questions from your resume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Speech-to-text voice dictation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Clear, actionable scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Practice Questions by Track --- */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Practice Questions by Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a discipline to preview sample interview questions and key evaluation areas.
            </p>
          </div>

          {/* Track Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6" role="tablist">
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
                to={user ? `/practice?track=${encodeURIComponent(activeTrack.targetRole)}` : '/login'}
                className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shrink-0"
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

      {/* --- How It Works --- */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              How MockMate Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Prepare, practice, and review your technical reasoning in three simple steps.
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
            Select your discipline or upload your resume to start practicing with instant feedback.
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
