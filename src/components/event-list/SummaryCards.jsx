import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Users, UserCheck, UserPlus } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function AnimatedCard({ card, value, loading, index }) {
  const displayValue = useCountUp(loading ? 0 : value)

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 3xl:p-8 hover:border-primary/30 dark:hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm 3xl:text-lg font-medium text-neutral-600 dark:text-neutral-400 truncate">
            {card.label}
          </p>
          <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl font-bold text-neutral-800 dark:text-neutral-100 mt-1 tracking-tight">
            {loading ? '...' : displayValue.toLocaleString()}
          </p>
          <p className="text-[11px] sm:text-xs 3xl:text-base text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
            {card.sublabel}
          </p>
        </div>
        <div className={`p-2 sm:p-3 3xl:p-4 rounded-xl ${card.bgLight} ${card.color} shrink-0`}>
          <card.icon className="w-4 h-4 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8" />
        </div>
      </div>
    </div>
  )
}

export default function SummaryCards({ data = {}, loading, dateLabel = '' }) {
  const cards = [
    {
      key: 'eventCount',
      label: 'กิจกรรมทั้งหมด',
      sublabel: dateLabel || 'ช่วงเวลาที่เลือก',
      icon: CalendarDays,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      key: 'totalParticipants',
      label: 'ผู้เข้าร่วมทั้งหมด',
      sublabel: 'สแกนเข้างาน',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      key: 'staffCount',
      label: 'Staff',
      sublabel: 'บุคลากร',
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgLight: 'bg-green-50 dark:bg-green-950/50',
    },
    {
      key: 'otherCount',
      label: 'Student & Guest',
      sublabel: 'นักศึกษา & บุคคลทั่วไป',
      icon: UserPlus,
      color: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 3xl:gap-6">
      {cards.map((card, index) => (
        <AnimatedCard
          key={card.key}
          card={card}
          value={data[card.key] ?? 0}
          loading={loading}
          index={index}
        />
      ))}
    </div>
  )
}
