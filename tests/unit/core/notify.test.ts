import { describe, it, expect, vi, beforeEach } from 'vitest'
import Swal from 'sweetalert2'
import { notifySuccess, notifyError, notifyApiError, confirmAction } from '@core/utils/notify'

describe('Notify Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('notifySuccess', () => {
    it('should call Swal.fire with success icon and title', () => {
      notifySuccess('Guardado')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'success',
          title: 'Guardado',
          timer: 1200,
          showConfirmButton: false,
        })
      )
    })
  })

  describe('notifyError', () => {
    it('should call Swal.fire with error icon', () => {
      notifyError('Error', 'Algo falló')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'error',
          title: 'Error',
          text: 'Algo falló',
        })
      )
    })
  })

  describe('notifyApiError', () => {
    it('should extract message from axios error response', () => {
      const err = { response: { data: { message: 'Token inválido' } } }
      notifyApiError(err)
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Token inválido',
        })
      )
    })

    it('should extract error field from response', () => {
      const err = { response: { data: { error: 'No autorizado' } } }
      notifyApiError(err)
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'No autorizado',
        })
      )
    })

    it('should use Error.message as fallback', () => {
      const err = new Error('Network Error')
      notifyApiError(err)
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Network Error',
        })
      )
    })

    it('should use fallback string for non-object errors', () => {
      notifyApiError(null, 'Error desconocido')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Error desconocido',
        })
      )
    })

    it('should use default fallback message', () => {
      notifyApiError(undefined)
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Ocurrió un error',
        })
      )
    })
  })

  describe('confirmAction', () => {
    it('should show confirmation dialog and return isConfirmed', async () => {
      const result = await confirmAction('¿Eliminar?', 'No se puede deshacer')
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '¿Eliminar?',
          text: 'No se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
        })
      )
      expect(result).toBe(true)
    })
  })
})
