import { useState, useMemo } from 'react'
import { Eye, Download, QrCode, Radio, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTime } from '../../utils/helpers'

export default function EventTable({ events = [], participantsMap = {}, onViewParticipants, onViewQR, onGoLive }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const query = searchTerm.toLowerCase().trim()
    return events.filter(
      (ev) =>
        ev.event_title?.toLowerCase().includes(query) ||
        ev.event_addr?.toLowerCase().includes(query) ||
        ev.event_type?.toLowerCase().includes(query)
    )
  }, [events, searchTerm])

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
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
        <p className="text-neutral-400 text-base">ไม่มีข้อมูลกิจกรรมในช่วงเวลาที่เลือก</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header with Search and Page Size */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-neutral-800">รายการกิจกรรม</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            กิจกรรมทั้งหมด {totalItems} รายการ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, สถานที่..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Rows per page select */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-white border border-neutral-200 rounded-xl px-3 py-2 sm:py-1.5 text-xs text-neutral-700 focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value={10}>10 รายการ/หน้า</option>
            <option value={20}>20 รายการ/หน้า</option>
            <option value={50}>50 รายการ/หน้า</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left w-12">#</th>
              <th className="px-4 py-3 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-3 text-left">ประเภท</th>
              <th className="px-4 py-3 text-left">สถานที่</th>
              <th className="px-4 py-3 text-left">เวลา</th>
              <th className="px-4 py-3 text-center">ผู้เข้าร่วม</th>
              <th className="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((ev, idx) => {
                const summary = participantsMap[ev.event_id]
                const apiBase = import.meta.env.API_BASE_URL || '/api'
                const pdfBaseUrl = apiBase.startsWith('http') ? apiBase.replace('/api', '') : ''
                const globalIndex = startRecord + idx

                return (
                  <tr key={ev.event_id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-neutral-400 font-medium">{globalIndex}</td>
                    <td className="px-4 py-3.5 font-medium text-neutral-800 max-w-xs truncate" title={ev.event_title}>
                      {ev.event_title}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-primary-light text-primary-dark font-medium whitespace-nowrap">
                        {ev.event_type || 'อื่นๆ'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600">{ev.event_addr || '-'}</td>
                    <td className="px-4 py-3.5 text-neutral-600 whitespace-nowrap">
                      {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-neutral-800">
                      {summary ? summary.total : '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewParticipants(ev.event_id)}
                          className="p-1.5 rounded-lg hover:bg-primary-light text-primary transition-colors cursor-pointer"
                          title="ดูรายชื่อผู้เข้าร่วม"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ev.pdf_file && (
                          <a
                            href={`${pdfBaseUrl}/pdf/${ev.pdf_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                            title="ดาวน์โหลด PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onViewQR(ev)}
                          className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors cursor-pointer"
                          title="ดู QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onGoLive(ev.event_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                          title="เปิดหน้า Live Check-in"
                        >
                          <Radio className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400 text-sm">
                  ไม่พบกิจกรรมที่ตรงกับการค้นหา "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            แสดง {startRecord} - {endRecord} จากทั้งหมด {totalItems} รายการ
          </div>

          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium text-neutral-700">
              หน้า {safeCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
