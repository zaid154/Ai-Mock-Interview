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

  let statusClass = ''
  if (timeLeft < 15) {
    statusClass = 'urgent'
  } else if (timeLeft < 45) {
    statusClass = 'warn'
  }

  return (
    <div className={`timer-container ${statusClass}`} title={label}>
      <Clock size={16} />
      <span>{formatted}</span>
    </div>
  )
}
