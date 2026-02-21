import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login } from './helpers';

const mockProducts = [
    { id: 1, name: 'Ron Medellín', sku: 'BEB-001', stock: 10, sale_price: 25000, purchase_price: 15000, category_id: 1, minimum_stock: 3, is_active: true },
    { id: 2, name: 'Cerveza Poker', sku: 'BEB-002', stock: 0, sale_price: 5000, purchase_price: 2500, category_id: 1, minimum_stock: 5, is_active: true },
];

const mockCategories = [
    { id: 1, name: 'Bebidas', description: 'Licores y cervezas' },
];

const mockOpenOrders = [
    {
        id: 1, order_number: 'ORD-0001', status: 'open', items: [
            { id: 10, product_id: 1, product: mockProducts[0], quantity: 2, unit_price: 25000, subtotal: 50000 },
        ]
    },
];

function createMock(cashRegisterOpen: boolean) {
    const mock = RequestMock()
        .onRequestTo(/\/api\/products.*/).respond({ data: mockProducts }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo(/\/api\/categories.*/).respond({ data: mockCategories }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo(/\/api\/orders\/open.*/).respond({ data: mockOpenOrders }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'POST', url: /\/api\/orders$/ }).respond({ data: { id: 2, order_number: 'ORD-0002', status: 'open', items: [] } }, 201, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'POST', url: /\/api\/orders\/.*\/add-item.*/ }).respond({ data: { id: 11, product_id: 1, quantity: 1, unit_price: 25000, subtotal: 25000 } }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'POST', url: /\/api\/orders\/.*\/close.*/ }).respond({ data: { id: 1, status: 'closed' } }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'POST', url: /\/api\/orders\/.*\/cancel.*/ }).respond({ data: { id: 1, status: 'cancelled' } }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'DELETE', url: /\/api\/orders\/.*\/remove-item\/.*/ }).respond({ message: 'ok' }, 200, { 'access-control-allow-origin': '*' });

    if (cashRegisterOpen) {
        mock.onRequestTo(/\/api\/cash-registers\/current.*/).respond({ data: { id: 1, status: 'open', opening_amount: 100000, user_id: 1, business_id: 1, opened_at: '2026-02-14T08:00:00' } }, 200, { 'access-control-allow-origin': '*' });
    } else {
        mock.onRequestTo(/\/api\/cash-registers\/current.*/).respond({ message: 'No cash register' }, 404, { 'access-control-allow-origin': '*' });
    }

    // Catch alls at the end
    mock.onRequestTo({ method: 'POST', url: /\/api\/.*/ }).respond({ data: {} }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo({ method: 'DELETE', url: /\/api\/.*/ }).respond({ message: 'ok' }, 200, { 'access-control-allow-origin': '*' })
        .onRequestTo(/\/api\/.*/).respond({ data: [] }, 200, { 'access-control-allow-origin': '*' });

    return mock;
}

const mockWithCashRegister = createMock(true);
const mockWithoutCashRegister = createMock(false);

fixture`Flujo POS Completo`
    .page`${BASE_URL}/pos`
    .beforeEach(async t => {
        await login();
    });

// Con caja abierta
test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - muestra la vista POS con productos y orden', async t => {
        await t.expect(Selector('*').withText('ORD-0001').visible).eql(true)
            .expect(Selector('*').withText('Ron Medellín').visible).eql(true)
            .expect(Selector('*').withText('Caja Abierta').visible).eql(true);
    });

test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - muestra botón Nueva Orden', async t => {
        await t.expect(Selector('*').withText('Nueva Orden').visible).eql(true);
    });

test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - tiene botón Volver para salir del POS', async t => {
        const btn = Selector('*').withText('Volver');
        await t.expect(btn.visible).eql(true);
        await t.click(btn);
        const url = await t.eval(() => window.location.href);
        await t.expect(url).contains('/dashboard');
    });

test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - muestra carrito con items de la orden activa', async t => {
        await t.expect(Selector('*').withText('Ron Medellín').visible).eql(true)
            .expect(Selector('*').withText('Cobrar').visible).eql(true);
    });

test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - botón Cancelar muestra confirmación SweetAlert2', async t => {
        await t.click(Selector('button').withText('Cancelar'));
        const swal = Selector('.swal2-popup');
        // Esperar a que SweetAlert aparezca y de un click en cancelar
        await t.expect(swal.visible).eql(true, 'message', { timeout: 5000 })
            .expect(Selector('*').withText('¿Cancelar esta orden?').visible).eql(true);

        await t.click(Selector('.swal2-cancel'));
    });

test
    .requestHooks(mockWithCashRegister)
    ('Con caja abierta - botón Cobrar abre dialog de pago', async t => {
        await t.click(Selector('*').withText('Cobrar'));
        await t.expect(Selector('*').withText('Método de Pago').visible).eql(true)
            .expect(Selector('*').withText('Efectivo').visible).eql(true)
            .expect(Selector('*').withText('Tarjeta').visible).eql(true)
            .expect(Selector('*').withText('Transferencia').visible).eql(true)
            .expect(Selector('*').withText('QR').visible).eql(true);
    });

// Sin caja abierta
test
    .requestHooks(mockWithoutCashRegister)
    ('Sin caja abierta - muestra chip Sin Caja y banner de advertencia', async t => {
        await t.expect(Selector('*').withText('Sin Caja').visible).eql(true)
            .expect(Selector('*').withText('No hay caja abierta').visible).eql(true);
    });
