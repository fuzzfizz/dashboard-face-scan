import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '../components/layout/Header'
import DateFilter from '../components/event-list/DateFilter'
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
  const [filterMode, setFilterMode] = useState(() => sessionStorage.getItem('dashboard_filter_mode') || 'single')
  const [startDate, setStartDate] = useState(() => sessionStorage.getItem('dashboard_start_date') || today)
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem('dashboard_end_date') || today)
  const [activePreset, setActivePreset] = useState(() => sessionStorage.getItem('dashboard_preset') || 'today')
  const [participantsMap, setParticipantsMap] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)

  const { events, count, loading: eventsLoading, error, refetch } = useEvents(startDate, endDate)

  useEffect(() => {
    sessionStorage.setItem('dashboard_filter_mode', filterMode)
    sessionStorage.setItem('dashboard_start_date', startDate)
    sessionStorage.setItem('dashboard_end_date', endDate)
    sessionStorage.setItem('dashboard_preset', activePreset)
  }, [filterMode, startDate, endDate, activePreset])

  const isToday = startDate === today && endDate === today

  const dateLabel = useMemo(() => {
    if (isToday) return `วันนี้ (${formatDateShort(today)})`
    if (startDate === endDate) return formatDate(startDate)
    return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
  }, [isToday, startDate, endDate, today])

  const applyPreset = (preset) => {
    setActivePreset(preset)
    if (preset === 'today') {
      setStartDate(today)
      setEndDate(today)
    } else if (preset === 'yesterday') {
      const y = getDaysAgo(1)
      setStartDate(y)
      setEndDate(y)
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

  const handleFilterModeChange = (mode) => {
    setFilterMode(mode)
    if (mode === 'single') {
      // Always default to today when switching to single date mode
      setStartDate(today)
      setEndDate(today)
      setActivePreset('today')
    } else {
      // Default to 7 days range when switching to range mode
      setStartDate(getDaysAgo(6))
      setEndDate(today)
      setActivePreset('7days')
    }
  }

  const handleSingleDateChange = (value) => {
    setStartDate(value)
    setEndDate(value)
    setActivePreset(value === today ? 'today' : value === getDaysAgo(1) ? 'yesterday' : 'custom')
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

  const listLoading = eventsLoading || summaryLoading

  // ========== Event Detail State ==========
  const {
    event,
    summary,
    participants,
    loading: detailLoading,
    isRefreshing,
    refetch: refetchDetail,
  } = useParticipants(selectedEventId)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  const handleDetailRefresh = useCallback(() => { refetchDetail(true) }, [refetchDetail])
  const { secondsLeft, isActive, toggle } = useAutoRefresh(handleDetailRefresh, 5000, true)

  // Latest participant vs Selected participant
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => new Date(b.regis_date) - new Date(a.regis_date))
  }, [participants])
  const latestParticipant = sorted[0] || null
  const isSelectedParticipant = selectedParticipant !== null && selectedParticipant.regis_id !== latestParticipant?.regis_id
  const displayParticipant = selectedParticipant || latestParticipant

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
    // Initial Loading state
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
      <div className={`min-h-screen lg:h-[100dvh] flex flex-col bg-slate-50 dark:bg-gray-950 lg:overflow-hidden transition-colors duration-200 ${viewTransition}`}>
        {/* Header */}
        <header className="bg-primary text-white px-3.5 sm:px-6 3xl:px-10 py-3 sm:py-3.5 3xl:py-6 flex items-center justify-between shadow-lg shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 3xl:gap-6 min-w-0 flex-1 mr-2">
            <button
              onClick={exitDetail}
              className="p-2 sm:p-2.5 3xl:p-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
              title="กลับไปรายการกิจกรรม"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-9 3xl:h-9" />
            </button>
            <div className="flex items-center gap-2.5 3xl:gap-4 min-w-0 flex-1">
              <ScanFace className="w-6 h-6 sm:w-7 sm:h-7 3xl:w-11 3xl:h-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-base sm:text-xl 2xl:text-2xl 3xl:text-5xl leading-tight truncate">
                  {event?.event_title || selectedEvent?.event_title || 'Live Check-in'}
                </h1>
                <p className="text-white/85 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl truncate mt-0.5">
                  {(event?.event_addr || selectedEvent?.event_addr) ? `${event?.event_addr || selectedEvent?.event_addr} • ` : ''}
                  {formatTime(event?.event_time_start || selectedEvent?.event_time_start)} - {formatTime(event?.event_time_stop || selectedEvent?.event_time_stop)} น.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2.5 3xl:gap-4 shrink-0">
            <button onClick={() => refetchDetail(false)} className="p-2 sm:p-2.5 3xl:p-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer" title="รีเฟรช">
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={toggleFullscreen} className="p-2 sm:p-2.5 3xl:p-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer hidden sm:flex" title={isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}>
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" />}
            </button>
            <button onClick={toggleTheme} className="p-2 sm:p-2.5 3xl:p-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer" title={isDark ? 'ธีมสว่าง' : 'ธีมมืด'}>
              {isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-slate-200" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-yellow-300" />}
            </button>
            <button
              onClick={toggle}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 3xl:px-6 3xl:py-3 rounded-xl text-xs sm:text-sm 2xl:text-base 3xl:text-xl font-bold transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-white/25 shadow-inner' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Auto {isActive ? `ON (${secondsLeft}s)` : 'OFF'}
            </button>
          </div>
        </header>

        {/* Main Split: Left 70% / Right 30% — Mobile scrollable, Desktop 100vh */}
        <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
          <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 shrink-0 lg:overflow-hidden">
            <LeftPanel
              event={event || selectedEvent}
              summary={summary}
              displayParticipant={displayParticipant}
              isSelectedParticipant={isSelectedParticipant}
            />
          </div>
          <div className="w-full lg:w-[30%] min-h-[480px] lg:min-h-0 flex-1 flex flex-col lg:overflow-hidden">
            <RightPanel
              participants={participants}
              summary={summary}
              selectedId={displayParticipant?.regis_id}
              onSelect={(p) => setSelectedParticipant(p)}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 3xl:px-10 py-2 sm:py-2.5 3xl:py-4 flex items-center justify-between text-xs sm:text-sm 2xl:text-base 3xl:text-xl text-neutral-600 dark:text-neutral-300 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <span className="truncate font-medium">สแกนล่าสุด: {lastScanTime}</span>
            <span className="text-neutral-300 dark:text-neutral-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline font-medium">Auto-refresh: {isActive ? 'ON (5s)' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                <WifiOff className="w-4 h-4 3xl:w-6 3xl:h-6" /> ออฟไลน์
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold">
                <span className="w-2.5 h-2.5 3xl:w-3.5 3xl:h-3.5 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="w-4 h-4 3xl:w-6 3xl:h-6" /> เชื่อมต่อแล้ว
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
      <main className="max-w-[2000px] mx-auto px-4 sm:px-8 2xl:px-10 3xl:px-16 py-6 sm:py-8 2xl:py-10 3xl:py-16 space-y-6 sm:space-y-8 2xl:space-y-10 3xl:space-y-14">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          activePreset={activePreset}
          filterMode={filterMode}
          onFilterModeChange={handleFilterModeChange}
          onSingleDateChange={handleSingleDateChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onPresetChange={applyPreset}
          onRefresh={refetch}
          loading={listLoading}
          dateLabel={dateLabel}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 3xl:px-8 3xl:py-6 rounded-2xl text-sm sm:text-base 3xl:text-2xl font-bold shadow-xs">
            {error}
          </div>
        )}

        <EventTable
          events={events}
          participantsMap={participantsMap}
          onSelectEvent={enterDetail}
        />
      </main>
    </div>
  )
}
