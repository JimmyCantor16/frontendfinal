import { describe, it, expect, vi, beforeEach } from 'vitest'
import Swal from 'sweetalert2'
import { promptInput, promptPassword } from '@core/utils/notify'

describe('Notify Utils - Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('promptInput', () => {
    it('returns value when user confirms', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        value: 'user input text',
        isDenied: false,
        isDismissed: false,
      })

      const result = await promptInput('Enter value', 'Some text')

      expect(Swal.fire).toHaveBeenCalledTimes(1)
      expect(result).toBe('user input text')
    })

    it('returns null when user cancels', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: false,
        value: undefined,
        isDenied: false,
        isDismissed: true,
      })

      const result = await promptInput('Enter value')

      expect(result).toBeNull()
    })

    it('passes inputValidator that rejects empty input', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        value: 'valid',
        isDenied: false,
        isDismissed: false,
      })

      await promptInput('Title', 'Text', 'placeholder')

      const callArgs = vi.mocked(Swal.fire).mock.calls[0][0] as Record<string, unknown>
      const validator = callArgs.inputValidator as (value: string) => string | null

      expect(validator('')).toBe('Este campo es requerido')
      expect(validator('   ')).toBe('Este campo es requerido')
      expect(validator('valid')).toBeNull()
    })

    it('passes correct options to Swal.fire', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        value: 'test',
        isDenied: false,
        isDismissed: false,
      })

      await promptInput('My Title', 'My Text', 'My Placeholder')

      const callArgs = vi.mocked(Swal.fire).mock.calls[0][0] as Record<string, unknown>
      expect(callArgs.title).toBe('My Title')
      expect(callArgs.text).toBe('My Text')
      expect(callArgs.input).toBe('textarea')
      expect(callArgs.inputPlaceholder).toBe('My Placeholder')
      expect(callArgs.showCancelButton).toBe(true)
    })
  })

  describe('promptPassword', () => {
    it('returns value when user confirms', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        value: 'secret123',
        isDenied: false,
        isDismissed: false,
      })

      const result = await promptPassword('Enter password', 'Verify your identity')

      expect(Swal.fire).toHaveBeenCalledTimes(1)
      expect(result).toBe('secret123')
    })

    it('returns null when user cancels', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: false,
        value: undefined,
        isDenied: false,
        isDismissed: true,
      })

      const result = await promptPassword('Enter password')

      expect(result).toBeNull()
    })

    it('passes correct options to Swal.fire', async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({
        isConfirmed: true,
        value: 'pwd',
        isDenied: false,
        isDismissed: false,
      })

      await promptPassword('Verify', 'Enter your password')

      const callArgs = vi.mocked(Swal.fire).mock.calls[0][0] as Record<string, unknown>
      expect(callArgs.title).toBe('Verify')
      expect(callArgs.text).toBe('Enter your password')
      expect(callArgs.input).toBe('password')
      expect(callArgs.inputPlaceholder).toBe('Ingrese contraseña')
      expect(callArgs.showCancelButton).toBe(true)
    })
  })
})
