const BASE_URL = import.meta.env.API_BASE_URL || '/api'

export async function fetchEvents(startDate, endDate) {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
  const res = await fetch(`${BASE_URL}/event/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function fetchParticipants(eventId) {
  const params = new URLSearchParams({ event_id: eventId })
  const res = await fetch(`${BASE_URL}/participants/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}
