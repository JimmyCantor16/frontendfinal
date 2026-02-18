describe('Configuración del Negocio', () => {
  beforeEach(() => {
    cy.login()
    // Catch-all PRIMERO (menor prioridad)
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    cy.intercept('PUT', '**/api/**', { statusCode: 200, body: { data: {} } })
    cy.intercept('POST', '**/api/**', { statusCode: 200, body: { data: {} } })
    // Específicos DESPUÉS (mayor prioridad)
    cy.intercept('GET', '**/api/business/settings**', {
      statusCode: 200,
      body: {
        data: {
          id: 1,
          name: 'Bar de Prueba',
          nit: '900123456-1',
          address: 'Calle 123',
          phone: '3001234567',
          email: 'bar@test.com',
          logo_url: null,
          plan: 'pro',
          subscription_status: 'active',
          trial_ends_at: null,
        },
      },
    }).as('getSettings')
    cy.intercept('PUT', '**/api/business/settings**', {
      statusCode: 200,
      body: {
        data: {
          id: 1,
          name: 'Bar Actualizado',
          nit: '900123456-1',
          address: 'Calle 456',
          phone: '3001234567',
          email: 'bar@test.com',
          logo_url: null,
          plan: 'pro',
          subscription_status: 'active',
        },
      },
    }).as('updateSettings')
    cy.visit('/settings')
  })

  it('muestra formulario de datos del negocio', () => {
    cy.wait('@getSettings')
    cy.contains('Datos del Negocio').should('be.visible')
    cy.get('input').should('have.length.greaterThan', 3)
  })

  it('muestra plan actual y suscripción', () => {
    cy.contains('Plan Actual').should('be.visible')
    cy.contains('Suscripción').should('be.visible')
    cy.contains('pro').should('be.visible')
  })

  it('muestra input para subir logo', () => {
    cy.wait('@getSettings')
    cy.get('.v-file-input').should('exist')
  })

  it('valida email inválido', () => {
    cy.wait('@getSettings')
    cy.get('input[type="email"]').clear().type('invalid-email')
    cy.get('input[type="email"]').blur()
    cy.contains('Email inválido').should('be.visible')
  })

  it('guarda cambios exitosamente', () => {
    cy.wait('@getSettings')
    cy.contains('Guardar Cambios').click()
    cy.wait('@updateSettings')
    cy.get('.swal2-popup', { timeout: 5000 }).should('be.visible')
  })
})
