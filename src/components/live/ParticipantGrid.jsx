import { useState, useMemo, useEffect, useRef } from 'react'
import { getInitial, getToday } from '../../utils/helpers'
import { Sparkles, Users } from 'lucide-react'

const typeDot = {
  staff: 'bg-green-500',
  student: 'bg-blue-500',
  guest: 'bg-yellow-500',
}

export default function ParticipantGrid({ participants = [], selectedId, onSelect }) {
  const [filterType, setFilterType] = useState('all')
  const [highlightedId, setHighlightedId] = useState(null)
  const prevLatestIdRef = useRef(null)
  const today = getToday()

  const sorted = useMemo(() => {
    return [...participants].sort(
      (a, b) => new Date(b.regis_date) - new Date(a.regis_date)
    )
  }, [participants])

  const latestParticipant = sorted[0]
  const isLatestFromToday = latestParticipant?.regis_date
    ? latestParticipant.regis_date.startsWith(today)
    : false

  // Trigger 3-second highlight only for today's new scans
  useEffect(() => {
    if (!latestParticipant) return
    const currentId = latestParticipant.regis_id

    if (isLatestFromToday && currentId && currentId !== prevLatestIdRef.current) {
      prevLatestIdRef.current = currentId
      setHighlightedId(currentId)

      const timer = setTimeout(() => {
        setHighlightedId(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [latestParticipant, isLatestFromToday])

  const filtered = useMemo(() => {
    if (filterType === 'all') return sorted
    return sorted.filter((p) => (p.user_type || 'guest').toLowerCase() === filterType)
  }, [sorted, filterType])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Live Grid Header & Type Filter Tabs */}
      <div className="px-3 sm:px-4 py-2 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-xs sm:text-sm text-neutral-800">รายชื่อผู้ Check-in</h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600">
            {filtered.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === 'all' ? 'bg-white text-neutral-800 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType('staff')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === 'staff' ? 'bg-white text-green-700 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setFilterType('student')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === 'student' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => setFilterType('guest')}
            className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              filterType === 'guest' ? 'bg-white text-yellow-700 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Guest
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-neutral-400">
          <div>
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm">
              {participants.length === 0
                ? 'ยังไม่มีผู้ลงทะเบียน / Check-in ในขณะนี้'
                : 'ไม่พบผู้เข้าร่วมในกลุ่มที่เลือก'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">ข้อมูลจะอัปเดตอัตโนมัติเมื่อมีการสแกนใบหน้า</p>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 sticky top-0 z-10 border-b border-neutral-200 text-xs text-neutral-600">
              <tr>
                <th className="px-3 py-2.5 text-left w-14">รูป</th>
                <th className="px-3 py-2.5 text-left">ชื่อ-นามสกุล</th>
                <th className="px-3 py-2.5 text-left">สังกัด / แผนก</th>
                <th className="px-3 py-2.5 text-left w-24">เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => {
                const isSelected = p.regis_id === selectedId
                const isHighlighted = p.regis_id === highlightedId
                const time = p.regis_date
                  ? new Date(p.regis_date).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : ''

                return (
                  <tr
                    key={p.regis_id}
                    onClick={() => onSelect(p)}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-primary-light/90 border-l-4 border-primary'
                        : isHighlighted
                        ? 'bg-green-50/90 border-l-4 border-primary shadow-xs animate-glow'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="relative">
                        {p.participant_photo ? (
                          <img
                            src={p.participant_photo}
                            alt={p.participant_name}
                            className={`w-9 h-9 rounded-full object-cover shadow-xs transition-transform ${isHighlighted ? 'scale-105 ring-2 ring-primary/40' : ''}`}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-9 h-9 rounded-full bg-primary-light text-primary font-bold text-xs items-center justify-center ${p.participant_photo ? 'hidden' : 'flex'}`}
                        >
                          {getInitial(p.participant_name)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${typeDot[p.user_type] || typeDot.guest}`}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{p.participant_name}</span>
                        {isHighlighted && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-primary text-white rounded-full flex items-center gap-0.5 shrink-0 shadow-xs animate-bounce">
                            <Sparkles className="w-2.5 h-2.5" /> ล่าสุด
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-500 text-xs truncate max-w-[150px]">
                      {p.user_department || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-neutral-500 text-xs whitespace-nowrap">{time}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
