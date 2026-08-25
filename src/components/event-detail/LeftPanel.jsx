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
} from 'lucide-react'
import QRCode from 'qrcode'
import { getInitial } from '../../utils/helpers'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

function StatCard({ icon: Icon, label, value, color, bgColor, iconBg }) {
  const displayValue = useCountUp(value)

  return (
    <div
      className={`${bgColor} rounded-2xl p-3 sm:p-4 2xl:p-5 3xl:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-3 shrink-0`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black ${color} truncate mb-0.5 3xl:mb-1.5`}>
          {label}
        </p>
        <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-7xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-2.5 sm:p-3 2xl:p-4 3xl:p-5 rounded-2xl ${iconBg} ${color} shrink-0`}>
        <Icon className="w-5 h-5 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8 3xl:w-12 3xl:h-12" />
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

  // Generate & download high-res PNG locally without network or tab navigation
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
    <div className="h-full flex flex-col p-3 sm:p-4 2xl:p-5 3xl:p-8 bg-slate-50/50 dark:bg-gray-950 transition-colors gap-3 sm:gap-3.5 3xl:gap-6 overflow-hidden">
      {/* 4 Stat Cards — Larger, bolder, more prominent numbers and labels */}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-3.5 3xl:gap-6 flex-1 min-h-0 overflow-hidden">
        {/* QR Code Card */}
        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-6 3xl:p-9 border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
          {/* Larger Title */}
          <p className="text-lg sm:text-xl 2xl:text-3xl 3xl:text-4xl font-black text-neutral-800 dark:text-neutral-100 mb-2 sm:mb-3 3xl:mb-5 shrink-0 text-center tracking-tight">
            QR Code สแกนเข้างาน
          </p>

          <div className="flex-1 min-h-0 flex items-center justify-center p-2.5 sm:p-3.5 bg-white rounded-2xl shadow-xs border border-neutral-200/80 max-h-[220px] sm:max-h-[270px] 2xl:max-h-[340px] 3xl:max-h-[460px] aspect-square w-full">
            {event?.qr_img ? (
              <img
                src={event.qr_img}
                alt="QR Code"
                className="w-full h-full object-contain rounded-xl"
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
            className="mt-2.5 sm:mt-3 3xl:mt-4 flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 3xl:px-5 3xl:py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm 3xl:text-base font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs shrink-0"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5" />
            <span>บันทึก QR Code</span>
          </button>
        </div>

        {/* Participant Info Card */}
        <div
          className={`h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-6 3xl:p-9 border shadow-sm transition-all duration-300 overflow-hidden ${
            isNewScan
              ? 'border-primary ring-4 sm:ring-8 ring-primary/20 shadow-xl animate-glow'
              : 'border-neutral-200/80 dark:border-neutral-800'
          }`}
        >
          {displayParticipant ? (
            <div
              className={`w-full flex flex-col items-center text-center justify-center transition-all duration-300 ${
                isNewScan ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Photo or Avatar */}
              <div className="relative mb-2.5 sm:mb-3 2xl:mb-4 3xl:mb-6 shrink-0">
                {displayParticipant.participant_photo ? (
                  <img
                    src={displayParticipant.participant_photo}
                    alt={displayParticipant.participant_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 2xl:w-32 2xl:h-32 3xl:w-48 3xl:h-48 rounded-full object-cover shadow-xl ring-4 sm:ring-6 ring-primary/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 2xl:w-32 2xl:h-32 3xl:w-48 3xl:h-48 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-black text-3xl sm:text-4xl 2xl:text-5xl 3xl:text-7xl items-center justify-center ring-4 sm:ring-6 ring-primary/20 shadow-xl ${
                    displayParticipant.participant_photo ? 'hidden' : 'flex'
                  }`}
                >
                  {getInitial(displayParticipant.participant_name)}
                </div>
              </div>

              {/* Participant Name */}
              <p className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 mb-1.5 sm:mb-2 3xl:mb-3.5 leading-snug truncate max-w-full px-2">
                {displayParticipant.participant_name}
              </p>

              {/* User Type Badge */}
              {displayParticipant.user_type && (
                <span
                  className={`inline-block px-3.5 py-1 sm:px-4 sm:py-1.5 3xl:px-6 3xl:py-2 rounded-full text-xs sm:text-sm 2xl:text-base 3xl:text-xl font-black border mb-2 sm:mb-2.5 3xl:mb-5 shadow-2xs shrink-0 ${
                    typeBadge[displayParticipant.user_type]?.class || typeBadge.guest.class
                  }`}
                >
                  {typeBadge[displayParticipant.user_type]?.label || 'Guest'}
                </span>
              )}

              {/* Meta Details */}
              <div className="space-y-1 sm:space-y-1.5 3xl:space-y-3 text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-600 dark:text-neutral-300">
                <p className="flex items-center justify-center gap-1.5">
                  <Building className="w-4 h-4 2xl:w-5 2xl:h-5 3xl:w-7 3xl:h-7 text-neutral-400 shrink-0" />
                  <span className="truncate max-w-[260px] sm:max-w-md font-medium">{displayParticipant.user_department || '-'}</span>
                </p>
                <p className="flex items-center justify-center gap-1.5 font-black text-neutral-800 dark:text-neutral-100">
                  <Clock className="w-4 h-4 2xl:w-5 2xl:h-5 3xl:w-7 3xl:h-7 text-primary shrink-0" />
                  <span>เวลาสแกน: {scanTime}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 3xl:w-28 3xl:h-28 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 3xl:mb-4 animate-pulse">
                <User className="w-8 h-8 sm:w-10 sm:h-10 3xl:w-14 3xl:h-14 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base 2xl:text-xl 3xl:text-2xl text-neutral-400 dark:text-neutral-500 font-bold">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
