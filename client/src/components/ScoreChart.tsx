import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface Props {
  scores: number[]
}

function colorFor(score: number) {
  if (score >= 7) return '#4ade80'
  if (score >= 4) return '#fbbf24'
  return '#f87171'
}

export default function ScoreChart({ scores }: Props) {
  const data = scores.map((score, i) => ({ name: `Q${i + 1}`, score }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis domain={[0, 10]} stroke="#8b8fa3" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            background: '#1a1c25',
            border: '1px solid #2c2f3a',
            borderRadius: 8,
            fontSize: 13,
          }}
          labelStyle={{ color: '#e6e7ec' }}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorFor(d.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
