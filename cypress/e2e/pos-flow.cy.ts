describe('Flujo POS Completo', () => {
  const mockProducts = [
    { id: 1, name: 'Ron Medellín', sku: 'BEB-001', stock: 10, sale_price: 25000, purchase_price: 15000, category_id: 1, minimum_stock: 3, is_active: true },
    { id: 2, name: 'Cerveza Poker', sku: 'BEB-002', stock: 0, sale_price: 5000, purchase_price: 2500, category_id: 1, minimum_stock: 5, is_active: true },
  ]

  const mockCategories = [
    { id: 1, name: 'Bebidas', description: 'Licores y cervezas' },
  ]

  const mockOpenOrders = [
    { id: 1, order_number: 'ORD-0001', status: 'open', items: [
      { id: 10, product_id: 1, product: mockProducts[0], quantity: 2, unit_price: 25000, subtotal: 50000 },
    ]},
  ]

  function setupApiInterceptors(cashRegisterOpen = true) {
    // Catch-all PRIMERO (menor prioridad)
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: { data: [] } })
    cy.intercept('POST', '**/api/**', { statusCode: 200, body: { data: {} } })
    cy.intercept('DELETE', '**/api/**', { statusCode: 200, body: { message: 'ok' } })

    // Específicos DESPUÉS (mayor prioridad)
    cy.intercept('GET', '**/api/products**', { statusCode: 200, body: { data: mockProducts } })
    cy.intercept('GET', '**/api/categories**', { statusCode: 200, body: { data: mockCategories } })
    cy.intercept('GET', '**/api/orders/open**', { statusCode: 200, body: { data: mockOpenOrders } }).as('getOrders')

    // Caja registradora
    if (cashRegisterOpen) {
      cy.intercept('GET', '**/api/cash-registers/current**', {
        statusCode: 200,
        body: { data: { id: 1, status: 'open', opening_amount: 100000, user_id: 1, business_id: 1, opened_at: '2026-02-14T08:00:00' } },
      })
    } else {
      cy.intercept('GET', '**/api/cash-registers/current**', { statusCode: 404, body: { message: 'No cash register' } })
    }

    // Acciones POS
    cy.intercept('POST', '**/api/orders', { statusCode: 201, body: { data: { id: 2, order_number: 'ORD-0002', status: 'open', items: [] } } })
    cy.intercept('POST', '**/api/orders/*/add-item', { statusCode: 200, body: { data: { id: 11, product_id: 1, quantity: 1, unit_price: 25000, subtotal: 25000 } } })
    cy.intercept('POST', '**/api/orders/*/close', { statusCode: 200, body: { data: { id: 1, status: 'closed' } } })
    cy.intercept('POST', '**/api/orders/*/cancel', { statusCode: 200, body: { data: { id: 1, status: 'cancelled' } } })
    cy.intercept('DELETE', '**/api/orders/*/remove-item/**', { statusCode: 200, body: { message: 'ok' } })
  }

  describe('Con caja abierta', () => {
    beforeEach(() => {
      cy.login()
      setupApiInterceptors(true)
      cy.visit('/pos')
      cy.wait('@getOrders')
    })

    it('muestra la vista POS con productos y orden', () => {
      cy.contains('ORD-0001').should('be.visible')
      cy.contains('Ron Medellín').should('be.visible')
      cy.contains('Caja Abierta').should('be.visible')
    })

    it('muestra botón Nueva Orden', () => {
      cy.contains('Nueva Orden').should('be.visible')
    })

    it('tiene botón Volver para salir del POS', () => {
      cy.contains('Volver').should('be.visible')
      cy.contains('Volver').click()
      cy.url().should('include', '/dashboard')
    })

    it('muestra carrito con items de la orden activa', () => {
      cy.contains('Ron Medellín').should('be.visible')
      cy.contains('Cobrar').should('be.visible')
    })

    it('botón Cancelar muestra confirmación SweetAlert2', () => {
      cy.contains('button', 'Cancelar').click()
      cy.get('.swal2-popup', { timeout: 5000 }).should('be.visible')
      cy.contains('¿Cancelar esta orden?').should('be.visible')
      cy.get('.swal2-cancel').click()
    })

    it('botón Cobrar abre dialog de pago', () => {
      cy.contains('Cobrar').click()
      cy.contains('Método de Pago').should('be.visible')
      cy.contains('Efectivo').should('be.visible')
      cy.contains('Tarjeta').should('be.visible')
      cy.contains('Transferencia').should('be.visible')
      cy.contains('QR').should('be.visible')
    })
  })

  describe('Sin caja abierta', () => {
    beforeEach(() => {
      cy.login()
      setupApiInterceptors(false)
      cy.visit('/pos')
    })

    it('muestra chip Sin Caja y banner de advertencia', () => {
      cy.contains('Sin Caja').should('be.visible')
      cy.contains('No hay caja abierta').should('be.visible')
    })
  })
})
