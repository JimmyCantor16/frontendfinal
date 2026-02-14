import Swal from 'sweetalert2'

let inactivityTimeout: ReturnType<typeof setTimeout> | null = null
let warningTimeout: ReturnType<typeof setTimeout> | null = null
let inactivityWarningOpen = false

const EVENTS = ['mousemove', 'keydown', 'click', 'scroll'] as const

let resetTimers: (() => void) | null = null

export function initInactivityControl(onLogout: () => void): void {
  clearInactivityControl()

  resetTimers = () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout)
    if (warningTimeout) clearTimeout(warningTimeout)

    // Solo cerrar el SweetAlert de inactividad, no otros modales
    if (inactivityWarningOpen) {
      Swal.close()
      inactivityWarningOpen = false
    }

    warningTimeout = setTimeout(() => {
      inactivityWarningOpen = true
      Swal.fire({
        title: 'Sesión por expirar',
        text: 'Se cerrará por inactividad',
        icon: 'warning',
        timer: 10000,
        showConfirmButton: false,
      }).then(() => {
        inactivityWarningOpen = false
      })
    }, 50000)

    inactivityTimeout = setTimeout(() => {
      onLogout()
    }, 60000)
  }

  EVENTS.forEach((event) => window.addEventListener(event, resetTimers!))
  resetTimers()
}

export function clearInactivityControl(): void {
  if (inactivityTimeout) clearTimeout(inactivityTimeout)
  if (warningTimeout) clearTimeout(warningTimeout)

  if (resetTimers) {
    EVENTS.forEach((event) => window.removeEventListener(event, resetTimers!))
    resetTimers = null
  }
}
