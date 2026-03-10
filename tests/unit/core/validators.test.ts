import { describe, it, expect } from 'vitest'
import { rules } from '@core/utils/validators'

describe('Validation Rules', () => {
  describe('required', () => {
    it('should fail for empty values', () => {
      expect(rules.required('')).toBe('Campo requerido')
      expect(rules.required(null)).toBe('Campo requerido')
      expect(rules.required(undefined)).toBe('Campo requerido')
      expect(rules.required(0)).toBe('Campo requerido')
    })
    it('should pass for truthy values', () => {
      expect(rules.required('test')).toBe(true)
      expect(rules.required(1)).toBe(true)
    })
  })

  describe('email', () => {
    it('should pass for valid emails', () => {
      expect(rules.email('test@example.com')).toBe(true)
      expect(rules.email('a@b.co')).toBe(true)
    })
    it('should fail for invalid emails', () => {
      expect(rules.email('notanemail')).toBe('Email no válido')
      expect(rules.email('@missing.com')).toBe('Email no válido')
    })
    it('should pass for empty (optional)', () => {
      expect(rules.email('')).toBe(true)
    })
  })

  describe('minLength', () => {
    it('should validate minimum length', () => {
      const rule = rules.minLength(3)
      expect(rule('ab')).toBe('Mínimo 3 caracteres')
      expect(rule('abc')).toBe(true)
      expect(rule('abcd')).toBe(true)
    })
  })

  describe('positiveNumber', () => {
    it('should reject zero and negatives', () => {
      expect(rules.positiveNumber(0)).toBe('Debe ser mayor a 0')
      expect(rules.positiveNumber(-1)).toBe('Debe ser mayor a 0')
    })
    it('should accept positive numbers', () => {
      expect(rules.positiveNumber(1)).toBe(true)
      expect(rules.positiveNumber(100)).toBe(true)
    })
  })

  describe('nonNegativeNumber', () => {
    it('should reject negatives', () => {
      expect(rules.nonNegativeNumber(-1)).toBe('Debe ser >= 0')
    })
    it('should accept zero and positive', () => {
      expect(rules.nonNegativeNumber(0)).toBe(true)
      expect(rules.nonNegativeNumber(50)).toBe(true)
    })
  })

  describe('nitFormat', () => {
    it('should accept valid NIT formats', () => {
      expect(rules.nitFormat('12345')).toBe(true)
      expect(rules.nitFormat('900-123-456')).toBe(true)
      expect(rules.nitFormat('900123456-1')).toBe(true)
    })
    it('should reject invalid NIT', () => {
      expect(rules.nitFormat('abc')).toBe('NIT inválido')
      expect(rules.nitFormat('12')).toBe('NIT inválido')
    })
    it('should pass for empty (optional)', () => {
      expect(rules.nitFormat('')).toBe(true)
    })
  })

  describe('documentNumber', () => {
    it('should accept valid document numbers', () => {
      expect(rules.documentNumber('12345678')).toBe(true)
      expect(rules.documentNumber('1234567890')).toBe(true)
    })
    it('should reject invalid documents', () => {
      expect(rules.documentNumber('123')).toBe('Documento inválido (4-15 dígitos)')
      expect(rules.documentNumber('abc')).toBe('Documento inválido (4-15 dígitos)')
    })
  })

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      const rule = rules.maxLength(5)
      expect(rule('abc')).toBe(true)
      expect(rule('abcde')).toBe(true)
      expect(rule('abcdef')).toBe('Máximo 5 caracteres')
    })
    it('should pass for empty (optional)', () => {
      expect(rules.maxLength(5)('')).toBe(true)
    })
  })

  describe('numeric', () => {
    it('should accept only digits', () => {
      expect(rules.numeric('12345')).toBe(true)
      expect(rules.numeric('abc')).toBe('Solo números')
      expect(rules.numeric('12.5')).toBe('Solo números')
    })
    it('should pass for empty (optional)', () => {
      expect(rules.numeric('')).toBe(true)
    })
  })

  describe('integerOnly', () => {
    it('should accept integers', () => {
      expect(rules.integerOnly(5)).toBe(true)
      expect(rules.integerOnly(0)).toBe(true)
      expect(rules.integerOnly(-3)).toBe(true)
    })
    it('should reject decimals', () => {
      expect(rules.integerOnly(5.5)).toBe('Debe ser un número entero')
      expect(rules.integerOnly(0.1)).toBe('Debe ser un número entero')
    })
    it('should handle string numbers', () => {
      expect(rules.integerOnly('10')).toBe(true)
      expect(rules.integerOnly('10.5')).toBe('Debe ser un número entero')
    })
  })

  describe('trimmedRequired', () => {
    it('should reject whitespace-only strings', () => {
      expect(rules.trimmedRequired('   ')).toBe('Campo requerido (no puede ser solo espacios)')
      expect(rules.trimmedRequired('  \t  ')).toBe('Campo requerido (no puede ser solo espacios)')
    })
    it('should accept non-empty trimmed values', () => {
      expect(rules.trimmedRequired('hello')).toBe(true)
      expect(rules.trimmedRequired(' hello ')).toBe(true)
    })
    it('should reject empty strings', () => {
      expect(rules.trimmedRequired('')).toBe('Campo requerido (no puede ser solo espacios)')
    })
  })
})
