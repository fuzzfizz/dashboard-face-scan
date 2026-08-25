import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { formatDateShort, formatTime } from '../../utils/helpers'

export default function EventTable({ events = [], participantsMap = {}, onSelectEvent }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const query = searchTerm.toLowerCase().trim()
    return events.filter(
      (ev) =>
        ev.event_title?.toLowerCase().includes(query) ||
        ev.event_addr?.toLowerCase().includes(query) ||
        ev.event_type?.toLowerCase().includes(query) ||
        ev.event_date?.toLowerCase().includes(query)
    )
  }, [events, searchTerm])

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
        <p className="text-neutral-400 text-base 3xl:text-xl">ไม่มีข้อมูลกิจกรรมในช่วงเวลาที่เลือก</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors animate-fade-in" style={{ animationDelay: '400ms' }}>
      {/* Header with Search */}
      <div className="px-4 sm:px-6 3xl:px-8 py-3.5 sm:py-4 3xl:py-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div>
          <h2 className="text-base sm:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            รายการกิจกรรม
          </h2>
          <p className="text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 mt-0.5">
            กิจกรรมทั้งหมด {totalItems} รายการ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 3xl:w-96">
            <Search className="w-4 h-4 3xl:w-5 3xl:h-5 text-neutral-400 absolute left-3 3xl:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, วันที่, สถานที่..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 3xl:pl-12 pr-3 py-2 sm:py-1.5 3xl:py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl text-xs 3xl:text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 sm:py-1.5 3xl:py-3 text-xs 3xl:text-lg text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value={10}>10 รายการ/หน้า</option>
            <option value={20}>20 รายการ/หน้า</option>
            <option value={50}>50 รายการ/หน้า</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm 3xl:text-xl">
          <thead className="bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left w-12">#</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">ประเภท</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">วันที่</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">เวลา</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">สถานที่</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-center">ผู้เข้าร่วม</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((ev, idx) => {
                const summary = participantsMap[ev.event_id]
                const globalIndex = startRecord + idx

                return (
                  <tr
                    key={ev.event_id}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all duration-200 hover:scale-[1.005] cursor-pointer group"
                    onClick={() => onSelectEvent(ev.event_id)}
                  >
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-400 dark:text-neutral-500 font-medium">{globalIndex}</td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 font-medium text-neutral-800 dark:text-neutral-100 max-w-xs truncate" title={ev.event_title}>
                      {ev.event_title}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5">
                      <span className="px-2.5 py-0.5 3xl:px-4 3xl:py-1 rounded-full text-xs 3xl:text-base bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-medium whitespace-nowrap">
                        {ev.event_type || 'อื่นๆ'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-700 dark:text-neutral-300 whitespace-nowrap font-medium text-xs sm:text-sm 3xl:text-xl">
                      {formatDateShort(ev.event_date) || '-'}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs 3xl:text-lg">
                      {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm 3xl:text-xl">{ev.event_addr || '-'}</td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-center font-bold text-neutral-800 dark:text-neutral-100">
                      {summary ? summary.total : '-'}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 3xl:px-5 3xl:py-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-300 text-xs 3xl:text-lg font-medium group-hover:bg-primary group-hover:text-white transition-all">
                        เข้ากิจกรรม
                        <ArrowRight className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 3xl:py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm 3xl:text-xl">
                  ไม่พบกิจกรรมที่ตรงกับการค้นหา "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-6 3xl:px-8 py-3 3xl:py-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs 3xl:text-lg text-neutral-500 dark:text-neutral-400">
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
