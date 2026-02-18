describe('Autenticación', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('muestra el formulario de login', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('Login').should('be.visible')
  })

  it('muestra el título Iniciar sesión', () => {
    cy.contains('Iniciar sesión').should('be.visible')
  })

  it('muestra validación con campos vacíos', () => {
    cy.contains('Login').click()
    cy.contains('Campo requerido').should('be.visible')
  })

  it('redirige a login si no está autenticado', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('permite acceder a dashboard con sesión válida', () => {
    cy.login()
    // Catch-all primero, específico después
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    cy.intercept('GET', '**/api/dashboard**', {
      statusCode: 200,
      body: { data: { ventas_hoy: 0, ventas_mes: 0, facturas_hoy: 0, productos_stock_bajo: [] } },
    })
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })
})
