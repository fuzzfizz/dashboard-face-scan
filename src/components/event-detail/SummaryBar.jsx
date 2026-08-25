export default function SummaryBar({ summary }) {
  return (
    <div className="grid grid-cols-4 px-2.5 3xl:px-4 py-2 3xl:py-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs 3xl:text-base shrink-0 transition-colors">
      <div className="flex flex-col items-center text-neutral-700 dark:text-neutral-200">
        <span className="text-[10px] 3xl:text-sm text-neutral-500 dark:text-neutral-400">ทั้งหมด</span>
        <b className="text-xs 3xl:text-lg font-bold">{summary?.total ?? 0}</b>
      </div>
      <div className="flex flex-col items-center text-green-700 dark:text-green-400">
        <span className="text-[10px] 3xl:text-sm text-green-600 dark:text-green-500">Staff</span>
        <b className="text-xs 3xl:text-lg font-bold">{summary?.staff ?? 0}</b>
      </div>
      <div className="flex flex-col items-center text-blue-700 dark:text-blue-400">
        <span className="text-[10px] 3xl:text-sm text-blue-600 dark:text-blue-500">Student</span>
        <b className="text-xs 3xl:text-lg font-bold">{summary?.student ?? 0}</b>
      </div>
      <div className="flex flex-col items-center text-amber-700 dark:text-amber-400">
        <span className="text-[10px] 3xl:text-sm text-amber-600 dark:text-amber-500">Guest</span>
        <b className="text-xs 3xl:text-lg font-bold">{summary?.guest ?? 0}</b>
      </div>
    </div>
  )
}
