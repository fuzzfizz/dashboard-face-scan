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
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex items-center justify-center h-80">
        <p className="text-neutral-400">ไม่มีข้อมูล</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Participant Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
