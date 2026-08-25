import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, UserCheck, GraduationCap, UserPlus, Download, Sparkles, User, Clock, Building } from 'lucide-react'
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
      className={`${bgColor} rounded-2xl p-4 3xl:p-7 border border-neutral-200/60 dark:border-neutral-800/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-xs 3xl:text-lg font-bold ${color} truncate mb-1`}>{label}</p>
        <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl font-extrabold text-neutral-800 dark:text-neutral-100 tracking-tight">
          {displayValue.toLocaleString()}
        </p>
      </div>
      <div className={`p-2.5 sm:p-3 3xl:p-5 rounded-2xl ${iconBg} ${color} shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-9 3xl:h-9" />
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

  useEffect(() => {
    if (!isSelectedParticipant && displayParticipant && displayParticipant.regis_id !== prevLatestRef.current) {
      prevLatestRef.current = displayParticipant.regis_id
      setIsNewScan(true)
      const timer = setTimeout(() => setIsNewScan(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [displayParticipant, isSelectedParticipant])

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

  const scanTime = displayParticipant?.regis_date
    ? new Date(displayParticipant.regis_date).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null

  const typeBadge = {
    staff: { label: 'Staff (บุคลากร)', class: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
    student: { label: 'Student (นักศึกษา)', class: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    guest: { label: 'Guest (บุคคลภายนอก)', class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 3xl:p-10 overflow-y-auto bg-slate-50/50 dark:bg-gray-950 transition-colors space-y-4 sm:space-y-6 3xl:space-y-8">
      {/* Clean & Bold Summary Stats 2x2 Grid (No confusing progress bars) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 3xl:gap-6">
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
          label="Staff (บุคลากร)"
          value={summary?.staff ?? 0}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-green-50 dark:bg-green-950/60"
        />
        <StatCard
          icon={GraduationCap}
          label="Student (นักศึกษา)"
          value={summary?.student ?? 0}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-blue-50 dark:bg-blue-950/60"
        />
        <StatCard
          icon={UserPlus}
          label="Guest (บุคคลภายนอก)"
          value={summary?.guest ?? 0}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-white dark:bg-neutral-900"
          iconBg="bg-amber-50 dark:bg-amber-950/60"
        />
      </div>

      {/* QR Code + Participant Info Card — Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 3xl:gap-6 flex-1 min-h-0">
        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl p-5 3xl:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
          <p className="text-xs 3xl:text-base font-bold text-neutral-500 dark:text-neutral-400 mb-3 3xl:mb-5">
            QR Code สแกนเข้างาน
          </p>
          {event?.qr_img ? (
            <div className="p-2.5 bg-white rounded-2xl shadow-inner border border-neutral-100">
              <img
                src={event.qr_img}
                alt="QR Code"
                className="w-36 h-36 sm:w-48 sm:h-48 2xl:w-56 2xl:h-56 3xl:w-72 3xl:h-72 rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="w-36 h-36 sm:w-48 sm:h-48 2xl:w-56 2xl:h-56 3xl:w-72 3xl:h-72 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <span className="text-xs 3xl:text-lg">ไม่มี QR Code</span>
            </div>
          )}
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="mt-4 3xl:mt-6 flex items-center gap-2 px-4 py-2 3xl:px-6 3xl:py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm 3xl:text-lg font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 3xl:w-5 3xl:h-5" />
            บันทึก QR Code
          </button>
        </div>

        {/* Participant Info Card (Handles both "สแกนล่าสุด" & "ข้อมูลผู้เข้าร่วมที่เลือก") */}
        <div
          className={`flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl p-5 3xl:p-8 border shadow-2xs transition-all duration-300 ${
            isNewScan && !isSelectedParticipant
              ? 'border-primary shadow-md animate-glow'
              : 'border-neutral-200/80 dark:border-neutral-800'
          }`}
        >
          {displayParticipant ? (
            <div
              className={`w-full flex flex-col items-center text-center transition-all duration-200 ${
                isNewScan && !isSelectedParticipant ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Header Status Badge */}
              <div className="mb-3 3xl:mb-5">
                {isSelectedParticipant ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 3xl:px-4 3xl:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs 3xl:text-base font-bold shadow-2xs">
                    <User className="w-3.5 h-3.5 3xl:w-4 3xl:h-4" />
                    <span>ข้อมูลผู้เข้าร่วม (เลือกดู)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 3xl:px-4 3xl:py-1.5 rounded-full bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs 3xl:text-base font-bold shadow-2xs">
                    <span className="w-2 h-2 3xl:w-2.5 3xl:h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span>สแกนล่าสุด</span>
                    {isNewScan && <Sparkles className="w-3.5 h-3.5 3xl:w-4 3xl:h-4 text-primary animate-bounce" />}
                  </div>
                )}
              </div>

              {/* Photo or Large Avatar */}
              <div className="relative mb-3 3xl:mb-4">
                {displayParticipant.participant_photo ? (
                  <img
                    src={displayParticipant.participant_photo}
                    alt={displayParticipant.participant_name}
                    className="w-18 h-18 sm:w-20 sm:h-20 3xl:w-28 3xl:h-28 rounded-full object-cover shadow-md ring-4 ring-primary/15"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex'
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 3xl:w-28 3xl:h-28 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-extrabold text-2xl 3xl:text-4xl items-center justify-center ring-4 ring-primary/15 ${
                    displayParticipant.participant_photo ? 'hidden' : 'flex'
                  }`}
                >
                  {getInitial(displayParticipant.participant_name)}
                </div>
              </div>

              {/* Participant Name */}
              <p className="text-base sm:text-xl 2xl:text-2xl 3xl:text-3xl font-extrabold text-neutral-800 dark:text-neutral-100 mb-1.5 3xl:mb-2.5">
                {displayParticipant.participant_name}
              </p>

              {/* User Type Badge */}
              {displayParticipant.user_type && (
                <span
                  className={`inline-block px-3 py-0.5 3xl:px-4 3xl:py-1 rounded-full text-[11px] 3xl:text-base font-bold border mb-3 3xl:mb-4 ${
                    typeBadge[displayParticipant.user_type]?.class || typeBadge.guest.class
                  }`}
                >
                  {typeBadge[displayParticipant.user_type]?.label || 'Guest'}
                </span>
              )}

              {/* Meta Details */}
              <div className="space-y-1 text-xs 3xl:text-lg text-neutral-500 dark:text-neutral-400">
                <p className="flex items-center justify-center gap-1.5">
                  <Building className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-neutral-400" />
                  <span>{displayParticipant.user_department || '-'}</span>
                </p>
                <p className="flex items-center justify-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                  <Clock className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 text-indigo-500" />
                  <span>สแกนเวลา: {scanTime}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 3xl:w-24 3xl:h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 3xl:mb-5 animate-pulse">
                <User className="w-7 h-7 3xl:w-10 3xl:h-10 text-neutral-400" />
              </div>
              <p className="text-sm 3xl:text-xl text-neutral-400 dark:text-neutral-500 font-medium">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
