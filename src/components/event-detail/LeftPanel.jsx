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
      className={`${bgColor} rounded-2xl p-2.5 sm:p-3 2xl:p-4 3xl:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-2.5 shrink-0`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[11px] sm:text-xs 2xl:text-sm 3xl:text-lg font-bold ${color} truncate mb-0.5`}>
          {label}
        </p>
        <p className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-2 sm:p-2.5 3xl:p-4 rounded-xl ${iconBg} ${color} shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6 3xl:w-9 3xl:h-9" />
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
    if (!event?.qr_img) return
    const cleanTitle = (event.event_title || 'event').replace(/[\s/\\?%*:|"<>]/g, '_')
    const fileName = `QR-${cleanTitle}.png`

    // Method 1: Fetch + Blob download
    try {
      const response = await fetch(event.qr_img, { mode: 'cors' })
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
      }
    } catch (err) {
      console.warn('Direct fetch QR failed, attempting canvas conversion...', err)
    }

    // Method 2: Image + Canvas
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = event.qr_img + (event.qr_img.includes('?') ? '&' : '?') + 't=' + Date.now()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 600
      canvas.height = img.naturalHeight || 600
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    } catch (err2) {
      console.warn('Canvas conversion failed, fallback to direct link...', err2)
    }

    // Method 3: Direct anchor click
    const a = document.createElement('a')
    a.href = event.qr_img
    a.target = '_blank'
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
    <div className="h-full flex flex-col p-3 sm:p-4 2xl:p-6 3xl:p-8 bg-slate-50/50 dark:bg-gray-950 transition-colors gap-3 sm:gap-4 3xl:gap-6 overflow-hidden">
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

      {/* QR Code Card + Participant Info Card — Extra Large & High Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 3xl:gap-6 flex-1 min-h-0 overflow-hidden">
        {/* QR Code Card — Extra Large */}
        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-7 3xl:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
          <p className="text-base sm:text-lg 2xl:text-2xl 3xl:text-3xl font-black text-neutral-800 dark:text-neutral-100 mb-2 sm:mb-3 3xl:mb-5 shrink-0">
            QR Code สแกนเข้างาน
          </p>
          <div className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-neutral-200/80 max-h-[220px] sm:max-h-[270px] 2xl:max-h-[340px] 3xl:max-h-[460px] aspect-square w-full">
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
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="mt-3 sm:mt-4 3xl:mt-6 flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3.5 3xl:px-10 3xl:py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-extrabold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" />
            <span>บันทึก QR Code</span>
          </button>
        </div>

        {/* Participant Info Card — Extra Large & High Impact */}
        <div
          className={`h-full flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 2xl:p-7 3xl:p-10 border shadow-sm transition-all duration-300 overflow-hidden ${
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
              {/* Extra Large Photo or Avatar */}
              <div className="relative mb-3 sm:mb-4 2xl:mb-5 3xl:mb-8 shrink-0">
                {displayParticipant.participant_photo ? (
                  <img
                    src={displayParticipant.participant_photo}
                    alt={displayParticipant.participant_name}
                    className="w-22 h-22 sm:w-28 sm:h-28 2xl:w-36 2xl:h-36 3xl:w-52 3xl:h-52 rounded-full object-cover shadow-xl ring-4 sm:ring-6 ring-primary/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-22 h-22 sm:w-28 sm:h-28 2xl:w-36 2xl:h-36 3xl:w-52 3xl:h-52 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-black text-3xl sm:text-4xl 2xl:text-5xl 3xl:text-7xl items-center justify-center ring-4 sm:ring-6 ring-primary/20 shadow-xl ${
                    displayParticipant.participant_photo ? 'hidden' : 'flex'
                  }`}
                >
                  {getInitial(displayParticipant.participant_name)}
                </div>
              </div>

              {/* Extra Large Participant Name */}
              <p className="text-xl sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 mb-1.5 sm:mb-2 3xl:mb-4 leading-snug truncate max-w-full px-2">
                {displayParticipant.participant_name}
              </p>

              {/* Extra Large User Type Badge */}
              {displayParticipant.user_type && (
                <span
                  className={`inline-block px-4 py-1 sm:px-5 sm:py-1.5 3xl:px-8 3xl:py-2.5 rounded-full text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-black border mb-2.5 sm:mb-3.5 3xl:mb-6 shadow-2xs shrink-0 ${
                    typeBadge[displayParticipant.user_type]?.class || typeBadge.guest.class
                  }`}
                >
                  {typeBadge[displayParticipant.user_type]?.label || 'Guest'}
                </span>
              )}

              {/* Extra Large Meta Details */}
              <div className="space-y-1.5 sm:space-y-2 3xl:space-y-4 text-sm sm:text-base 2xl:text-xl 3xl:text-3xl text-neutral-600 dark:text-neutral-300">
                <p className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6 3xl:w-8 3xl:h-8 text-neutral-400 shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-md font-medium">{displayParticipant.user_department || '-'}</span>
                </p>
                <p className="flex items-center justify-center gap-2 font-black text-neutral-800 dark:text-neutral-100">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6 3xl:w-8 3xl:h-8 text-primary shrink-0" />
                  <span>เวลาสแกน: {scanTime}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="w-18 h-18 sm:w-22 sm:h-22 3xl:w-32 3xl:h-32 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 3xl:mb-5 animate-pulse">
                <User className="w-9 h-9 sm:w-11 sm:h-11 3xl:w-16 3xl:h-16 text-neutral-400" />
              </div>
              <p className="text-sm sm:text-base 2xl:text-xl 3xl:text-3xl text-neutral-400 dark:text-neutral-500 font-bold">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
