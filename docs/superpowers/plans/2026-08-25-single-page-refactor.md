# Single-Page Dashboard Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Face Scan Check-in Dashboard from a 2-page app into a single-page app with Indigo design system, responsive large-screen support, and mock data.

**Architecture:** Single `MainPage` component with two view states (Event List / Event Detail) switched via `selectedEventId` state. Left 70% / Right 30% split in detail view. All charts removed. Animated transitions between views.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4, React Router v7, Lucide React

## Global Constraints

- Tailwind CSS v4 with `@theme` and `@custom-variant` syntax (NOT v3 config files)
- Primary color: Indigo (`#4f46e5` light / `#818cf8` dark)
- Custom `3xl` breakpoint at `1920px` for large displays
- All headings must scale up to `text-7xl` on `3xl` screens
- Font family: `'Noto Sans Thai', 'Inter', sans-serif`
- Dark mode: class-based via `.dark` on `<html>`
- No test framework — verify via `npm run dev` visual inspection with mock data
- Environment variable prefix: `API_` (configured in `vite.config.js`)

---

### Task 1: Design System — Update Global Styles

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Nothing
- Produces: CSS custom properties (`--color-primary`, `--color-primary-dark`, `--color-primary-light`), animation keyframes (`fade-in`, `slide-left`, `slide-right`, `glow-pulse`, `shimmer`, `progress-fill`), custom `3xl` breakpoint, utility classes (`.animate-glow`, `.animate-fade-in`, `.animate-slide-left`, `.animate-slide-right`, `.animate-shimmer`)

- [ ] **Step 1: Replace index.css with new design system**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
@custom-variant 3xl (@media (width >= 1920px));

@theme {
  --color-primary: #4f46e5;
  --color-primary-dark: #3730a3;
  --color-primary-light: #eef2ff;
}

body {
  font-family: 'Noto Sans Thai', 'Inter', sans-serif;
  @apply bg-slate-50 text-neutral-800 transition-colors duration-200;
}

.dark body {
  @apply bg-gray-950 text-neutral-100;
}

html {
  scroll-behavior: smooth;
}

/* === Animation Keyframes === */

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes progress-fill {
  from { width: 0%; }
}

/* === Utility Classes === */

.animate-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out both;
}

.animate-slide-left {
  animation: slide-left 0.3s ease-out both;
}

.animate-slide-right {
  animation: slide-right 0.3s ease-out both;
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.animate-progress-fill {
  animation: progress-fill 0.6s ease-out both;
}
```

- [ ] **Step 2: Verify the dev server starts without CSS errors**

Run: `npm run dev`
Expected: No errors in terminal. Page loads (will look broken since components still use old colors — that's expected).

- [ ] **Step 3: Commit**

```powershell
git add src/index.css
git commit -m "feat: update design system to Indigo theme with animations and 3xl breakpoint"
```

---

### Task 2: Mock Data System

**Files:**
- Create: `src/utils/mockData.js`
- Modify: `src/services/api.js`
- Modify: `.env`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Nothing
- Produces: `mockEvents` array, `mockParticipantsMap` object keyed by event_id, mock-aware `fetchEvents(startDate, endDate)` and `fetchParticipants(eventId)` functions

- [ ] **Step 1: Create mock data file**

Create `src/utils/mockData.js`:

```javascript
const MOCK_EVENTS = [
  {
    event_id: 'mock-001',
    event_title: 'ประชุมวิชาการเภสัชกรรมคลินิก ครั้งที่ 15',
    event_type: 'ประชุม',
    event_date: new Date().toISOString().split('T')[0],
    event_time_start: '08:30:00',
    event_time_stop: '16:30:00',
    event_addr: 'ห้องประชุม 1 อาคารเฉลิมพระเกียรติ',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-001',
    pdf_file: null,
  },
  {
    event_id: 'mock-002',
    event_title: 'อบรมเชิงปฏิบัติการ AI ทางเภสัชศาสตร์',
    event_type: 'อบรม',
    event_date: new Date().toISOString().split('T')[0],
    event_time_start: '09:00:00',
    event_time_stop: '12:00:00',
    event_addr: 'ห้อง SCB2100 อาคารวิทยาศาสตร์',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-002',
    pdf_file: null,
  },
  {
    event_id: 'mock-003',
    event_title: 'สัมมนาแนวโน้มเทคโนโลยีเภสัชกรรม 2026',
    event_type: 'สัมมนา',
    event_date: new Date().toISOString().split('T')[0],
    event_time_start: '13:00:00',
    event_time_stop: '17:00:00',
    event_addr: 'ห้องประชุม 3 คณะเภสัชศาสตร์',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-003',
    pdf_file: null,
  },
  {
    event_id: 'mock-004',
    event_title: 'ประชุมคณะกรรมการบริหารคณะ ครั้งที่ 8/2569',
    event_type: 'ประชุม',
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })(),
    event_time_start: '09:00:00',
    event_time_stop: '12:00:00',
    event_addr: 'ห้องประชุมชั้น 2 อาคารบริหาร',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-004',
    pdf_file: null,
  },
  {
    event_id: 'mock-005',
    event_title: 'อบรมการใช้เครื่องมือวิเคราะห์ยา',
    event_type: 'อบรม',
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0]; })(),
    event_time_start: '10:00:00',
    event_time_stop: '15:00:00',
    event_addr: 'ห้องปฏิบัติการ ชั้น 4',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-005',
    pdf_file: null,
  },
  {
    event_id: 'mock-006',
    event_title: 'สัมมนาวิจัยบัณฑิตศึกษา ประจำภาคเรียนที่ 1',
    event_type: 'สัมมนา',
    event_date: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString().split('T')[0]; })(),
    event_time_start: '08:00:00',
    event_time_stop: '16:00:00',
    event_addr: 'ห้องประชุมใหญ่ ชั้น 5',
    qr_img: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT-mock-006',
    pdf_file: null,
  },
]

const THAI_FIRST_NAMES = [
  'สมชาย', 'สมหญิง', 'วิชัย', 'สุภาพร', 'ประภาส', 'นภาพร', 'ธนากร', 'พิมพ์ใจ',
  'อรรถพล', 'จิราภรณ์', 'กิตติ', 'สุนิสา', 'ปรีชา', 'วรรณา', 'ธีรศักดิ์', 'มาลี',
  'อนุชา', 'ศิริพร', 'เกรียงไกร', 'อุไรวรรณ', 'สุรศักดิ์', 'พรทิพย์', 'ชาญชัย', 'ดวงใจ',
  'มานพ', 'จุฑามาศ', 'วีระ', 'กาญจนา', 'สำราญ', 'ลำดวน',
]
const THAI_LAST_NAMES = [
  'ใจดี', 'สุขสันต์', 'เก่งกาจ', 'รักเรียน', 'มีชัย', 'สว่างวงศ์', 'พิทักษ์', 'ประเสริฐ',
  'ศรีสุข', 'วงศ์สกุล', 'แก้วมณี', 'ชัยชนะ', 'ทองดี', 'บุญมา', 'ศิริวัฒน์',
]
const DEPARTMENTS = [
  'ภาควิชาเภสัชกรรม', 'ภาควิชาเภสัชเคมี', 'ภาควิชาเภสัชชีววิทยา',
  'ภาควิชาเภสัชวิทยา', 'ภาควิชาเทคโนโลยีเภสัชกรรม', 'สำนักงานคณะ',
  'ภาควิชาบริบาลเภสัชกรรม', 'หน่วยวิจัย Smart Pharmacy',
]

const USER_TYPES = ['staff', 'staff', 'staff', 'staff', 'student', 'student', 'student', 'guest', 'guest', 'guest']

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateParticipants(eventId, eventDate, timeStart, count) {
  const participants = []
  const [startHour, startMin] = timeStart.split(':').map(Number)
  const baseTime = new Date(`${eventDate}T${timeStart}`)

  for (let i = 0; i < count; i++) {
    const offsetMinutes = Math.floor(Math.random() * 120)
    const scanTime = new Date(baseTime.getTime() + offsetMinutes * 60000)
    const userType = randomItem(USER_TYPES)

    participants.push({
      regis_id: `${eventId}-p${String(i + 1).padStart(3, '0')}`,
      participant_name: `${randomItem(THAI_FIRST_NAMES)} ${randomItem(THAI_LAST_NAMES)}`,
      user_type: userType,
      user_department: randomItem(DEPARTMENTS),
      participant_photo: null,
      regis_date: scanTime.toISOString().replace('T', ' ').substring(0, 19),
    })
  }

  return participants.sort((a, b) => new Date(b.regis_date) - new Date(a.regis_date))
}

// Pre-generate participants for each event
const MOCK_PARTICIPANTS = {}
const MOCK_SUMMARIES = {}

MOCK_EVENTS.forEach((ev) => {
  const count = 30 + Math.floor(Math.random() * 21) // 30-50
  const parts = generateParticipants(ev.event_id, ev.event_date, ev.event_time_start, count)
  MOCK_PARTICIPANTS[ev.event_id] = parts

  const summary = { total: parts.length, staff: 0, student: 0, guest: 0 }
  parts.forEach((p) => {
    if (p.user_type === 'staff') summary.staff++
    else if (p.user_type === 'student') summary.student++
    else summary.guest++
  })
  MOCK_SUMMARIES[ev.event_id] = summary
})

export function getMockEvents(startDate, endDate) {
  return MOCK_EVENTS.filter((ev) => ev.event_date >= startDate && ev.event_date <= endDate)
}

export function getMockParticipants(eventId) {
  const event = MOCK_EVENTS.find((ev) => ev.event_id === eventId)
  if (!event) return null
  return {
    event,
    summary: MOCK_SUMMARIES[eventId],
    participants: MOCK_PARTICIPANTS[eventId],
  }
}
```

- [ ] **Step 2: Update api.js with mock data toggle**

Replace `src/services/api.js` with:

```javascript
import { getMockEvents, getMockParticipants } from '../utils/mockData'

const BASE_URL = import.meta.env.API_BASE_URL || '/api'
const USE_MOCK = import.meta.env.API_USE_MOCK === 'true'

function mockDelay() {
  const ms = 300 + Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchEvents(startDate, endDate) {
  if (USE_MOCK) {
    await mockDelay()
    const data = getMockEvents(startDate, endDate)
    return { success: true, count: data.length, data }
  }

  const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
  const res = await fetch(`${BASE_URL}/event/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function fetchParticipants(eventId) {
  if (USE_MOCK) {
    await mockDelay()
    const data = getMockParticipants(eventId)
    if (!data) throw new Error('Event not found')
    return { success: true, data }
  }

  const params = new URLSearchParams({ event_id: eventId })
  const res = await fetch(`${BASE_URL}/participants/?${params}`)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}
```

- [ ] **Step 3: Update .env to enable mock mode**

Replace `.env`:

```
API_USE_MOCK=true
```

- [ ] **Step 4: Update .env.example**

Replace `.env.example`:

```
API_BASE_URL=/api
API_USE_MOCK=false
```

- [ ] **Step 5: Verify mock data loads**

Run: `npm run dev`
Expected: App loads. Console should not show any API errors (data comes from mock). The existing DashboardPage still renders (may look different due to new colors).

- [ ] **Step 6: Commit**

```powershell
git add src/utils/mockData.js src/services/api.js .env .env.example
git commit -m "feat: add mock data system with environment toggle"
```

---

### Task 3: Header Component

**Files:**
- Create: `src/components/layout/Header.jsx`

**Interfaces:**
- Consumes: `useTheme()` from `src/context/ThemeContext.jsx`
- Produces: `default Header` component — minimal top bar with brand name and dark mode toggle

- [ ] **Step 1: Create Header.jsx**

Create `src/components/layout/Header.jsx`:

```jsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/layout/Header.jsx
git commit -m "feat: add minimal Header component with responsive scaling"
```

---

### Task 4: DateFilter Component

**Files:**
- Create: `src/components/event-list/DateFilter.jsx`

**Interfaces:**
- Consumes: Props `{ startDate, endDate, activePreset, onStartDateChange, onEndDateChange, onPresetChange, onRefresh, loading, dateLabel }`
- Produces: `default DateFilter` component — date preset buttons + custom date pickers + refresh button

- [ ] **Step 1: Create DateFilter.jsx**

Create `src/components/event-list/DateFilter.jsx`:

```jsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/event-list/DateFilter.jsx
git commit -m "feat: add DateFilter component with responsive scaling and hover animations"
```

---

### Task 5: SummaryCards Component (Event List)

**Files:**
- Create: `src/components/event-list/SummaryCards.jsx`

**Interfaces:**
- Consumes: Props `{ data: { eventCount, totalParticipants, staffCount, otherCount }, loading, dateLabel }`
- Produces: `default SummaryCards` component with count-up animation and fade-in stagger

- [ ] **Step 1: Create SummaryCards.jsx with count-up animation**

Create `src/components/event-list/SummaryCards.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'
import { CalendarDays, Users, UserCheck, UserPlus } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function AnimatedCard({ card, value, loading, index }) {
  const displayValue = useCountUp(loading ? 0 : value)

  return (
    <div
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 3xl:p-8 hover:border-primary/30 dark:hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm 3xl:text-lg font-medium text-neutral-600 dark:text-neutral-400 truncate">
            {card.label}
          </p>
          <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl font-bold text-neutral-800 dark:text-neutral-100 mt-1 tracking-tight">
            {loading ? '...' : displayValue.toLocaleString()}
          </p>
          <p className="text-[11px] sm:text-xs 3xl:text-base text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
            {card.sublabel}
          </p>
        </div>
        <div className={`p-2 sm:p-3 3xl:p-4 rounded-xl ${card.bgLight} ${card.color} shrink-0`}>
          <card.icon className="w-4 h-4 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8" />
        </div>
      </div>
    </div>
  )
}

export default function SummaryCards({ data = {}, loading, dateLabel = '' }) {
  const cards = [
    {
      key: 'eventCount',
      label: 'กิจกรรมทั้งหมด',
      sublabel: dateLabel || 'ช่วงเวลาที่เลือก',
      icon: CalendarDays,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      key: 'totalParticipants',
      label: 'ผู้เข้าร่วมทั้งหมด',
      sublabel: 'สแกนเข้างาน',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      key: 'staffCount',
      label: 'Staff',
      sublabel: 'บุคลากร',
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgLight: 'bg-green-50 dark:bg-green-950/50',
    },
    {
      key: 'otherCount',
      label: 'Student & Guest',
      sublabel: 'นักศึกษา & บุคคลทั่วไป',
      icon: UserPlus,
      color: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 3xl:gap-6">
      {cards.map((card, index) => (
        <AnimatedCard
          key={card.key}
          card={card}
          value={data[card.key] ?? 0}
          loading={loading}
          index={index}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/event-list/SummaryCards.jsx
git commit -m "feat: add SummaryCards with count-up animation and stagger fade-in"
```

---

### Task 6: EventTable Component (Event List)

**Files:**
- Create: `src/components/event-list/EventTable.jsx`

**Interfaces:**
- Consumes: Props `{ events, participantsMap, onSelectEvent }`
- Produces: `default EventTable` component — searchable, paginated table with single "เข้ากิจกรรม" button per row

- [ ] **Step 1: Create EventTable.jsx**

Create `src/components/event-list/EventTable.jsx`:

```jsx
import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { formatDateShort, formatTime } from '../../utils/helpers'

export default function EventTable({ events = [], participantsMap = {}, onSelectEvent }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredEvents = useMemo(() => {
    if (!searchTerm.trim()) return events
    const query = searchTerm.toLowerCase().trim()
    return events.filter(
      (ev) =>
        ev.event_title?.toLowerCase().includes(query) ||
        ev.event_addr?.toLowerCase().includes(query) ||
        ev.event_type?.toLowerCase().includes(query) ||
        ev.event_date?.toLowerCase().includes(query)
    )
  }, [events, searchTerm])

  const totalItems = filteredEvents.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedEvents = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize
    return filteredEvents.slice(startIdx, startIdx + pageSize)
  }, [filteredEvents, safeCurrentPage, pageSize])

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems)

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 3xl:p-12 text-center animate-fade-in">
        <p className="text-neutral-400 text-base 3xl:text-xl">ไม่มีข้อมูลกิจกรรมในช่วงเวลาที่เลือก</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors animate-fade-in" style={{ animationDelay: '400ms' }}>
      {/* Header with Search */}
      <div className="px-4 sm:px-6 3xl:px-8 py-3.5 sm:py-4 3xl:py-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-950/50">
        <div>
          <h2 className="text-base sm:text-lg 2xl:text-2xl 3xl:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            รายการกิจกรรม
          </h2>
          <p className="text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 mt-0.5">
            กิจกรรมทั้งหมด {totalItems} รายการ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 3xl:w-96">
            <Search className="w-4 h-4 3xl:w-5 3xl:h-5 text-neutral-400 absolute left-3 3xl:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม, วันที่, สถานที่..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 3xl:pl-12 pr-3 py-2 sm:py-1.5 3xl:py-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-xl text-xs 3xl:text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 sm:py-1.5 3xl:py-3 text-xs 3xl:text-lg text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary cursor-pointer w-full sm:w-auto"
          >
            <option value={10}>10 รายการ/หน้า</option>
            <option value={20}>20 รายการ/หน้า</option>
            <option value={50}>50 รายการ/หน้า</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm 3xl:text-xl">
          <thead className="bg-neutral-50 dark:bg-neutral-950/60 text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left w-12">#</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">ประเภท</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">วันที่</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">เวลา</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-left">สถานที่</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-center">ผู้เข้าร่วม</th>
              <th className="px-4 py-3 3xl:px-6 3xl:py-5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((ev, idx) => {
                const summary = participantsMap[ev.event_id]
                const globalIndex = startRecord + idx

                return (
                  <tr
                    key={ev.event_id}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all duration-200 hover:scale-[1.005] cursor-pointer group"
                    onClick={() => onSelectEvent(ev.event_id)}
                  >
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-400 dark:text-neutral-500 font-medium">{globalIndex}</td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 font-medium text-neutral-800 dark:text-neutral-100 max-w-xs truncate" title={ev.event_title}>
                      {ev.event_title}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5">
                      <span className="px-2.5 py-0.5 3xl:px-4 3xl:py-1 rounded-full text-xs 3xl:text-base bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-medium whitespace-nowrap">
                        {ev.event_type || 'อื่นๆ'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-700 dark:text-neutral-300 whitespace-nowrap font-medium text-xs sm:text-sm 3xl:text-xl">
                      {formatDateShort(ev.event_date) || '-'}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-600 dark:text-neutral-400 whitespace-nowrap text-xs 3xl:text-lg">
                      {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm 3xl:text-xl">{ev.event_addr || '-'}</td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-center font-bold text-neutral-800 dark:text-neutral-100">
                      {summary ? summary.total : '-'}
                    </td>
                    <td className="px-4 py-3.5 3xl:px-6 3xl:py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 3xl:px-5 3xl:py-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-indigo-300 text-xs 3xl:text-lg font-medium group-hover:bg-primary group-hover:text-white transition-all">
                        เข้ากิจกรรม
                        <ArrowRight className="w-3.5 h-3.5 3xl:w-5 3xl:h-5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 3xl:py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm 3xl:text-xl">
                  ไม่พบกิจกรรมที่ตรงกับการค้นหา "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-6 3xl:px-8 py-3 3xl:py-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs 3xl:text-lg text-neutral-500 dark:text-neutral-400">
          <div>
            แสดง {startRecord} - {endRecord} จากทั้งหมด {totalItems} รายการ
          </div>

          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 3xl:p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 3xl:w-5 3xl:h-5" />
            </button>

            <span className="px-2 font-medium text-neutral-700 dark:text-neutral-200">
              หน้า {safeCurrentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 3xl:p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 3xl:w-5 3xl:h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/event-list/EventTable.jsx
git commit -m "feat: add simplified EventTable with single enter-event button"
```

---

### Task 7: Event Detail — LeftPanel Component

**Files:**
- Create: `src/components/event-detail/LeftPanel.jsx`

**Interfaces:**
- Consumes: Props `{ event, summary, latestParticipant }`
- Produces: `default LeftPanel` component — Summary stats 2×2 grid + QR code with save button + latest scan card

- [ ] **Step 1: Create LeftPanel.jsx**

Create `src/components/event-detail/LeftPanel.jsx`:

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, UserCheck, GraduationCap, UserPlus, Download, Sparkles } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function StatCard({ icon: Icon, label, value, total, color, bgColor, barColor }) {
  const displayValue = useCountUp(value)
  const percentage = total > 0 ? (value / total) * 100 : 0

  return (
    <div className={`${bgColor} rounded-xl p-3 sm:p-4 3xl:p-6`}>
      <div className="flex items-center gap-2 3xl:gap-3 mb-1">
        <Icon className={`w-4 h-4 3xl:w-6 3xl:h-6 ${color}`} />
        <span className={`text-xs 3xl:text-lg font-medium ${color}`}>{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl 2xl:text-4xl 3xl:text-6xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
        {displayValue.toLocaleString()}
      </p>
      <div className="mt-2 3xl:mt-3 h-1.5 3xl:h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full animate-progress-fill`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function LeftPanel({ event, summary, latestParticipant }) {
  const total = summary?.total ?? 0
  const prevLatestRef = useRef(null)
  const [isNewScan, setIsNewScan] = useState(false)

  useEffect(() => {
    if (latestParticipant && latestParticipant.regis_id !== prevLatestRef.current) {
      prevLatestRef.current = latestParticipant.regis_id
      setIsNewScan(true)
      const timer = setTimeout(() => setIsNewScan(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [latestParticipant])

  const handleSaveQR = useCallback(async () => {
    if (!event?.qr_img) return
    try {
      const response = await fetch(event.qr_img)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR-${event.event_title || 'event'}-${event.event_date || 'unknown'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to save QR code:', err)
    }
  }, [event])

  const scanTime = latestParticipant?.regis_date
    ? new Date(latestParticipant.regis_date).toLocaleTimeString('th-TH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : null

  const typeBadge = {
    staff: { label: 'Staff', class: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400' },
    student: { label: 'Student', class: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400' },
    guest: { label: 'Guest', class: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400' },
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 3xl:p-10 overflow-y-auto bg-white dark:bg-neutral-900 transition-colors">
      {/* Summary Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 3xl:gap-5 mb-6 3xl:mb-10">
        <StatCard
          icon={Users} label="ทั้งหมด" value={total} total={total}
          color="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-50 dark:bg-indigo-950/30"
          barColor="bg-indigo-500"
        />
        <StatCard
          icon={UserCheck} label="Staff" value={summary?.staff ?? 0} total={total}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-50 dark:bg-green-950/30"
          barColor="bg-green-500"
        />
        <StatCard
          icon={GraduationCap} label="Student" value={summary?.student ?? 0} total={total}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          barColor="bg-blue-500"
        />
        <StatCard
          icon={UserPlus} label="Guest" value={summary?.guest ?? 0} total={total}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
          barColor="bg-amber-500"
        />
      </div>

      {/* QR Code + Latest Scan — Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 3xl:gap-6 flex-1 min-h-0">
        {/* QR Code */}
        <div className="flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl p-4 3xl:p-8 border border-neutral-200 dark:border-neutral-800">
          {event?.qr_img ? (
            <img
              src={event.qr_img}
              alt="QR Code"
              className="w-40 h-40 sm:w-52 sm:h-52 2xl:w-64 2xl:h-64 3xl:w-80 3xl:h-80 rounded-xl shadow-sm object-contain"
            />
          ) : (
            <div className="w-40 h-40 sm:w-52 sm:h-52 2xl:w-64 2xl:h-64 3xl:w-80 3xl:h-80 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <span className="text-sm 3xl:text-xl">ไม่มี QR Code</span>
            </div>
          )}
          <button
            onClick={handleSaveQR}
            disabled={!event?.qr_img}
            className="mt-4 3xl:mt-6 flex items-center gap-2 px-4 py-2 3xl:px-6 3xl:py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm 3xl:text-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 3xl:w-5 3xl:h-5" />
            บันทึก QR Code
          </button>
        </div>

        {/* Latest Scan Card */}
        <div className={`flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl p-4 3xl:p-8 border transition-all duration-300 ${
          isNewScan ? 'border-primary animate-glow' : 'border-neutral-200 dark:border-neutral-800'
        }`}>
          {latestParticipant ? (
            <div className={`text-center transition-all duration-200 ${isNewScan ? 'scale-105' : 'scale-100'}`}>
              <div className="flex items-center justify-center gap-2 mb-3 3xl:mb-5">
                <span className={`w-2.5 h-2.5 3xl:w-3.5 3xl:h-3.5 rounded-full bg-green-500 ${isNewScan ? 'animate-pulse' : ''}`} />
                <span className="text-xs 3xl:text-lg font-semibold text-green-600 dark:text-green-400">
                  สแกนล่าสุด
                </span>
                {isNewScan && <Sparkles className="w-4 h-4 3xl:w-5 3xl:h-5 text-primary animate-bounce" />}
              </div>
              <p className="text-lg sm:text-xl 2xl:text-2xl 3xl:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-1 3xl:mb-2">
                {latestParticipant.participant_name}
              </p>
              {latestParticipant.user_type && (
                <span className={`inline-block px-3 py-1 3xl:px-5 3xl:py-2 rounded-full text-xs 3xl:text-lg font-medium mb-2 3xl:mb-3 ${
                  typeBadge[latestParticipant.user_type]?.class || typeBadge.guest.class
                }`}>
                  {typeBadge[latestParticipant.user_type]?.label || 'Guest'}
                </span>
              )}
              <p className="text-sm 3xl:text-xl text-neutral-500 dark:text-neutral-400 mb-1">
                {latestParticipant.user_department || '-'}
              </p>
              <p className="text-sm 3xl:text-xl font-medium text-neutral-600 dark:text-neutral-300">
                ⏰ {scanTime}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 3xl:w-24 3xl:h-24 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 3xl:mb-5 animate-pulse">
                <span className="text-2xl 3xl:text-4xl text-neutral-400">?</span>
              </div>
              <p className="text-sm 3xl:text-xl text-neutral-400 dark:text-neutral-500">
                รอผู้เข้าร่วมสแกนเข้างาน...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/event-detail/LeftPanel.jsx
git commit -m "feat: add LeftPanel with summary stats, QR code save, and latest scan card"
```

---

### Task 8: Event Detail — ParticipantGrid (Compact)

**Files:**
- Create: `src/components/event-detail/ParticipantGrid.jsx`

**Interfaces:**
- Consumes: Props `{ participants, selectedId, onSelect }`
- Produces: `default ParticipantGrid` component — compact participant list with filter tabs and glow animation

- [ ] **Step 1: Create ParticipantGrid.jsx**

Create `src/components/event-detail/ParticipantGrid.jsx`:

```jsx
import { useState, useMemo, useEffect, useRef } from 'react'
import { getInitial, getToday } from '../../utils/helpers'
import { Sparkles, Users } from 'lucide-react'

const FILTER_TABS = [
  { key: 'all', label: 'ทั้งหมด', color: 'text-neutral-800 dark:text-neutral-100' },
  { key: 'staff', label: 'Staff', color: 'text-green-700 dark:text-green-400' },
  { key: 'student', label: 'Student', color: 'text-blue-700 dark:text-blue-400' },
  { key: 'guest', label: 'Guest', color: 'text-amber-700 dark:text-amber-400' },
]

const TYPE_DOT = {
  staff: 'bg-green-500',
  student: 'bg-blue-500',
  guest: 'bg-amber-500',
}

export default function ParticipantGrid({ participants = [], selectedId, onSelect }) {
  const [filterType, setFilterType] = useState('all')
  const [highlightedId, setHighlightedId] = useState(null)
  const prevLatestIdRef = useRef(null)
  const today = getToday()

  const sorted = useMemo(() => {
    return [...participants].sort(
      (a, b) => new Date(b.regis_date) - new Date(a.regis_date)
    )
  }, [participants])

  const latestParticipant = sorted[0]
  const isLatestFromToday = latestParticipant?.regis_date
    ? latestParticipant.regis_date.startsWith(today)
    : false

  useEffect(() => {
    if (!latestParticipant) return
    const currentId = latestParticipant.regis_id
    if (isLatestFromToday && currentId && currentId !== prevLatestIdRef.current) {
      prevLatestIdRef.current = currentId
      setHighlightedId(currentId)
      const timer = setTimeout(() => setHighlightedId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [latestParticipant, isLatestFromToday])

  const filtered = useMemo(() => {
    if (filterType === 'all') return sorted
    return sorted.filter((p) => (p.user_type || 'guest').toLowerCase() === filterType)
  }, [sorted, filterType])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white dark:bg-neutral-900">
      {/* Header & Filter */}
      <div className="px-3 3xl:px-5 py-2 3xl:py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0 transition-colors">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-xs sm:text-sm 3xl:text-xl text-neutral-800 dark:text-neutral-100">
            ผู้ Check-in
          </h3>
          <span className="px-2 py-0.5 3xl:px-3 3xl:py-1 rounded-full text-[11px] 3xl:text-base font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {filtered.length}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs 3xl:text-base">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-2 py-1 3xl:px-3 3xl:py-1.5 rounded-md text-[11px] 3xl:text-sm font-medium transition-colors cursor-pointer ${
                filterType === tab.key
                  ? `bg-white dark:bg-neutral-950 ${tab.color} shadow-xs font-semibold`
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-500">
          <div>
            <Users className="w-8 h-8 3xl:w-12 3xl:h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm 3xl:text-xl">
              {participants.length === 0
                ? 'ยังไม่มีผู้ลงทะเบียน'
                : 'ไม่พบผู้เข้าร่วมในกลุ่มที่เลือก'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1 bg-white dark:bg-neutral-900">
          {filtered.map((p) => {
            const isSelected = p.regis_id === selectedId
            const isHighlighted = p.regis_id === highlightedId
            const time = p.regis_date
              ? new Date(p.regis_date).toLocaleTimeString('th-TH', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })
              : ''

            return (
              <div
                key={p.regis_id}
                onClick={() => onSelect(p)}
                className={`flex items-center gap-2.5 3xl:gap-4 px-3 3xl:px-5 py-2.5 3xl:py-4 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-light/90 dark:bg-primary/10 border-l-4 border-l-primary'
                    : isHighlighted
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/30 border-l-4 border-l-primary shadow-xs animate-glow'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 3xl:w-12 3xl:h-12 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-indigo-300 font-bold text-xs 3xl:text-lg flex items-center justify-center">
                    {getInitial(p.participant_name)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 3xl:w-3.5 3xl:h-3.5 rounded-full border-2 border-white dark:border-neutral-900 ${TYPE_DOT[p.user_type] || TYPE_DOT.guest}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm 3xl:text-xl font-medium text-neutral-800 dark:text-neutral-100 truncate">
                      {p.participant_name}
                    </span>
                    {isHighlighted && (
                      <span className="px-1.5 py-0.5 text-[10px] 3xl:text-xs font-bold bg-primary text-white rounded-full flex items-center gap-0.5 shrink-0 shadow-xs animate-bounce">
                        <Sparkles className="w-2.5 h-2.5 3xl:w-3 3xl:h-3" /> ล่าสุด
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] 3xl:text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {p.user_department || '-'}
                  </p>
                </div>

                {/* Time */}
                <span className="text-[11px] 3xl:text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap shrink-0">
                  {time}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/event-detail/ParticipantGrid.jsx
git commit -m "feat: add compact ParticipantGrid for 30% right panel"
```

---

### Task 9: Event Detail — SummaryBar + RightPanel

**Files:**
- Create: `src/components/event-detail/SummaryBar.jsx`
- Create: `src/components/event-detail/RightPanel.jsx`

**Interfaces:**
- `SummaryBar` consumes: Props `{ summary: { total, staff, student, guest } }`
- `RightPanel` consumes: Props `{ participants, summary, selectedId, onSelect }`
- `RightPanel` produces: Composed wrapper rendering `ParticipantGrid` + `SummaryBar`

- [ ] **Step 1: Create SummaryBar.jsx**

Create `src/components/event-detail/SummaryBar.jsx`:

```jsx
import { Users, UserCheck, GraduationCap, UserPlus } from 'lucide-react'

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
```

- [ ] **Step 2: Create RightPanel.jsx**

Create `src/components/event-detail/RightPanel.jsx`:

```jsx
import ParticipantGrid from './ParticipantGrid'
import SummaryBar from './SummaryBar'

export default function RightPanel({ participants, summary, selectedId, onSelect }) {
  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-gray-950 transition-colors">
      <ParticipantGrid
        participants={participants}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <SummaryBar summary={summary} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/event-detail/SummaryBar.jsx src/components/event-detail/RightPanel.jsx
git commit -m "feat: add SummaryBar and RightPanel wrapper for event detail view"
```

---

### Task 10: MainPage — Single Page with View State Switching

**Files:**
- Create: `src/pages/MainPage.jsx`

**Interfaces:**
- Consumes: `Header`, `DateFilter`, `SummaryCards` (event-list), `EventTable` (event-list), `LeftPanel`, `RightPanel`, `useEvents`, `useParticipants`, `useAutoRefresh`, `useTheme`, `fetchParticipants`, helpers
- Produces: `default MainPage` component — the single page of the entire app

- [ ] **Step 1: Create MainPage.jsx**

Create `src/pages/MainPage.jsx`:

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import Header from '../components/layout/Header'
import DateFilter from '../components/event-list/DateFilter'
import SummaryCards from '../components/event-list/SummaryCards'
import EventTable from '../components/event-list/EventTable'
import LeftPanel from '../components/event-detail/LeftPanel'
import RightPanel from '../components/event-detail/RightPanel'
import { useEvents } from '../hooks/useEvents'
import { useParticipants } from '../hooks/useParticipants'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { useTheme } from '../context/ThemeContext'
import { fetchParticipants } from '../services/api'
import {
  getToday, getDaysAgo, getStartOfMonth, getStartOfYear,
  formatDate, formatDateShort, formatTime,
} from '../utils/helpers'
import {
  ArrowLeft, ScanFace, RefreshCw, Maximize, Minimize,
  Sun, Moon, Wifi, WifiOff,
} from 'lucide-react'

export default function MainPage() {
  const { isDark, toggleTheme } = useTheme()
  const today = getToday()

  // ========== View State ==========
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [viewTransition, setViewTransition] = useState('') // 'slide-left' | 'slide-right' | ''

  const enterDetail = (eventId) => {
    setViewTransition('animate-slide-left')
    setSelectedEventId(eventId)
  }

  const exitDetail = () => {
    setViewTransition('animate-slide-right')
    setSelectedEventId(null)
  }

  // ========== Event List State ==========
  const [startDate, setStartDate] = useState(() => sessionStorage.getItem('dashboard_start_date') || today)
  const [endDate, setEndDate] = useState(() => sessionStorage.getItem('dashboard_end_date') || today)
  const [activePreset, setActivePreset] = useState(() => sessionStorage.getItem('dashboard_preset') || 'today')
  const [participantsMap, setParticipantsMap] = useState({})
  const [summaryLoading, setSummaryLoading] = useState(false)

  const { events, count, loading: eventsLoading, error, refetch } = useEvents(startDate, endDate)

  useEffect(() => {
    sessionStorage.setItem('dashboard_start_date', startDate)
    sessionStorage.setItem('dashboard_end_date', endDate)
    sessionStorage.setItem('dashboard_preset', activePreset)
  }, [startDate, endDate, activePreset])

  const isToday = startDate === today && endDate === today

  const dateLabel = useMemo(() => {
    if (isToday) return `วันนี้ (${formatDateShort(today)})`
    if (startDate === endDate) return formatDate(startDate)
    return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`
  }, [isToday, startDate, endDate, today])

  const applyPreset = (preset) => {
    setActivePreset(preset)
    if (preset === 'today') { setStartDate(today); setEndDate(today) }
    else if (preset === '7days') { setStartDate(getDaysAgo(6)); setEndDate(today) }
    else if (preset === 'month') { setStartDate(getStartOfMonth()); setEndDate(today) }
    else if (preset === 'year') { setStartDate(getStartOfYear()); setEndDate(today) }
  }

  const handleStartDateChange = (value) => { setStartDate(value); setActivePreset('custom') }
  const handleEndDateChange = (value) => { setEndDate(value); setActivePreset('custom') }

  // Fetch summaries for all events
  useEffect(() => {
    if (events.length === 0) { setParticipantsMap({}); return }
    setSummaryLoading(true)
    Promise.allSettled(events.map((ev) => fetchParticipants(ev.event_id)))
      .then((results) => {
        const map = {}
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.success) {
            map[res.value.data.event.event_id] = res.value.data.summary
          }
        })
        setParticipantsMap(map)
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false))
  }, [events])

  const totals = Object.values(participantsMap).reduce(
    (acc, s) => ({
      total: acc.total + Number(s?.total || 0),
      staff: acc.staff + Number(s?.staff || 0),
      student: acc.student + Number(s?.student || 0),
      guest: acc.guest + Number(s?.guest || 0),
    }),
    { total: 0, staff: 0, student: 0, guest: 0 }
  )

  const listLoading = eventsLoading || summaryLoading

  // ========== Event Detail State ==========
  const { event, summary, participants, loading: detailLoading, refetch: refetchDetail } = useParticipants(selectedEventId)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  const handleDetailRefresh = useCallback(() => { refetchDetail() }, [refetchDetail])
  const { secondsLeft, isActive, toggle } = useAutoRefresh(handleDetailRefresh, 5000, !!selectedEventId)

  // Latest participant
  const sorted = useMemo(() => {
    return [...participants].sort((a, b) => new Date(b.regis_date) - new Date(a.regis_date))
  }, [participants])
  const latestParticipant = selectedParticipant || sorted[0] || null

  // Reset selection when switching events
  useEffect(() => { setSelectedParticipant(null) }, [selectedEventId])

  // Find selected event info for header
  const selectedEvent = events.find((e) => e.event_id === selectedEventId)

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.error)
    else document.exitFullscreen?.().catch(console.error)
  }

  // Online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const lastScanTime = sorted[0]?.regis_date
    ? new Date(sorted[0].regis_date).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'

  // ========== RENDER: Event Detail View ==========
  if (selectedEventId) {
    // Loading state
    if (detailLoading && participants.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 3xl:w-12 3xl:h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400 3xl:text-xl">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )
    }

    return (
      <div className={`h-[100dvh] flex flex-col bg-slate-50 dark:bg-gray-950 overflow-hidden transition-colors duration-200 ${viewTransition}`}>
        {/* Header */}
        <header className="bg-primary text-white px-3.5 sm:px-6 3xl:px-10 py-2.5 sm:py-3 3xl:py-5 flex items-center justify-between shadow-lg shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 3xl:gap-6 min-w-0 flex-1 mr-2">
            <button
              onClick={exitDetail}
              className="p-1.5 3xl:p-2.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="กลับไปรายการกิจกรรม"
            >
              <ArrowLeft className="w-5 h-5 3xl:w-7 3xl:h-7" />
            </button>
            <div className="flex items-center gap-2 3xl:gap-3 min-w-0 flex-1">
              <ScanFace className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm sm:text-lg 2xl:text-3xl 3xl:text-5xl leading-tight truncate">
                  {event?.event_title || selectedEvent?.event_title || 'Live Check-in'}
                </h1>
                <p className="text-white/70 text-[11px] sm:text-xs 2xl:text-sm 3xl:text-lg truncate">
                  {(event?.event_addr || selectedEvent?.event_addr) ? `${event?.event_addr || selectedEvent?.event_addr} • ` : ''}
                  {formatTime(event?.event_time_start || selectedEvent?.event_time_start)} - {formatTime(event?.event_time_stop || selectedEvent?.event_time_stop)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 3xl:gap-3 shrink-0">
            <button onClick={handleDetailRefresh} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title="รีเฟรช">
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 ${detailLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title={isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}>
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6" />}
            </button>
            <button onClick={toggleTheme} className="p-1.5 sm:p-2 3xl:p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" title={isDark ? 'ธีมสว่าง' : 'ธีมมืด'}>
              {isDark ? <Moon className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 text-slate-200" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5 3xl:w-6 3xl:h-6 text-yellow-300" />}
            </button>
            <button
              onClick={toggle}
              className={`px-2.5 sm:px-3 3xl:px-5 py-1.5 3xl:py-2.5 rounded-lg text-xs 3xl:text-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive ? 'bg-white/20' : 'bg-white/10'}`}
            >
              Auto {isActive ? `ON (${secondsLeft}s)` : 'OFF'}
            </button>
          </div>
        </header>

        {/* Main Split: Left 70% / Right 30% */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 shrink-0 overflow-hidden">
            <LeftPanel event={event || selectedEvent} summary={summary} latestParticipant={latestParticipant} />
          </div>
          <div className="w-full lg:w-[30%] flex-1 min-h-0 flex flex-col">
            <RightPanel
              participants={participants}
              summary={summary}
              selectedId={latestParticipant?.regis_id}
              onSelect={(p) => setSelectedParticipant(p)}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 3xl:px-10 py-1.5 sm:py-2 3xl:py-3 flex items-center justify-between text-[11px] sm:text-xs 3xl:text-base text-neutral-500 dark:text-neutral-400 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <span className="truncate">สแกนล่าสุด: {lastScanTime}</span>
            <span className="text-neutral-300 dark:text-neutral-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Auto-refresh: {isActive ? 'ON (5s)' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <WifiOff className="w-3.5 h-3.5 3xl:w-5 3xl:h-5" /> ออฟไลน์
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span className="w-2 h-2 3xl:w-3 3xl:h-3 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5 3xl:w-5 3xl:h-5" /> เชื่อมต่อแล้ว
              </span>
            )}
          </div>
        </footer>
      </div>
    )
  }

  // ========== RENDER: Event List View ==========
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-200 ${viewTransition}`}>
      <Header />
      <main className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 3xl:px-12 py-4 sm:py-6 3xl:py-10 space-y-4 sm:space-y-6 3xl:space-y-10">
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          activePreset={activePreset}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onPresetChange={applyPreset}
          onRefresh={refetch}
          loading={listLoading}
          dateLabel={dateLabel}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 3xl:px-6 3xl:py-4 rounded-xl 3xl:text-xl">
            {error}
          </div>
        )}

        <SummaryCards
          data={{
            eventCount: count,
            totalParticipants: totals.total,
            staffCount: totals.staff,
            otherCount: totals.student + totals.guest,
          }}
          loading={listLoading}
          dateLabel={dateLabel}
        />

        <EventTable
          events={events}
          participantsMap={participantsMap}
          onSelectEvent={enterDetail}
        />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify MainPage renders with mock data**

Run: `npm run dev`
Expected: At this point the old routes still exist. We need to update App.jsx next (Task 11). Just verify MainPage file has no syntax errors by checking the terminal for compilation errors.

- [ ] **Step 3: Commit**

```powershell
git add src/pages/MainPage.jsx
git commit -m "feat: add MainPage with view state switching and slide transitions"
```

---

### Task 11: App.jsx Update + Cleanup

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/pages/DashboardPage.jsx`
- Delete: `src/pages/LiveCheckinPage.jsx`
- Delete: `src/components/dashboard/EventBarChart.jsx`
- Delete: `src/components/dashboard/ParticipantPieChart.jsx`
- Delete: `src/components/dashboard/ParticipantsModal.jsx`
- Delete: `src/components/dashboard/QRModal.jsx`
- Delete: `src/components/dashboard/SummaryCards.jsx`
- Delete: `src/components/dashboard/EventTable.jsx`
- Delete: `src/components/live/PhotoDisplay.jsx`
- Delete: `src/components/live/ParticipantGrid.jsx`
- Delete: `src/components/live/SummaryBar.jsx`
- Delete: `src/components/layout/Navbar.jsx`
- Modify: `package.json` (remove `recharts` dependency)

**Interfaces:**
- Consumes: `MainPage`, `ThemeProvider`
- Produces: Updated `App` component with single route

- [ ] **Step 1: Update App.jsx to single route**

Replace `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import MainPage from './pages/MainPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
```

- [ ] **Step 2: Delete old files**

```powershell
Remove-Item -Path src/pages/DashboardPage.jsx
Remove-Item -Path src/pages/LiveCheckinPage.jsx
Remove-Item -Path src/components/dashboard -Recurse
Remove-Item -Path src/components/live -Recurse
Remove-Item -Path src/components/layout/Navbar.jsx
```

- [ ] **Step 3: Remove recharts dependency**

```powershell
npm uninstall recharts
```

- [ ] **Step 4: Verify the app builds and runs**

Run: `npm run dev`
Expected: App opens at `/`, shows Event List View with mock data. Clicking an event navigates to Event Detail View with slide animation. Back button returns to Event List. No console errors.

- [ ] **Step 5: Run production build to check for errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: complete single-page refactor - remove old pages, charts, and recharts dependency"
```

---

### Task 12: Final Visual Verification & Polish

**Files:**
- Possibly modify: any component files for visual fixes discovered during testing

**Interfaces:**
- Consumes: All components
- Produces: Verified, polished application

- [ ] **Step 1: Test Event List View**

Run: `npm run dev`

Verify:
- Header shows "Face Scan Check-in" with dark mode toggle
- Date Filter shows presets (วันนี้, 7 วัน, เดือนนี้, ปีนี้) and custom date pickers
- SummaryCards display with count-up animation (numbers count from 0 to actual)
- EventTable shows mock events with search and pagination
- Each row has "เข้ากิจกรรม" button that highlights on hover
- Clicking a row enters Event Detail with slide-left animation
- Dark mode toggle works correctly
- All colors are Indigo-based (no green primary remaining)

- [ ] **Step 2: Test Event Detail View**

Verify:
- Header shows event title, subtitle (location, time), back button, controls
- Left panel (70%): Summary stats 2×2 grid with count-up and progress bars
- Left panel: QR code displayed, "บันทึก QR Code" button works (downloads image)
- Left panel: Latest scan card shows most recent participant with pulse animation
- Right panel (30%): Compact participant list with filter tabs
- Right panel: New scan glow animation works (wait for auto-refresh)
- Right panel: SummaryBar at bottom shows totals
- Footer: Shows last scan time, auto-refresh status, connection status
- Back button returns to Event List with slide-right animation
- Fullscreen toggle works
- Auto-refresh countdown (5s) works

- [ ] **Step 3: Test large display scaling**

Resize browser window to ≥1920px width (or use DevTools responsive mode).

Verify:
- Headings scale up appropriately (up to text-7xl on 3xl screens)
- Cards, buttons, table text all scale up proportionally
- Layout remains balanced — no excessive whitespace
- QR code in LeftPanel is larger on big screens

- [ ] **Step 4: Test dark mode across both views**

Toggle dark mode and verify:
- All backgrounds switch correctly
- Text contrast is readable
- Card borders and surfaces update
- Indigo accents look good in dark mode

- [ ] **Step 5: Commit any visual fixes**

```powershell
git add -A
git commit -m "fix: visual polish and responsive adjustments after testing"
```
