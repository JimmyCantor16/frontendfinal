# Plan de Pruebas QA — Bar POS SaaS

**Versión:** 1.0
**Fecha:** 2026-02-14
**Objetivo:** Certificar el sistema para paso a producción

---

## 1. Flujo de Autenticación

### TC-AUTH-01: Login exitoso
- **Precondición:** Usuario registrado en el backend
- **Pasos:**
  1. Ir a `/login`
  2. Ingresar email y contraseña válidos
  3. Click en "Iniciar Sesión"
- **Resultado esperado:**
  - Redirect a `/dashboard`
  - AppBar muestra nombre del negocio y logo (o icono de tienda si no hay logo)
  - Sidebar visible con todas las secciones
  - `localStorage` tiene `token`, `user`, `business`

### TC-AUTH-02: Login con credenciales inválidas
- **Pasos:** Ingresar email/contraseña incorrectos
- **Resultado esperado:** SweetAlert2 con mensaje de error del backend

### TC-AUTH-03: Login con campos vacíos
- **Pasos:** Click en "Iniciar Sesión" sin llenar campos
- **Resultado esperado:** Validación de Vuetify muestra "Requerido" bajo cada campo

### TC-AUTH-04: Inactividad auto-logout
- **Pasos:** Login exitoso → no interactuar por 60 segundos
- **Resultado esperado:** Alert de advertencia a los 50s, logout automático a los 60s, redirect a `/login`

### TC-AUTH-05: Token expirado (401)
- **Pasos:** Borrar manualmente el token del localStorage y hacer cualquier acción
- **Resultado esperado:** Redirect a `/login`, localStorage limpiado

---

## 2. Dashboard

### TC-DASH-01: Carga inicial
- **Precondición:** Login exitoso
- **Resultado esperado:**
  - 3 cards: Ventas Hoy, Ventas del Mes, Facturas Hoy (con valores del backend)
  - Tabla "Productos con Stock Bajo" muestra datos o "No hay productos con stock bajo"
  - Si el backend falla: SweetAlert2 con error (no console.error silencioso)

---

## 3. Catálogos (Categorías, Proveedores, Clientes)

### TC-CAT-01: Listar registros
- **Pasos:** Navegar a `/categories`, `/suppliers`, `/clients`
- **Resultado esperado:** v-data-table con datos. Si vacío: "No se encontraron..."

### TC-CAT-02: Crear registro
- **Pasos:** Click "Nuevo" → llenar formulario → Guardar
- **Resultado esperado:** SweetAlert2 "Creado", dialog se cierra, tabla se actualiza

### TC-CAT-03: Editar registro
- **Pasos:** Click en icono editar → modificar datos → Guardar
- **Resultado esperado:** SweetAlert2 "Actualizado", tabla refleja cambios

### TC-CAT-04: Eliminar registro
- **Pasos:** Click en icono eliminar
- **Resultado esperado:** SweetAlert2 confirmación "¿Eliminar...?" → Si confirma: "Eliminado" → tabla se actualiza

### TC-CAT-05: Búsqueda/filtro
- **Pasos:** Escribir en campo de búsqueda
- **Resultado esperado:** Tabla filtra en tiempo real

---

## 4. Inventario

### TC-INV-01: Listar productos
- **Pasos:** Navegar a `/products`
- **Resultado esperado:** Tabla con productos, filtro por categoría y stock bajo funcional

### TC-INV-02: Crear producto
- **Pasos:** Click "Nuevo Producto" → llenar formulario completo → Guardar
- **Validar:** Precio de venta, precio de compra, stock inicial, categoría, SKU
- **Resultado esperado:** Producto creado, tabla actualizada

### TC-INV-03: Ajuste manual de inventario
- **Pasos:** Ir a `/inventory` → Click "Ajuste Manual" → Seleccionar producto → Nuevo stock → Razón → Aplicar
- **Resultado esperado:** Movimiento registrado, stock actualizado en tabla de productos

### TC-INV-04: Listar movimientos con filtros
- **Pasos:** Filtrar por producto y/o por tipo (Compra, Venta, Ajuste, Cancelación)
- **Resultado esperado:** Tabla filtra correctamente

---

## 5. Caja Registradora (CRÍTICO)

### TC-CAJA-01: Abrir caja
- **Precondición:** No hay caja abierta
- **Pasos:** Navegar a `/cash-register` → Ingresar monto inicial → Click "Abrir Caja"
- **Resultado esperado:** Vista cambia a estado "Caja Abierta" con resumen

### TC-CAJA-02: Verificar estado en POS
- **Precondición:** Caja abierta
- **Pasos:** Navegar a `/pos`
- **Resultado esperado:** Chip "Caja Abierta" verde en barra superior, banner de advertencia NO visible

### TC-CAJA-03: POS sin caja abierta
- **Precondición:** No hay caja abierta
- **Pasos:** Navegar a `/pos`
- **Resultado esperado:** Chip "Sin Caja" rojo, banner amarillo de advertencia, botón "Cobrar" muestra error SweetAlert2 al intentar cobrar

### TC-CAJA-04: Cerrar caja
- **Precondición:** Caja abierta (idealmente después de ventas)
- **Pasos:** Ir a `/cash-register` → Ingresar monto contado → Click "Cerrar Caja"
- **Resultado esperado:** Confirmación SweetAlert2, resumen con diferencia (esperado vs contado), vista vuelve a estado "Sin caja"

---

## 6. Punto de Venta — POS (CRÍTICO)

### TC-POS-01: Vista inicial
- **Precondición:** Login + Caja abierta
- **Pasos:** Navegar a `/pos`
- **Resultado esperado:**
  - Spinner de carga mientras se cargan datos
  - Productos visibles en grid por categorías
  - Barra superior con chips de órdenes abiertas + botón "Nueva Orden"
  - Panel derecho con carrito vacío: "Agrega productos a la orden"
  - Botón "Volver" en AppBar para regresar al dashboard

### TC-POS-02: Crear nueva orden
- **Pasos:** Click "Nueva Orden"
- **Resultado esperado:** Nueva pestaña aparece (ORD-XXXX), se selecciona automáticamente, carrito muestra "Agrega productos a la orden"

### TC-POS-03: Agregar productos al carrito
- **Pasos:** Click en tarjeta de producto
- **Resultado esperado:** Producto aparece en carrito con cantidad 1, subtotal correcto, total se actualiza, stock del producto se actualiza en la vista

### TC-POS-04: Agregar producto sin stock
- **Pasos:** Click en producto con stock = 0
- **Resultado esperado:** SweetAlert2 "Sin stock" con nombre del producto, producto NO se agrega

### TC-POS-05: Quitar producto del carrito
- **Pasos:** Click en X al lado del producto en el carrito
- **Resultado esperado:** SweetAlert2 confirmación "¿Quitar este producto?" → Si confirma: item desaparece, stock se devuelve

### TC-POS-06: Filtrar por categoría
- **Pasos:** Click en chip de categoría
- **Resultado esperado:** Solo se muestran productos de esa categoría

### TC-POS-07: Cobrar orden (generar venta)
- **Pasos:** Con productos en carrito → Click "Cobrar" → Seleccionar método de pago → "Confirmar Pago"
- **Resultado esperado:**
  - Dialog de pago aparece con total correcto
  - 4 botones: Efectivo, Tarjeta, Transferencia, QR
  - Al confirmar: SweetAlert2 "Orden cobrada", dialog se cierra
  - Pestaña de la orden desaparece (ya no está abierta)
  - Stock actualizado

### TC-POS-08: Cancelar orden
- **Pasos:** Con orden activa → Click "Cancelar"
- **Resultado esperado:** SweetAlert2 confirmación → Si confirma: "Orden cancelada", pestaña desaparece, stock devuelto

### TC-POS-09: Múltiples órdenes simultáneas
- **Pasos:** Crear 3 órdenes → agregar productos diferentes a cada una → switch entre tabs
- **Resultado esperado:** Cada tab muestra su carrito correcto, totales independientes

### TC-POS-10: Volver al Dashboard desde POS
- **Pasos:** Desde `/pos` → Click botón "Volver" en AppBar
- **Resultado esperado:** Navega a `/dashboard`, sidebar visible nuevamente

---

## 7. Órdenes de Compra

### TC-PO-01: Crear orden de compra
- **Pasos:** Navegar a `/purchase-orders` → Crear nueva → Agregar items → Guardar
- **Resultado esperado:** Orden creada con estado pendiente

### TC-PO-02: Recibir orden de compra
- **Pasos:** Click en orden → Click "Recibir"
- **Resultado esperado:** SweetAlert2 confirmación, estado cambia a "Recibida", stock de productos se incrementa

### TC-PO-03: Cancelar orden de compra
- **Pasos:** Click en orden → Click "Cancelar"
- **Resultado esperado:** SweetAlert2 confirmación, estado cambia a "Cancelada"

---

## 8. Facturas

### TC-INV-F-01: Crear factura
- **Pasos:** Navegar a `/invoices` → Crear nueva → Seleccionar cliente → Agregar items → Guardar
- **Resultado esperado:** Factura creada, precio unitario se llena automáticamente desde producto

### TC-INV-F-02: Ver detalle de factura
- **Pasos:** Click en factura de la lista
- **Resultado esperado:** Vista detalle con items, totales, datos del cliente

### TC-INV-F-03: Cancelar factura
- **Pasos:** Click "Cancelar Factura"
- **Resultado esperado:** SweetAlert2 confirmación, estado cambia a "Cancelada"

---

## 9. Reportes

### TC-REP-01: Reporte diario
- **Pasos:** Navegar a `/reports/daily`
- **Resultado esperado:**
  - Fecha por defecto: hoy
  - 4 cards: Total Ventas, Órdenes Cerradas, Ticket Promedio, Canceladas
  - Desglose por método de pago con barras de progreso
  - Tabla de productos más vendidos
  - Si no hay datos: card "Sin datos para esta fecha"

### TC-REP-02: Cambiar fecha del reporte
- **Pasos:** Cambiar fecha en el selector
- **Resultado esperado:** Spinner de carga, datos se actualizan para la nueva fecha

---

## 10. Configuración

### TC-SET-01: Ver datos del negocio
- **Pasos:** Navegar a `/settings`
- **Resultado esperado:** Formulario con datos actuales del negocio, plan actual, estado de suscripción

### TC-SET-02: Editar datos del negocio
- **Pasos:** Modificar nombre, NIT, dirección, teléfono, email → Guardar
- **Resultado esperado:** SweetAlert2 "Configuración guardada", AppBar actualiza nombre del negocio

### TC-SET-03: Validación de email
- **Pasos:** Ingresar email inválido → Intentar guardar
- **Resultado esperado:** Mensaje "Email inválido" bajo el campo

### TC-SET-04: Subir logo
- **Pasos:** Click en input de archivo → Seleccionar imagen PNG/JPG (< 2MB) → Se sube automáticamente
- **Resultado esperado:** Preview del logo, SweetAlert2 "Logo actualizado", AppBar muestra el nuevo logo

### TC-SET-05: Logo demasiado grande
- **Pasos:** Intentar subir imagen > 2MB
- **Resultado esperado:** Validación "Máximo 2 MB"

---

## 11. Administración

### TC-ADM-01: Listar usuarios (solo admin)
- **Precondición:** Login con usuario rol `admin`
- **Pasos:** Navegar a `/users`
- **Resultado esperado:** Tabla con usuarios y sus roles, loading state mientras carga

### TC-ADM-02: Acceso denegado (usuario regular)
- **Precondición:** Login con usuario rol `user`
- **Pasos:** Intentar navegar a `/users`
- **Resultado esperado:** Redirect a `/dashboard` (guard de router bloquea)

---

## 12. Navegación y Layout

### TC-NAV-01: Sidebar completo
- **Resultado esperado:** Sidebar muestra: Dashboard, POS, Catálogos (3), Inventario (2), Operaciones (Caja + OC + Facturas), Reportes, Admin (solo admin), Configuración

### TC-NAV-02: Ruta inexistente
- **Pasos:** Navegar a URL que no existe (ej. `/xyz`)
- **Resultado esperado:** Redirect a `/login`

### TC-NAV-03: Acceso sin autenticación
- **Pasos:** Sin login, intentar navegar a `/dashboard`
- **Resultado esperado:** Redirect a `/login`

---

## 13. Multi-Tenant / Diferenciación de Negocios

### TC-MT-01: Identidad del negocio visible
- **Resultado esperado:** AppBar muestra nombre y logo del negocio en todo momento (excepto login)

### TC-MT-02: Header X-Business-Id
- **Verificar:** Cada request HTTP incluye header `X-Business-Id` con el ID del negocio autenticado
- **Herramienta:** Inspeccionar Network tab del navegador

### TC-MT-03: Datos aislados por negocio
- **Pasos:** Login con usuario de negocio A → verificar que solo ve datos del negocio A
- **Resultado esperado:** Productos, categorías, órdenes, facturas, etc. son solo del negocio actual

---

## 14. Criterios de Aceptación para Producción

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Login/logout funcional con SweetAlert2 | ⬜ |
| 2 | Todas las vistas CRUD con confirmación en acciones destructivas | ⬜ |
| 3 | POS: crear orden → agregar productos → cobrar → stock se actualiza | ⬜ |
| 4 | POS: cancelar orden devuelve stock con confirmación | ⬜ |
| 5 | POS: botón "Volver" para salir de vista fullscreen | ⬜ |
| 6 | Caja registradora: abrir → operar POS → cerrar con resumen | ⬜ |
| 7 | POS bloqueado si no hay caja abierta | ⬜ |
| 8 | Reporte diario con datos correctos | ⬜ |
| 9 | Configuración: editar datos + subir logo funcional | ⬜ |
| 10 | Nombre del negocio visible en AppBar | ⬜ |
| 11 | Header X-Business-Id en todas las requests | ⬜ |
| 12 | Error handling con SweetAlert2 en todas las vistas (no console.error) | ⬜ |
| 13 | Build de producción sin errores TypeScript | ⬜ |
| 14 | Guards de autenticación y roles funcionan | ⬜ |
| 15 | Inactividad auto-logout funcional | ⬜ |
