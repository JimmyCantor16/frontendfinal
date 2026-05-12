/**
 * Composable que detecta entradas de un scanner de códigos de barras
 * tipo "keyboard wedge" (USB que emula teclado).
 *
 * Heurística: el scanner tipea muchos caracteres MUY rápido (típicamente
 * <30 ms entre teclas) y termina con Enter. Un humano tipea con >100 ms
 * de gap. Acumulamos chars cuando vienen rápidos seguidos, y cuando llega
 * Enter (o pasa un timeout) emitimos el código completo.
 *
 * NO ejecutamos el callback si el usuario está escribiendo en un input,
 * textarea o contenteditable — eso permite que igual pueda buscar/escribir
 * con teclado sin que el scanner interfiera.
 *
 * Uso:
 *   const scanner = useBarcodeScanner({
 *     onScan: (code) => { ... },
 *     minLength: 4,
 *     maxIntervalMs: 40,
 *   })
 *   onMounted(scanner.start)
 *   onBeforeUnmount(scanner.stop)
 */

interface ScannerOptions {
  /** Callback cuando se detecta un código completo. */
  onScan: (code: string) => void
  /** Largo mínimo válido del código (default: 4). */
  minLength?: number
  /** Intervalo máximo entre teclas para considerarlo scanner (default: 40 ms). */
  maxIntervalMs?: number
  /** Tiempo máximo total esperando Enter antes de descartar el buffer (default: 500 ms). */
  bufferTimeoutMs?: number
}

interface ScannerHandle {
  start: () => void
  stop: () => void
  isActive: () => boolean
}

export function useBarcodeScanner(opts: ScannerOptions): ScannerHandle {
  const {
    onScan,
    minLength = 4,
    maxIntervalMs = 40,
    bufferTimeoutMs = 500,
  } = opts

  let buffer = ''
  let lastKeyAt = 0
  let bufferTimer: ReturnType<typeof setTimeout> | null = null
  let active = false

  function isTypingInField(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (target.isContentEditable) return true
    return false
  }

  function resetBuffer(): void {
    buffer = ''
    if (bufferTimer) {
      clearTimeout(bufferTimer)
      bufferTimer = null
    }
  }

  function flushIfValid(): void {
    const code = buffer.trim()
    resetBuffer()
    if (code.length >= minLength) {
      onScan(code)
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (!active) return
    // Si el user está tipeando en un campo, dejá pasar normal.
    if (isTypingInField(event.target)) return

    const now = Date.now()
    const gap = now - lastKeyAt
    lastKeyAt = now

    if (event.key === 'Enter') {
      // Solo tomamos Enter como "fin de scan" si veníamos acumulando rápido
      if (buffer.length >= minLength) {
        event.preventDefault()
        flushIfValid()
      } else {
        resetBuffer()
      }
      return
    }

    // Solo caracteres imprimibles de 1 char (filtra Shift, Ctrl, etc.)
    if (event.key.length !== 1) return

    // Si el gap es alto y ya teníamos algo, descartamos lo anterior
    if (buffer.length > 0 && gap > maxIntervalMs) {
      resetBuffer()
    }

    buffer += event.key

    // Reset del timer cada vez que llega un char
    if (bufferTimer) clearTimeout(bufferTimer)
    bufferTimer = setTimeout(() => {
      // Si pasó el timeout sin Enter, intentar flush igual
      flushIfValid()
    }, bufferTimeoutMs)
  }

  return {
    start(): void {
      if (active) return
      active = true
      document.addEventListener('keydown', handleKeydown, true)
    },
    stop(): void {
      if (!active) return
      active = false
      document.removeEventListener('keydown', handleKeydown, true)
      resetBuffer()
      lastKeyAt = 0
    },
    isActive(): boolean {
      return active
    },
  }
}
