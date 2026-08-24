import { useState, useMemo } from 'react'
import { X, Users, UserCheck, GraduationCap, UserPlus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useParticipants } from '../../hooks/useParticipants'
import { formatDateTime, getInitial } from '../../utils/helpers'

const typeBadge = {
  staff: 'bg-green-100 text-green-700',
  student: 'bg-blue-100 text-blue-700',
  guest: 'bg-yellow-100 text-yellow-700',
}

const typeThai = {
  staff: 'Staff',
  student: 'Student',
  guest: 'Guest',
}

export default function ParticipantsModal({ eventId, onClose }) {
  const { event, summary, participants, loading, error } = useParticipants(eventId)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return participants
    const query = searchTerm.toLowerCase().trim()
    return participants.filter(
      (p) =>
        p.participant_name?.toLowerCase().includes(query) ||
        p.user_department?.toLowerCase().includes(query) ||
        p.user_type?.toLowerCase().includes(query)
    )
  }, [participants, searchTerm])

  // Pagination calculation
  const totalItems = filteredParticipants.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedList = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredParticipants.slice(start, start + pageSize)
  }, [filteredParticipants, safeCurrentPage, pageSize])

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              {event?.event_title || 'รายชื่อผู้เข้าร่วมกิจกรรม'}
            </h2>
            {event && (
              <p className="text-xs text-neutral-500 mt-0.5">
                สถานที่: {event.event_addr || '-'} • วันที่: {event.event_date || '-'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-6 py-2.5 bg-neutral-50 border-b border-neutral-200 text-xs">
          <span className="flex items-center gap-1.5 text-neutral-700">
            <Users className="w-4 h-4 text-neutral-500" /> ทั้งหมด: <b>{summary.total}</b> คน
          </span>
          <span className="flex items-center gap-1.5 text-green-700">
            <UserCheck className="w-4 h-4" /> Staff: <b>{summary.staff}</b> คน
          </span>
          <span className="flex items-center gap-1.5 text-blue-700">
            <GraduationCap className="w-4 h-4" /> Student: <b>{summary.student}</b> คน
          </span>
          <span className="flex items-center gap-1.5 text-yellow-700">
            <UserPlus className="w-4 h-4" /> Guest: <b>{summary.guest}</b> คน
          </span>
        </div>

        {/* Search & Toolbar */}
        <div className="px-6 py-3 border-b border-neutral-100 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, สังกัด..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-none cursor-pointer"
          >
            <option value={15}>15 คน/หน้า</option>
            <option value={30}>30 คน/หน้า</option>
            <option value={50}>50 คน/หน้า</option>
          </select>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="p-12 text-center text-neutral-400 text-sm">
              กำลังโหลดข้อมูลรายชื่อผู้เข้าร่วม...
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-500 text-sm">
              {error}
            </div>
          )}
          {!loading && !error && (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 sticky top-0 border-b border-neutral-200 text-xs">
                <tr>
                  <th className="px-4 py-2.5 text-left w-12">#</th>
                  <th className="px-4 py-2.5 text-left w-16">รูปภาพ</th>
                  <th className="px-4 py-2.5 text-left">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-2.5 text-left">ประเภท</th>
                  <th className="px-4 py-2.5 text-left">สังกัด / แผนก</th>
                  <th className="px-4 py-2.5 text-left">เวลาที่ Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedList.length > 0 ? (
                  paginatedList.map((p, idx) => (
                    <tr key={p.regis_id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-4 py-2.5 text-neutral-400 text-xs font-medium">
                        {startRecord + idx}
                      </td>
                      <td className="px-4 py-2.5">
                        {p.participant_photo ? (
                          <img
                            src={p.participant_photo}
                            alt={p.participant_name}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs items-center justify-center ${
                            p.participant_photo ? 'hidden' : 'flex'
                          }`}
                        >
                          {getInitial(p.participant_name)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-neutral-800">
                        {p.participant_name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            typeBadge[p.user_type] || typeBadge.guest
                          }`}
                        >
                          {typeThai[p.user_type] || p.user_type || 'Guest'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600 text-xs">
                        {p.user_department || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600 text-xs whitespace-nowrap">
                        {formatDateTime(p.regis_date)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 text-sm">
                      {searchTerm
                        ? `ไม่พบรายชื่อที่ตรงกับการค้นหา "${searchTerm}"`
                        : 'ยังไม่มีรายชื่อผู้เข้าร่วมในกิจกรรมนี้'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Pagination Footer */}
        {totalItems > 0 && (
          <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
            <div>
              แสดง {startRecord} - {endRecord} จากทั้งหมด {totalItems} คน
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-1.5 font-medium text-neutral-700">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="หน้าถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
