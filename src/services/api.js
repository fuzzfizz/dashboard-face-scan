import { getMockEvents, getMockParticipants } from '../utils/mockData'

const BASE_URL = import.meta.env.API_BASE_URL || '/api'
const USE_MOCK = import.meta.env.API_USE_MOCK === 'true'

function mockDelay() {
  const ms = 300 + Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchEvents(startDate, endDate) {
  if (USE_MOCK) {
    await mockDelay()
    const data = getMockEvents(startDate, endDate)
    return { success: true, count: data.length, data }
  }

  const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
  const res = await fetch(`${BASE_URL}/event/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function fetchParticipants(eventId) {
  if (USE_MOCK) {
    await mockDelay()
    const data = getMockParticipants(eventId)
    if (!data) throw new Error('Event not found')
    return { success: true, data }
  }

  const params = new URLSearchParams({ event_id: eventId })
  const res = await fetch(`${BASE_URL}/participants/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}
