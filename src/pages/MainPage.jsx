import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '../components/layout/Header'
import DateFilter from '../components/event-list/DateFilter'
import SummaryCards from '../components/event-list/SummaryCards'
import EventTable from '../components/event-list/EventTable'
import LeftPanel from '../components/event-detail/LeftPanel'
import RightPanel from '../components/event-detail/RightPanel'
import { useEvents } from '../hooks/useEvents'
import { useParticipants } from '../hooks/useParticipants'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useTheme } from '../context/ThemeContext'
import { fetchParticipants } from '../services/api'
import {
  getToday, getDaysAgo, getStartOfMonth, getStartOfYear,
  formatDate, formatDateShort, formatTime,
} from '../utils/helpers'
import {
  ArrowLeft, ScanFace, RefreshCw, Maximize, Minimize,
  Sun, Moon, Wifi, WifiOff,
} from 'lucide-react'

export default function MainPage() {
  const { isDark, toggleTheme } = useTheme()
  const today = getToday()

  // ========== View State ==========
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [viewTransition, setViewTransition] = useState('') // 'animate-slide-left' | 'animate-slide-right' | ''

  const enterDetail = (eventId) => {
    setViewTransition('animate-slide-left')
    setSelectedEventId(eventId)
  }

  const exitDetail = () => {
    setViewTransition('animate-slide-right')
    setSelectedEventId(null)
  }

  // ========== Event List State ==========
  const [startDate, setStartDate] = useState(() => sessionStorage.getItem('dashboard_start_date') || today)
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem('dashboard_end_date') || today)
  const [activePreset, setActivePreset] = useState(() => sessionStorage.getItem('dashboard_preset') || 'today')
  const [participantsMap, setParticipantsMap] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)

  const { events, count, loading: eventsLoading, error, refetch } = useEvents(startDate, endDate)

  useEffect(() => {
    sessionStorage.setItem('dashboard_start_date', startDate)
    sessionStorage.setItem('dashboard_end_date', endDate)
    sessionStorage.setItem('dashboard_preset', activePreset)
  }, [startDate, endDate, activePreset])

  const isToday = startDate === today && endDate === today

  const dateLabel = useMemo(() => {
    if (isToday) return `วันนี้ (${formatDateShort(today)})`
    if (startDate === endDate) return formatDate(startDate)
    return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
  }, [isToday, startDate, endDate, today])

  const applyPreset = (preset) => {
    setActivePreset(preset)
    if (preset === 'today') { setStartDate(today); setEndDate(today) }
    else if (preset === '7days') { setStartDate(getDaysAgo(6)); setEndDate(today) }
    else if (preset === 'month') { setStartDate(getStartOfMonth()); setEndDate(today) }
    else if (preset === 'year') { setStartDate(getStartOfYear()); setEndDate(today) }
  }

  const handleStartDateChange = (value) => { setStartDate(value); setActivePreset('custom') }
  const handleEndDateChange = (value) => { setEndDate(value); setActivePreset('custom') }

  // Fetch summaries for all events
  useEffect(() => {
    if (events.length === 0) { setParticipantsMap({}); return }
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

  const listLoading = eventsLoading || summaryLoading

  // ========== Event Detail State ==========
  const { event, summary, participants, loading: detailLoading, refetch: refetchDetail } = useParticipants(selectedEventId)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  const handleDetailRefresh = useCallback(() => { refetchDetail() }, [refetchDetail])
  const { secondsLeft, isActive, toggle } = useAutoRefresh(handleDetailRefresh, 5000, !!selectedEventId)

  // Latest participant
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => new Date(b.regis_date) - new Date(a.regis_date))
  }, [participants])
  const latestParticipant = selectedParticipant || sorted[0] || null

  // Reset selection when switching events
  useEffect(() => { setSelectedParticipant(null) }, [selectedEventId])

  // Find selected event info for header
  const selectedEvent = events.find((e) => e.event_id === selectedEventId)

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.error)
    else document.exitFullscreen?.().catch(console.error)
  }

  // Online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const lastScanTime = sorted[0]?.regis_date
    ? new Date(sorted[0].regis_date).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'

  // ========== RENDER: Event Detail View ==========
  if (selectedEventId) {
    // Loading state
    if (detailLoading && participants.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 3xl:w-12 3xl:h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 3xl:text-xl">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )
    }

    return (
      <div className={`h-[100dvh] flex flex-col bg-slate-50 dark:bg-gray-950 overflow-hidden transition-colors duration-200 ${viewTransition}`}>
        {/* Header */}
        <header className="bg-primary text-white px-3.5 sm:px-6 3xl:px-10 py-2.5 sm:py-3 3xl:py-5 flex items-center justify-between shadow-lg shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 3xl:gap-6 min-w-0 flex-1 mr-2">
            <button
              onClick={exitDetail}
              className="p-1.5 3xl:p-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="กลับไปรายการกิจกรรม"
            >
              <ArrowLeft className="w-5 h-5 3xl:w-7 3xl:h-7" />
            </button>
            <div className="flex items-center gap-2 3xl:gap-3 min-w-0 flex-1">
              <ScanFace className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm sm:text-lg 2xl:text-3xl 3xl:text-5xl leading-tight truncate">
                  {event?.event_title || selectedEvent?.event_title || 'Live Check-in'}
                </h1>
                <p className="text-white/70 text-[11px] sm:text-xs 2xl:text-sm 3xl:text-lg truncate">
                  {(event?.event_addr || selectedEvent?.event_addr) ? `${event?.event_addr || selectedEvent?.event_addr} • ` : ''}
                  {formatTime(event?.event_time_start || selectedEvent?.event_time_start)} - {formatTime(event?.event_time_stop || selectedEvent?.event_time_stop)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 3xl:gap-3 shrink-0">
            <button onClick={handleDetailRefresh} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title="รีเฟรช">
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 ${detailLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title={isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}>
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6" />}
            </button>
            <button onClick={toggleTheme} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title={isDark ? 'ธีมสว่าง' : 'ธีมมืด'}>
              {isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 text-slate-200" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 text-yellow-300" />}
            </button>
            <button
              onClick={toggle}
              className={`px-2.5 sm:px-3 3xl:px-5 py-1.5 3xl:py-2.5 rounded-lg text-xs 3xl:text-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive ? 'bg-white/20' : 'bg-white/10'}`}
            >
              Auto {isActive ? `ON (${secondsLeft}s)` : 'OFF'}
            </button>
          </div>
        </header>

        {/* Main Split: Left 70% / Right 30% */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 shrink-0 overflow-hidden">
            <LeftPanel event={event || selectedEvent} summary={summary} latestParticipant={latestParticipant} />
          </div>
          <div className="w-full lg:w-[30%] flex-1 min-h-0 flex flex-col">
            <RightPanel
              participants={participants}
              summary={summary}
              selectedId={latestParticipant?.regis_id}
              onSelect={(p) => setSelectedParticipant(p)}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 3xl:px-10 py-1.5 sm:py-2 3xl:py-3 flex items-center justify-between text-[11px] sm:text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <span className="truncate">สแกนล่าสุด: {lastScanTime}</span>
            <span className="text-neutral-300 dark:text-neutral-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Auto-refresh: {isActive ? 'ON (5s)' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <WifiOff className="w-3.5 h-3.5 3xl:w-5 3xl:h-5" /> ออฟไลน์
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span className="w-2 h-2 3xl:w-3 3xl:h-3 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 3xl:w-5 3xl:h-5" /> เชื่อมต่อแล้ว
              </span>
            )}
          </div>
        </footer>
      </div>
    )
  }

  // ========== RENDER: Event List View ==========
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-200 ${viewTransition}`}>
      <Header />
      <main className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 3xl:px-12 py-4 sm:py-6 3xl:py-10 space-y-4 sm:space-y-6 3xl:space-y-10">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          activePreset={activePreset}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onPresetChange={applyPreset}
          onRefresh={refetch}
          loading={listLoading}
          dateLabel={dateLabel}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 3xl:px-6 3xl:py-4 rounded-xl 3xl:text-xl">
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
          loading={listLoading}
          dateLabel={dateLabel}
        />

        <EventTable
          events={events}
          participantsMap={participantsMap}
          onSelectEvent={enterDetail}
        />
      </main>
    </div>
  )
}
