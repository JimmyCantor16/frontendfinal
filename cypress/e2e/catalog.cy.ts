describe('Catálogos CRUD', () => {
  beforeEach(() => {
    cy.login()
    // Catch-all PRIMERO (menor prioridad)
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    cy.intercept('POST', '**/api/**', { statusCode: 201, body: { data: { id: 99, name: 'Nuevo' } } })
    cy.intercept('PUT', '**/api/**', { statusCode: 200, body: { data: { id: 1, name: 'Editado' } } })
    cy.intercept('DELETE', '**/api/**', { statusCode: 200, body: { message: 'Eliminado' } })
    // Específicos DESPUÉS (mayor prioridad)
    cy.intercept('GET', '**/api/categories**', {
      statusCode: 200,
      body: { data: [{ id: 1, name: 'Bebidas', description: 'Licores y cervezas' }] },
    })
    cy.intercept('GET', '**/api/suppliers**', {
      statusCode: 200,
      body: { data: [{ id: 1, name: 'Proveedor Test', phone: '300123', email: 'p@test.com', address: 'Calle 1' }] },
    })
    cy.intercept('GET', '**/api/clients**', {
      statusCode: 200,
      body: { data: [{ id: 1, name: 'Cliente Test', phone: '300456', email: 'c@test.com', address: 'Calle 2' }] },
    })
  })

  describe('Categorías', () => {
    beforeEach(() => cy.visit('/categories'))

    it('muestra la vista de Categorías', () => {
      cy.contains('Categorías').should('be.visible')
      cy.get('.v-data-table').should('be.visible')
    })

    it('tiene botón para crear nueva categoría', () => {
      cy.get('.v-btn').contains(/Nuev/i).should('be.visible')
    })

    it('abre dialog al crear nueva', () => {
      cy.get('.v-btn').contains(/Nuev/i).click()
      cy.get('.v-dialog').should('be.visible')
    })
  })

  describe('Proveedores', () => {
    beforeEach(() => cy.visit('/suppliers'))

    it('muestra la vista de Proveedores', () => {
      cy.contains('Proveedores').should('be.visible')
      cy.get('.v-data-table').should('be.visible')
    })

    it('tiene botón para crear nuevo proveedor', () => {
      cy.get('.v-btn').contains(/Nuev/i).should('be.visible')
    })

    it('abre dialog al crear nuevo', () => {
      cy.get('.v-btn').contains(/Nuev/i).click()
      cy.get('.v-dialog').should('be.visible')
    })
  })

  describe('Clientes', () => {
    beforeEach(() => cy.visit('/clients'))

    it('muestra la vista de Clientes', () => {
      cy.contains('Clientes').should('be.visible')
      cy.get('.v-data-table').should('be.visible')
    })

    it('tiene botón para crear nuevo cliente', () => {
      cy.get('.v-btn').contains(/Nuev/i).should('be.visible')
    })

    it('abre dialog al crear nuevo', () => {
      cy.get('.v-btn').contains(/Nuev/i).click()
      cy.get('.v-dialog').should('be.visible')
    })
  })
})
