import { ScanFace, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Header() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-8 2xl:px-10 3xl:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20 2xl:h-24 3xl:h-28">
          <div className="flex items-center gap-3 sm:gap-4 3xl:gap-6">
            <div className="p-2 sm:p-2.5 3xl:p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs">
              <ScanFace className="w-7 h-7 sm:w-9 sm:h-9 2xl:w-11 2xl:h-11 3xl:w-14 3xl:h-14 shrink-0" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl 2xl:text-3xl 3xl:text-5xl tracking-tight block">
                Face Scan Check-in
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 sm:p-3 2xl:p-4 3xl:p-5 rounded-2xl hover:bg-white/15 active:scale-95 text-white transition-all cursor-pointer shadow-xs"
            title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          >
            {isDark ? (
              <Moon className="w-6 h-6 sm:w-7 sm:h-7 3xl:w-9 3xl:h-9 text-slate-200" />
            ) : (
              <Sun className="w-6 h-6 sm:w-7 sm:h-7 3xl:w-9 3xl:h-9 text-yellow-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
