import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login } from './helpers';

const apiMock = RequestMock()
    .onRequestTo({ method: 'GET', url: /\/api\/business\/settings.*/ })
    .respond({
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
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'PUT', url: /\/api\/business\/settings.*/ })
    .respond({
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
    }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'PUT', url: /\/api\/.*/ })
    .respond({ data: {} }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo({ method: 'POST', url: /\/api\/.*/ })
    .respond({ data: {} }, 200, { 'access-control-allow-origin': '*' })
    .onRequestTo(/\/api\/.*/)
    .respond({ data: [] }, 200, { 'access-control-allow-origin': '*' });

fixture`Configuración del Negocio`
    .page`${BASE_URL}/settings`
    .requestHooks(apiMock)
    .beforeEach(async t => {
        await login();
    });

test('muestra formulario de datos del negocio', async t => {
    await t.expect(Selector('*').withText('Datos del Negocio').visible).eql(true);
    const inputsCount = await Selector('input').count;
    await t.expect(inputsCount).gt(3);
});

test('muestra plan actual y suscripción', async t => {
    await t.expect(Selector('*').withText('Plan Actual').visible).eql(true)
        .expect(Selector('*').withText('Suscripción').visible).eql(true)
        .expect(Selector('*').withText('pro').visible).eql(true);
});

test('muestra input para subir logo', async t => {
    await t.expect(Selector('.v-file-input').exists).eql(true);
});

test('valida email inválido', async t => {
    const emailInput = Selector('input[type="email"]');
    await t.click(emailInput).pressKey('ctrl+a delete').typeText(emailInput, 'invalid-email');
    await t.click(Selector('body')); // trigger blur
    await t.expect(Selector('*').withText('Email inválido').visible).eql(true);
});

test('guarda cambios exitosamente', async t => {
    await t.click(Selector('*').withText('Guardar Cambios'));

    // SweetAlert debe aparecer tras guardar
    const swal = Selector('.swal2-popup');
    await t.expect(swal.visible).eql(true, 'message', { timeout: 5000 });
});
