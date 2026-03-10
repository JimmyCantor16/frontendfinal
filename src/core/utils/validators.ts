export const rules = {
  required: (v: unknown) => !!v || 'Campo requerido',
  email: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email no válido',
  minLength: (min: number) => (v: string) => !v || v.length >= min || `Mínimo ${min} caracteres`,
  maxLength: (max: number) => (v: string) => !v || v.length <= max || `Máximo ${max} caracteres`,
  numeric: (v: string) => !v || /^\d+$/.test(v) || 'Solo números',
  positiveNumber: (v: number) => v > 0 || 'Debe ser mayor a 0',
  nonNegativeNumber: (v: number) => v >= 0 || 'Debe ser >= 0',
  nitFormat: (v: string) => !v || /^[\d\-]{5,20}$/.test(v) || 'NIT inválido',
  documentNumber: (v: string) => !v || /^\d{4,15}$/.test(v) || 'Documento inválido (4-15 dígitos)',
  integerOnly: (v: unknown) => Number.isInteger(Number(v)) || 'Debe ser un número entero',
  trimmedRequired: (v: unknown) => !!String(v).trim() || 'Campo requerido (no puede ser solo espacios)',
}
