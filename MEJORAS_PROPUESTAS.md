# CarKeeper - Mejoras Propuestas

**Fecha:** 2026-03-04
**Total de issues encontrados:** 114 (Frontend: 74 | Backend: 40)

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRITICAL | 6 | 6 CORREGIDOS |
| HIGH | 21 | 4 CORREGIDOS |
| MEDIUM | 52 | PENDIENTES |
| LOW | 35 | PENDIENTES |

### Ya corregidos en esta sesión:
- Endpoint cron sin autenticación
- IDOR en notificaciones (cualquier usuario podía modificar otro)
- Webhook RevenueCat sin verificación
- Export controller con field names incorrectos (devolvía data vacía)
- Cascade delete al eliminar usuario
- API keys loggeadas en consola
- Unreachable code en checkAuth middleware
- Path traversal en descarga de documentos
- Permisos per-user en vehículos compartidos
- Status code incorrecto (500 en vez de 200) en notificaciones

---

## 1. SEGURIDAD (Prioridad: INMEDIATA)

### 1.1 Rate Limiting - NO EXISTE
**Impacto:** ALTO | **Esfuerzo:** BAJO
- No hay protección contra brute force en login/register/password-reset
- **Solución:** Instalar `express-rate-limit`
```bash
npm install express-rate-limit
```
```javascript
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/usuarios/login', authLimiter);
```

### 1.2 Input Validation Schema - NO EXISTE
**Impacto:** ALTO | **Esfuerzo:** MEDIO
- Todos los controllers hacen `...req.body` sin validación
- **Solución:** Implementar `joi` o `zod` para validación de schemas
```bash
npm install zod
```

### 1.3 Helmet - Headers de Seguridad
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- No hay headers de seguridad (X-Frame-Options, CSP, etc.)
- **Solución:**
```bash
npm install helmet
```

### 1.4 Password Reset Token sin Expiración
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- `usuario.token` persiste en DB sin TTL
- **Solución:** Agregar campo `tokenExpires` con TTL de 1 hora

### 1.5 Google Client ID Hardcodeado
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- `config/socialAuth.js:6` tiene el Client ID hardcodeado
- **Solución:** Mover a variables de entorno

---

## 2. PERFORMANCE - BACKEND (Prioridad: ALTA)

### 2.1 File Operations Bloqueantes (fs.unlinkSync)
**Impacto:** ALTO | **Esfuerzo:** BAJO
- `vehiculoController.js`, `documentoController.js` usan `fs.unlinkSync()` (bloquea event loop)
- **Solución:** Reemplazar con `fs.promises.unlink()`

### 2.2 Duplicate Detection Ineficiente
**Impacto:** MEDIO | **Esfuerzo:** MEDIO
- `gastoController.js:353-389` carga docs completos con `$$ROOT` y borra uno por uno
- **Solución:** Usar `$skip` en aggregation y `deleteMany` con IDs

### 2.3 Missing Database Indexes
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- No hay index compuesto en `(userId, isActive)` para vehículos
- **Solución:** Agregar en modelos:
```javascript
vehiculoSchema.index({ userId: 1, isActive: 1 });
```

### 2.4 Pagination con skip() Ineficiente
**Impacto:** BAJO | **Esfuerzo:** MEDIO
- `skip()` es O(n) en MongoDB para datasets grandes
- **Solución futura:** Cursor-based pagination con `_id > lastId`

### 2.5 Multer Configuración Duplicada x4
**Impacto:** BAJO | **Esfuerzo:** BAJO
- 4 archivos con config de multer idéntica
- **Solución:** Centralizar en `helpers/multerConfig.js`

---

## 3. PERFORMANCE - FRONTEND (Prioridad: MEDIA)

### 3.1 Missing Memoization en Listas
**Impacto:** ALTO | **Esfuerzo:** MEDIO
- `VehicleListScreen.js`: Animaciones se recrean en cada render
- `ExpensesScreen.js`: Categorías se recalculan en cada render
- **Solución:** `useMemo` para cálculos pesados, `useCallback` para handlers

### 3.2 Computaciones Pesadas en Render
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- `gastos.reduce()` ejecutado en render directo (VehicleListScreen:327)
- `getTotalByCategory()` recalculado sin cache (ExpensesScreen:156)
- **Solución:** Mover a `useMemo`

### 3.3 Memory Leaks en useEffect
**Impacto:** MEDIO | **Esfuerzo:** MEDIO
- `SubscriptionProvider.js:19-28`: setTimeout sin cleanup en unmount
- `AuthProvider.js:20-52`: Async sin AbortController
- **Solución:** Agregar cleanup functions y AbortController

### 3.4 268+ Console.logs en Producción
**Impacto:** BAJO | **Esfuerzo:** MEDIO
- Todos los servicios y providers tienen console.log extensivos
- **Solución:** Crear helper `logger.js` con flag `__DEV__`

---

## 4. UX / UI (Prioridad: MEDIA)

### 4.1 Empty States Faltantes
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- DocumentsScreen: No tiene estado vacío "No hay documentos"
- MaintenanceListScreen: Falta empty state al cambiar tabs
- **Solución:** Componente reutilizable `EmptyState`

### 4.2 Error Messages Genéricos
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- Muchos errores solo dicen "Error del servidor"
- **Solución:** Mensajes específicos por tipo de error

### 4.3 Confirmación en Acciones Destructivas
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- `cleanDuplicates` no muestra preview de qué se va a borrar
- **Solución:** Mostrar lista de duplicados antes de confirmar

### 4.4 Offline Support
**Impacto:** ALTO | **Esfuerzo:** ALTO
- La app no funciona sin conexión
- **Solución futura:** AsyncStorage/SQLite como cache local

### 4.5 Pull-to-Refresh en Todas las Listas
**Impacto:** BAJO | **Esfuerzo:** BAJO
- Verificar que todas las listas tengan `RefreshControl`

---

## 5. ARQUITECTURA (Prioridad: MEDIA-BAJA)

### 5.1 Error Handling Centralizado
**Impacto:** ALTO | **Esfuerzo:** MEDIO
- Backend: Cada controller tiene su propio try/catch con formato distinto
- **Solución:** Middleware global de errores
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Error interno' : err.message
  });
});
```

### 5.2 Response Format Inconsistente
**Impacto:** MEDIO | **Esfuerzo:** MEDIO
- Algunos: `{ msg: "..." }`
- Otros: `{ success: false, error: "..." }`
- Otros: `{ es: "...", en: "..." }`
- **Solución:** Estandarizar a `{ success, data?, error?, message? }`

### 5.3 API Versioning
**Impacto:** BAJO | **Esfuerzo:** BAJO
- Rutas sin versión: `/api/usuarios`
- **Solución futura:** `/api/v1/usuarios`

### 5.4 TypeScript Migration
**Impacto:** ALTO | **Esfuerzo:** ALTO (largo plazo)
- Todo el código es JavaScript sin types
- **Solución futura:** Migración gradual a TypeScript

### 5.5 Testing
**Impacto:** ALTO | **Esfuerzo:** ALTO
- 35/40 tests pasan pero coverage es bajo
- **Solución:** Agregar tests para controllers y frontend con Jest/Testing Library

---

## 6. DATA INTEGRITY (Prioridad: ALTA)

### 6.1 Race Condition en Vehicle Sharing
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- Check + save no es atómico en `respondToInvitation`
- **Solución:** Usar `$addToSet` de MongoDB en vez de find+push+save

### 6.2 Orphaned Data en Soft Delete de Vehículos
**Impacto:** MEDIO | **Esfuerzo:** BAJO
- Al hacer soft delete (`isActive: false`), gastos/mantenimientos quedan huérfanos
- **Solución:** Filtrar por `isActive` en queries de gastos/mantenimientos

### 6.3 Transacciones para Operaciones Relacionadas
**Impacto:** MEDIO | **Esfuerzo:** MEDIO
- Crear mantenimiento + gasto asociado no es atómico
- **Solución:** MongoDB transactions con `session`

---

## 7. MEJORAS PARA ANDROID (Prioridad: ALTA)

### 7.1 RevenueCat Android API Key
**Impacto:** CRITICAL | **Esfuerzo:** BAJO
- `.env` tiene `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=` vacío
- **Acción:** Crear app Android en RevenueCat dashboard y obtener key

### 7.2 Google Services para Android
**Impacto:** ALTO | **Esfuerzo:** BAJO
- Falta `google-services.json` para Firebase en Android
- **Acción:** Descargar desde Firebase Console > Project Settings > Android app

### 7.3 Google OAuth Android Client ID
**Impacto:** ALTO | **Esfuerzo:** BAJO
- Necesita OAuth client con SHA-1 fingerprint
- **Acción:** Generar SHA-1 con `keytool` y crear client en Google Cloud Console

### 7.4 Deep Linking Android
**Impacto:** MEDIO | **Esfuerzo:** MEDIO
- Intent filters para abrir invitaciones desde email
- **Solución:** Configurar `intentFilters` en `app.json`

---

## 8. NUEVAS FEATURES PROPUESTAS (Prioridad: FUTURA)

### 8.1 Widget de Mantenimiento (Android/iOS)
- Mostrar próximo mantenimiento pendiente en widget de home screen

### 8.2 Backup Automático Programado
- Exportación periódica de datos a email o cloud storage

### 8.3 OCR para Recibos
- Escanear facturas/recibos y extraer datos automáticamente

### 8.4 Comparación de Gastos
- Dashboard comparativo mes a mes, año a año

### 8.5 Recordatorios Inteligentes
- Basados en patrones de uso (cada X km, cada X meses)

### 8.6 Multi-idioma Expandido
- Agregar portugués, francés, italiano

### 8.7 Modo Flota
- Para empresas con múltiples vehículos y conductores

### 8.8 Integración con OBD-II
- Lectura de datos del vehículo vía Bluetooth OBD

---

## ROADMAP SUGERIDO

### Sprint 1 (Semana actual)
- [ ] Rate limiting
- [ ] Input validation (zod)
- [ ] Helmet
- [ ] fs.unlinkSync → async
- [ ] Database indexes

### Sprint 2 (Próxima semana)
- [ ] RevenueCat Android key
- [ ] Google Services Android
- [ ] Error handling centralizado
- [ ] Response format estandarizado
- [ ] Empty states en frontend

### Sprint 3 (2 semanas)
- [ ] Memoización frontend
- [ ] Console.log cleanup completo
- [ ] Multer centralizado
- [ ] Tests de integración
- [ ] Race condition fix ($addToSet)

### Sprint 4 (3 semanas)
- [ ] Offline support básico
- [ ] Deep linking
- [ ] Password reset token expiration
- [ ] Transacciones MongoDB
- [ ] TypeScript setup gradual

### Backlog (Futuro)
- [ ] OCR para recibos
- [ ] Widget de mantenimiento
- [ ] Modo flota
- [ ] OBD-II integration
- [ ] Multi-idioma expandido
