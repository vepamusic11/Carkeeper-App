# CarKeeper - Documentación Completa del Proyecto

**Versión:** 1.0.3
**Fecha de documentación:** 2026-03-04
**Plataformas:** iOS, Android (en migración)

---

## 1. Arquitectura General

### Estructura del Monorepo

```
carkeeper/
├── backend/              # API REST con Node.js/Express
│   ├── config/           # Configuración de base de datos
│   ├── controllers/      # Lógica de negocio
│   ├── models/           # Esquemas MongoDB/Mongoose
│   ├── routes/           # Definición de endpoints
│   ├── middleware/        # Auth, validación, suscripciones
│   ├── helpers/           # Utilidades (JWT, emails, IDs)
│   └── index.js          # Entry point del servidor (puerto 4002)
│
├── carKeeper/            # App móvil React Native/Expo
│   ├── App.js            # Componente raíz con navegación
│   ├── app.json          # Configuración Expo
│   ├── eas.json          # Configuración EAS Build
│   ├── .env              # Variables de entorno
│   └── src/
│       ├── screens/      # Pantallas organizadas por feature
│       ├── context/      # Providers de estado global (Context API)
│       ├── hooks/        # Custom hooks
│       ├── services/     # Llamadas a API y servicios externos
│       ├── components/   # Componentes reutilizables
│       ├── utils/        # Helpers (i18n, formateo)
│       ├── constants/    # Colores, tema, configuración
│       └── assets/       # Imágenes y animaciones Lottie
```

---

## 2. Stack Tecnológico

### Frontend (Mobile App)
| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.79.5 | Framework base |
| Expo | 53.0.20 | Toolchain y módulos nativos |
| React Navigation v7 | 7.x | Navegación (stack, bottom-tabs) |
| Context API | - | Gestión de estado global |
| Firebase Auth | - | Autenticación |
| RevenueCat | 9.1.0 | Compras in-app y suscripciones |
| Axios | - | HTTP client |
| react-native-reanimated | 3.17.4 | Animaciones |
| Lottie | - | Animaciones vectoriales |
| react-native-chart-kit | - | Gráficos analíticos |
| expo-notifications | - | Push notifications |
| expo-localization | - | i18n (ES/EN) |

### Backend (API)
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | - | Runtime (ES Modules) |
| Express.js | 4.18.2 | Framework HTTP |
| MongoDB | 6.9.0 | Base de datos |
| Mongoose | - | ODM |
| JWT | 9.0.0 | Autenticación por tokens |
| bcryptjs | 2.4.3 | Hashing de contraseñas |
| Nodemailer | 6.9.1 | Envío de emails |
| Multer | 1.4.5 | Upload de archivos |
| Expo Server SDK | 3.14.0 | Push notifications |
| PDFKit | - | Generación de PDF |
| csv-writer | - | Exportación CSV |

---

## 3. Modelos de Base de Datos

### Usuario
```
{
  nombre, apellido, email, password,
  provider (local/google/apple), providerId,
  profileImage, lengua,
  allowNotifications, notificationToken,
  isInvitado, proActivatedBy,
  configuraciones: { tema, moneda, unidadDistancia }
}
```

### Vehiculo
```
{
  userId (ref: Usuario),
  marca, modelo, ano, patente, color,
  kilometraje, vin, motor, combustible, transmision,
  imageUrl, notas, isActive,
  sharedWith: [{
    userId, role (viewer/editor/admin),
    invitedBy, invitedAt, acceptedAt, status,
    permissions: { canEditExpenses, canEditMaintenance, canUploadDocuments, canEditVehicle }
  }],
  sharingSettings: { allowExpenseEditing, allowMaintenanceEditing, allowDocumentUploads, allowVehicleEditing }
}
```

### Gasto
```
{
  userId, vehiculoId (ref: Vehiculo),
  tipo, descripcion, monto, fecha,
  categoria, proveedor, kilometraje, notas
}
```

### Mantenimiento
```
{
  userId, vehiculoId (ref: Vehiculo),
  tipo, descripcion, fecha, costo,
  kilometraje, taller, recordatorio,
  notas, estado (pendiente/completado)
}
```

### Documento
```
{
  userId, vehicleId (ref: Vehiculo),
  title, type, description,
  expirationDate, isExpired, reminderSent,
  fileUrl, fileName, fileSize, fileType
}
```

### VehicleInvitation
```
{
  invitedBy (ref: Usuario), invitedUser (ref: Usuario),
  invitedEmail, vehicleId (ref: Vehiculo),
  role, status (pending/accepted/declined/expired),
  message, invitationToken, expiresAt (7 días),
  permissions: { canEditExpenses, canEditMaintenance, canUploadDocuments, canEditVehicle }
}
```

---

## 4. API Endpoints

### Autenticación (`/api/usuarios`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Login con email/password |
| POST | `/login-google` | Login con Google |
| POST | `/apple-auth` | Login con Apple |
| POST | `/registrar` | Registro nuevo usuario |
| POST | `/registrar-google` | Registro con Google |
| POST | `/comprobar` | Verificar token auth |
| PUT | `/perfil` | Editar perfil |
| GET | `/estadisticas` | Estadísticas del usuario |
| PUT | `/configuraciones` | Actualizar configuraciones |
| POST | `/allow-notifications` | Habilitar notificaciones |
| POST | `/notification-token` | Registrar token push |
| POST | `/eliminar-usuario/:id` | Eliminar cuenta |

### Vehículos (`/api/vehiculos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar vehículos |
| POST | `/` | Crear vehículo |
| GET | `/:id` | Obtener vehículo |
| PUT | `/:id` | Actualizar vehículo |
| DELETE | `/:id` | Eliminar vehículo |

### Gastos (`/api/gastos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar gastos |
| POST | `/` | Crear gasto |
| GET | `/:id` | Obtener gasto |
| PUT | `/:id` | Actualizar gasto |
| DELETE | `/:id` | Eliminar gasto |

### Mantenimientos (`/api/mantenimientos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar mantenimientos |
| POST | `/` | Crear mantenimiento |
| GET | `/:id` | Obtener mantenimiento |
| PUT | `/:id` | Actualizar mantenimiento |
| DELETE | `/:id` | Eliminar mantenimiento |

### Documentos (`/api/documentos`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar documentos (con paginación) |
| POST | `/` | Crear documento (con upload) |
| GET | `/:id` | Obtener documento |
| PUT | `/:id` | Actualizar documento |
| DELETE | `/:id` | Eliminar documento |
| GET | `/:id/download` | Descargar archivo |
| DELETE | `/:id/file` | Eliminar archivo adjunto |
| GET | `/proximos-vencer` | Documentos próximos a vencer |
| GET | `/estadisticas` | Estadísticas de documentos |
| POST | `/recordatorios` | Enviar recordatorios |

### Exportación (`/api/export`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/csv` | Exportar datos a CSV |
| GET | `/json` | Exportar datos a JSON |

### Suscripciones (`/api/subscription`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/status` | Estado de suscripción |
| POST | `/verify` | Verificar compra |

### Compartir Vehículos (`/api/vehicle-sharing`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/invite` | Invitar usuario |
| GET | `/sent` | Invitaciones enviadas |
| GET | `/received` | Invitaciones recibidas |
| POST | `/respond/:invitationToken` | Aceptar/rechazar invitación |
| GET | `/shared` | Vehículos compartidos conmigo |
| DELETE | `/:vehicleId/user/:userId` | Remover usuario |
| POST | `/:vehicleId/leave` | Salir de vehículo compartido |

---

## 5. Navegación de la App

```
RootNavigator (basado en AuthContext)
│
├── [No autenticado] OnboardingFlow
│   ├── Onboarding (carousel de bienvenida)
│   ├── OnboardingPaywall
│   ├── Welcome (login social + email)
│   ├── Login
│   ├── Register
│   └── AuthNavigator
│
├── [Autenticado sin suscripción] MandatoryPaywall
│
└── [Autenticado con suscripción] MainTabNavigator
    ├── Tab: Vehículos
    │   ├── VehicleList
    │   ├── AddVehicle
    │   └── VehicleDetail
    │
    ├── Tab: Mantenimientos
    │   ├── MaintenanceList
    │   ├── AddMaintenance
    │   └── MaintenanceDetail
    │
    ├── Tab: Gastos
    │   ├── ExpensesList
    │   ├── AddExpense
    │   └── ExpenseDetail
    │
    └── Tab: Perfil
        ├── ProfileMain
        ├── EditProfile
        ├── Settings
        ├── HelpCenter
        ├── PrivacyPolicy
        ├── VehicleSharing
        ├── Analytics
        ├── Export
        ├── Documents
        └── AddDocument

Modal: Subscription (upgrade)
```

---

## 6. Flujo de Autenticación

1. **Inicio** → Onboarding (solo primera vez)
2. **Welcome Screen** → Opciones: Google / Apple (solo iOS) / Email
3. **Login/Register** → Se envía al backend → JWT token
4. **Post-Auth Check** → `checkSubscriptionAfterAuth()`:
   - Conecta con RevenueCat (`Purchases.logIn(userId)`)
   - Obtiene customerInfo
   - Determina tipo de suscripción
5. **Gate de suscripción**:
   - Sin suscripción → MandatoryPaywall
   - Con suscripción/trial → MainTabNavigator

### Tiers de Suscripción
| Feature | Free | Premium | Pro |
|---|---|---|---|
| Vehículos | 1 | Ilimitados | Ilimitados |
| Mantenimientos/mes | 2 | Ilimitados | Ilimitados |
| Gastos/mes | 2 | Ilimitados | Ilimitados |
| Recordatorios | 5 | 50 | Ilimitados |
| Categorías gastos | 3 | 10 | Ilimitadas |
| Exportar datos | No | Sí | Sí |
| Compartir vehículos | No | Sí | Sí |
| Invitar usuarios | No | No | Sí |
| Soporte prioritario | No | No | Sí |

---

## 7. Gestión de Estado (Context API)

### Providers (orden de anidamiento en App.js)
1. **ThemeProvider** - Tema claro/oscuro, colores
2. **AuthProvider** - Usuario, login/logout, token JWT
3. **SubscriptionProvider** - RevenueCat, features, gates
4. **NotificationsProvider** - Push notifications, tokens
5. **VehiculosProvider** - CRUD vehículos
6. **MantenimientosProvider** - CRUD mantenimientos
7. **GastosProvider** - CRUD gastos
8. **DocumentsProvider** - CRUD documentos

### Custom Hooks
- `useAuth()` - Acceso a AuthContext
- `useVehiculos()` - CRUD vehículos
- `useMantenimientos()` - CRUD mantenimientos
- `useGastos()` - CRUD gastos
- `useDocuments()` - CRUD documentos
- `useSubscription()` - Estado de suscripción
- `useNotifications()` - Notificaciones push
- `useTheme()` - Tema de la app
- `useLanguage()` - Idioma (ES/EN)
- `useVehicleSharing()` - Compartir vehículos

---

## 8. Bugs Corregidos

### Bug #1 (CRITICAL) - Sobrescritura de Permisos en Vehículos Compartidos
- **Archivo:** `vehicleSharingController.js`
- **Problema:** Los permisos de la invitación no se almacenaban per-user
- **Solución:** Se agregó campo `permissions` al subdocumento `sharedWith` en el modelo Vehiculo y se almacenan los permisos de la invitación al aceptar

### Bug #2 (MEDIUM) - Precedencia de Operadores ✅ (Ya corregido)
- Validación de `canRespond` ya tiene paréntesis correctos y check `!invitation.invitedUser`

### Bug #3 (LOW) - Variable Duplicada ✅ (Ya corregido)
- `currentUser` solo se declara una vez

### Bug #4 (MEDIUM) - Race Condition ✅ (Ya corregido)
- Usa `VehicleInvitation.updateMany()` en lugar de loop

### Bug #5 (LOW) - Path Traversal en Descarga
- **Archivo:** `documentoController.js`
- **Problema:** `fileUrl.replace()` permitía path traversal
- **Solución:** Usar `path.join()` + `path.basename()` para sanitizar rutas

### Bug #6 (MEDIUM) - Error Headers ✅ (Ya corregido)
- Ya tiene check `!res.headersSent`

### Bug #7 (MEDIUM) - Loop Síncrono ✅ (Ya corregido)
- Ya usa `Promise.all()` con `.map()`

---

## 9. Estado de Compatibilidad Android

### Funciona correctamente
- Navegación completa (React Navigation)
- KeyboardAvoidingView (con `behavior` correcto per-platform)
- Push notifications (con canal Android configurado)
- Google Sign-In (con `Platform.select()`)
- RevenueCat (con API key per-platform)
- Tema claro/oscuro
- i18n (ES/EN)
- Todas las pantallas CRUD
- Tab bar con ajustes per-platform

### Requiere configuración externa
- **RevenueCat Android API Key**: Necesita key de RevenueCat dashboard → `.env` `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID`
- **Google Services**: Necesita `google-services.json` desde Firebase Console para builds nativos (no necesario para Expo Go)
- **Google Android Client ID**: Necesita OAuth client configurado en Google Cloud Console con SHA-1

### Comportamiento en Android
- **Apple Sign-In**: No se muestra (correcto, solo iOS)
- **Expo Go**: Funciona para desarrollo y testing

---

## 10. Guía de Desarrollo

### Requisitos
- Node.js >= 18
- npm >= 8
- Expo CLI (`npm install -g expo-cli eas-cli`)
- MongoDB (para backend)
- Expo Go app en el celular

### Setup Frontend
```bash
cd carKeeper
npm install
npx expo install        # Ajusta versiones compatibles con Expo
npx expo start          # Inicia Metro Bundler
# o
npx expo start --lan    # Para LAN (misma red WiFi)
npx expo start --tunnel # Para acceso remoto (requiere ngrok)
```

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env    # Configurar variables
npm run dev             # Inicia con nodemon
```

### Variables de entorno necesarias (.env frontend)
```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=
EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID=    # ⚠️ Configurar para Android
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_APPLE_CLIENT_ID=
EXPO_PUBLIC_APP_ENVIRONMENT=development
EXPO_PUBLIC_BACKEND_URL=https://deepyze.com.ar
```

### Build para producción
```bash
# Android APK (testing)
eas build --platform android --profile development

# Android AAB (Play Store)
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## 11. Mejoras Futuras Propuestas

### Prioridad Alta
1. **Completar configuración Android**: RevenueCat API key, Google Services, SHA-1 fingerprint
2. **Testing E2E**: Implementar tests de integración con Detox o Maestro
3. **Eliminar `sharingSettings` global**: Migrar completamente a permisos per-user en `sharedWith`
4. **Validación de inputs**: Sanitización más estricta en backend (XSS, injection)

### Prioridad Media
5. **Offline support**: Cache local con AsyncStorage o SQLite para uso sin conexión
6. **Image optimization**: Comprimir imágenes antes de upload (react-native-image-resizer)
7. **Paginación en listas**: Implementar infinite scroll en todas las listas
8. **Rate limiting**: Agregar express-rate-limit al backend
9. **Refresh tokens**: Implementar JWT refresh tokens para mayor seguridad
10. **Migrar a TypeScript**: Mejorar type safety del codebase

### Prioridad Baja
11. **Dark mode completo**: Verificar todas las pantallas en modo oscuro
12. **Accesibilidad**: Labels, contraste, screen reader support
13. **Deep linking**: Manejo de URLs para invitaciones de vehículos
14. **Widget Android/iOS**: Widget de recordatorios de mantenimiento
15. **Backup automático**: Exportación periódica programada
16. **Analytics dashboard mejorado**: Gráficos más detallados con filtros

### Deuda Técnica
17. **Eliminar console.log** de producción
18. **Centralizar error handling**: Middleware unificado de errores
19. **Separar concerns**: Extraer lógica de controllers a services
20. **Actualizar dependencias deprecadas**: react-native-vector-icons, glob, rimraf

---

## 12. Servicios Externos

| Servicio | Uso | Dashboard |
|---|---|---|
| Firebase | Auth, push tokens | console.firebase.google.com |
| RevenueCat | Suscripciones | app.revenuecat.com |
| MongoDB | Base de datos | Atlas/self-hosted |
| Google Cloud | OAuth 2.0 | console.cloud.google.com |
| Apple Developer | Apple Sign-In | developer.apple.com |
| Expo/EAS | Build & deploy | expo.dev |
| Backend Server | API REST | deepyze.com.ar:4002 |

---

## 13. Archivos Clave de Referencia

| Archivo | Ubicación | Descripción |
|---|---|---|
| App.js | `carKeeper/App.js` | Entry point, navegación principal |
| AuthProvider.js | `carKeeper/src/context/AuthProvider.js` | Autenticación global |
| SubscriptionProvider.js | `carKeeper/src/context/SubscriptionProvider.js` | Suscripciones RevenueCat |
| revenuecat.js | `carKeeper/src/services/revenuecat.js` | Servicio RevenueCat |
| socialAuth.js | `carKeeper/src/services/socialAuth.js` | Google/Apple auth |
| vehicleSharingController.js | `backend/controllers/vehicleSharingController.js` | Compartir vehículos |
| documentoController.js | `backend/controllers/documentoController.js` | Gestión documentos |
| Vehiculo.js | `backend/models/Vehiculo.js` | Modelo vehículo |
| VehicleInvitation.js | `backend/models/VehicleInvitation.js` | Modelo invitación |
| app.json | `carKeeper/app.json` | Config Expo |
| eas.json | `carKeeper/eas.json` | Config EAS Build |
