'use client'
import { useEffect, useRef, useState } from 'react'

export default function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current === value) return

    const from = prevRef.current
    const to = value
    const diff = to - from
    const steps = Math.min(Math.abs(diff), 40)
    const stepSize = diff / steps
    let current = from
    let step = 0

    const interval = setInterval(() => {
      step++
      current += stepSize
      const rounded = step === steps ? to : Math.round(current)
      setDisplay(rounded)
      if (step >= steps) {
        clearInterval(interval)
        prevRef.current = to
      }
    }, 25)

    return () => clearInterval(interval)
  }, [value])

  return <span>{display.toLocaleString()}</span>
}
