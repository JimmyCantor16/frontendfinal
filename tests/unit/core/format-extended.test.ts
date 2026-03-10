import { describe, it, expect } from 'vitest'
import { formatTime, formatDate, formatDateTime, formatCOP } from '@core/utils/format'

describe('Format Utils - Extended', () => {
  describe('formatTime', () => {
    it('formats a valid datetime string to time only', () => {
      const result = formatTime('2026-03-08T14:30:00')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      // Should contain hour and minute portions
      expect(result).toMatch(/\d{1,2}/)
    })

    it('returns empty string for null', () => {
      expect(formatTime(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(formatTime(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(formatTime('')).toBe('')
    })

    it('returns empty string for invalid date string', () => {
      expect(formatTime('not-a-date')).toBe('')
    })
  })

  describe('formatDate - invalid input', () => {
    it('returns empty string for invalid date string', () => {
      expect(formatDate('not-a-date')).toBe('')
    })

    it('returns empty string for random text', () => {
      expect(formatDate('abc123')).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatDateTime - invalid input', () => {
    it('returns empty string for invalid date string', () => {
      expect(formatDateTime('not-a-date')).toBe('')
    })

    it('returns empty string for random text', () => {
      expect(formatDateTime('xyz')).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(formatDateTime('')).toBe('')
    })
  })

  describe('formatCOP - negative numbers', () => {
    it('formats negative numbers', () => {
      const result = formatCOP(-5000)
      expect(result).toContain('5')
      expect(result).toContain('000')
      // Should include negative sign
      expect(result).toMatch(/-/)
    })

    it('formats small negative numbers', () => {
      const result = formatCOP(-1)
      expect(result).toContain('1')
      expect(result).toMatch(/-/)
    })

    it('formats large negative numbers', () => {
      const result = formatCOP(-1000000)
      expect(result).toMatch(/-/)
      expect(result).toContain('1')
    })
  })
})
