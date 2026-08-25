import { ScanFace, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Header() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 3xl:px-10">
        <div className="flex items-center justify-between h-14 sm:h-16 3xl:h-20">
          <div className="flex items-center gap-2 sm:gap-3 3xl:gap-4">
            <ScanFace className="w-6 h-6 sm:w-7 sm:h-7 3xl:w-9 3xl:h-9 shrink-0" />
            <span className="font-bold text-lg sm:text-xl 2xl:text-2xl 3xl:text-3xl truncate">
              Face Scan Check-in
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 3xl:p-3 rounded-xl hover:bg-white/10 active:scale-95 text-white transition-all cursor-pointer"
            title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          >
            {isDark ? (
              <Moon className="w-5 h-5 3xl:w-6 3xl:h-6 text-slate-200" />
            ) : (
              <Sun className="w-5 h-5 3xl:w-6 3xl:h-6 text-yellow-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
