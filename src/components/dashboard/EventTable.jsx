import { Eye, Download, QrCode, Radio } from 'lucide-react'
import { formatTime } from '../../utils/helpers'

export default function EventTable({ events, participantsMap, onViewParticipants, onViewQR, onGoLive }) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 text-center">
        <p className="text-neutral-400 text-lg">ไม่มีข้อมูลกิจกรรม</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800">Event List</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">ชื่อกิจกรรม</th>
              <th className="px-4 py-3 text-left">ประเภท</th>
              <th className="px-4 py-3 text-left">สถานที่</th>
              <th className="px-4 py-3 text-left">เวลา</th>
              <th className="px-4 py-3 text-center">ผู้เข้าร่วม</th>
              <th className="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {events.map((ev, idx) => {
              const summary = participantsMap[ev.event_id]
              const apiBase = import.meta.env.API_BASE_URL || '/api'
              const pdfBaseUrl = apiBase.startsWith('http') ? apiBase.replace('/api', '') : ''
              return (
                <tr key={ev.event_id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800 max-w-xs truncate">{ev.event_title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-primary-light text-primary-dark font-medium">
                      {ev.event_type || 'อื่นๆ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{ev.event_addr}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatTime(ev.event_time_start)} - {formatTime(ev.event_time_stop)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-neutral-800">
                    {summary ? summary.total : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewParticipants(ev.event_id)}
                        className="p-1.5 rounded-lg hover:bg-primary-light text-primary transition-colors"
                        title="ดูรายชื่อ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ev.pdf_file && (
                        <a
                          href={`${pdfBaseUrl}/pdf/${ev.pdf_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="ดาวน์โหลด"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onViewQR(ev)}
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                        title="QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onGoLive(ev.event_id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="ไป Live"
                      >
                        <Radio className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
