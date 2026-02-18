import Swal from 'sweetalert2'

const SWAL_Z_INDEX = 100000

export function notifySuccess(title: string): void {
  Swal.fire({
    icon: 'success',
    title,
    timer: 1200,
    showConfirmButton: false,
    customClass: { popup: 'swal-above-dialog' },
    didOpen: () => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(SWAL_Z_INDEX)
    },
  })
}

export function notifyError(title: string, text?: string): void {
  Swal.fire({
    icon: 'error',
    title,
    text,
    customClass: { popup: 'swal-above-dialog' },
    didOpen: () => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(SWAL_Z_INDEX)
    },
  })
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
    customClass: { popup: 'swal-above-dialog' },
    didOpen: () => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(SWAL_Z_INDEX)
    },
  })
  return result.isConfirmed
}

export async function promptInput(
  title: string,
  text?: string,
  inputPlaceholder = ''
): Promise<string | null> {
  const result = await Swal.fire({
    title,
    text,
    input: 'textarea',
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value || !value.trim()) return 'Este campo es requerido'
      return null
    },
    customClass: { popup: 'swal-above-dialog' },
    didOpen: () => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(SWAL_Z_INDEX)
    },
  })
  return result.isConfirmed ? (result.value as string) : null
}

export async function promptPassword(
  title: string,
  text?: string
): Promise<string | null> {
  const result = await Swal.fire({
    title,
    text,
    input: 'password',
    inputPlaceholder: 'Ingrese contraseña',
    showCancelButton: true,
    confirmButtonText: 'Verificar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    customClass: { popup: 'swal-above-dialog' },
    didOpen: () => {
      const container = Swal.getContainer()
      if (container) container.style.zIndex = String(SWAL_Z_INDEX)
    },
  })
  return result.isConfirmed ? (result.value as string) : null
}
