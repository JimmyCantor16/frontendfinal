describe('Reporte Diario', () => {
  beforeEach(() => {
    cy.login()
    // Catch-all PRIMERO (menor prioridad)
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    // Específico DESPUÉS (mayor prioridad)
    cy.intercept('GET', '**/api/reports/daily**', {
      statusCode: 200,
      body: {
        data: {
          total_sales: 450000,
          orders_closed: 12,
          average_ticket: 37500,
          orders_cancelled: 1,
          sales_by_method: { cash: 200000, card: 150000, transfer: 80000, qr: 20000 },
          top_products: [
            { product_id: 1, product_name: 'Ron Medellín', quantity_sold: 15, total_revenue: 375000 },
          ],
        },
      },
    }).as('getReport')
    cy.visit('/reports/daily')
  })

  it('muestra la vista de reporte diario', () => {
    cy.contains('Reporte Diario').should('be.visible')
  })

  it('tiene selector de fecha', () => {
    cy.get('input[type="date"]').should('exist')
  })

  it('muestra cards de resumen con datos', () => {
    cy.wait('@getReport')
    cy.contains('Total Ventas').should('be.visible')
    cy.contains('Órdenes Cerradas').should('be.visible')
    cy.contains('Ticket Promedio').should('be.visible')
    cy.contains('Canceladas').should('be.visible')
  })

  it('muestra desglose por método de pago', () => {
    cy.wait('@getReport')
    cy.contains('Efectivo').should('be.visible')
    cy.contains('Tarjeta').should('be.visible')
    cy.contains('Transferencia').should('be.visible')
    cy.contains('QR').should('be.visible')
  })

  it('muestra tabla de productos más vendidos', () => {
    cy.wait('@getReport')
    cy.contains('Productos Más Vendidos').should('be.visible')
    cy.contains('Ron Medellín').should('be.visible')
  })
})
