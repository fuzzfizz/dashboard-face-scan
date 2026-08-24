import { useState, useEffect, useCallback } from 'react'
import { fetchEvents } from '../services/api'

export function useEvents(startDate, endDate) {
  const [events, setEvents] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchEvents(startDate, endDate)
      if (res.success) {
        setEvents(res.data)
        setCount(res.count)
      } else {
        setError(res.message || 'Failed to load events')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => { load() }, [load])

  return { events, count, loading, error, refetch: load }
}
