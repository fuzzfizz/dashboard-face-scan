import { getInitial } from '../../utils/helpers'

const typeDot = {
  staff: 'bg-green-500',
  student: 'bg-blue-500',
  guest: 'bg-yellow-500',
}

export default function ParticipantGrid({ participants, selectedId, onSelect }) {
  const sorted = [...participants].sort(
    (a, b) => new Date(b.regis_date) - new Date(a.regis_date)
  )

  return (
    <div className="overflow-y-auto flex-1">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2.5 text-left">รูป</th>
            <th className="px-3 py-2.5 text-left">ชื่อ</th>
            <th className="px-3 py-2.5 text-left">สังกัด</th>
            <th className="px-3 py-2.5 text-left">เวลา</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {sorted.map((p) => {
            const isSelected = p.regis_id === selectedId
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
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-light' : 'hover:bg-neutral-50'
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="relative">
                    {p.participant_photo ? (
                      <img
                        src={p.participant_photo}
                        alt={p.participant_name}
                        className="w-9 h-9 rounded-full object-cover"
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
                <td className="px-3 py-2.5 font-medium text-neutral-800">{p.participant_name}</td>
                <td className="px-3 py-2.5 text-neutral-500 text-xs">{p.user_department}</td>
                <td className="px-3 py-2.5 text-neutral-500 text-xs">{time}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
