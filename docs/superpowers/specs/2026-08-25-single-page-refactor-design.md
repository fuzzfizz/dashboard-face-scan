# Single-Page Dashboard Refactor — Design Spec

## Overview

Refactor the Face Scan Check-in Dashboard from a 2-page app (DashboardPage + LiveCheckinPage) into a **single-page application** with two view states: Event List and Event Detail. Redesign the UI with an Indigo color scheme, responsive typography that scales up to large displays (TV/kiosk), polished animations, and mock data support.

## Goals

1. **Merge into one page** — Remove DashboardPage and LiveCheckinPage; replace with a single `MainPage` that switches between Event List and Event Detail views using local state (no routing between views).
2. **Redesign Event Detail left panel** — Replace the face photo (PhotoDisplay) with a QR code + save button + participant summary stats.
3. **Narrow the right panel** — Right panel reduced from 60% to 30%.
4. **Scale for large displays** — All UI elements (typography, cards, spacing, buttons) scale up on screens ≥1920px using a custom `3xl` breakpoint, with headings reaching `text-7xl`.
5. **New Indigo design system** — Replace olive green primary color with Indigo, add modern animations.
6. **Remove charts** — Cut EventBarChart and ParticipantPieChart entirely.
7. **Mock data for testing** — Environment-variable-toggled mock mode with realistic Thai-language data.

## Architecture

### Approach: Single-Page with View State

The app uses a single component `MainPage` rendered at route `/`. Navigation between views is handled by a `selectedEventId` state variable:

- `selectedEventId === null` → **Event List View** (SummaryCards + DateFilter + EventTable)
- `selectedEventId === "123"` → **Event Detail View** (QR + Stats + ParticipantGrid)

View transitions are animated (slide-left to enter detail, slide-right to return to list).

### Routing

```
/ → MainPage (the only route)
* → Redirect to /
```

React Router is kept but reduced to a single route. No `react-router-dom` params or navigation between pages.

## File Structure (After Refactor)

### New / Modified Files

```
src/
├── App.jsx                            ← Simplify to single route "/"
├── main.jsx                           ← No change
├── index.css                          ← New design tokens (Indigo, animations, 3xl breakpoint)
├── pages/
│   └── MainPage.jsx                   ← NEW: Single page with view state switching
├── components/
│   ├── layout/
│   │   └── Header.jsx                 ← REPLACE Navbar: minimal header (brand + dark mode)
│   ├── event-list/                    ← NEW directory
│   │   ├── SummaryCards.jsx           ← ADAPT from dashboard/SummaryCards (add count-up animation)
│   │   ├── DateFilter.jsx             ← NEW: extracted date filter component
│   │   └── EventTable.jsx            ← ADAPT from dashboard/EventTable (simplify to single "enter" button)
│   └── event-detail/                  ← NEW directory
│       ├── LeftPanel.jsx              ← NEW: QR code + save button + summary stats
│       ├── RightPanel.jsx             ← NEW: wrapper for ParticipantGrid + SummaryBar
│       ├── ParticipantGrid.jsx        ← ADAPT from live/ParticipantGrid (compact for 30% width)
│       └── SummaryBar.jsx             ← ADAPT from live/SummaryBar
├── hooks/
│   ├── useAutoRefresh.js              ← No change
│   ├── useEvents.js                   ← No change
│   └── useParticipants.js             ← No change
├── services/
│   └── api.js                         ← ADD mock data toggle via env variable
├── context/
│   └── ThemeContext.jsx               ← No change
└── utils/
    ├── helpers.js                     ← No change
    └── mockData.js                    ← NEW: realistic mock events + participants
```

### Files to Delete

- `src/pages/DashboardPage.jsx` — Replaced by MainPage
- `src/pages/LiveCheckinPage.jsx` — Replaced by MainPage
- `src/components/dashboard/EventBarChart.jsx` — Charts removed
- `src/components/dashboard/ParticipantPieChart.jsx` — Charts removed
- `src/components/dashboard/ParticipantsModal.jsx` — No longer needed (detail view replaces it)
- `src/components/dashboard/QRModal.jsx` — Moved into LeftPanel
- `src/components/live/PhotoDisplay.jsx` — Replaced by QR code in LeftPanel
- `src/components/layout/Navbar.jsx` — Replaced by Header

## View 1: Event List View

Displayed when no event is selected (`selectedEventId === null`).

### Layout (top to bottom)

1. **Header** — Sticky top. Brand name + dark mode toggle. Minimal.
2. **DateFilter** — Preset buttons (วันนี้, 7 วันล่าสุด, เดือนนี้, ปีนี้) + custom date pickers + refresh button. Active preset highlighted in Indigo.
3. **SummaryCards** — 4 cards in a horizontal grid:
   - กิจกรรมทั้งหมด (CalendarDays icon)
   - ผู้เข้าร่วมทั้งหมด (Users icon)
   - Staff (UserCheck icon)
   - Student & Guest (UserPlus icon)
   - Each card number has **count-up animation** (0 → actual value in ~800ms).
   - Cards appear with **fade-in stagger** (100ms delay between each).
4. **EventTable** — Searchable, paginated table of events.
   - Columns: ชื่อกิจกรรม, ประเภท, วันที่, เวลา, สถานที่, จำนวนคน, [เข้ากิจกรรม]
   - Single action button per row: **"เข้ากิจกรรม"** (arrow-right icon). Clicking sets `selectedEventId`.
   - Remove individual PDF/QR/Live buttons from each row.
   - Table rows have **hover:scale-[1.02] transition** and subtle background highlight.
   - Search, page size selector (10/20/50), and pagination controls retained.

### Data Flow

- `useEvents(startDate, endDate)` fetches event list.
- `Promise.allSettled` fetches participant summaries for all events (for SummaryCards aggregate counts).
- Date state persisted in `sessionStorage` (same as current behavior).

## View 2: Event Detail View

Displayed when an event is selected (`selectedEventId !== null`). Enters with **slide-left animation**, exits with **slide-right**.

### Header Bar

- **Back button** (← กลับ) — Sets `selectedEventId = null`, triggers slide-right transition back to Event List.
- **Event title** — Large, responsive heading (sm:text-2xl → 3xl:text-7xl).
- **Event subtitle** — Date, time range, location in smaller text.
- **Controls (right side):**
  - Auto-refresh toggle with countdown display (🔄 5s)
  - Fullscreen toggle (⛶)
  - Dark mode toggle (🌙/☀️)

### Main Content: Left Panel (70%) + Right Panel (30%)

Full viewport height (`h-[100dvh]`), no page scroll.

#### Left Panel (70% width on desktop, full width stacked on mobile)

**Section 1: Summary Stats (2×2 grid)**

4 cards arranged in a 2-column grid, each containing:
- Icon + label (e.g. 👥 ทั้งหมด)
- Large number with **count-up animation**
- **Animated progress bar** showing proportion relative to total (width animates from 0% to actual %)
- Color-coded: Total=Indigo, Staff=Green, Student=Blue, Guest=Amber

**Section 2: QR Code + Latest Scan (side by side)**

Arranged as a 2-column layout within the left panel:

- **Left sub-section: QR Code**
  - Large QR code image from `event.qr_img`
  - Scaled to fill available space (max ~280px on desktop, larger on 3xl screens)
  - **"💾 บันทึก QR Code"** button below
  - Save mechanism: Fetch the QR image, draw to canvas, trigger `<a download>` to save as PNG

- **Right sub-section: Latest Scan Card**
  - Shows the most recently scanned participant
  - Displays: name, user_type badge (color-coded), department, check-in timestamp
  - **Green pulse dot** indicator + "สแกนล่าสุด" label
  - Updates automatically on each auto-refresh cycle
  - When a new scan is detected: **entrance animation** (scale-in + fade)
  - When no participants yet: placeholder "รอผู้เข้าร่วมสแกน..." with subtle pulse animation

#### Right Panel (30% width on desktop, full width stacked on mobile)

**Top: Filter Tabs**
- Pill buttons: ทั้งหมด | Staff | Student | Guest
- Each shows count in parentheses
- Active tab highlighted in Indigo

**Middle: Participant List (scrollable)**
- Compact list format (optimized for narrow 30% width)
- Each row: Name, user_type badge, check-in time
- Sorted descending by `regis_date` (newest first)
- **Glow animation** (3-second green ring pulse + "ล่าสุด" sparkle badge) on the newest scan
- Clicking a row updates the "Latest Scan Card" in the left panel

**Bottom: SummaryBar (sticky)**
- 4-column compact display: Total | Staff | Student | Guest with counts
- Fixed at bottom of right panel

### Footer Bar

- Auto-refresh interval indicator with countdown
- Online/offline connection status dot (green=connected, yellow=reconnecting, red=offline)

### Features Retained from LiveCheckinPage

- `useAutoRefresh` hook (5-second polling, page-visibility aware)
- `useParticipants` hook for data fetching
- Fullscreen API toggle
- Network online/offline detection (`window.addEventListener('online'/'offline')`)
- New scan detection via `useRef` comparison

## Design System

### Color Palette

#### Primary: Indigo

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--color-primary` | `#4f46e5` (indigo-600) | `#818cf8` (indigo-400) |
| `--color-primary-dark` | `#3730a3` (indigo-800) | `#6366f1` (indigo-500) |
| `--color-primary-light` | `#eef2ff` (indigo-50) | `#1e1b4b` (indigo-950) |

#### Surfaces

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--color-surface` | `#ffffff` | `#0a0a0a` (neutral-950) |
| `--color-background` | `#f8fafc` (slate-50) | `#030712` (gray-950) |

#### Category Colors (Badges & Progress Bars)

| Category | Light Mode | Dark Mode |
|---|---|---|
| Staff | `#16a34a` (green-600) | `#22c55e` (green-500) |
| Student | `#3b82f6` (blue-500) | `#60a5fa` (blue-400) |
| Guest | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) |

### Typography Scale (Responsive)

| Element | sm | lg | 2xl | 3xl (≥1920px) |
|---|---|---|---|---|
| Event title (detail view) | text-2xl | text-4xl | text-5xl | text-7xl |
| Summary card numbers | text-2xl | text-3xl | text-4xl | text-6xl |
| Table body text | text-sm | text-base | text-lg | text-xl |
| Buttons | text-sm | text-base | text-lg | text-xl |
| Header brand | text-lg | text-xl | text-2xl | text-3xl |
| Summary card labels | text-xs | text-sm | text-base | text-lg |
| Participant name (grid) | text-sm | text-base | text-lg | text-xl |

### Custom Breakpoint

```css
@custom-media --3xl (width >= 1920px);
```

Add `3xl` variant to Tailwind CSS v4 configuration in `index.css`.

### Animation Catalog

| Animation | Where Used | Details |
|---|---|---|
| Count-up | Summary card numbers | Number counts from 0 to actual value over ~800ms using requestAnimationFrame |
| Fade-in stagger | Cards, table rows on load | Each element fades in sequentially with 100ms delay |
| Slide transition | Event List ↔ Event Detail | Slide-left entering detail, slide-right returning to list. ~300ms ease-out |
| Glow pulse | Newest scan in ParticipantGrid | Indigo/green ring pulse for 3 seconds (retained from current `animate-glow`) |
| Scale hover | Buttons, cards, table rows | `hover:scale-[1.02] transition-transform duration-200` |
| Progress bar fill | Summary stats bars in LeftPanel | Width animates from 0% to proportional value over ~600ms ease-out |
| Pulse dot | Latest scan indicator, online status | Continuous subtle pulse (retained from current) |
| Skeleton shimmer | Loading states | Gray placeholder boxes with shimmer gradient animation |
| Scale-in entrance | Latest scan card update | New scan info scales from 0.95 to 1.0 with fade, ~200ms |

### CSS Keyframes to Define

```css
@keyframes count-up { /* handled via JS requestAnimationFrame */ }

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
  to { width: var(--target-width); }
}
```

## Mock Data

### Configuration

Environment variable in `.env`:

```
API_USE_MOCK=true
```

Accessed via `import.meta.env.API_USE_MOCK`. When `"true"`, `api.js` returns mock data with a simulated delay (300-500ms random) instead of making real HTTP requests.

### Mock Data Content (`src/utils/mockData.js`)

**Mock Events (6 events):**
- Thai event names (e.g. "ประชุมวิชาการเภสัชกรรมคลินิก", "อบรม AI ทางเภสัชศาสตร์")
- Varied event types (ประชุม, อบรม, สัมมนา)
- Dates within current month
- Realistic time ranges and Thai location names
- Placeholder QR image URLs (use `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=EVENT_ID`)

**Mock Participants (30-50 per event):**
- Thai first + last names
- Distributed user_type: ~40% staff, ~35% student, ~25% guest
- Thai department names (e.g. "ภาควิชาเภสัชกรรม", "ภาควิชาเภสัชเคมี")
- Realistic check-in timestamps (spread across event time range)
- Photo URLs left as empty/null (no face photos in new design)

**Mock Summary:**
- Auto-calculated from mock participants per event

## QR Code Save Feature

Implementation approach for the "💾 บันทึก QR Code" button:

1. Fetch the QR image from `event.qr_img` URL
2. Draw it onto an off-screen `<canvas>` element
3. Convert canvas to blob via `canvas.toBlob()`
4. Create a temporary `<a>` element with `download` attribute
5. Set `href` to `URL.createObjectURL(blob)`
6. Trigger click to download
7. Clean up the object URL

Filename format: `QR-{event_title}-{event_date}.png`

## What Gets Removed

| Item | Reason |
|---|---|
| `DashboardPage.jsx` | Replaced by MainPage |
| `LiveCheckinPage.jsx` | Replaced by MainPage |
| `EventBarChart.jsx` | Charts removed per requirement |
| `ParticipantPieChart.jsx` | Charts removed per requirement |
| `ParticipantsModal.jsx` | Replaced by Event Detail View |
| `QRModal.jsx` | QR display moved into LeftPanel inline |
| `PhotoDisplay.jsx` | Replaced by QR code + Latest Scan card |
| `Navbar.jsx` | Replaced by simpler Header |
| `recharts` dependency | No longer needed (no charts) |
| Dashboard ↔ Live navigation | Single page, no inter-page navigation |
| Session storage for date state | Can simplify to just `useState` (single page context) |

## What Gets Kept (Unchanged)

| Item | Notes |
|---|---|
| `useAutoRefresh.js` | Same polling + visibility logic |
| `useEvents.js` | Same API integration |
| `useParticipants.js` | Same API integration |
| `ThemeContext.jsx` | Same dark/light toggle |
| `helpers.js` | Same date formatting utilities |
| `vite.config.js` | Same proxy config (add envPrefix for mock flag) |
| Fullscreen API | Same implementation in Event Detail View |
| Online/Offline detection | Same window event listeners |
| New scan detection | Same useRef-based comparison |

## Mobile Responsiveness

On screens smaller than `lg` (1024px):

- **Event List View**: Stacks vertically naturally (cards in 2-col grid on sm, 4-col on lg+)
- **Event Detail View**: Left and right panels stack vertically (left panel on top, right panel below)
- Left panel sections (Summary Stats + QR/Latest Scan) also stack vertically on small screens
- Touch-friendly button sizes and spacing
