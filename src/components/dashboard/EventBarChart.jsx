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
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex items-center justify-center h-64 sm:h-80">
        <p className="text-neutral-400 text-sm">ไม่มีข้อมูลกิจกรรม</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-3 sm:mb-4">
        จำนวนผู้เข้าร่วมแยกตามประเภทกิจกรรม
      </h3>
      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="จำนวนผู้เข้าร่วม" fill="#5c990e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
