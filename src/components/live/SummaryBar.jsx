import { Users, UserCheck, GraduationCap, UserPlus } from 'lucide-react'

export default function SummaryBar({ summary }) {
  return (
    <div className="flex items-center gap-5 px-4 py-3 bg-white border-t border-neutral-200 text-sm">
      <span className="flex items-center gap-1.5 text-neutral-700">
        <Users className="w-4 h-4" /> ทั้งหมด: <b>{summary?.total ?? 0}</b>
      </span>
      <span className="flex items-center gap-1.5 text-green-700">
        <UserCheck className="w-4 h-4" /> Staff: <b>{summary?.staff ?? 0}</b>
      </span>
      <span className="flex items-center gap-1.5 text-blue-700">
        <GraduationCap className="w-4 h-4" /> Student: <b>{summary?.student ?? 0}</b>
      </span>
      <span className="flex items-center gap-1.5 text-yellow-700">
        <UserPlus className="w-4 h-4" /> Guest: <b>{summary?.guest ?? 0}</b>
      </span>
    </div>
  )
}
