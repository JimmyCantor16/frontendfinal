describe('Dashboard', () => {
  beforeEach(() => {
    cy.login()
    // Catch-all PRIMERO (menor prioridad)
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    // Específico DESPUÉS (mayor prioridad — sobreescribe el catch-all)
    cy.intercept('GET', '**/api/dashboard**', {
      statusCode: 200,
      body: {
        data: {
          ventas_hoy: 150000,
          ventas_mes: 3500000,
          facturas_hoy: 5,
          productos_stock_bajo: [
            { id: 1, sku: 'BEB-001', name: 'Ron Medellín', stock: 2, minimum_stock: 5 },
          ],
        },
      },
    }).as('getDashboard')
    cy.visit('/dashboard')
  })

  it('muestra las 3 cards de estadísticas', () => {
    cy.wait('@getDashboard')
    cy.contains('Ventas Hoy').should('be.visible')
    cy.contains('Ventas del Mes').should('be.visible')
    cy.contains('Facturas Hoy').should('be.visible')
  })

  it('muestra tabla de stock bajo', () => {
    cy.wait('@getDashboard')
    cy.contains('Productos con Stock Bajo').should('be.visible')
    cy.get('.v-data-table').should('be.visible')
  })

  it('sidebar navegable con todas las secciones', () => {
    cy.get('.v-navigation-drawer').should('exist')
    // Items at bottom may be clipped by overflow, so check existence not visibility
    cy.get('.v-navigation-drawer').within(() => {
      cy.contains('Dashboard').should('exist')
      cy.contains('Punto de Venta').should('exist')
      cy.contains('Categorías').should('exist')
      cy.contains('Proveedores').should('exist')
      cy.contains('Clientes').should('exist')
      cy.contains('Productos').should('exist')
      cy.contains('Movimientos').should('exist')
      cy.contains('Caja Registradora').should('exist')
      cy.contains('Reporte Diario').should('exist')
      cy.contains('Configuración').should('exist')
    })
  })
})
