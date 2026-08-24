import { Users, UserCheck, GraduationCap, UserPlus } from 'lucide-react'

export default function SummaryBar({ summary }) {
  return (
    <div className="grid grid-cols-4 sm:flex sm:items-center sm:gap-5 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white border-t border-neutral-200 text-xs sm:text-sm shrink-0">
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-neutral-700">
        <span className="text-[10px] sm:text-xs text-neutral-500 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 hidden sm:inline" /> ทั้งหมด
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.total ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-green-700">
        <span className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 hidden sm:inline" /> Staff
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.staff ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-blue-700">
        <span className="text-[10px] sm:text-xs text-blue-600 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 hidden sm:inline" /> Student
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.student ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-yellow-700">
        <span className="text-[10px] sm:text-xs text-yellow-600 flex items-center gap-1">
          <UserPlus className="w-3.5 h-3.5 hidden sm:inline" /> Guest
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.guest ?? 0}</b>
      </div>
    </div>
  )
}
