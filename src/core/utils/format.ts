export function formatCOP(value: number | string | undefined | null): string {
  return '$ ' + Number(value || 0).toLocaleString('es-CO')
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO')
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export function formatTime(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
