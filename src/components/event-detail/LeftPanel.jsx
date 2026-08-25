import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, UserCheck, GraduationCap, UserPlus, Download, Sparkles } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function StatCard({ icon: Icon, label, value, total, color, bgColor, barColor }) {
  const displayValue = useCountUp(value)
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className={`${bgColor} rounded-xl p-3 sm:p-4 3xl:p-6`}>
      <div className="flex items-center gap-2 3xl:gap-3 mb-1">
        <Icon className={`w-4 h-4 3xl:w-6 3xl:h-6 ${color}`} />
        <span className={`text-xs 3xl:text-lg font-medium ${color}`}>{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
        {displayValue.toLocaleString()}
      </p>
      <div className="mt-2 3xl:mt-3 h-1.5 3xl:h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full animate-progress-fill`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function LeftPanel({ event, summary, latestParticipant }) {
  const total = summary?.total ?? 0
  const prevLatestRef = useRef(null)
  const [isNewScan, setIsNewScan] = useState(false)

  useEffect(() => {
    if (latestParticipant && latestParticipant.regis_id !== prevLatestRef.current) {
      prevLatestRef.current = latestParticipant.regis_id
      setIsNewScan(true)
      const timer = setTimeout(() => setIsNewScan(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [latestParticipant])

  const handleSaveQR = useCallback(async () => {
    if (!event?.qr_img) return
    try {
      const response = await fetch(event.qr_img)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR-${event.event_title || 'event'}-${event.event_date || 'unknown'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to save QR code:', err)
    }
  }, [event])

  const scanTime = latestParticipant?.regis_date
    ? new Date(latestParticipant.regis_date).toLocaleTimeString('th-TH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : null

  const typeBadge = {
    staff: { label: 'Staff', class: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400' },
    student: { label: 'Student', class: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400' },
    guest: { label: 'Guest', class: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 3xl:p-10 overflow-y-auto bg-white dark:bg-neutral-900 transition-colors">
      {/* Summary Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 3xl:gap-5 mb-6 3xl:mb-10">
        <StatCard
          icon={Users} label="ทั้งหมด" value={total} total={total}
          color="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-50 dark:bg-indigo-950/30"
          barColor="bg-indigo-500"
        />
        <StatCard
          icon={UserCheck} label="Staff" value={summary?.staff ?? 0} total={total}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-50 dark:bg-green-950/30"
          barColor="bg-green-500"
        />
        <StatCard
          icon={GraduationCap} label="Student" value={summary?.student ?? 0} total={total}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          barColor="bg-blue-500"
        />
        <StatCard
          icon={UserPlus} label="Guest" value={summary?.guest ?? 0} total={total}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
          barColor="bg-amber-500"
        />
      </div>

      {/* QR Code + Latest Scan — Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 3xl:gap-6 flex-1 min-h-0">
        {/* QR Code */}
        <div className="flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl p-4 3xl:p-8 border border-neutral-200 dark:border-neutral-800">
          {event?.qr_img ? (
            <img
              src={event.qr_img}
              alt="QR Code"
              className="w-40 h-40 sm:w-52 sm:h-52 2xl:w-64 2xl:h-64 3xl:w-80 3xl:h-80 rounded-xl shadow-sm object-contain"
            />
          ) : (
            <div className="w-40 h-40 sm:w-52 sm:h-52 2xl:w-64 2xl:h-64 3xl:w-80 3xl:h-80 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <span className="text-sm 3xl:text-xl">ไม่มี QR Code</span>
            </div>
          )}
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="mt-4 3xl:mt-6 flex items-center gap-2 px-4 py-2 3xl:px-6 3xl:py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm 3xl:text-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 3xl:w-5 3xl:h-5" />
            บันทึก QR Code
          </button>
        </div>

        {/* Latest Scan Card */}
        <div className={`flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl p-4 3xl:p-8 border transition-all duration-300 ${
          isNewScan ? 'border-primary animate-glow' : 'border-neutral-200 dark:border-neutral-800'
        }`}>
          {latestParticipant ? (
            <div className={`text-center transition-all duration-200 ${isNewScan ? 'scale-105' : 'scale-100'}`}>
              <div className="flex items-center justify-center gap-2 mb-3 3xl:mb-5">
                <span className={`w-2.5 h-2.5 3xl:w-3.5 3xl:h-3.5 rounded-full bg-green-500 ${isNewScan ? 'animate-pulse' : ''}`} />
                <span className="text-xs 3xl:text-lg font-semibold text-green-600 dark:text-green-400">
                  สแกนล่าสุด
                </span>
                {isNewScan && <Sparkles className="w-4 h-4 3xl:w-5 3xl:h-5 text-primary animate-bounce" />}
              </div>
              <p className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-1 3xl:mb-2">
                {latestParticipant.participant_name}
              </p>
              {latestParticipant.user_type && (
                <span className={`inline-block px-3 py-1 3xl:px-5 3xl:py-2 rounded-full text-xs 3xl:text-lg font-medium mb-2 3xl:mb-3 ${
                  typeBadge[latestParticipant.user_type]?.class || typeBadge.guest.class
                }`}>
                  {typeBadge[latestParticipant.user_type]?.label || 'Guest'}
                </span>
              )}
              <p className="text-sm 3xl:text-xl text-neutral-500 dark:text-neutral-400 mb-1">
                {latestParticipant.user_department || '-'}
              </p>
              <p className="text-sm 3xl:text-xl font-medium text-neutral-600 dark:text-neutral-300">
                ⏰ {scanTime}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 3xl:w-24 3xl:h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 3xl:mb-5 animate-pulse">
                <span className="text-2xl 3xl:text-4xl text-neutral-400">?</span>
              </div>
              <p className="text-sm 3xl:text-xl text-neutral-400 dark:text-neutral-500">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
