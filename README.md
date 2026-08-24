# 🪪 Face Scan Event Check-in Dashboard

เว็บแดชบอร์ดสำหรับแสดงข้อมูลการลงชื่อเข้าใช้งานอุปกรณ์ **Face Scan** (ระบบสแกนใบหน้า) และสถิติการเข้าร่วมกิจกรรมต่างๆ พัฒนาขึ้นสำหรับคณะเภสัชศาสตร์ มหาวิทยาลัยเชียงใหม่ (Pharmacy CMU)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 📊 Dashboard ภาพรวม (`/dashboard`)
- **กรองช่วงวันที่ (Date Range Filter)**: เลือกดูข้อมูลกิจกรรมตามช่วงวันที่ต้องการ (ค่าเริ่มต้นเป็นวันที่ปัจจุบัน)
- **กล่องสรุปสถิติ (Summary Cards)**: แสดงจำนวนกิจกรรมประจำวัน, ผู้เข้าร่วมทั้งหมด, Staff, และ Student & Guest
- **กราฟวิเคราะห์ข้อมูล (Interactive Charts)**:
  - **Bar Chart**: สรุปจำนวนผู้เข้าร่วมแยกตามประเภทกิจกรรม
  - **Pie Chart**: สัดส่วนผู้เข้าร่วมแยกตามสถานะ (Staff / Student / Guest)
- **ตารางกิจกรรม (Event Table)**:
  - 👁️ **Drill-down Modal**: ดูรายชื่อผู้ลงทะเบียน/สแกนใบหน้าแบบละเอียด (รูปถ่าย, ชื่อ, สังกัด, เวลา Check-in)
  - 📥 **Download PDF**: ลิงก์ดาวน์โหลดรายงานสรุปกิจกรรม
  - 📱 **QR Code Modal**: แสดงรูปภาพ QR Code สำหรับใช้ลงทะเบียนหรือสแกน
  - 🔴 **Go Live**: ปุ่มกดเปิดหน้า Live Check-in ประจำกิจกรรมนั้นๆ

### 2. 🔴 Live Check-in หน้าจอสด (`/live/:eventId`)
- **จอแสดงผลแบบ Split-Screen (40 / 60)**: ออกแบบมาเพื่อแสดงผลบนจอ TV / Projector หน้างานกิจกรรม
  - **ฝั่งซ้าย (40%)**: แสดงรูปภาพผู้สแกนใบหน้าขนาดใหญ่ พร้อมชื่อ-นามสกุล, สังกัด, สถานะ และเวลาที่สแกน
  - **ฝั่งขวา (60%)**: รายชื่อผู้ Check-in เรียงลำดับจากล่าสุดลงมา สามารถคลิกเลือกรายชื่อเพื่อดูรูปฝั่งซ้ายได้ทันที
- **Auto-Refresh ทุก 5 วินาที**:
  - อัปเดตข้อมูลอัตโนมัติแบบ Real-time พร้อมแถบนับเวลาถอยหลังและปุ่มเปิด/ปิด
  - **ประหยัดทรัพยากร**: หยุดทำงานอัตโนมัติเมื่อผู้ใช้สลับหน้า หรือย่อ/สลับแท็บเบราว์เซอร์ (Page Visibility API)
- **หน้ารายการกิจกรรมสำรอง**: กรณีเข้าลิงก์ `/live` โดยตรง ระบบจะแสดงรายการกิจกรรมประจำวันให้เลือกทันที

### 3. 🎨 ธีมและดีไซน์
- ใช้ธีมสีประจำคณะเภสัชศาสตร์ มช. (**Olive Green `#5c990e`**)
- ฟอนต์ภาษาไทยและอังกฤษ **Noto Sans Thai** & **Inter**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```bash
cp .env.example .env
```
กำหนดค่า URL ของ API ในไฟล์ `.env`:
```env
API_BASE_URL=https://your-api-endpoint-url.com/api
```

### 3. รันโปรเจกต์ในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

### 4. Build สำหรับ Production
```bash
npm run build
```
ไฟล์สำหรับ Deploy จะถูกสร้างไว้ในโฟลเดอร์ `dist/`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
dashboard-face-scan/
├── src/
│   ├── components/
│   │   ├── dashboard/       # คอมโพเนนต์หน้า Dashboard (SummaryCards, Charts, EventTable, Modals)
│   │   ├── layout/          # Navbar และ Header
│   │   └── live/            # คอมโพเนนต์หน้า Live (PhotoDisplay, ParticipantGrid, SummaryBar)
│   ├── hooks/               # Custom Hooks (useEvents, useParticipants, useAutoRefresh)
│   ├── pages/               # DashboardPage, LiveCheckinPage
│   ├── services/            # API Service Layer (fetchEvents, fetchParticipants)
│   ├── utils/               # ฟังก์ชันแปลงวันที่ เวลา และ Helpers
│   ├── App.jsx              # การตั้งค่า Route
│   ├── index.css            # Tailwind CSS @theme configuration
│   └── main.jsx             # Entry point
├── .env.example             # ตัวอย่างการกำหนดค่า Environment Variables
├── vite.config.js           # การตั้งค่า Vite (React, Tailwind v4, API_ prefix)
└── package.json
```

---

## 🔒 ความปลอดภัย (Security & Privacy)
- โปรเจกต์นี้ไม่เปิดเผย Endpoint จริงบน Git (จัดการผ่านไฟล์ `.env` ที่ถูก Ignore ไว้)
- ไม่มีการเก็บข้อมูลส่วนบุคคล (PDPA) ลงบน Repository
