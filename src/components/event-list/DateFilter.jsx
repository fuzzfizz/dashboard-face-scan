import { Calendar, ArrowRight, RefreshCw } from 'lucide-react'

const PRESETS = [
  { key: 'today', label: 'วันนี้' },
  { key: '7days', label: '7 วันล่าสุด' },
  { key: 'month', label: 'เดือนนี้' },
  { key: 'year', label: 'ปีนี้' },
]

export default function DateFilter({
  startDate,
  endDate,
  activePreset,
  onStartDateChange,
  onEndDateChange,
  onPresetChange,
  onRefresh,
  loading,
  dateLabel,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 3xl:p-8 transition-colors animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2 3xl:gap-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 text-primary shrink-0" />
            <h1 className="text-base sm:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
              ช่วงเวลาแสดงข้อมูล
            </h1>
            <span className="px-2.5 py-0.5 3xl:px-4 3xl:py-1 rounded-full text-xs 3xl:text-base font-semibold bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 truncate max-w-full">
              {dateLabel}
            </span>
          </div>
          <p className="text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            เลือกช่วงเวลาที่ต้องการดูสถิติและรายชื่อกิจกรรม
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 3xl:gap-2 bg-neutral-100/80 dark:bg-neutral-800 p-1.5 3xl:p-2 rounded-xl w-full sm:w-auto">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => onPresetChange(preset.key)}
              className={`px-3 py-1.5 3xl:px-5 3xl:py-2.5 rounded-lg text-xs 3xl:text-lg font-medium transition-all text-center cursor-pointer hover:scale-[1.02] active:scale-95 ${
                activePreset === preset.key
                  ? 'bg-white dark:bg-neutral-950 text-primary shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-3.5 sm:my-4 border-neutral-100 dark:border-neutral-800" />

      {/* Custom Date Pickers & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 sm:py-1.5 3xl:px-5 3xl:py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto">
            <span className="text-xs 3xl:text-base font-medium text-neutral-500 dark:text-neutral-400 shrink-0">ตั้งแต่:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-xs sm:text-sm 3xl:text-lg text-neutral-800 dark:text-neutral-100 font-medium focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
            />
          </div>

          <ArrowRight className="w-4 h-4 3xl:w-6 3xl:h-6 text-neutral-400 hidden sm:block self-center shrink-0" />

          <div className="flex items-center justify-between sm:justify-start gap-2 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 sm:py-1.5 3xl:px-5 3xl:py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto">
            <span className="text-xs 3xl:text-base font-medium text-neutral-500 dark:text-neutral-400 shrink-0">ถึง:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-xs sm:text-sm 3xl:text-lg text-neutral-800 dark:text-neutral-100 font-medium focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
            />
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 3xl:px-6 3xl:py-3 rounded-xl text-xs sm:text-sm 3xl:text-lg font-medium transition-all shadow-sm disabled:opacity-70 cursor-pointer w-full sm:w-auto shrink-0 hover:scale-[1.02] active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 3xl:w-5 3xl:h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>
  )
}
