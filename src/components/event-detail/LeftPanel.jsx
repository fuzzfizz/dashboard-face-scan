import { useState, useEffect, useRef } from 'react'
import {
  Users,
  UserCheck,
  GraduationCap,
  UserPlus,
  QrCode,
} from 'lucide-react'

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target || 0)
  const prevValueRef = useRef(target || 0)
  const rafRef = useRef(null)

  useEffect(() => {
    const startVal = prevValueRef.current
    if (startVal === target) return

    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startVal + (target - startVal) * eased)
      setValue(current)
      prevValueRef.current = current
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevValueRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

/* === Sci-Fi HUD Reticle Corner Brackets === */
function ReticleCorners({ color = 'border-primary/80 dark:border-cyan-400/80' }) {
  return (
    <>
      <span className={`absolute top-3.5 left-3.5 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-t-2 border-l-2 ${color} rounded-tl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute top-3.5 right-3.5 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-t-2 border-r-2 ${color} rounded-tr-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-3.5 left-3.5 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-b-2 border-l-2 ${color} rounded-bl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-3.5 right-3.5 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-b-2 border-r-2 ${color} rounded-br-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
    </>
  )
}

function StatCard({ icon: Icon, label, value, color, bgColor, iconBg }) {
  const displayValue = useCountUp(value)

  return (
    <div
      className={`${bgColor} rounded-3xl px-6 py-5 sm:px-7 sm:py-5.5 2xl:px-8 2xl:py-6.5 3xl:px-12 3xl:py-9 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-4 sm:gap-5 3xl:gap-8 flex-1 relative overflow-hidden`}
    >
      <div className="min-w-0 flex-1 relative z-10">
        <p className={`text-sm sm:text-base 2xl:text-lg 3xl:text-3xl font-black ${color} truncate mb-1 sm:mb-1.5 3xl:mb-2.5`}>
          {label}
        </p>
        <p className="text-2xl sm:text-3xl 2xl:text-5xl 3xl:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-none">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-3.5 sm:p-4 2xl:p-4.5 3xl:p-6 rounded-2xl ${iconBg} ${color} shrink-0 relative z-10`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-9 2xl:h-9 3xl:w-14 3xl:h-14" />
      </div>
    </div>
  )
}

export default function LeftPanel({ event, summary }) {
  const total = summary?.total ?? 0

  return (
    <div className="h-full flex flex-col md:flex-row p-3.5 sm:p-5 2xl:p-6 3xl:p-10 bg-slate-50/50 dark:bg-gray-950 transition-colors gap-3.5 sm:gap-5 3xl:gap-8 lg:overflow-hidden">
      {/* Left Column: 4 Stat Cards Stack */}
      <div className="w-full md:w-[40%] lg:w-[36%] xl:w-[34%] shrink-0 flex flex-col gap-3 sm:gap-4 3xl:gap-6">
        <StatCard
          icon={Users}
          label="ผู้เข้าร่วมทั้งหมด"
          value={total}
          color="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-indigo-50 dark:bg-indigo-950/60"
        />
        <StatCard
          icon={UserCheck}
          label="Staff"
          value={summary?.staff ?? 0}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-green-50 dark:bg-green-950/60"
        />
        <StatCard
          icon={GraduationCap}
          label="Student"
          value={summary?.student ?? 0}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-blue-50 dark:bg-blue-950/60"
        />
        <StatCard
          icon={UserPlus}
          label="Guest"
          value={summary?.guest ?? 0}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
        />
      </div>

      {/* Right Column: Giant QR Code Card */}
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-7 2xl:p-8 3xl:p-12 border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[340px] sm:min-h-0">
        <ReticleCorners />

        {/* Title */}
        <p className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight text-center mb-4 sm:mb-6 3xl:mb-10 shrink-0 relative z-10">
          QR code สแกนเข้าร่วมกิจกรรม
        </p>

        {/* Giant Centered QR Code Image Frame */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 sm:p-6 3xl:p-10 bg-white rounded-3xl shadow-md border-2 border-neutral-100 dark:border-neutral-800/80 max-h-[280px] sm:max-h-[380px] 2xl:max-h-[480px] 3xl:max-h-[720px] aspect-square w-full">
          {event?.qr_img ? (
            <img
              src={event.qr_img}
              alt="QR code สแกนเข้าร่วมกิจกรรม"
              className="w-full h-full object-contain rounded-2xl relative z-10"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-2">
              <QrCode className="w-16 h-16 3xl:w-28 3xl:h-28 text-neutral-300 dark:text-neutral-700" />
              <span className="text-base sm:text-lg 3xl:text-2xl font-bold">ไม่มี QR Code สำหรับกิจกรรมนี้</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
