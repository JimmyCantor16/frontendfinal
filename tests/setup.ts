import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock process.env
process.env.VUE_APP_API_URL = 'http://localhost:8000'
process.env.VUE_APP_RECAPTCHA_SITE_KEY = 'test-key'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '', assign: vi.fn(), replace: vi.fn(), reload: vi.fn() },
  writable: true,
})

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true, value: '' }),
    close: vi.fn(),
    getContainer: vi.fn(() => ({ style: { zIndex: '' } })),
  },
}))

// Mock recaptcha
vi.mock('@core/utils/recaptcha', () => ({
  getRecaptchaToken: vi.fn().mockResolvedValue('test-recaptcha-token'),
}))

// Suppress Vuetify warnings in tests
config.global.stubs = {
  'v-app': { template: '<div><slot /></div>' },
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-text-field': { template: '<input />' },
  'v-form': { template: '<form><slot /></form>' },
  'v-alert': { template: '<div><slot /></div>' },
}
