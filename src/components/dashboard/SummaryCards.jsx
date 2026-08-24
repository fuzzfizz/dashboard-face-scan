import { CalendarDays, Users, UserCheck, UserPlus } from 'lucide-react'

const cards = [
  { key: 'eventCount', label: 'กิจกรรมวันนี้', icon: CalendarDays, color: 'text-primary' },
  { key: 'totalParticipants', label: 'ผู้เข้าร่วมทั้งหมด', icon: Users, color: 'text-blue-600' },
  { key: 'staffCount', label: 'Staff', icon: UserCheck, color: 'text-green-600' },
  { key: 'otherCount', label: 'Student & Guest', icon: UserPlus, color: 'text-yellow-600' },
]

export default function SummaryCards({ data = {}, loading }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.key} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{card.label}</p>
              <p className="text-3xl font-bold text-neutral-800 mt-1">
                {loading ? '...' : (data[card.key] ?? 0)}
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-neutral-50 ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
