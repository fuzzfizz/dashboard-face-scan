import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#5c990e', '#3b82f6', '#eab308']

export default function ParticipantPieChart({ staffCount = 0, studentCount = 0, guestCount = 0 }) {
  const data = [
    { name: 'Staff', value: staffCount },
    { name: 'Student', value: studentCount },
    { name: 'Guest', value: guestCount },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex items-center justify-center h-64 sm:h-80">
        <p className="text-neutral-400 text-sm">ไม่มีข้อมูลสัดส่วนผู้เข้าร่วม</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-3 sm:mb-4">สัดส่วนผู้เข้าร่วมตามสถานะ</h3>
      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
