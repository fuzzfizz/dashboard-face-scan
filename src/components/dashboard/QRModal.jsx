import { X } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function QRModal({ event, onClose }) {
  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-800">QR Code</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <img
          src={event.qr_img}
          alt={`QR: ${event.event_title}`}
          className="mx-auto max-w-full rounded-lg border border-neutral-200"
        />
        <p className="mt-4 font-medium text-neutral-800">{event.event_title}</p>
        <p className="text-sm text-neutral-500">{formatDate(event.event_date)}</p>
      </div>
    </div>
  )
}
