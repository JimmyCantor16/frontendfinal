import Swal from 'sweetalert2'

export function notifySuccess(title: string): void {
  Swal.fire({ icon: 'success', title, timer: 1200, showConfirmButton: false })
}

export function notifyError(title: string, text?: string): void {
  Swal.fire({ icon: 'error', title, text })
}

export function notifyApiError(err: unknown, fallback = 'Ocurrió un error'): void {
  const message =
    (err as any)?.response?.data?.message || (err as Error)?.message || fallback
  notifyError('Error', message)
}

export async function confirmAction(
  title: string,
  text?: string,
  confirmText = 'Confirmar'
): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    allowEscapeKey: true,
  })
  return result.isConfirmed
}
