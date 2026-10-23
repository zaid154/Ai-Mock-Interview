import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Sparkles, CheckCircle2, Terminal, Cpu, Database, Network } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TRACKS = [
  {
    role: 'Frontend Engineering',
    icon: Code2,
    badge: 'Intermediate to Senior',
    tech: ['React 18', 'Event Loop', 'DOM Hydration', 'Performance', 'State Machines'],
    desc: 'Deep dive into rendering lifecycles, memory leak diagnosis, CSS layout engines, bundle splitting, and asynchronous state synchronization.',
  },
  {
    role: 'Backend Architecture',
    icon: Database,
    badge: 'Senior & Staff',
    tech: ['Node.js I/O', 'PostgreSQL', 'Idempotent APIs', 'Redis', 'Connection Pooling'],
    desc: 'Architect resilient APIs, optimize query latency with composite indexing, handle worker thread pools, and manage distributed transactions.',
  },
  {
    role: 'Fullstack & MERN',
    icon: Terminal,
    badge: 'All Levels',
    tech: ['React-Express', 'MongoDB Aggregations', 'JWT Security', 'Optimistic UI', 'Docker'],
    desc: 'End-to-end data pipelines from client forms to database replicas. Schema validation, optimistic updates, and authentication pipelines.',
  },
  {
    role: 'System Design & Scalability',
    icon: Network,
    badge: 'Principal',
    tech: ['Distributed Systems', 'Kafka Queues', 'Horizontal Sharding', 'CAP Theorem', 'CDN Cache'],
    desc: 'Design high-throughput distributed systems. Balance throughput vs. latency, failover policies, rate-limiting, and partition tolerance.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Select a Track or Upload Resume',
    desc: 'Choose from 4 engineering tracks or drop your PDF resume to dynamically calibrate questions against your personal tech stack.',
  },
  {
    step: '02',
    title: 'Answer Interactive Technical Rounds',
    desc: 'Speak or type your architectural reasoning. Handle follow-up probes from the AI interviewer testing edge cases and trade-offs.',
  },
  {
    step: '03',
    title: 'Instant FAANG Rubric Scorecard',
    desc: 'Get calibrated hiring verdicts, depth breakdown, model answers, and save tricky questions to your revision bookmarks.',
  },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles size={13} className="text-blue-600" />
            <span>AI Technical Interview Simulator</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-5">
            Master Technical Interviews with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Real-Time AI Calibration.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Simulate realistic frontend, backend, and distributed systems interviews. Answer via speech or text, defend trade-offs, and receive actionable rubric feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <span>{user ? 'Go to Dashboard' : 'Start Practicing Free'}</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to={user ? '/practice' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm px-6 py-3 rounded-xl shadow-xs transition"
            >
              <Code2 size={16} className="text-slate-500" />
              <span>Explore Tracks</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Resume-tailored questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Speech-to-text recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Instant rubric scorecards</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Engineering Tracks ── */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Curated Engineering Tracks
            </h2>
            <p className="text-sm text-slate-500">
              Targeted evaluation rubrics aligned with top tech hiring standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TRACKS.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.role}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Icon size={20} />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/80">
                        {t.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {t.role}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {t.desc}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {t.tech.map((skill) => (
                        <span key={skill} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={user ? `/practice?track=${encodeURIComponent(t.role)}` : '/login'}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition"
                    >
                      <span>Practice {t.role}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              How MockMate AI Works
            </h2>
            <p className="text-sm text-slate-500">
              From track selection to verified feedback in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-blue-600/40 mb-3 block font-mono">
                    {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
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

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ready to test your engineering knowledge?
          </h2>
          <p className="text-sm text-blue-100 max-w-lg mx-auto mb-8">
            Select a track, launch your first simulated round, and get calibrated feedback in minutes.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition cursor-pointer"
          >
            <span>{user ? 'Launch Dashboard' : 'Get Started Free'}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
