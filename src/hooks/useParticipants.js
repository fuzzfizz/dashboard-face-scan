import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchParticipants } from '../services/api'

export function useParticipants(eventId) {
  const [event, setEvent] = useState(null)
  const [summary, setSummary] = useState({ total: 0, staff: 0, student: 0, guest: 0 })
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const isFirstLoadRef = useRef(true)

  const load = useCallback(
    async (silent = false) => {
      if (!eventId || eventId === '0') return
      if (!silent && isFirstLoadRef.current) {
        setLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      try {
        const res = await fetchParticipants(eventId)
        if (res.success) {
          setEvent(res.data.event)
          setSummary(res.data.summary)
          setParticipants(res.data.participants)
          isFirstLoadRef.current = false
        } else {
          setError(res.message || 'Failed to load participants')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [eventId]
  )

  useEffect(() => {
    isFirstLoadRef.current = true
    load(false)
  }, [load])

  return {
    event,
    summary,
    participants,
    loading,
    isRefreshing,
    refetch: (silent = true) => load(silent),
  }
}
