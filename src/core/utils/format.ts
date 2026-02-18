export function formatCOP(value: number | string | undefined | null): string {
  return '$ ' + Number(value || 0).toLocaleString('es-CO')
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CO')
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO') + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
