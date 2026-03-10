import { ClientFunction, RequestMock } from 'testcafe';

// URL base para los tests
export const BASE_URL = 'http://localhost:8080';

// Helper para simular login seteando localStorage directamente, igual que en Cypress
export const login = ClientFunction(() => {
  const mockUser = {
    id: 1,
    name: 'Admin Test',
    email: 'admin@test.com',
    role: 'admin',
    business_id: 1,
  };
  const mockBusiness = {
    id: 1,
    name: 'Bar de Prueba',
    slug: 'bar-de-prueba',
    logo_url: null,
    address: 'Calle 123',
    phone: '3001234567',
    email: 'bar@test.com',
    nit: '900123456-1',
    plan: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
  };

  window.localStorage.setItem('token', 'fake-testcafe-token-12345');
  window.localStorage.setItem('user', JSON.stringify(mockUser));
  window.localStorage.setItem('business', JSON.stringify(mockBusiness));
});

// Helper genérico para interceptar las llamadas Catch-all
export const catchAllMock = RequestMock()
  .onRequestTo(/\/api\/.*/)
  .respond({ data: [] }, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-credentials': 'true'
  });
