import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'
import { useDebouncedRef } from '@core/utils/debounce'

describe('useDebouncedRef', () => {
  it('should return initial value immediately', () => {
    const scope = effectScope()
    const source = ref('hello')
    let debounced: ReturnType<typeof useDebouncedRef<string>>
    scope.run(() => {
      debounced = useDebouncedRef(source, 300)
    })
    expect(debounced!.value).toBe('hello')
    scope.stop()
  })

  it('should debounce updates', async () => {
    vi.useFakeTimers()
    const scope = effectScope()
    const source = ref('a')
    let debounced: ReturnType<typeof useDebouncedRef<string>>
    scope.run(() => {
      debounced = useDebouncedRef(source, 300)
    })

    source.value = 'b'
    await nextTick()
    expect(debounced!.value).toBe('a')

    vi.advanceTimersByTime(300)
    await nextTick()
    expect(debounced!.value).toBe('b')

    scope.stop()
    vi.useRealTimers()
  })

  it('should only apply last value within delay', async () => {
    vi.useFakeTimers()
    const scope = effectScope()
    const source = ref('x')
    let debounced: ReturnType<typeof useDebouncedRef<string>>
    scope.run(() => {
      debounced = useDebouncedRef(source, 200)
    })

    source.value = 'y'
    await nextTick()
    vi.advanceTimersByTime(100)

    source.value = 'z'
    await nextTick()
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(debounced!.value).toBe('z')
    scope.stop()
    vi.useRealTimers()
  })

  it('should cleanup timeout on scope disposal', async () => {
    vi.useFakeTimers()
    const source = ref('a')
    const scope = effectScope()
    let debounced: ReturnType<typeof useDebouncedRef<string>>
    scope.run(() => {
      debounced = useDebouncedRef(source, 300)
    })

    source.value = 'b'
    await nextTick()
    scope.stop() // Disposes, should clear timeout

    vi.advanceTimersByTime(300)
    await nextTick()
    // Value should NOT have updated since scope was disposed
    expect(debounced!.value).toBe('a')
    vi.useRealTimers()
  })
})
