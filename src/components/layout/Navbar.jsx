import { Link, useLocation } from "react-router-dom";
import { ScanFace, LayoutDashboard, Radio, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-16 gap-2">
          {/* Logo / Brand Title */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 sm:gap-2 font-bold text-sm sm:text-base md:text-xl shrink-0 min-w-0"
          >
            <ScanFace className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 shrink-0" />
            <span className="hidden md:inline truncate">Dashboard Face Attendance</span>
            <span className="hidden sm:inline md:hidden truncate">Face Attendance</span>
            <span className="sm:hidden font-bold truncate text-xs sm:text-sm">Face Scan</span>
          </Link>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                isActive("/dashboard")
                  ? "bg-white/20 font-semibold shadow-xs"
                  : "hover:bg-white/10 text-white/90"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/live"
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${
                isActive("/live")
                  ? "bg-white/20 font-semibold shadow-xs"
                  : "hover:bg-white/10 text-white/90"
              }`}
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>
                Live<span className="hidden sm:inline"> Check-in</span>
              </span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 active:scale-95 text-white transition-all cursor-pointer"
              title={isDark ? "ธีมมืด (คลิกเพื่อเปลี่ยนเป็นธีมสว่าง)" : "ธีมสว่าง (คลิกเพื่อเปลี่ยนเป็นธีมมืด)"}
            >
              {isDark ? (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-200" />
              ) : (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
