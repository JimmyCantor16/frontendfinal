import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login } from './helpers';

const apiMock = RequestMock()
    .onRequestTo(/\/api\/dashboard.*/)
    .respond({
        data: {
            ventas_hoy: 150000,
            ventas_mes: 3500000,
            facturas_hoy: 5,
            productos_stock_bajo: [
                { id: 1, sku: 'BEB-001', name: 'Ron Medellín', stock: 2, minimum_stock: 5 },
            ],
        },
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/.*/)
    .respond({ data: [] }, 200, { 'access-control-allow-origin': '*' });

fixture`Dashboard`
    .page`${BASE_URL}/dashboard`
    .requestHooks(apiMock)
    .beforeEach(async t => {
        await login();
    });

test('muestra las 3 cards de estadísticas', async t => {
    await t.expect(Selector('*').withText('Ventas Hoy').visible).eql(true)
        .expect(Selector('*').withText('Ventas del Mes').visible).eql(true)
        .expect(Selector('*').withText('Facturas Hoy').visible).eql(true);
});

test('muestra tabla de stock bajo', async t => {
    await t.expect(Selector('*').withText('Productos con Stock Bajo').visible).eql(true)
        .expect(Selector('.v-data-table').visible).eql(true);
});

test('sidebar navegable con todas las secciones', async t => {
    const drawer = Selector('.v-navigation-drawer');
    await t.expect(drawer.exists).eql(true);

    await t.expect(drawer.find('*').withText('Dashboard').exists).eql(true)
        .expect(drawer.find('*').withText('Punto de Venta').exists).eql(true)
        .expect(drawer.find('*').withText('Categorías').exists).eql(true)
        .expect(drawer.find('*').withText('Proveedores').exists).eql(true)
        .expect(drawer.find('*').withText('Clientes').exists).eql(true)
        .expect(drawer.find('*').withText('Productos').exists).eql(true)
        .expect(drawer.find('*').withText('Movimientos').exists).eql(true)
        .expect(drawer.find('*').withText('Caja Registradora').exists).eql(true)
        .expect(drawer.find('*').withText('Reporte Diario').exists).eql(true)
        .expect(drawer.find('*').withText('Configuración').exists).eql(true);
});
