import { describe, it, expect } from 'vitest'
import { normalizeUser, normalizeUserRole } from '@core/types/models'
import type { UserRole } from '@core/types/models'

describe('Model Utilities', () => {
  describe('normalizeUserRole', () => {
    it('should return role string directly if present', () => {
      expect(normalizeUserRole({ role: 'admin' })).toBe('admin')
      expect(normalizeUserRole({ role: 'cajero' })).toBe('cajero')
      expect(normalizeUserRole({ role: 'user' })).toBe('user')
    })

    it('should extract role from roles array of strings', () => {
      expect(normalizeUserRole({ roles: ['admin'] })).toBe('admin')
    })

    it('should extract role from roles array of objects', () => {
      expect(normalizeUserRole({ roles: [{ id: 1, name: 'cajero' }] })).toBe('cajero')
    })

    it('should default to "user" when no role info', () => {
      expect(normalizeUserRole({})).toBe('user')
      expect(normalizeUserRole({ role: '' })).toBe('user')
      expect(normalizeUserRole({ roles: [] })).toBe('user')
    })
  })

  describe('normalizeUser', () => {
    it('should normalize a raw user object with role string', () => {
      const raw = { id: 1, name: 'Test', email: 'test@x.com', role: 'admin' }
      const user = normalizeUser(raw)
      expect(user.role).toBe('admin')
      expect(user.name).toBe('Test')
    })

    it('should normalize a raw user object with roles array', () => {
      const raw = {
        id: 1, name: 'Test', email: 'test@x.com',
        roles: [{ id: 1, name: 'cajero' }],
      }
      const user = normalizeUser(raw)
      expect(user.role).toBe('cajero')
    })
  })
})
