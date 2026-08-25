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

    const name = `${randomItem(THAI_FIRST_NAMES)} ${randomItem(THAI_LAST_NAMES)}`
    const pid = `${eventId}-p${String(i + 1).padStart(3, '0')}`

    participants.push({
      regis_id: pid,
      participant_name: name,
      user_type: userType,
      user_department: randomItem(DEPARTMENTS),
      participant_photo: `https://i.pravatar.cc/150?u=${pid}`,
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
