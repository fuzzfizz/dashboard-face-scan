import { X } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function QRModal({ event, onClose }) {
  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-4 sm:p-6 max-w-md w-full text-center max-h-[90dvh] flex flex-col overflow-y-auto border border-neutral-200 dark:border-neutral-700 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-neutral-800 dark:text-neutral-100 truncate mr-2">QR Code สำหรับลงทะเบียน</h2>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer shrink-0 transition-colors">
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 inline-block mx-auto shadow-xs">
          <img
            src={event.qr_img}
            alt={`QR: ${event.event_title}`}
            className="mx-auto max-w-full max-h-[50vh] object-contain rounded-xl"
          />
        </div>
        <p className="mt-4 font-bold text-neutral-800 dark:text-neutral-100 text-sm sm:text-base leading-snug">{event.event_title}</p>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">{formatDate(event.event_date)}</p>
      </div>
    </div>
  )
}
