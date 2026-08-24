import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTheme } from '../../context/ThemeContext'

const COLORS = ['#5c990e', '#3b82f6', '#eab308']

export default function ParticipantPieChart({ staffCount = 0, studentCount = 0, guestCount = 0 }) {
  const { isDark } = useTheme()
  const data = [
    { name: 'Staff', value: staffCount },
    { name: 'Student', value: studentCount },
    { name: 'Guest', value: guestCount },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-center h-64 sm:h-80 transition-colors">
        <p className="text-neutral-400 dark:text-neutral-500 text-sm">ไม่มีข้อมูลสัดส่วนผู้เข้าร่วม</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6 transition-colors">
      <h3 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-3 sm:mb-4">สัดส่วนผู้เข้าร่วมตามสถานะ</h3>
      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#d1d5db' : '#374151' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
