import { Calendar, ArrowRight, RefreshCw, CalendarDays, CalendarRange } from 'lucide-react'

const SINGLE_PRESETS = [
  { key: 'today', label: 'วันนี้' },
  { key: 'yesterday', label: 'เมื่อวาน' },
]

const RANGE_PRESETS = [
  { key: '7days', label: '7 วันล่าสุด' },
  { key: 'month', label: 'เดือนนี้' },
  { key: 'year', label: 'ปีนี้' },
]

export default function DateFilter({
  startDate,
  endDate,
  activePreset,
  filterMode = 'single',
  onFilterModeChange,
  onSingleDateChange,
  onStartDateChange,
  onEndDateChange,
  onPresetChange,
  onRefresh,
  loading,
  dateLabel,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-7 2xl:p-8 3xl:p-12 transition-colors animate-fade-in">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 3xl:gap-5">
            <div className="p-2 sm:p-2.5 3xl:p-3 bg-primary/10 rounded-2xl">
              <Calendar className="w-5 h-5 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8 3xl:w-12 3xl:h-12 text-primary shrink-0" />
            </div>
            <h1 className="text-lg sm:text-2xl 2xl:text-3xl 3xl:text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">
              ช่วงเวลาแสดงข้อมูล
            </h1>
            <span className="px-3.5 py-1 sm:px-4 sm:py-1.5 3xl:px-6 3xl:py-2 rounded-full text-xs sm:text-sm 2xl:text-lg 3xl:text-2xl font-bold bg-primary/10 text-primary dark:text-indigo-300 truncate max-w-full">
              {dateLabel}
            </span>
          </div>
          <p className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-500 dark:text-neutral-400 mt-1.5 3xl:mt-2.5 font-medium">
            เลือกดูสถิติและรายชื่อกิจกรรมแบบเฉพาะวันหรือเป็นช่วงเวลา
          </p>
        </div>

        {/* Mode Switcher Tabs + Presets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 3xl:gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1.5 3xl:p-2 rounded-2xl self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => onFilterModeChange('single')}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 3xl:px-7 3xl:py-3.5 rounded-xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold transition-all cursor-pointer ${
                filterMode === 'single'
                  ? 'bg-white dark:bg-neutral-950 text-primary shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" />
              <span>เฉพาะวันที่</span>
            </button>
            <button
              onClick={() => onFilterModeChange('range')}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 3xl:px-7 3xl:py-3.5 rounded-xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold transition-all cursor-pointer ${
                filterMode === 'range'
                  ? 'bg-white dark:bg-neutral-950 text-primary shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7" />
              <span>ช่วงวันที่</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 3xl:gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 3xl:p-2 rounded-2xl shadow-2xs">
            {(filterMode === 'single' ? SINGLE_PRESETS : RANGE_PRESETS).map((preset) => (
              <button
                key={preset.key}
                onClick={() => onPresetChange(preset.key)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 3xl:px-6 3xl:py-3.5 rounded-xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold transition-all text-center cursor-pointer hover:scale-[1.02] active:scale-95 ${
                  activePreset === preset.key
                    ? 'bg-white dark:bg-neutral-950 text-primary shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-4 sm:my-6 3xl:my-8 border-neutral-100 dark:border-neutral-800" />

      {/* Date Pickers & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {filterMode === 'single' ? (
          /* Single Date Mode */
          <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 sm:px-5 sm:py-3 3xl:px-7 3xl:py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto shadow-2xs">
            <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
              เลือกวันที่:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onSingleDateChange(e.target.value)}
              className="bg-transparent text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-800 dark:text-neutral-100 font-extrabold focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
            />
          </div>
        ) : (
          /* Range Mode */
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 sm:px-5 sm:py-3 3xl:px-7 3xl:py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto shadow-2xs">
              <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                ตั้งแต่:
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-800 dark:text-neutral-100 font-extrabold focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
              />
            </div>

            <ArrowRight className="w-5 h-5 3xl:w-7 3xl:h-7 text-neutral-400 hidden sm:block self-center shrink-0" />

            <div className="flex items-center justify-between sm:justify-start gap-3 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 sm:px-5 sm:py-3 3xl:px-7 3xl:py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full sm:w-auto shadow-2xs">
              <span className="text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-bold text-neutral-600 dark:text-neutral-300 shrink-0">
                ถึง:
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="bg-transparent text-xs sm:text-sm 2xl:text-base 3xl:text-2xl text-neutral-800 dark:text-neutral-100 font-extrabold focus:outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
              />
            </div>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 sm:px-6 sm:py-3 3xl:px-8 3xl:py-4 rounded-2xl text-xs sm:text-sm 2xl:text-base 3xl:text-2xl font-extrabold transition-all shadow-sm hover:shadow-md disabled:opacity-70 cursor-pointer w-full sm:w-auto shrink-0 hover:scale-[1.02] active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 3xl:w-7 3xl:h-7 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>
  )
}
