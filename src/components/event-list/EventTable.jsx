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
  Sparkles,
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
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 3xl:p-12 text-center animate-fade-in">
        <Calendar className="w-12 h-12 3xl:w-16 3xl:h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
        <h3 className="text-base 3xl:text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
          ไม่มีข้อมูลกิจกรรม
        </h3>
        <p className="text-neutral-400 text-sm 3xl:text-lg">
          ไม่พบรายการกิจกรรมในช่วงเวลาที่เลือก คุณสามารถเปลี่ยนช่วงเวลาหรือกดรีเฟรชข้อมูลได้
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 3xl:space-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
      {/* Header with Search & Filter Pills */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 3xl:p-8 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 3xl:gap-3">
              <h2 className="text-base sm:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                รายการกิจกรรม
              </h2>
              <span className="px-2.5 py-0.5 3xl:px-3.5 3xl:py-1 rounded-full text-xs 3xl:text-base font-bold bg-primary/10 text-primary dark:text-indigo-300">
                {totalItems} รายการ
              </span>
            </div>
            <p className="text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 mt-1">
              คลิกที่การ์ดกิจกรรมเพื่อเข้าสู่หน้า Live Check-in และดูสถิติ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 3xl:w-96">
              <Search className="w-4 h-4 3xl:w-5 3xl:h-5 text-neutral-400 absolute left-3 3xl:left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหากิจกรรม, สถานที่..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 3xl:pl-12 pr-3 py-2 3xl:py-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl text-xs 3xl:text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Page size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 3xl:py-3 text-xs 3xl:text-lg text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
            >
              <option value={6}>6 การ์ด/หน้า</option>
              <option value={9}>9 การ์ด/หน้า</option>
              <option value={12}>12 การ์ด/หน้า</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills (if multiple types exist) */}
        {eventTypes.length > 2 && (
          <div className="flex items-center gap-1.5 3xl:gap-2 mt-3.5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto pb-1">
            <span className="text-xs 3xl:text-base font-medium text-neutral-400 dark:text-neutral-500 shrink-0 mr-1">
              ประเภท:
            </span>
            {eventTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1 3xl:px-4 3xl:py-1.5 rounded-lg text-xs 3xl:text-base font-medium transition-all shrink-0 cursor-pointer ${
                  selectedType === type
                    ? 'bg-primary text-white shadow-xs font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {type === 'all' ? 'ทั้งหมด' : type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modern Event Cards Grid */}
      {paginatedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 3xl:gap-8">
          {paginatedEvents.map((ev, index) => {
            const summary = participantsMap[ev.event_id]
            const participantCount = summary ? summary.total : 0
            const typeStyle = TYPE_COLORS[ev.event_type] || TYPE_COLORS.default
            const isEventToday = ev.event_date === today

            return (
              <div
                key={ev.event_id}
                onClick={() => onSelectEvent(ev.event_id)}
                className="group relative bg-white dark:bg-neutral-900 rounded-2xl p-5 3xl:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Accent Top Gradient on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3 3xl:mb-4">
                    <span
                      className={`px-3 py-1 3xl:px-4 3xl:py-1.5 rounded-xl text-xs 3xl:text-base font-semibold border ${typeStyle}`}
                    >
                      {ev.event_type || 'กิจกรรม'}
                    </span>

                    {isEventToday ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 3xl:px-3.5 3xl:py-1 rounded-full text-[11px] 3xl:text-sm font-bold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 animate-pulse">
                        <span className="w-1.5 h-1.5 3xl:w-2 3xl:h-2 rounded-full bg-green-500" /> วันนี้
                      </span>
                    ) : (
                      <span className="text-xs 3xl:text-base font-medium text-neutral-400 dark:text-neutral-500">
                        {formatDateShort(ev.event_date)}
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h3
                    className="text-base sm:text-lg 3xl:text-2xl font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-primary dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3.5 3xl:mb-5 leading-snug"
                    title={ev.event_title}
                  >
                    {ev.event_title}
                  </h3>

                  {/* Meta details */}
                  <div className="space-y-2 3xl:space-y-3 mb-4 3xl:mb-6 text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-indigo-500 shrink-0" />
                      <span className="truncate">{formatDate(ev.event_date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-indigo-500 shrink-0" />
                      <span>
                        {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)} น.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-indigo-500 shrink-0" />
                      <span className="truncate">{ev.event_addr || 'ไม่ระบุสถานที่'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Participants count + Enter action */}
                <div className="pt-3.5 3xl:pt-5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/70 px-2.5 py-1.5 3xl:px-4 3xl:py-2 rounded-xl">
                    <Users className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-neutral-500 dark:text-neutral-400" />
                    <span className="text-xs 3xl:text-base text-neutral-600 dark:text-neutral-300">
                      ผู้เข้าร่วม: <b className="text-neutral-800 dark:text-white font-bold">{participantCount}</b> คน
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 3xl:px-5 3xl:py-2.5 rounded-xl bg-primary text-white text-xs 3xl:text-base font-semibold shadow-xs group-hover:bg-primary-dark group-hover:shadow-md transition-all group-hover:translate-x-0.5">
                    เข้าสู่กิจกรรม
                    <ArrowRight className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 3xl:p-12 text-center animate-fade-in">
          <p className="text-neutral-400 text-sm 3xl:text-xl">
            ไม่พบกิจกรรมที่ตรงกับการค้นหา "{searchTerm}"
          </p>
        </div>
      )}

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 3xl:px-8 py-3 3xl:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs 3xl:text-lg text-neutral-500 dark:text-neutral-400 transition-colors">
          <div>
            แสดง {startRecord} - {endRecord} จากทั้งหมด {totalItems} รายการ
          </div>

          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 3xl:p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 3xl:w-5 3xl:h-5" />
            </button>

            <span className="px-2 font-medium text-neutral-700 dark:text-neutral-200">
              หน้า {safeCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 3xl:p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 3xl:w-5 3xl:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
