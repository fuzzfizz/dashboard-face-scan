import { getInitial } from '../../utils/helpers'

const typeBadge = {
  staff: { bg: 'bg-green-100 text-green-700', label: 'Staff' },
  student: { bg: 'bg-blue-100 text-blue-700', label: 'Student' },
  guest: { bg: 'bg-yellow-100 text-yellow-700', label: 'Guest' },
}

export default function PhotoDisplay({ participant }) {
  if (!participant) {
    return (
      <div className="flex flex-row lg:flex-col items-center justify-center h-full p-4 lg:p-6 text-neutral-400 dark:text-neutral-500 gap-3">
        <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-44 lg:h-44 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
          <span className="text-2xl sm:text-4xl lg:text-6xl text-neutral-300 dark:text-neutral-600">?</span>
        </div>
        <div className="text-left lg:text-center">
          <p className="text-sm sm:text-base lg:text-lg font-medium text-neutral-500 dark:text-neutral-300">รอผู้เข้าร่วมสแกนเข้างาน...</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">ระบบจะแสดงข้อมูลอัตโนมัติเมื่อมีคนสแกน</p>
        </div>
      </div>
    )
  }

  const badge = typeBadge[participant.user_type] || typeBadge.guest
  const checkinTime = participant.regis_date
    ? new Date(participant.regis_date).toLocaleString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : ''

  return (
    <div className="flex flex-row lg:flex-col items-center lg:justify-center h-full p-3.5 sm:p-5 lg:p-6 gap-3.5 sm:gap-4 lg:gap-0 w-full">
      {/* Photo Container */}
      <div className="relative shrink-0">
        {participant.participant_photo ? (
          <img
            src={participant.participant_photo}
            alt={participant.participant_name}
            className="w-20 h-20 sm:w-28 sm:h-28 lg:w-48 lg:h-48 xl:w-56 xl:h-56 rounded-2xl object-cover shadow-md border-2 lg:border-4 border-white dark:border-neutral-700"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`w-20 h-20 sm:w-28 sm:h-28 lg:w-48 lg:h-48 xl:w-56 xl:h-56 rounded-2xl bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-light font-bold text-2xl sm:text-4xl lg:text-6xl items-center justify-center shadow-md ${
            participant.participant_photo ? 'hidden' : 'flex'
          }`}
        >
          {getInitial(participant.participant_name)}
        </div>
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1 lg:flex-none lg:mt-5 text-left lg:text-center">
        <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-neutral-800 dark:text-neutral-100 leading-snug truncate lg:whitespace-normal">
          {participant.participant_name}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate lg:whitespace-normal">
          {participant.user_department || '-'}
        </p>
        <div className="flex flex-wrap items-center lg:justify-center gap-2 mt-1.5 sm:mt-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500">
            Check-in: {checkinTime}
          </span>
        </div>
      </div>
    </div>
  )
}
