import { useEffect, useRef } from 'react'

export default function ReflectBlackHole() {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (v) {
      v.muted = true
      v.defaultMuted = true
      const playPromise = v.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {})
      }
    }
  }, [])

  return (
    <div className="reflect-hole-wrapper">
      {/* Radiant Event Horizon Ambient Glow */}
      <div className="reflect-hole-ambient" />

      {/* 1. Authentic Reflect Black Hole Video */}
      <div className="reflect-hole-video-box">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="reflect-hole-video"
        >
          <source src="/black-hole.webm" type="video/webm" />
          <source src="/black-hole.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. Concentric Celestial Orbital Rings with Arc Fade & Rotation */}
      <div className="reflect-hole-rings">
        {/* Outer Ring - 808px with Celestial Dots */}
        <div className="reflect-ring-container ring-outer">
          <div className="reflect-ring ring-anim-cw">
            <span className="celestial-dot dot-1" />
            <span className="celestial-dot dot-2" />
            <span className="celestial-dot dot-3" />
          </div>
        </div>

        {/* Middle Ring - 608px */}
        <div className="reflect-ring-container ring-mid">
          <div className="reflect-ring ring-anim-ccw">
            <span className="celestial-dot dot-4" />
            <span className="celestial-dot dot-5" />
          </div>
        </div>

        {/* Innermost Ring - 416px */}
        <div className="reflect-ring-container ring-inner">
          <div className="reflect-ring ring-anim-cw" />
        </div>
      </div>

      {/* 3. Starlight Horizon Ray */}
      <div className="reflect-hole-horizon-ray" />
    </div>
  )
}
