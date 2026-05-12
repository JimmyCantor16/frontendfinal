/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises, config } from '@vue/test-utils'
import { nextTick } from 'vue'

// --- Hoisted shared spies for service mocks ---
const { loginSpy, pushSpy, getRecaptchaSpy } = vi.hoisted(() => ({
  loginSpy: vi.fn(),
  pushSpy: vi.fn(),
  getRecaptchaSpy: vi.fn(),
}))

// --- Mocks ---
vi.mock('@modules/auth/services/auth.service', () => ({
  login: (...args: unknown[]) => loginSpy(...args),
  fetchMe: vi.fn(),
}))

vi.mock('@core/plugins/inactivity', () => ({
  initInactivityControl: vi.fn(),
  clearInactivityControl: vi.fn(),
}))

vi.mock('@core/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushSpy, replace: vi.fn(), currentRoute: { value: { path: '/login' } } }),
  }
})

vi.mock('@core/utils/recaptcha', () => ({
  getRecaptchaToken: (...args: unknown[]) => getRecaptchaSpy(...args),
}))

// Stubs override the global ones from tests/setup.ts so that we can
// observe v-model bindings and submit/click events in the DOM.
const componentStubs = {
  'v-app': { template: '<div><slot /></div>' },
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-form': {
    emits: ['submit'],
    template: '<form @submit.prevent="$emit(\'submit\', $event)"><slot /></form>',
  },
  'v-text-field': {
    props: ['modelValue', 'label', 'type', 'rules'],
    emits: ['update:modelValue'],
    template:
      '<input :type="type || \'text\'" :value="modelValue" :data-label="label" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  'v-btn': {
    props: ['type', 'loading', 'disabled'],
    template:
      '<button :type="type || \'button\'" :disabled="loading || disabled"><slot /></button>',
  },
  'v-alert': {
    template: '<div class="v-alert"><slot /></div>',
  },
}

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any prior global stubs from tests/setup.ts and apply ours.
    config.global.stubs = componentStubs
    getRecaptchaSpy.mockResolvedValue('captcha-token')
  })

  async function mountView() {
    const { setActivePinia, createPinia } = await import('pinia')
    setActivePinia(createPinia())
    const LoginView = (await import('../LoginView.vue')).default
    return mount(LoginView, {
      global: {
        stubs: componentStubs,
      },
    })
  }

  it('renders the login form with email and password fields', async () => {
    const wrapper = await mountView()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('binds email and password through v-model', async () => {
    const wrapper = await mountView()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('user@example.com')
    await inputs[1].setValue('secret123')

    expect((inputs[0].element as HTMLInputElement).value).toBe('user@example.com')
    expect((inputs[1].element as HTMLInputElement).value).toBe('secret123')
  })

  it('calls auth service on submit and redirects to /dashboard on success', async () => {
    loginSpy.mockResolvedValue({
      access_token: 'tok',
      user: { id: 1, name: 'A', email: 'user@example.com', role: 'admin' },
      business: { id: 1, name: 'B', subscription_status: 'active' },
    })

    const wrapper = await mountView()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('user@example.com')
    await inputs[1].setValue('secret123')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    await nextTick()

    expect(loginSpy).toHaveBeenCalledTimes(1)
    expect(loginSpy.mock.calls[0][0]).toMatchObject({
      email: 'user@example.com',
      password: 'secret123',
      recaptcha_token: 'captcha-token',
    })
    expect(pushSpy).toHaveBeenCalledWith('/dashboard')
  })

  it('shows an error alert when the service throws', async () => {
    loginSpy.mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    })

    const wrapper = await mountView()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('bad@example.com')
    await inputs[1].setValue('wrong')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    await nextTick()

    expect(pushSpy).not.toHaveBeenCalled()
    const alert = wrapper.find('.v-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Credenciales inválidas')
  })

  it('continues login when reCAPTCHA fails (uses empty token)', async () => {
    getRecaptchaSpy.mockRejectedValue(new Error('recaptcha down'))
    loginSpy.mockResolvedValue({
      access_token: 'tok',
      user: { id: 1, name: 'A', email: 'x@y.z', role: 'admin' },
    })

    const wrapper = await mountView()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('x@y.z')
    await inputs[1].setValue('pw')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(loginSpy).toHaveBeenCalledTimes(1)
    expect(loginSpy.mock.calls[0][0].recaptcha_token).toBe('')
  })
})
