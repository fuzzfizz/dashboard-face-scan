import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import SummaryCards from '../components/dashboard/SummaryCards'
import EventBarChart from '../components/dashboard/EventBarChart'
import ParticipantPieChart from '../components/dashboard/ParticipantPieChart'
import EventTable from '../components/dashboard/EventTable'
import ParticipantsModal from '../components/dashboard/ParticipantsModal'
import QRModal from '../components/dashboard/QRModal'
import { useEvents } from '../hooks/useEvents'
import { fetchParticipants } from '../services/api'
import { getToday } from '../utils/helpers'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState(getToday())
  const [endDate, setEndDate] = useState(getToday())
  const { events, count, loading: eventsLoading, error, refetch } = useEvents(startDate, endDate)

  const [participantsMap, setParticipantsMap] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [qrEvent, setQrEvent] = useState(null)

  useEffect(() => {
    if (events.length === 0) {
      setParticipantsMap({})
      return
    }
    setSummaryLoading(true)
    Promise.allSettled(events.map((ev) => fetchParticipants(ev.event_id)))
      .then((results) => {
        const map = {}
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.success) {
            map[res.value.data.event.event_id] = res.value.data.summary
          }
        })
        setParticipantsMap(map)
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false))
  }, [events])

  const totals = Object.values(participantsMap).reduce(
    (acc, s) => ({
      total: acc.total + Number(s?.total || 0),
      staff: acc.staff + Number(s?.staff || 0),
      student: acc.student + Number(s?.student || 0),
      guest: acc.guest + Number(s?.guest || 0),
    }),
    { total: 0, staff: 0, student: 0, guest: 0 }
  )

  const loading = eventsLoading || summaryLoading

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">วันที่เริ่ม:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">วันที่สิ้นสุด:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-neutral-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <SummaryCards
          data={{
            eventCount: count,
            totalParticipants: totals.total,
            staffCount: totals.staff,
            otherCount: totals.student + totals.guest,
          }}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventBarChart events={events} participantsMap={participantsMap} />
          <ParticipantPieChart
            staffCount={totals.staff}
            studentCount={totals.student}
            guestCount={totals.guest}
          />
        </div>

        <EventTable
          events={events}
          participantsMap={participantsMap}
          onViewParticipants={(id) => setSelectedEventId(id)}
          onViewQR={(ev) => setQrEvent(ev)}
          onGoLive={(id) => navigate(`/live/${id}`)}
        />
      </main>

      {selectedEventId && (
        <ParticipantsModal eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
      {qrEvent && <QRModal event={qrEvent} onClose={() => setQrEvent(null)} />}
    </div>
  )
}
