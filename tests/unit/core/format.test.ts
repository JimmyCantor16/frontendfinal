import { describe, it, expect } from 'vitest'
import { formatCOP, formatDate, formatDateTime } from '@core/utils/format'

describe('Format Utils', () => {
  describe('formatCOP', () => {
    it('should format number as COP currency', () => {
      const result = formatCOP(1000)
      expect(result).toContain('1')
      expect(result).toContain('000')
      expect(result).toMatch(/^\$/)
    })

    it('should handle zero', () => {
      const result = formatCOP(0)
      expect(result).toContain('0')
    })

    it('should handle null/undefined with fallback to 0', () => {
      expect(formatCOP(null)).toContain('0')
      expect(formatCOP(undefined)).toContain('0')
    })

    it('should handle string numbers', () => {
      const result = formatCOP('5000')
      expect(result).toContain('5')
    })
  })

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const result = formatDate('2026-03-08')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle null/undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format a valid datetime string', () => {
      const result = formatDateTime('2026-03-08T14:30:00')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle null/undefined', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
    })
  })
})
