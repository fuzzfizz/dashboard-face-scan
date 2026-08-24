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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-3.5 sm:p-5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 truncate">{card.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mt-1 tracking-tight">
                {loading ? '...' : (data[card.key] ?? 0)}
              </p>
              <p className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">{card.sublabel}</p>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${card.bgLight} dark:bg-opacity-20 ${card.color} shrink-0`}>
              <card.icon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
