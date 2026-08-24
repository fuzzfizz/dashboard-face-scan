import { getInitial } from '../../utils/helpers'

const typeBadge = {
  staff: { bg: 'bg-green-100 text-green-700', label: 'Staff' },
  student: { bg: 'bg-blue-100 text-blue-700', label: 'Student' },
  guest: { bg: 'bg-yellow-100 text-yellow-700', label: 'Guest' },
}

export default function PhotoDisplay({ participant }) {
  if (!participant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <div className="w-48 h-48 rounded-full bg-neutral-200 flex items-center justify-center mb-4">
          <span className="text-6xl">?</span>
        </div>
        <p className="text-lg">รอผู้เข้าร่วม...</p>
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
    <div className="flex flex-col items-center justify-center h-full p-6">
      {participant.participant_photo ? (
        <img
          src={participant.participant_photo}
          alt={participant.participant_name}
          className="w-56 h-56 rounded-2xl object-cover shadow-lg border-4 border-white"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}
      <div
        className={`w-56 h-56 rounded-2xl bg-primary-light text-primary font-bold text-7xl items-center justify-center shadow-lg ${participant.participant_photo ? 'hidden' : 'flex'}`}
      >
        {getInitial(participant.participant_name)}
      </div>

      <div className="mt-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-800">{participant.participant_name}</h2>
        <p className="text-neutral-500 mt-1">{participant.user_department}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${badge.bg}`}>
          {badge.label}
        </span>
        <p className="text-neutral-400 text-sm mt-2">Check-in: {checkinTime}</p>
      </div>
    </div>
  )
}
