export function formatCOP(value: number | string | undefined | null): string {
  return '$ ' + Number(value || 0).toLocaleString('es-CO')
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-CO')
}
