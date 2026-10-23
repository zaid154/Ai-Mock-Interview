import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

function colorFor(score) {
  if (score >= 7) return '#10b981' // emerald-500
  if (score >= 4) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

export default function ScoreChart({ scores, questions = [] }) {
  const resolvedScores = Array.isArray(scores) && scores.length > 0
    ? scores
    : Array.isArray(questions)
    ? questions.map((q) => (typeof q === 'object' && q !== null ? q.score : q))
    : []
  const data = resolvedScores.map((score, i) => ({ name: `Q${i + 1}`, score: Number(score) || 0 }))
  const maxScoreInSeries = Math.max(...resolvedScores.map(Number), 10)
  const maxY = maxScoreInSeries > 10 ? 100 : 10

  return (
    <div className="w-full h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis domain={[0, maxY]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: 12,
              color: '#0f172a',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 700 }}
            formatter={(value) => [`${value} / ${maxY}`, 'Score']}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={36} minPointSize={8}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
