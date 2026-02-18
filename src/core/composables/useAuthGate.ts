import { ref } from 'vue'
import { verifyPassword } from '@core/services/auth-verify.service'
import { promptPassword, notifyError } from '@core/utils/notify'
import { useAuthStore } from '@modules/auth/store/auth.store'

const MAX_ATTEMPTS = 3
const failedAttempts = ref(0)

export function useAuthGate() {
  const authStore = useAuthStore()

  function resetAttempts() {
    failedAttempts.value = 0
  }

  async function requirePassword(
    title = 'Verificación de identidad',
    text = 'Ingresa tu contraseña para continuar'
  ): Promise<boolean> {
    const password = await promptPassword(title, text)
    if (password === null) return false

    const valid = await verifyPassword(password)
    if (valid) {
      resetAttempts()
      return true
    }

    failedAttempts.value++
    const remaining = MAX_ATTEMPTS - failedAttempts.value

    if (remaining <= 0) {
      notifyError('Sesión bloqueada', 'Demasiados intentos fallidos. Serás redirigido al login.')
      setTimeout(() => authStore.logout(), 1500)
      return false
    }

    notifyError('Contraseña incorrecta', `Te quedan ${remaining} intento${remaining === 1 ? '' : 's'}.`)
    return false
  }

  return {
    failedAttempts,
    requirePassword,
    resetAttempts,
  }
}
