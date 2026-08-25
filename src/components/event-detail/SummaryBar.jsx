export default function SummaryBar({ summary }) {
  return (
    <div className="grid grid-cols-4 px-3 sm:px-4 3xl:px-6 py-2.5 sm:py-3 3xl:py-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shrink-0 transition-colors">
      <div className="flex flex-col items-center text-neutral-700 dark:text-neutral-200">
        <span className="text-xs sm:text-sm 3xl:text-lg font-medium text-neutral-500 dark:text-neutral-400">
          ทั้งหมด
        </span>
        <b className="text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-extrabold mt-0.5">
          {summary?.total ?? 0}
        </b>
      </div>
      <div className="flex flex-col items-center text-green-700 dark:text-green-400">
        <span className="text-xs sm:text-sm 3xl:text-lg font-medium text-green-600 dark:text-green-500">
          Staff
        </span>
        <b className="text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-extrabold mt-0.5">
          {summary?.staff ?? 0}
        </b>
      </div>
      <div className="flex flex-col items-center text-blue-700 dark:text-blue-400">
        <span className="text-xs sm:text-sm 3xl:text-lg font-medium text-blue-600 dark:text-blue-500">
          Student
        </span>
        <b className="text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-extrabold mt-0.5">
          {summary?.student ?? 0}
        </b>
      </div>
      <div className="flex flex-col items-center text-amber-700 dark:text-amber-400">
        <span className="text-xs sm:text-sm 3xl:text-lg font-medium text-amber-600 dark:text-amber-500">
          Guest
        </span>
        <b className="text-sm sm:text-base 2xl:text-lg 3xl:text-2xl font-extrabold mt-0.5">
          {summary?.guest ?? 0}
        </b>
      </div>
    </div>
  )
}
