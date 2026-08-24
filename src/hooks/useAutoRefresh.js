import { useState, useEffect, useRef, useCallback } from 'react'

export function useAutoRefresh(callback, intervalMs = 5000, initialEnabled = true) {
  const [isActive, setIsActive] = useState(initialEnabled)
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(intervalMs / 1000))
  const callbackRef = useRef(callback)
  const intervalIdRef = useRef(null)
  const countdownIdRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isActive) {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current)
      if (countdownIdRef.current) clearInterval(countdownIdRef.current)
      return
    }

    const totalSeconds = Math.floor(intervalMs / 1000)
    setSecondsLeft(totalSeconds)

    const startTimers = () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current)
      if (countdownIdRef.current) clearInterval(countdownIdRef.current)

      countdownIdRef.current = setInterval(() => {
        setSecondsLeft((prev) => (prev <= 1 ? totalSeconds : prev - 1))
      }, 1000)

      intervalIdRef.current = setInterval(() => {
        // Only run callback if page is active/visible
        if (typeof document !== 'undefined' && !document.hidden) {
          callbackRef.current?.()
        }
      }, intervalMs)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause timer when tab is in background
        if (intervalIdRef.current) clearInterval(intervalIdRef.current)
        if (countdownIdRef.current) clearInterval(countdownIdRef.current)
      } else {
        // Resume timer and trigger immediate fresh load when user returns to tab
        setSecondsLeft(totalSeconds)
        callbackRef.current?.()
        startTimers()
      }
    }

    startTimers()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current)
      if (countdownIdRef.current) clearInterval(countdownIdRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, intervalMs])

  const toggle = useCallback(() => setIsActive((prev) => !prev), [])

  return { secondsLeft, isActive, toggle }
}
