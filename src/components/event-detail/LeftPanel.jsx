import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Users,
  UserCheck,
  GraduationCap,
  UserPlus,
  Download,
  Clock,
  Building,
  User,
  Sparkles,
} from 'lucide-react'
import QRCode from 'qrcode'
import { getInitial } from '../../utils/helpers'

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
      <span className={`absolute top-2.5 left-2.5 w-3.5 h-3.5 3xl:w-6 3xl:h-6 border-t-2 border-l-2 ${color} rounded-tl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute top-2.5 right-2.5 w-3.5 h-3.5 3xl:w-6 3xl:h-6 border-t-2 border-r-2 ${color} rounded-tr-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-2.5 left-2.5 w-3.5 h-3.5 3xl:w-6 3xl:h-6 border-b-2 border-l-2 ${color} rounded-bl-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
      <span className={`absolute bottom-2.5 right-2.5 w-3.5 h-3.5 3xl:w-6 3xl:h-6 border-b-2 border-r-2 ${color} rounded-br-xs pointer-events-none opacity-80 animate-reticle-breathe`} />
    </>
  )
}

/* === Dual Rotating HUD Target Rings === */
function HudTargetRings() {
  return (
    <div className="absolute inset-[-14px] sm:inset-[-18px] 2xl:inset-[-22px] 3xl:inset-[-36px] pointer-events-none z-0">
      {/* Outer Segmented HUD Ring (Clockwise) */}
      <svg
        className="w-full h-full animate-hud-cw text-primary/45 dark:text-cyan-400/50"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="18 10 35 12 18 10"
        />
        <circle cx="50" cy="4" r="1.5" fill="currentColor" />
        <circle cx="96" cy="50" r="1.5" fill="currentColor" />
        <circle cx="50" cy="96" r="1.5" fill="currentColor" />
        <circle cx="4" cy="50" r="1.5" fill="currentColor" />
      </svg>

      {/* Inner Target Ring (Counter-Clockwise) */}
      <svg
        className="absolute inset-[5px] 3xl:inset-[9px] w-[calc(100%-10px)] 3xl:w-[calc(100%-18px)] h-[calc(100%-10px)] 3xl:h-[calc(100%-18px)] animate-hud-ccw text-indigo-500/35 dark:text-indigo-400/40"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="8 8 20 8"
        />
      </svg>
    </div>
  )
}

/* === Live Radar Concentric Waves === */
function RadarRippleWaves() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="absolute w-full h-full rounded-full border-2 border-primary/25 dark:border-cyan-400/30 animate-radar-wave" />
      <div className="absolute w-full h-full rounded-full border-2 border-indigo-400/20 dark:border-indigo-400/25 animate-radar-wave-delayed" />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color, bgColor, iconBg }) {
  const displayValue = useCountUp(value)

  return (
    <div
      className={`${bgColor} rounded-2xl p-3 sm:p-4 2xl:p-5 3xl:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5 sm:gap-3 shrink-0 relative overflow-hidden`}
    >
      <div className="min-w-0 flex-1 relative z-10">
        <p className={`text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black ${color} truncate mb-0.5 3xl:mb-1.5`}>
          {label}
        </p>
        <p className="text-xl sm:text-2xl 2xl:text-4xl 3xl:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-2 sm:p-2.5 2xl:p-3.5 3xl:p-5 rounded-2xl ${iconBg} ${color} shrink-0 relative z-10`}>
        <Icon className="w-4 h-4 sm:w-6 sm:h-6 2xl:w-8 2xl:h-8 3xl:w-12 3xl:h-12" />
      </div>
    </div>
  )
}

export default function LeftPanel({
  event,
  summary,
  displayParticipant,
  isSelectedParticipant = false,
}) {
  const total = summary?.total ?? 0
  const prevLatestRef = useRef(null)
  const [isNewScan, setIsNewScan] = useState(false)

  // Trigger animation when a new person is added
  useEffect(() => {
    if (!isSelectedParticipant && displayParticipant && displayParticipant.regis_id !== prevLatestRef.current) {
      prevLatestRef.current = displayParticipant.regis_id
      setIsNewScan(true)
      const timer = setTimeout(() => setIsNewScan(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [displayParticipant, isSelectedParticipant])

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

  const scanTime = displayParticipant?.regis_date
    ? new Date(displayParticipant.regis_date).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null

  const typeBadge = {
    staff: {
      label: 'Staff (บุคลากร)',
      class: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    },
    student: {
      label: 'Student (นักศึกษา)',
      class: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    guest: {
      label: 'Guest (บุคคลภายนอก)',
      class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  }

  return (
    <div className="h-full flex flex-col p-3.5 sm:p-4 2xl:p-5 3xl:p-8 bg-slate-50/50 dark:bg-gray-950 transition-colors gap-3.5 sm:gap-4 3xl:gap-6 lg:overflow-hidden">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 3xl:gap-5 shrink-0">
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

      {/* QR Code Card + Participant Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 3xl:gap-6 flex-1 min-h-0 lg:overflow-hidden">
        {/* QR Code Card with Laser Scanner & Reticle */}
        <div className="relative flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-6 3xl:p-9 border border-neutral-200/80 dark:border-neutral-800 shadow-sm min-h-[260px] sm:min-h-0 overflow-hidden">
          <ReticleCorners />

          <p className="text-base sm:text-lg 2xl:text-2xl 3xl:text-4xl font-black text-neutral-800 dark:text-neutral-100 mb-2 sm:mb-3 3xl:mb-5 shrink-0 text-center tracking-tight">
            QR Code สแกนเข้างาน
          </p>

          {/* QR Code Container */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center p-2.5 sm:p-3.5 bg-white rounded-2xl shadow-xs border border-neutral-200/80 max-h-[190px] sm:max-h-[240px] 2xl:max-h-[300px] 3xl:max-h-[440px] aspect-square w-full overflow-hidden">
            {event?.qr_img ? (
              <img
                src={event.qr_img}
                alt="QR Code"
                className="w-full h-full object-contain rounded-xl relative z-0"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <span className="text-base sm:text-lg font-bold">ไม่มี QR Code</span>
              </div>
            )}
          </div>

          {/* Compact Save Button */}
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="mt-2.5 sm:mt-3 3xl:mt-4 flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 3xl:px-5 3xl:py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm 3xl:text-base font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0 relative z-20"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5" />
            <span>บันทึก QR Code</span>
          </button>
        </div>

        {/* Participant Info Card with Dual HUD Reticle & Radar Waves */}
        <div
          className={`relative flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-6 3xl:p-9 border shadow-sm transition-all duration-300 min-h-[260px] sm:min-h-0 overflow-hidden ${
            isNewScan
              ? 'border-primary ring-4 sm:ring-8 ring-primary/20 shadow-xl animate-glow'
              : 'border-neutral-200/80 dark:border-neutral-800'
          }`}
        >
          <ReticleCorners />

          {displayParticipant ? (
            <div
              className={`w-full flex flex-col items-center text-center justify-center transition-all duration-300 relative z-10 ${
                isNewScan ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Photo or Avatar with Dual HUD Target Rings & Radar Waves */}
              <div className="relative mb-2.5 sm:mb-3 2xl:mb-4 3xl:mb-6 shrink-0 flex items-center justify-center">
                {/* Continuous Radar Ripple Waves */}
                <RadarRippleWaves />

                {/* Continuous Dual Rotating HUD Rings */}
                <HudTargetRings />

                {displayParticipant.participant_photo ? (
                  <img
                    src={displayParticipant.participant_photo}
                    alt={displayParticipant.participant_name}
                    className="w-18 h-18 sm:w-22 sm:h-22 2xl:w-28 2xl:h-28 3xl:w-44 3xl:h-44 rounded-full object-cover shadow-xl ring-4 sm:ring-6 ring-primary/30 relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-18 h-18 sm:w-22 sm:h-22 2xl:w-28 2xl:h-28 3xl:w-44 3xl:h-44 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-black text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl items-center justify-center ring-4 sm:ring-6 ring-primary/30 shadow-xl relative z-10 ${
                    displayParticipant.participant_photo ? 'hidden' : 'flex'
                  }`}
                >
                  {getInitial(displayParticipant.participant_name)}
                </div>
              </div>

              {/* Participant Name */}
              <p className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-4xl font-black text-neutral-800 dark:text-neutral-100 mb-1 sm:mb-1.5 3xl:mb-3 leading-snug truncate max-w-full px-2">
                {displayParticipant.participant_name}
              </p>

              {/* User Type Badge */}
              {displayParticipant.user_type && (
                <span
                  className={`inline-block px-3.5 py-0.5 sm:px-4 sm:py-1 3xl:px-6 3xl:py-2 rounded-full text-xs sm:text-sm 2xl:text-base 3xl:text-xl font-black border mb-2 sm:mb-2.5 3xl:mb-4 shadow-2xs shrink-0 ${
                    typeBadge[displayParticipant.user_type]?.class || typeBadge.guest.class
                  }`}
                >
                  {typeBadge[displayParticipant.user_type]?.label || 'Guest'}
                </span>
              )}

              {/* Meta Details */}
              <div className="space-y-1 sm:space-y-1.5 3xl:space-y-2.5 text-xs sm:text-sm 2xl:text-base 3xl:text-xl text-neutral-600 dark:text-neutral-300">
                <p className="flex items-center justify-center gap-1.5">
                  <Building className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 3xl:w-6 3xl:h-6 text-neutral-400 shrink-0" />
                  <span className="truncate max-w-[240px] sm:max-w-md font-medium">{displayParticipant.user_department || '-'}</span>
                </p>
                <p className="flex items-center justify-center gap-1.5 font-black text-neutral-800 dark:text-neutral-100">
                  <Clock className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 3xl:w-6 3xl:h-6 text-primary shrink-0" />
                  <span>เวลาสแกน: {scanTime}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 relative z-10">
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 3xl:w-32 3xl:h-32 mx-auto mb-2.5 sm:mb-3 3xl:mb-4 flex items-center justify-center">
                <RadarRippleWaves />
                <HudTargetRings />
                <div className="w-14 h-14 sm:w-16 sm:h-16 3xl:w-24 3xl:h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center relative z-10 shadow-md">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 3xl:w-12 3xl:h-12 text-neutral-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-xl text-neutral-400 dark:text-neutral-500 font-bold">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
