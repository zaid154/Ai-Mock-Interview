import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

function colorFor(score) {
  if (score >= 7) return 'var(--good)'
  if (score >= 4) return 'var(--warn)'
  return 'var(--bad)'
}

export default function ScoreChart({ scores = [] }) {
  const data = scores.map((score, i) => ({ name: `Q${i + 1}`, score: Number(score) || 0 }))
  const maxScoreInSeries = Math.max(...scores.map(Number), 10)
  const maxY = maxScoreInSeries > 10 ? 100 : 10

  return (
    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis domain={[0, maxY]} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: 'var(--shadow-md)',
              fontSize: 13,
              color: 'var(--text)',
            }}
            labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
            formatter={(value) => [`${value} / ${maxY}`, 'Score']}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={42} minPointSize={8}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
