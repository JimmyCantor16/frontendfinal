import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unmock recaptcha for this test file
vi.unmock('@core/utils/recaptcha')

describe('getRecaptchaToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should reject when grecaptcha is undefined', async () => {
    // @ts-expect-error setting window property
    delete window.grecaptcha

    const { getRecaptchaToken } = await import('@core/utils/recaptcha')
    await expect(getRecaptchaToken()).rejects.toThrow('reCAPTCHA no disponible')
  })

  it('should resolve with token when grecaptcha works', async () => {
    // @ts-expect-error setting window property
    window.grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: vi.fn().mockResolvedValue('test-token-123'),
    }

    const { getRecaptchaToken } = await import('@core/utils/recaptcha')
    const token = await getRecaptchaToken()
    expect(token).toBe('test-token-123')
  })

  it('should reject when grecaptcha.execute fails', async () => {
    // @ts-expect-error setting window property
    window.grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: vi.fn().mockRejectedValue(new Error('execute failed')),
    }

    const { getRecaptchaToken } = await import('@core/utils/recaptcha')
    await expect(getRecaptchaToken()).rejects.toThrow('execute failed')
  })

  it('should timeout after 10 seconds', async () => {
    vi.useFakeTimers()

    // @ts-expect-error setting window property
    window.grecaptcha = {
      ready: () => { /* never calls callback */ },
      execute: vi.fn(),
    }

    const { getRecaptchaToken } = await import('@core/utils/recaptcha')
    const promise = getRecaptchaToken()

    vi.advanceTimersByTime(10001)

    await expect(promise).rejects.toThrow('reCAPTCHA timeout')
    vi.useRealTimers()
  })

  it('should pass custom action to execute', async () => {
    const executeMock = vi.fn().mockResolvedValue('token')
    // @ts-expect-error setting window property
    window.grecaptcha = {
      ready: (cb: () => void) => cb(),
      execute: executeMock,
    }

    const { getRecaptchaToken } = await import('@core/utils/recaptcha')
    await getRecaptchaToken('checkout')

    expect(executeMock).toHaveBeenCalledWith('test-key', { action: 'checkout' })
  })
})
