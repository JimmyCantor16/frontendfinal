import { Selector, RequestMock } from 'testcafe';
import { BASE_URL, login, catchAllMock } from './helpers';

const catchAllAndDashboardMock = RequestMock()
    .onRequestTo(/\/api\/dashboard.*/)
    .respond({ data: { ventas_hoy: 0, ventas_mes: 0, facturas_hoy: 0, productos_stock_bajo: [] } }, 200, {
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true'
    })
    .onRequestTo(/\/api\/.*/)
    .respond({ data: [] }, 200, {
        'access-control-allow-origin': '*',
    });

fixture`Autenticación`
    .page`${BASE_URL}/login`;

test('muestra el formulario de login', async t => {
    const emailInput = Selector('input[type="email"]');
    const passwordInput = Selector('input[type="password"]');
    const loginButton = Selector('button').withText('Login');

    await t
        .expect(emailInput.visible).eql(true)
        .expect(passwordInput.visible).eql(true)
        .expect(loginButton.visible).eql(true);
});

test('muestra el título Iniciar sesión', async t => {
    const title = Selector('*').withText('Iniciar sesión');
    await t.expect(title.visible).eql(true);
});

test('muestra validación con campos vacíos', async t => {
    const loginButton = Selector('button').withText('Login');
    await t.click(loginButton);
    const errorMsg = Selector('*').withText('Campo requerido');
    await t.expect(errorMsg.visible).eql(true);
});

test('redirige a login si no está autenticado', async t => {
    await t.navigateTo(`${BASE_URL}/dashboard`);
    const url = await t.eval(() => window.location.href);
    await t.expect(url).contains('/login');
});

test
    .requestHooks(catchAllAndDashboardMock)
    ('permite acceder a dashboard con sesión válida', async t => {
        await login();
        await t.navigateTo(`${BASE_URL}/dashboard`);

        const url = await t.eval(() => window.location.href);
        await t.expect(url).contains('/dashboard');

        const dashboardTitle = Selector('*').withText('Dashboard');
        await t.expect(dashboardTitle.exists).eql(true);
    });
