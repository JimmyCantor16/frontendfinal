import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login } from './helpers';

const apiMock = RequestMock()
    .onRequestTo(/\/api\/categories.*/)
    .respond({ data: [{ id: 1, name: 'Bebidas', description: 'Licores y cervezas' }] }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/suppliers.*/)
    .respond({ data: [{ id: 1, name: 'Proveedor Test', phone: '300123', email: 'p@test.com', address: 'Calle 1' }] }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/clients.*/)
    .respond({ data: [{ id: 1, name: 'Cliente Test', phone: '300456', email: 'c@test.com', address: 'Calle 2' }] }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'POST', url: /\/api\/.*/ })
    .respond({ data: { id: 99, name: 'Nuevo' } }, 201, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'PUT', url: /\/api\/.*/ })
    .respond({ data: { id: 1, name: 'Editado' } }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'DELETE', url: /\/api\/.*/ })
    .respond({ message: 'Eliminado' }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/.*/)
    .respond({ data: [] }, 200, { 'access-control-allow-origin': '*' });

fixture`Catálogos CRUD`
    .page`${BASE_URL}`
    .requestHooks(apiMock)
    .beforeEach(async t => {
        await login();
    });

// Categorías
test('Categorías - muestra la vista de Categorías', async t => {
    await t.navigateTo(`${BASE_URL}/categories`);
    const title = Selector('*').withText('Categorías');
    const table = Selector('.v-data-table');
    await t.expect(title.visible).eql(true)
        .expect(table.visible).eql(true);
});

test('Categorías - abre dialog al crear nueva', async t => {
    await t.navigateTo(`${BASE_URL}/categories`);
    const newBtn = Selector('.v-btn').withText(/Nuev/i);
    await t.expect(newBtn.visible).eql(true);
    await t.click(newBtn);
    const dialog = Selector('.v-dialog');
    await t.expect(dialog.visible).eql(true);
});

// Proveedores
test('Proveedores - muestra la vista de Proveedores', async t => {
    await t.navigateTo(`${BASE_URL}/suppliers`);
    const title = Selector('*').withText('Proveedores');
    const table = Selector('.v-data-table');
    await t.expect(title.visible).eql(true)
        .expect(table.visible).eql(true);
});

test('Proveedores - abre dialog al crear nuevo', async t => {
    await t.navigateTo(`${BASE_URL}/suppliers`);
    const newBtn = Selector('.v-btn').withText(/Nuev/i);
    await t.expect(newBtn.visible).eql(true);
    await t.click(newBtn);
    const dialog = Selector('.v-dialog');
    await t.expect(dialog.visible).eql(true);
});

// Clientes
test('Clientes - muestra la vista de Clientes', async t => {
    await t.navigateTo(`${BASE_URL}/clients`);
    const title = Selector('*').withText('Clientes');
    const table = Selector('.v-data-table');
    await t.expect(title.visible).eql(true)
        .expect(table.visible).eql(true);
});

test('Clientes - abre dialog al crear nuevo', async t => {
    await t.navigateTo(`${BASE_URL}/clients`);
    const newBtn = Selector('.v-btn').withText(/Nuev/i);
    await t.expect(newBtn.visible).eql(true);
    await t.click(newBtn);
    const dialog = Selector('.v-dialog');
    await t.expect(dialog.visible).eql(true);
});
