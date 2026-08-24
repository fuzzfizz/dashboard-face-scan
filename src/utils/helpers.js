export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(timeStr) {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

export function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDaysAgo(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStartOfMonth() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export function getStartOfYear() {
  const d = new Date()
  const year = d.getFullYear()
  return `${year}-01-01`
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}
