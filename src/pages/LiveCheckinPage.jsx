import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useParticipants } from '../hooks/useParticipants'
import { useEvents } from '../hooks/useEvents'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import PhotoDisplay from '../components/live/PhotoDisplay'
import ParticipantGrid from '../components/live/ParticipantGrid'
import SummaryBar from '../components/live/SummaryBar'
import { formatDate, formatTime, getToday } from '../utils/helpers'
import { RefreshCw, ArrowLeft, ScanFace, Radio, Calendar } from 'lucide-react'

export default function LiveCheckinPage() {
  const { eventId } = useParams()
  const isNoEventSelected = !eventId || eventId === '0'
  const today = getToday()

  const {
    events: todayEvents,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents(isNoEventSelected ? today : null, isNoEventSelected ? today : null)

  const { event, summary, participants, loading, error, refetch } = useParticipants(eventId)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const { secondsLeft, isActive, toggle } = useAutoRefresh(handleRefresh, 5000, true)

  // Default to latest check-in participant
  const sorted = [...participants].sort(
    (a, b) => new Date(b.regis_date) - new Date(a.regis_date)
  )
  const displayParticipant = selectedParticipant || sorted[0] || null

  const lastScanTime = sorted[0]?.regis_date
    ? new Date(sorted[0].regis_date).toLocaleString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '-'

  // Fallback: When no event is selected (e.g. /live or /live/0)
  if (isNoEventSelected) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Header */}
        <header className="bg-primary text-white px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <ScanFace className="w-6 h-6" />
              <div>
                <h1 className="font-bold text-lg leading-tight">Live Check-in</h1>
                <p className="text-white/70 text-xs">เลือกกิจกรรมเพื่อเริ่มดูการ Check-in แบบ Real-time</p>
              </div>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
          >
            กลับหน้าแดชบอร์ด
          </Link>
        </header>

        {/* Event Selector Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">กิจกรรมประจำวันนี้</h2>
              <p className="text-sm text-neutral-500">{formatDate(today)}</p>
            </div>
            <button
              onClick={refetchEvents}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${eventsLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </button>
          </div>

          {eventsLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">กำลังโหลดกิจกรรมวันนี้...</p>
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayEvents.map((ev) => (
                <div
                  key={ev.event_id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-neutral-800 leading-snug">{ev.event_title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-light text-primary-dark font-medium shrink-0">
                        {ev.event_type || 'อื่นๆ'}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-neutral-500 mb-4">
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-600">สถานที่:</span> {ev.event_addr || '-'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-600">เวลา:</span>{' '}
                        {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/live/${ev.event_id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
                  >
                    <Radio className="w-4 h-4" />
                    เปิด Live Check-in
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-800 mb-1">ไม่พบกิจกรรมสำหรับวันนี้</h3>
              <p className="text-sm text-neutral-500 mb-6">
                ไม่มีกิจกรรมที่จัดขึ้นในวันนี้ หรือคุณสามารถเลือกกิจกรรมจากช่วงวันที่อื่นๆ ได้ในหน้าแดชบอร์ด
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
              >
                เลือกกิจกรรมจากหน้าแดชบอร์ด
              </Link>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (loading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error && participants.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-800 mb-2">ไม่สามารถโหลดข้อมูล Live Check-in</h2>
          <p className="text-neutral-500 text-sm mb-6">{error || 'ไม่พบข้อมูลกิจกรรมที่เลือก'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-medium transition-colors cursor-pointer"
            >
              ลองใหม่อีกครั้ง
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
            >
              กลับหน้าแดชบอร์ด
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-primary text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ScanFace className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg leading-tight">{event?.event_title || 'Live Check-in'}</h1>
              <p className="text-white/70 text-xs">
                {event?.event_addr} • {formatTime(event?.event_time_start)} - {formatTime(event?.event_time_stop)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="รีเฟรช"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={toggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            Auto {isActive ? `ON (${secondsLeft}s)` : 'OFF'}
          </button>
        </div>
      </header>

      {/* Main Content — Split Screen */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Photo */}
        <div className="w-2/5 bg-white border-r border-neutral-200 flex items-center justify-center">
          <PhotoDisplay participant={displayParticipant} />
        </div>

        {/* Right Panel — Grid + Summary */}
        <div className="w-3/5 flex flex-col">
          <div className="px-4 py-3 bg-white border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-800">รายชื่อผู้ Check-in</h3>
          </div>
          <ParticipantGrid
            participants={participants}
            selectedId={displayParticipant?.regis_id}
            onSelect={(p) => setSelectedParticipant(p)}
          />
          <SummaryBar summary={summary} />
        </div>
      </div>

      {/* Footer Status */}
      <footer className="bg-white border-t border-neutral-200 px-6 py-2 flex items-center justify-between text-xs text-neutral-500">
        <span>สแกนล่าสุด: {lastScanTime}</span>
        <span>Auto-refresh: {isActive ? `ON (ทุก 5 วินาที)` : 'OFF'}</span>
      </footer>
    </div>
  )
}

