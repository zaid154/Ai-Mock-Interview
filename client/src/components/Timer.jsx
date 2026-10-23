import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function Timer({ minutes, onTimeUp, label = 'Time Remaining' }) {
  const totalSeconds = (Number(minutes) || 0) * 60
  const [timeLeft, setTimeLeft] = useState(totalSeconds)

  useEffect(() => {
    setTimeLeft(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, onTimeUp])

  if (!totalSeconds) return null

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const isUrgent = timeLeft < 15
  const isWarn = timeLeft < 45 && !isUrgent

  const badgeColor = isUrgent
    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
    : isWarn
    ? 'bg-amber-50 text-amber-700 border-amber-300'
    : 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold transition shadow-xs ${badgeColor}`}
      title={label}
    >
      <Clock size={13} className={isUrgent ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-slate-500'} />
      <span>{formatted}</span>
    </div>
  )
}
