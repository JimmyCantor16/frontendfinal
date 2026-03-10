import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login } from './helpers';

const apiMock = RequestMock()
    .onRequestTo(/\/api\/reports\/daily.*/)
    .respond({
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
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/.*/)
    .respond({ data: [] }, 200, { 'access-control-allow-origin': '*' });

fixture`Reporte Diario`
    .page`${BASE_URL}/reports/daily`
    .requestHooks(apiMock)
    .beforeEach(async t => {
        await login();
    });

test('muestra la vista de reporte diario', async t => {
    await t.expect(Selector('*').withText('Reporte Diario').visible).eql(true);
});

test('tiene selector de fecha', async t => {
    await t.expect(Selector('input[type="date"]').exists).eql(true);
});

test('muestra cards de resumen con datos', async t => {
    await t.expect(Selector('*').withText('Total Ventas').visible).eql(true)
        .expect(Selector('*').withText('Órdenes Cerradas').visible).eql(true)
        .expect(Selector('*').withText('Ticket Promedio').visible).eql(true)
        .expect(Selector('*').withText('Canceladas').visible).eql(true);
});

test('muestra desglose por método de pago', async t => {
    await t.expect(Selector('*').withText('Efectivo').visible).eql(true)
        .expect(Selector('*').withText('Tarjeta').visible).eql(true)
        .expect(Selector('*').withText('Transferencia').visible).eql(true)
        .expect(Selector('*').withText('QR').visible).eql(true);
});

test('muestra tabla de productos más vendidos', async t => {
    await t.expect(Selector('*').withText('Productos Más Vendidos').visible).eql(true)
        .expect(Selector('*').withText('Ron Medellín').visible).eql(true);
});
