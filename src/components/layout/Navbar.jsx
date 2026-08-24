import { Link, useLocation } from "react-router-dom";
import { ScanFace, LayoutDashboard, Radio } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <ScanFace className="w-7 h-7" />
            dashboard Face Check-in
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard") ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/live"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/live") ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <Radio className="w-4 h-4" />
              Live Check-in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
