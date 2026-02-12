import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'

let inactivityTimeout = null
let warningTimeout = null

export function initInactivityControl() {
  const auth = useAuthStore()

  const resetTimers = () => {
    clearTimeout(inactivityTimeout)
    clearTimeout(warningTimeout)

    // Aviso a los 50s
    warningTimeout = setTimeout(() => {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión inactiva',
        text: 'Tu sesión se cerrará en 10 segundos',
        timer: 10000,
        showConfirmButton: false,
      })
    }, 50000)

    // Logout a los 60s
    inactivityTimeout = setTimeout(() => {
      auth.logout()
    }, 60000)
  }

  ;['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
    window.addEventListener(event, resetTimers)
  })

  resetTimers()
}
