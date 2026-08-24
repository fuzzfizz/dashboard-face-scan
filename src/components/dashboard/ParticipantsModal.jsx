import { X, Users, UserCheck, GraduationCap, UserPlus } from 'lucide-react'
import { useParticipants } from '../../hooks/useParticipants'
import { formatDateTime, getInitial } from '../../utils/helpers'

const typeBadge = {
  staff: 'bg-green-100 text-green-700',
  student: 'bg-blue-100 text-blue-700',
  guest: 'bg-yellow-100 text-yellow-700',
}

export default function ParticipantsModal({ eventId, onClose }) {
  const { event, summary, participants, loading, error } = useParticipants(eventId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-800">
              {event?.event_title || 'รายชื่อผู้เข้าร่วม'}
            </h2>
            {event && (
              <p className="text-sm text-neutral-500 mt-0.5">{event.event_addr} • {event.event_date}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-6 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-sm">
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> ทั้งหมด: <b>{summary.total}</b></span>
          <span className="flex items-center gap-1.5 text-green-700"><UserCheck className="w-4 h-4" /> Staff: <b>{summary.staff}</b></span>
          <span className="flex items-center gap-1.5 text-blue-700"><GraduationCap className="w-4 h-4" /> Student: <b>{summary.student}</b></span>
          <span className="flex items-center gap-1.5 text-yellow-700"><UserPlus className="w-4 h-4" /> Guest: <b>{summary.guest}</b></span>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading && <p className="p-8 text-center text-neutral-400">กำลังโหลด...</p>}
          {error && <p className="p-8 text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-4 py-2.5 text-left">รูป</th>
                  <th className="px-4 py-2.5 text-left">ชื่อ</th>
                  <th className="px-4 py-2.5 text-left">ประเภท</th>
                  <th className="px-4 py-2.5 text-left">สังกัด</th>
                  <th className="px-4 py-2.5 text-left">เวลา Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {participants.map((p, idx) => (
                  <tr key={p.regis_id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 text-neutral-400">{idx + 1}</td>
                    <td className="px-4 py-2.5">
                      {p.participant_photo ? (
                        <img
                          src={p.participant_photo}
                          alt={p.participant_name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                        />
                      ) : null}
                      <div
                        className={`w-8 h-8 rounded-full bg-primary-light text-primary font-bold text-xs items-center justify-center ${p.participant_photo ? 'hidden' : 'flex'}`}
                      >
                        {getInitial(p.participant_name)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-neutral-800">{p.participant_name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge[p.user_type] || typeBadge.guest}`}>
                        {p.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600">{p.user_department}</td>
                    <td className="px-4 py-2.5 text-neutral-600">{formatDateTime(p.regis_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
