import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

function colorFor(score) {
  if (score >= 7) return 'var(--good)'
  if (score >= 4) return 'var(--warn)'
  return 'var(--bad)'
}

export default function ScoreChart({ scores }) {
  const data = scores.map((score, i) => ({ name: `Q${i + 1}`, score }))

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 10]} stroke="var(--text-subtle)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-md)',
            fontSize: 13,
            color: 'var(--text)',
          }}
          labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
          formatter={(value) => [`${value} / 10`, 'Score']}
        />
        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={44}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorFor(d.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
