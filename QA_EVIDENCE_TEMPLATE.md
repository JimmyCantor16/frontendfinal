# Evidencia de Pruebas QA — Bar POS SaaS

**Tester:** _______________
**Fecha de ejecución:** _______________
**Ambiente:** localhost:8080 (frontend) + localhost:8000 (backend)
**Rama:** `dev`
**Navegador:** Chrome XX / Firefox XX / Safari XX

---

## Instrucciones

1. Ejecutar las pruebas en el orden listado abajo
2. Para cada caso: marcar resultado (PASS/FAIL/BLOCKED)
3. Si FAIL: capturar screenshot, anotar comportamiento real, y crear entrada en la sección "Defectos"
4. Screenshots se guardan en la carpeta `qa-evidence/` con el nombre del caso (ej. `TC-AUTH-01.png`)
5. Al finalizar, llenar el resumen ejecutivo al final del documento

---

## Ronda: ______ (1ra ejecución / regresión / re-test)

---

## 1. AUTENTICACIÓN

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-AUTH-01 | Login exitoso → redirect a /dashboard | ⬜ PASS / ⬜ FAIL | |
| TC-AUTH-02 | Login con credenciales inválidas → SweetAlert error | ⬜ PASS / ⬜ FAIL | |
| TC-AUTH-03 | Login con campos vacíos → validación Vuetify | ⬜ PASS / ⬜ FAIL | |
| TC-AUTH-04 | Inactividad auto-logout (60s) | ⬜ PASS / ⬜ FAIL | |
| TC-AUTH-05 | Token expirado (401) → redirect a /login | ⬜ PASS / ⬜ FAIL | |

**Blocker para continuar:** TC-AUTH-01 debe ser PASS

---

## 2. DASHBOARD

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-DASH-01 | Cards de estadísticas visibles con datos | ⬜ PASS / ⬜ FAIL | |
| TC-DASH-02 | Tabla stock bajo muestra datos o texto vacío | ⬜ PASS / ⬜ FAIL | |
| TC-DASH-03 | Si backend falla → SweetAlert error (no console.error) | ⬜ PASS / ⬜ FAIL | |

---

## 3. CATÁLOGOS

### Categorías
| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-CAT-01 | Listar categorías | ⬜ PASS / ⬜ FAIL | |
| TC-CAT-02 | Crear categoría → SweetAlert "Creado" | ⬜ PASS / ⬜ FAIL | |
| TC-CAT-03 | Editar categoría → SweetAlert "Actualizado" | ⬜ PASS / ⬜ FAIL | |
| TC-CAT-04 | Eliminar categoría → confirmación SweetAlert | ⬜ PASS / ⬜ FAIL | |
| TC-CAT-05 | Búsqueda filtra en tiempo real | ⬜ PASS / ⬜ FAIL | |

### Proveedores
| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-SUP-01 | Listar proveedores | ⬜ PASS / ⬜ FAIL | |
| TC-SUP-02 | Crear proveedor | ⬜ PASS / ⬜ FAIL | |
| TC-SUP-03 | Editar proveedor | ⬜ PASS / ⬜ FAIL | |
| TC-SUP-04 | Eliminar proveedor → confirmación | ⬜ PASS / ⬜ FAIL | |

### Clientes
| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-CLI-01 | Listar clientes | ⬜ PASS / ⬜ FAIL | |
| TC-CLI-02 | Crear cliente | ⬜ PASS / ⬜ FAIL | |
| TC-CLI-03 | Editar cliente | ⬜ PASS / ⬜ FAIL | |
| TC-CLI-04 | Eliminar cliente → confirmación | ⬜ PASS / ⬜ FAIL | |

---

## 4. INVENTARIO

### Productos
| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-PROD-01 | Listar productos con filtro categoría | ⬜ PASS / ⬜ FAIL | |
| TC-PROD-02 | Crear producto | ⬜ PASS / ⬜ FAIL | |
| TC-PROD-03 | Editar producto | ⬜ PASS / ⬜ FAIL | |
| TC-PROD-04 | Eliminar producto → confirmación | ⬜ PASS / ⬜ FAIL | |
| TC-PROD-05 | Filtro stock bajo funciona | ⬜ PASS / ⬜ FAIL | |

### Movimientos de Inventario
| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-MOV-01 | Listar movimientos con filtros | ⬜ PASS / ⬜ FAIL | |
| TC-MOV-02 | Ajuste manual → stock se actualiza | ⬜ PASS / ⬜ FAIL | |

**Blocker para POS:** Debe haber productos con stock > 0

---

## 5. CAJA REGISTRADORA

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-CAJA-01 | Abrir caja con monto inicial | ⬜ PASS / ⬜ FAIL | |
| TC-CAJA-02 | Chip "Caja Abierta" verde en POS | ⬜ PASS / ⬜ FAIL | |
| TC-CAJA-03 | POS sin caja → chip rojo + banner advertencia | ⬜ PASS / ⬜ FAIL | |
| TC-CAJA-04 | Cerrar caja → confirmación → resumen | ⬜ PASS / ⬜ FAIL | |

**Blocker para POS cobro:** TC-CAJA-01 debe ser PASS

---

## 6. PUNTO DE VENTA (POS) — FLUJO CRÍTICO

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-POS-01 | Vista inicial con spinner de carga | ⬜ PASS / ⬜ FAIL | |
| TC-POS-02 | Crear nueva orden ("Nueva Orden") | ⬜ PASS / ⬜ FAIL | |
| TC-POS-03 | Agregar producto al carrito (click en tarjeta) | ⬜ PASS / ⬜ FAIL | |
| TC-POS-04 | Agregar producto sin stock → SweetAlert "Sin stock" | ⬜ PASS / ⬜ FAIL | |
| TC-POS-05 | Quitar producto → confirmación SweetAlert | ⬜ PASS / ⬜ FAIL | |
| TC-POS-06 | Filtrar productos por categoría | ⬜ PASS / ⬜ FAIL | |
| TC-POS-07 | Cobrar → dialog pago → confirmar → "Orden cobrada" | ⬜ PASS / ⬜ FAIL | |
| TC-POS-08 | Cancelar orden → confirmación → "Orden cancelada" | ⬜ PASS / ⬜ FAIL | |
| TC-POS-09 | Múltiples órdenes en tabs, carritos independientes | ⬜ PASS / ⬜ FAIL | |
| TC-POS-10 | Botón "Volver" → navega a /dashboard | ⬜ PASS / ⬜ FAIL | |
| TC-POS-11 | Cobrar sin caja → SweetAlert "Sin Caja" | ⬜ PASS / ⬜ FAIL | |

---

## 7. ÓRDENES DE COMPRA

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-PO-01 | Crear orden de compra con items | ⬜ PASS / ⬜ FAIL | |
| TC-PO-02 | Ver detalle de orden | ⬜ PASS / ⬜ FAIL | |
| TC-PO-03 | Recibir orden → confirmación → stock se incrementa | ⬜ PASS / ⬜ FAIL | |
| TC-PO-04 | Cancelar orden → confirmación | ⬜ PASS / ⬜ FAIL | |

---

## 8. FACTURAS

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-FAC-01 | Crear factura con items | ⬜ PASS / ⬜ FAIL | |
| TC-FAC-02 | Precio unitario se llena automático | ⬜ PASS / ⬜ FAIL | |
| TC-FAC-03 | Ver detalle de factura | ⬜ PASS / ⬜ FAIL | |
| TC-FAC-04 | Cancelar factura → confirmación | ⬜ PASS / ⬜ FAIL | |

---

## 9. REPORTES

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-REP-01 | Reporte diario con fecha actual | ⬜ PASS / ⬜ FAIL | |
| TC-REP-02 | Cards resumen (ventas, órdenes, ticket, canceladas) | ⬜ PASS / ⬜ FAIL | |
| TC-REP-03 | Desglose por método de pago con barras | ⬜ PASS / ⬜ FAIL | |
| TC-REP-04 | Tabla productos más vendidos | ⬜ PASS / ⬜ FAIL | |
| TC-REP-05 | Cambiar fecha → datos se actualizan | ⬜ PASS / ⬜ FAIL | |
| TC-REP-06 | Fecha sin datos → "Sin datos para esta fecha" | ⬜ PASS / ⬜ FAIL | |

---

## 10. CONFIGURACIÓN

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-SET-01 | Ver datos del negocio cargados | ⬜ PASS / ⬜ FAIL | |
| TC-SET-02 | Editar y guardar → SweetAlert "Configuración guardada" | ⬜ PASS / ⬜ FAIL | |
| TC-SET-03 | Email inválido → validación "Email inválido" | ⬜ PASS / ⬜ FAIL | |
| TC-SET-04 | Subir logo (PNG/JPG < 2MB) → preview + "Logo actualizado" | ⬜ PASS / ⬜ FAIL | |
| TC-SET-05 | Logo > 2MB → validación "Máximo 2 MB" | ⬜ PASS / ⬜ FAIL | |
| TC-SET-06 | AppBar refleja nombre/logo actualizado | ⬜ PASS / ⬜ FAIL | |

---

## 11. ADMIN

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-ADM-01 | Listar usuarios (login como admin) | ⬜ PASS / ⬜ FAIL | |
| TC-ADM-02 | Acceso denegado (login como user regular) | ⬜ PASS / ⬜ FAIL | |
| TC-ADM-03 | Loading state mientras carga | ⬜ PASS / ⬜ FAIL | |

---

## 12. NAVEGACIÓN Y SEGURIDAD

| ID | Caso | Resultado | Observaciones |
|----|------|-----------|---------------|
| TC-NAV-01 | Sidebar muestra todas las secciones | ⬜ PASS / ⬜ FAIL | |
| TC-NAV-02 | Ruta inexistente → redirect a /login | ⬜ PASS / ⬜ FAIL | |
| TC-NAV-03 | Sin autenticación → redirect a /login | ⬜ PASS / ⬜ FAIL | |
| TC-NAV-04 | Header X-Business-Id en requests (Network tab) | ⬜ PASS / ⬜ FAIL | |

---

## Registro de Defectos

| # | Caso relacionado | Severidad | Descripción | Comportamiento esperado | Comportamiento real | Screenshot | Estado |
|---|-----------------|-----------|-------------|------------------------|---------------------|------------|--------|
| D-001 | TC-XXX-XX | CRITICAL/HIGH/MEDIUM/LOW | Descripción del defecto | Qué debería pasar | Qué pasó realmente | `qa-evidence/D-001.png` | OPEN/FIXED/RE-TEST |
| | | | | | | | |
| | | | | | | | |

### Clasificación de severidad
- **CRITICAL:** Bloquea funcionalidad principal (no se puede cobrar, no se puede hacer login)
- **HIGH:** Funcionalidad importante no trabaja (SweetAlert no aparece, datos incorrectos)
- **MEDIUM:** Funcionalidad menor afectada (filtro no funciona, formato incorrecto)
- **LOW:** Cosmético o mejora (alineación, typo, color)

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Total casos de prueba | 68 |
| PASS | ___ |
| FAIL | ___ |
| BLOCKED | ___ |
| NO EJECUTADO | ___ |
| Defectos CRITICAL | ___ |
| Defectos HIGH | ___ |
| Defectos MEDIUM | ___ |
| Defectos LOW | ___ |

### Decisión de certificación

⬜ **APROBADO para producción** — Todos los flujos críticos pasan, sin defectos CRITICAL/HIGH abiertos
⬜ **APROBADO con observaciones** — Flujos críticos pasan, defectos MEDIUM/LOW documentados para siguiente sprint
⬜ **RECHAZADO** — Defectos CRITICAL o HIGH abiertos, requiere corrección y re-test

**Firma del tester:** _______________
**Fecha:** _______________
