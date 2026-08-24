import { Link, useLocation } from "react-router-dom";
import { ScanFace, LayoutDashboard, Radio } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-base sm:text-xl shrink-0"
          >
            <ScanFace className="w-6 h-6 sm:w-7 h-7" />
            <span className="hidden sm:inline">ระบบแดชบอร์ด Face Scan</span>
            <span className="sm:hidden font-bold">Face Scan</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                isActive("/dashboard") ? "bg-white/20 font-semibold" : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>แดชบอร์ด</span>
            </Link>
            <Link
              to="/live"
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                isActive("/live") ? "bg-white/20 font-semibold" : "hover:bg-white/10"
              }`}
            >
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Live Check-in</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
