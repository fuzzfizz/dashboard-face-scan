import { useState, useMemo, useEffect, useRef } from 'react'
import { getInitial, getToday } from '../../utils/helpers'
import { Users } from 'lucide-react'

const FILTER_TABS = [
  { key: 'all', label: 'ทั้งหมด', color: 'text-neutral-800 dark:text-neutral-100' },
  { key: 'staff', label: 'Staff', color: 'text-green-700 dark:text-green-400' },
  { key: 'student', label: 'Student', color: 'text-blue-700 dark:text-blue-400' },
  { key: 'guest', label: 'Guest', color: 'text-amber-700 dark:text-amber-400' },
]

const TYPE_DOT = {
  staff: 'bg-green-500',
  student: 'bg-blue-500',
  guest: 'bg-amber-500',
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

  useEffect(() => {
    if (!latestParticipant) return
    const currentId = latestParticipant.regis_id
    if (isLatestFromToday && currentId && currentId !== prevLatestIdRef.current) {
      prevLatestIdRef.current = currentId
      setHighlightedId(currentId)
      const timer = setTimeout(() => setHighlightedId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [latestParticipant, isLatestFromToday])

  const filtered = useMemo(() => {
    if (filterType === 'all') return sorted
    return sorted.filter((p) => (p.user_type || 'guest').toLowerCase() === filterType)
  }, [sorted, filterType])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-neutral-900">
      {/* Header & Filter Tabs */}
      <div className="px-3.5 sm:px-4 3xl:px-6 py-3 3xl:py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm sm:text-base 2xl:text-xl 3xl:text-2xl text-neutral-800 dark:text-neutral-100">
            ผู้เข้าร่วม
          </h3>
          <span className="px-2.5 py-0.5 3xl:px-4 3xl:py-1 rounded-full text-xs sm:text-sm 3xl:text-lg font-bold bg-primary/10 text-primary dark:text-indigo-300">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs sm:text-sm 3xl:text-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 3xl:px-4 3xl:py-2 rounded-lg text-xs sm:text-sm 3xl:text-base font-semibold transition-all cursor-pointer ${
                filterType === tab.key
                  ? `bg-white dark:bg-neutral-950 ${tab.color} shadow-xs font-bold`
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
          <div>
            <Users className="w-10 h-10 3xl:w-16 3xl:h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm sm:text-base 3xl:text-2xl font-medium">
              {participants.length === 0
                ? 'ยังไม่มีผู้ลงทะเบียน'
                : 'ไม่พบผู้เข้าร่วมในกลุ่มที่เลือก'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800/80">
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
              <div
                key={p.regis_id}
                onClick={() => onSelect(p)}
                className={`flex items-center gap-3 sm:gap-3.5 3xl:gap-5 px-3.5 sm:px-4 3xl:px-6 py-3 sm:py-3.5 3xl:py-4.5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary'
                    : isHighlighted
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/30 border-l-4 border-l-primary shadow-xs animate-glow'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                {/* Photo / Avatar */}
                <div className="relative shrink-0">
                  {p.participant_photo ? (
                    <img
                      src={p.participant_photo}
                      alt={p.participant_name}
                      className={`w-10 h-10 sm:w-11 sm:h-11 2xl:w-12 2xl:h-12 3xl:w-16 3xl:h-16 rounded-full object-cover shadow-2xs ring-2 ${
                        isHighlighted ? 'ring-primary animate-pulse' : 'ring-neutral-200 dark:ring-neutral-700'
                      }`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 2xl:w-12 2xl:h-12 3xl:w-16 3xl:h-16 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-extrabold text-sm sm:text-base 3xl:text-xl items-center justify-center ring-2 ${
                      isHighlighted ? 'ring-primary animate-pulse' : 'ring-neutral-200 dark:ring-neutral-700'
                    } ${p.participant_photo ? 'hidden' : 'flex'}`}
                  >
                    {getInitial(p.participant_name)}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 3xl:w-4 3xl:h-4 rounded-full border-2 border-white dark:border-neutral-900 ${
                      TYPE_DOT[p.user_type] || TYPE_DOT.guest
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-bold text-neutral-800 dark:text-neutral-100 truncate">
                    {p.participant_name}
                  </p>
                  <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-xl text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {p.user_department || '-'}
                  </p>
                </div>

                {/* Time */}
                <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-xl font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap shrink-0">
                  {time}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
