/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Set auth state in localStorage directly (no API call).
       * Works even if backend doesn't have the test user.
       */
      login(): Chainable<void>
      /**
       * Login via the UI form (requires backend running with valid credentials).
       */
      loginViaUI(email: string, password: string): Chainable<void>
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

/**
 * Sets localStorage to simulate an authenticated session.
 * The auth guard checks for token + user in localStorage,
 * so this is enough to bypass login for protected routes.
 */
Cypress.Commands.add('login', () => {
  const mockUser = {
    id: 1,
    name: 'Admin Test',
    email: 'admin@test.com',
    role: 'admin',
    business_id: 1,
  }
  const mockBusiness = {
    id: 1,
    name: 'Bar de Prueba',
    slug: 'bar-de-prueba',
    logo_url: null,
    address: 'Calle 123',
    phone: '3001234567',
    email: 'bar@test.com',
    nit: '900123456-1',
    plan: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
  }

  window.localStorage.setItem('token', 'fake-cypress-token-12345')
  window.localStorage.setItem('user', JSON.stringify(mockUser))
  window.localStorage.setItem('business', JSON.stringify(mockBusiness))
})

/**
 * Login through the UI form — use this for actual e2e with real backend.
 */
Cypress.Commands.add('loginViaUI', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('Login').click()
  cy.url({ timeout: 15000 }).should('include', '/dashboard')
})

Cypress.Commands.add('getBySel', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`)
})

export {}
