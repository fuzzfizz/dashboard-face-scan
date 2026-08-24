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
import {
  getToday,
  getDaysAgo,
  getStartOfMonth,
  getStartOfYear,
  formatDate,
  formatDateShort,
} from '../utils/helpers'
import { RefreshCw, Calendar, ArrowRight, Clock } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const today = getToday()

  // Initialize from sessionStorage to preserve filters when navigating back from Live page
  const [startDate, setStartDate] = useState(() => {
    return sessionStorage.getItem('dashboard_start_date') || today
  })
  const [endDate, setEndDate] = useState(() => {
    return sessionStorage.getItem('dashboard_end_date') || today
  })
  const [activePreset, setActivePreset] = useState(() => {
    return sessionStorage.getItem('dashboard_preset') || 'today'
  })

  const { events, count, loading: eventsLoading, error, refetch } = useEvents(startDate, endDate)

  const [participantsMap, setParticipantsMap] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [qrEvent, setQrEvent] = useState(null)

  // Save active filter state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('dashboard_start_date', startDate)
    sessionStorage.setItem('dashboard_end_date', endDate)
    sessionStorage.setItem('dashboard_preset', activePreset)
  }, [startDate, endDate, activePreset])

  const isToday = startDate === today && endDate === today

  let dateLabel = ''
  if (isToday) {
    dateLabel = `วันนี้ (${formatDateShort(today)})`
  } else if (startDate === endDate) {
    dateLabel = formatDate(startDate)
  } else {
    dateLabel = `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
  }

  const applyPreset = (preset) => {
    setActivePreset(preset)
    if (preset === 'today') {
      setStartDate(today)
      setEndDate(today)
    } else if (preset === '7days') {
      setStartDate(getDaysAgo(6))
      setEndDate(today)
    } else if (preset === 'month') {
      setStartDate(getStartOfMonth())
      setEndDate(today)
    } else if (preset === 'year') {
      setStartDate(getStartOfYear())
      setEndDate(today)
    }
  }

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Compact & Intuitive Date Filter Toolbar */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-5 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
            {/* Header + Range Status Badge */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <h1 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100">ช่วงเวลาแสดงข้อมูล</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary-dark truncate max-w-full">
                  {dateLabel}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                เลือกช่วงเวลาที่ต้องการดูสถิติและรายชื่อกิจกรรมสแกนใบหน้า
              </p>
            </div>

            {/* Quick Presets Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 bg-neutral-100/80 dark:bg-neutral-700/60 p-1.5 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => applyPreset('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                  activePreset === 'today' && isToday
                    ? 'bg-white dark:bg-neutral-900 text-primary dark:text-primary shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-600/50'
                }`}
              >
                วันนี้
              </button>
              <button
                onClick={() => applyPreset('7days')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                  activePreset === '7days'
                    ? 'bg-white dark:bg-neutral-900 text-primary dark:text-primary shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-600/50'
                }`}
              >
                7 วันล่าสุด
              </button>
              <button
                onClick={() => applyPreset('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                  activePreset === 'month'
                    ? 'bg-white dark:bg-neutral-900 text-primary dark:text-primary shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-600/50'
                }`}
              >
                เดือนนี้
              </button>
              <button
                onClick={() => applyPreset('year')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                  activePreset === 'year'
                    ? 'bg-white dark:bg-neutral-900 text-primary dark:text-primary shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-600/50'
                }`}
              >
                ปีนี้
              </button>
            </div>
          </div>

          <hr className="my-3.5 sm:my-4 border-neutral-100 dark:border-neutral-700" />

          {/* Custom Date Pickers & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-neutral-50 dark:bg-neutral-900/80 px-3 py-2 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full sm:w-auto">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0">ตั้งแต่:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="bg-transparent text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 font-medium focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
                />
              </div>

              <ArrowRight className="w-4 h-4 text-neutral-400 hidden sm:block self-center shrink-0" />

              <div className="flex items-center justify-between sm:justify-start gap-2 bg-neutral-50 dark:bg-neutral-900/80 px-3 py-2 sm:py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full sm:w-auto">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 shrink-0">ถึง:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setActivePreset('custom')
                  }}
                  className="bg-transparent text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 font-medium focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
                />
              </div>
            </div>

            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm disabled:opacity-70 cursor-pointer w-full sm:w-auto shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
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
          isToday={isToday}
          dateLabel={dateLabel}
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
