import { useState, useEffect, useCallback } from 'react'
import { fetchParticipants } from '../services/api'

export function useParticipants(eventId) {
  const [event, setEvent] = useState(null)
  const [summary, setSummary] = useState({ total: 0, staff: 0, student: 0, guest: 0 })
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!eventId || eventId === '0') return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchParticipants(eventId)
      if (res.success) {
        setEvent(res.data.event)
        setSummary(res.data.summary)
        setParticipants(res.data.participants)
      } else {
        setError(res.message || 'Failed to load participants')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => { load() }, [load])

  return { event, summary, participants, loading, error, refetch: load }
}
