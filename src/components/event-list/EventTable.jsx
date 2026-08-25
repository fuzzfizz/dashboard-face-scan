import { useState, useMemo } from 'react'
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Filter,
} from 'lucide-react'
import { formatDate, formatDateShort, formatTime, getToday } from '../../utils/helpers'

const TYPE_COLORS = {
  ประชุม: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
  อบรม: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  สัมมนา: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
  default: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
}

export default function EventTable({ events = [], participantsMap = {}, onSelectEvent }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const today = getToday()

  // Extract distinct event types
  const eventTypes = useMemo(() => {
    const types = new Set()
    events.forEach((ev) => {
      if (ev.event_type) types.add(ev.event_type)
    })
    return ['all', ...Array.from(types)]
  }, [events])

  // Filter events based on search query & type
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchType = selectedType === 'all' || ev.event_type === selectedType
      if (!matchType) return false

      if (!searchTerm.trim()) return true
      const query = searchTerm.toLowerCase().trim()
      return (
        ev.event_title?.toLowerCase().includes(query) ||
        ev.event_addr?.toLowerCase().includes(query) ||
        ev.event_type?.toLowerCase().includes(query) ||
        ev.event_date?.toLowerCase().includes(query)
      )
    })
  }, [events, searchTerm, selectedType])

  // Calculate pagination
  const totalItems = filteredEvents.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedEvents = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize
    return filteredEvents.slice(startIdx, startIdx + pageSize)
  }, [filteredEvents, safeCurrentPage, pageSize])

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems)

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 p-10 3xl:p-16 text-center animate-fade-in">
        <CalendarCheck className="w-16 h-16 3xl:w-24 3xl:h-24 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl 3xl:text-4xl font-extrabold text-neutral-800 dark:text-neutral-200 mb-2">
          ไม่มีข้อมูลกิจกรรม
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base 3xl:text-2xl">
          ไม่พบรายการกิจกรรมในช่วงเวลาที่เลือก คุณสามารถเปลี่ยนช่วงเวลาหรือกดรีเฟรชข้อมูลได้
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-7 3xl:space-y-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Header with Search & Filter Dropdown */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-7 2xl:p-8 3xl:p-12 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-3 3xl:gap-4">
              <h2 className="text-lg sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
                รายการกิจกรรม
              </h2>
              <span className="px-3.5 py-1 3xl:px-5 3xl:py-2 rounded-full text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold bg-primary/10 text-primary dark:text-indigo-300">
                {totalItems} รายการ
              </span>
            </div>
            <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-500 dark:text-neutral-400 mt-1.5 3xl:mt-2.5 font-medium">
              คลิกที่การ์ดกิจกรรมเพื่อเข้าสู่หน้า Live Check-in และดูสถิติ
            </p>
          </div>

          {/* Search, Type Dropdown, and Page Size Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 2xl:w-80 3xl:w-[420px]">
              <Search className="w-5 h-5 3xl:w-7 3xl:h-7 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหากิจกรรม, สถานที่..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-12 3xl:pl-16 pr-4 py-3 sm:py-3.5 3xl:py-5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-2xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>

            {/* Event Type Filter Dropdown */}
            {eventTypes.length > 2 && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-auto bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 sm:py-3.5 3xl:py-5 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? '🏷️ ทุกประเภท' : `🏷️ ${type}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page size dropdown */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 sm:py-3.5 3xl:py-5 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto shadow-2xs"
            >
              <option value={6}>6 การ์ด / หน้า</option>
              <option value={9}>9 การ์ด / หน้า</option>
              <option value={12}>12 การ์ด / หน้า</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern Large Event Cards Grid */}
      {paginatedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 2xl:gap-7 3xl:gap-10">
          {paginatedEvents.map((ev, index) => {
            const summary = participantsMap[ev.event_id]
            const participantCount = summary ? summary.total : 0
            const typeStyle = TYPE_COLORS[ev.event_type] || TYPE_COLORS.default
            const isEventToday = ev.event_date === today

            return (
              <div
                key={ev.event_id}
                onClick={() => onSelectEvent(ev.event_id)}
                className="group relative bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-7 2xl:p-8 3xl:p-12 border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-2xl hover:border-primary/60 dark:hover:border-primary/60 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Top Accent Gradient Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-4 3xl:mb-6">
                    <span
                      className={`px-3.5 py-1 sm:px-4 sm:py-1.5 3xl:px-6 3xl:py-2.5 rounded-2xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black border ${typeStyle}`}
                    >
                      {ev.event_type || 'กิจกรรม'}
                    </span>

                    {isEventToday ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 3xl:px-5 3xl:py-2 rounded-full text-xs sm:text-sm 3xl:text-xl font-black bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 animate-pulse">
                        <span className="w-2 h-2 3xl:w-3 3xl:h-3 rounded-full bg-green-500" /> วันนี้
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-xl font-bold text-neutral-400 dark:text-neutral-500">
                        {formatDateShort(ev.event_date)}
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h3
                    className="text-base sm:text-xl 2xl:text-2xl 3xl:text-4xl font-black text-neutral-800 dark:text-neutral-100 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3.5 sm:mb-5 3xl:mb-8 leading-snug tracking-tight"
                    title={ev.event_title}
                  >
                    {ev.event_title}
                  </h3>

                  {/* Meta details */}
                  <div className="space-y-2 sm:space-y-3 3xl:space-y-5 mb-4 sm:mb-6 3xl:mb-8 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-600 dark:text-neutral-300 font-medium">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-primary shrink-0" />
                      <span className="truncate">{formatDate(ev.event_date)}</span>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-primary shrink-0" />
                      <span>
                        {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)} น.
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-primary shrink-0" />
                      <span className="truncate">{ev.event_addr || 'ไม่ระบุสถานที่'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Participants count + Action button */}
                <div className="pt-3.5 sm:pt-5 3xl:pt-7 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-50 dark:bg-neutral-800/80 px-3 py-1.5 sm:px-4 sm:py-2.5 3xl:px-6 3xl:py-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-700/50">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-600 dark:text-neutral-300 font-medium">
                      ผู้เข้าร่วม: <b className="text-neutral-900 dark:text-white font-black">{participantCount}</b> คน
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2.5 3xl:px-7 3xl:py-3.5 rounded-2xl bg-primary text-white text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black shadow-sm group-hover:bg-primary-dark group-hover:shadow-md transition-all group-hover:translate-x-1">
                    เข้าสู่กิจกรรม
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 p-10 3xl:p-16 text-center animate-fade-in">
          <p className="text-neutral-400 text-sm sm:text-base 3xl:text-2xl">
            ไม่พบกิจกรรมที่ตรงกับการค้นหา "{searchTerm}"
          </p>
        </div>
      )}

      {/* Large Pagination Bar */}
      {totalItems > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 px-5 sm:px-8 3xl:px-12 py-3.5 sm:py-5 3xl:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-600 dark:text-neutral-300 font-medium transition-colors">
          <div>
            แสดง {startRecord} - {endRecord} จากทั้งหมด <b className="font-bold">{totalItems}</b> รายการ
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-2 sm:p-2.5 3xl:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 3xl:w-7 3xl:h-7" />
            </button>

            <span className="px-2.5 sm:px-3 font-bold text-neutral-800 dark:text-neutral-100">
              หน้า {safeCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-2 sm:p-2.5 3xl:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <ChevronRight className="w-5 h-5 3xl:w-7 3xl:h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
