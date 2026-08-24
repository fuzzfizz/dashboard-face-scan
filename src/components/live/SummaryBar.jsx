import { Users, UserCheck, GraduationCap, UserPlus } from 'lucide-react'

export default function SummaryBar({ summary }) {
  return (
    <div className="grid grid-cols-4 sm:flex sm:items-center sm:gap-5 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm shrink-0 transition-colors">
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-neutral-700 dark:text-neutral-200">
        <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 hidden sm:inline" /> ทั้งหมด
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.total ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-green-700 dark:text-green-400">
        <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 hidden sm:inline" /> Staff
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.staff ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-blue-700 dark:text-blue-400">
        <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-500 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 hidden sm:inline" /> Student
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.student ?? 0}</b>
      </div>
      <div className="flex flex-col sm:flex-row items-center sm:gap-1.5 text-yellow-700 dark:text-yellow-400">
        <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
          <UserPlus className="w-3.5 h-3.5 hidden sm:inline" /> Guest
        </span>
        <b className="text-xs sm:text-sm font-bold">{summary?.guest ?? 0}</b>
      </div>
    </div>
  )
}
