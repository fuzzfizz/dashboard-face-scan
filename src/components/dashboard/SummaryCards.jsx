import { CalendarDays, Users, UserCheck, UserPlus } from 'lucide-react'

export default function SummaryCards({ data = {}, loading, isToday = true, dateLabel = '' }) {
  const cards = [
    {
      key: 'eventCount',
      label: isToday ? 'กิจกรรมวันนี้' : 'กิจกรรมในช่วงที่เลือก',
      sublabel: dateLabel || (isToday ? 'วันนี้' : 'ช่วงเวลาที่เลือก'),
      icon: CalendarDays,
      color: 'text-primary',
      bgLight: 'bg-primary-light/50',
    },
    {
      key: 'totalParticipants',
      label: 'ผู้เข้าร่วมทั้งหมด',
      sublabel: 'สแกนเข้างาน',
      icon: Users,
      color: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      key: 'staffCount',
      label: 'Staff',
      sublabel: 'บุคลากร',
      icon: UserCheck,
      color: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      key: 'otherCount',
      label: 'Student & Guest',
      sublabel: 'นักศึกษา & บุคคลทั่วไป',
      icon: UserPlus,
      color: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 hover:border-neutral-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-600 truncate">{card.label}</p>
              <p className="text-3xl font-bold text-neutral-800 mt-1">
                {loading ? '...' : (data[card.key] ?? 0)}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">{card.sublabel}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgLight} ${card.color} shrink-0`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
