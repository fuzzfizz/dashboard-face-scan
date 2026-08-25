import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Users,
  UserCheck,
  GraduationCap,
  UserPlus,
  Download,
  QrCode,
} from 'lucide-react'
import QRCode from 'qrcode'

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
      <span className={`absolute top-3 left-3 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-t-2 border-l-2 ${color} rounded-tl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-t-2 border-r-2 ${color} rounded-tr-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-3 left-3 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-b-2 border-l-2 ${color} rounded-bl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-3 right-3 w-4 h-4 sm:w-5 sm:h-5 3xl:w-8 3xl:h-8 border-b-2 border-r-2 ${color} rounded-br-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
    </>
  )
}

function StatCard({ icon: Icon, label, value, color, bgColor, iconBg }) {
  const displayValue = useCountUp(value)

  return (
    <div
      className={`${bgColor} rounded-2xl p-3.5 sm:p-4 2xl:p-5 3xl:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5 sm:gap-3 shrink-0 relative overflow-hidden`}
    >
      <div className="min-w-0 flex-1 relative z-10">
        <p className={`text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black ${color} truncate mb-0.5 3xl:mb-1.5`}>
          {label}
        </p>
        <p className="text-xl sm:text-2xl 2xl:text-4xl 3xl:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-2.5 sm:p-3 2xl:p-3.5 3xl:p-5 rounded-2xl ${iconBg} ${color} shrink-0 relative z-10`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-8 2xl:h-8 3xl:w-12 3xl:h-12" />
      </div>
    </div>
  )
}

export default function LeftPanel({ event, summary }) {
  const total = summary?.total ?? 0

  // Multi-tier QR Code downloader
  const handleSaveQR = useCallback(async () => {
    if (!event) return
    const cleanTitle = (event.event_title || 'event').replace(/[^\w\u0E00-\u0E7F-]/g, '_')
    const fileName = `QR-${cleanTitle}.png`

    try {
      if (event.qr_img && event.qr_img.startsWith('data:')) {
        const a = document.createElement('a')
        a.href = event.qr_img
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        return
      }

      const qrData = event.qr_img || `EVENT-${event.event_id || 'CHECKIN'}`
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 1024,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Failed to generate/download QR Code:', err)
    }
  }, [event])

  return (
    <div className="h-full flex flex-col p-3.5 sm:p-5 2xl:p-6 3xl:p-10 bg-slate-50/50 dark:bg-gray-950 transition-colors gap-3.5 sm:gap-5 3xl:gap-8 lg:overflow-hidden">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 3xl:gap-6 shrink-0">
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

      {/* Prominent Full-Panel QR Code Card */}
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-7 2xl:p-8 3xl:p-12 border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden min-h-[360px] sm:min-h-0">
        <ReticleCorners />

        {/* Title and Instruction */}
        <div className="text-center mb-3 sm:mb-4 2xl:mb-5 3xl:mb-8 shrink-0 relative z-10">
          <p className="text-lg sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
            QR Code สแกนเข้างาน
          </p>
          <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-500 dark:text-neutral-400 mt-1 3xl:mt-2 font-medium">
            สแกนด้วยกล้องมือถือเพื่อลงทะเบียนและบันทึกเวลาเข้าร่วมงาน
          </p>
        </div>

        {/* Large Centered QR Code Image Frame */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 3xl:p-6 bg-white rounded-3xl shadow-md border-2 border-neutral-100 dark:border-neutral-800/80 max-h-[220px] sm:max-h-[300px] 2xl:max-h-[380px] 3xl:max-h-[560px] aspect-square w-full">
          {event?.qr_img ? (
            <img
              src={event.qr_img}
              alt="QR Code สแกนเข้างาน"
              className="w-full h-full object-contain rounded-2xl relative z-10"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 gap-2">
              <QrCode className="w-12 h-12 3xl:w-20 3xl:h-20 text-neutral-300 dark:text-neutral-700" />
              <span className="text-sm sm:text-base 3xl:text-2xl font-bold">ไม่มี QR Code สำหรับกิจกรรมนี้</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 sm:mt-5 3xl:mt-8 shrink-0 relative z-20">
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 3xl:px-9 3xl:py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" />
            <span>บันทึก QR Code</span>
          </button>
        </div>
      </div>
    </div>
  )
}
