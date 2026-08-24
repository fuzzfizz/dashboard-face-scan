import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function EventBarChart({ events = [], participantsMap = {} }) {
  const typeMap = {}
  events.forEach((ev) => {
    const type = ev.event_type || 'อื่นๆ'
    if (!typeMap[type]) typeMap[type] = 0
    const summary = participantsMap[ev.event_id]
    typeMap[type] += summary ? summary.total : 0
  })

  const data = Object.entries(typeMap).map(([name, value]) => ({ name, จำนวนผู้เข้าร่วม: value }))

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex items-center justify-center h-80">
        <p className="text-neutral-400">ไม่มีข้อมูล</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Participants by Event Type</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="จำนวนผู้เข้าร่วม" fill="#5c990e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
