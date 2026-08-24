import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useParticipants } from "../hooks/useParticipants";
import { useEvents } from "../hooks/useEvents";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useTheme } from "../context/ThemeContext";
import PhotoDisplay from "../components/live/PhotoDisplay";
import ParticipantGrid from "../components/live/ParticipantGrid";
import SummaryBar from "../components/live/SummaryBar";
import { formatDate, formatTime, getToday } from "../utils/helpers";
import {
  RefreshCw,
  ArrowLeft,
  ScanFace,
  Radio,
  Calendar,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from "lucide-react";

export default function LiveCheckinPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { eventId } = useParams();
  const isNoEventSelected = !eventId || eventId === "0";
  const today = getToday();

  // Fullscreen state & toggle
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  // Network online/offline status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const {
    events: todayEvents,
    loading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents(
    isNoEventSelected ? today : null,
    isNoEventSelected ? today : null,
  );

  const { event, summary, participants, loading, error, refetch } =
    useParticipants(eventId);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const { secondsLeft, isActive, toggle } = useAutoRefresh(
    handleRefresh,
    5000,
    true,
  );

  // Default to latest check-in participant
  const sorted = [...participants].sort(
    (a, b) => new Date(b.regis_date) - new Date(a.regis_date),
  );
  const displayParticipant = selectedParticipant || sorted[0] || null;

  const lastScanTime = sorted[0]?.regis_date
    ? new Date(sorted[0].regis_date).toLocaleString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-";

  // Fallback: When no event is selected (e.g. /live or /live/0)
  if (isNoEventSelected) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col transition-colors duration-200">
        {/* Simple Header */}
        <header className="bg-primary text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <ScanFace className="w-6 h-6" />
            <h1 className="font-bold text-lg">Live Check-in — เลือกกิจกรรม</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              title={isDark ? "ธีมมืด (คลิกเพื่อเปลี่ยนเป็นธีมสว่าง)" : "ธีมสว่าง (คลิกเพื่อเปลี่ยนเป็นธีมมืด)"}
            >
              {isDark ? (
                <Moon className="w-4 h-4 text-slate-200" />
              ) : (
                <Sun className="w-4 h-4 text-yellow-300" />
              )}
            </button>
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors cursor-pointer"
            >
              กลับหน้าแดชบอร์ด
            </button>
          </div>
        </header>

        {/* Event Selector Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                กิจกรรมประจำวันนี้
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(today)}</p>
            </div>
            <button
              onClick={refetchEvents}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${eventsLoading ? "animate-spin" : ""}`}
              />
              รีเฟรช
            </button>
          </div>

          {eventsLoading ? (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center transition-colors">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                กำลังโหลดกิจกรรมวันนี้...
              </p>
            </div>
          ) : todayEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayEvents.map((ev) => (
                <div
                  key={ev.event_id}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 leading-snug">
                        {ev.event_title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-light text-primary-dark font-medium shrink-0">
                        {ev.event_type || "อื่นๆ"}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                          สถานที่:
                        </span>{" "}
                        {ev.event_addr || "-"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                          เวลา:
                        </span>{" "}
                        {formatTime(ev.event_time_start)} -{" "}
                        {formatTime(ev.event_time_stop)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/live/${ev.event_id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
                  >
                    <Radio className="w-4 h-4" />
                    เปิด Live Check-in
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center transition-colors">
              <Calendar className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                ไม่พบกิจกรรมสำหรับวันนี้
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                ไม่มีกิจกรรมที่จัดขึ้นในวันนี้
                หรือคุณสามารถเลือกกิจกรรมจากช่วงวันที่อื่นๆ ได้ในหน้าแดชบอร์ด
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
              >
                เลือกกิจกรรมจากหน้าแดชบอร์ด
              </Link>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (loading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && participants.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4 transition-colors">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-700 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            ไม่สามารถโหลดข้อมูล Live Check-in
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
            {error || "ไม่พบข้อมูลกิจกรรมที่เลือก"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-sm font-medium transition-colors cursor-pointer"
            >
              ลองใหม่อีกครั้ง
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors cursor-pointer"
            >
              กลับหน้าแดชบอร์ด
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-neutral-50 dark:bg-neutral-900 overflow-hidden transition-colors duration-200">
      {/* Header */}
      <header className="bg-primary text-white px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 mr-2">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="ย้อนกลับไปหน้าแดชบอร์ด"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ScanFace className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm sm:text-lg leading-tight truncate">
                {event?.event_title || "Live Check-in"}
              </h1>
              <p className="text-white/70 text-[11px] sm:text-xs truncate hidden xs:block sm:block">
                {event?.event_addr ? `${event.event_addr} • ` : ""}
                {formatTime(event?.event_time_start)} -{" "}
                {formatTime(event?.event_time_stop)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="รีเฟรช"
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title={
              isFullscreen ? "ออกจากโหมดเต็มจอ" : "แสดงผลเต็มจอ (Fullscreen)"
            }
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title={isDark ? "ธีมมืด (คลิกเพื่อเปลี่ยนเป็นธีมสว่าง)" : "ธีมสว่าง (คลิกเพื่อเปลี่ยนเป็นธีมมืด)"}
          >
            {isDark ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            )}
          </button>
          <button
            onClick={toggle}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              isActive ? "bg-white/20" : "bg-white/10"
            }`}
          >
            Auto {isActive ? `ON (${secondsLeft}s)` : "OFF"}
          </button>
        </div>
      </header>

      {/* Main Content — Split Screen (Vertical on mobile, Horizontal on desktop) */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left / Top Panel — Photo */}
        <div className="w-full lg:w-2/5 bg-white dark:bg-neutral-850 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center shadow-xs lg:shadow-none transition-colors">
          <PhotoDisplay participant={displayParticipant} />
        </div>

        {/* Right / Bottom Panel — Grid + Summary */}
        <div className="w-full lg:w-3/5 flex-1 min-h-0 flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors">
          <ParticipantGrid
            participants={participants}
            selectedId={displayParticipant?.regis_id}
            onSelect={(p) => setSelectedParticipant(p)}
          />
          <SummaryBar summary={summary} />
        </div>
      </div>

      {/* Footer Status with Network Health */}
      <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <span className="truncate">สแกนล่าสุด: {lastScanTime}</span>
          <span className="text-neutral-300 dark:text-neutral-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Auto-refresh: {isActive ? `ON (5s)` : "OFF"}
          </span>
        </div>

        {/* Connection Health Indicator */}
        <div className="flex items-center gap-1.5">
          {!isOnline ? (
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>ออฟไลน์</span>
            </span>
          ) : error ? (
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังลองเชื่อมต่อใหม่...</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>การเชื่อมต่อปกติ</span>
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
