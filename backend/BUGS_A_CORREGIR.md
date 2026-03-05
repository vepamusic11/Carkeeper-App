# 🐛 Bugs a Corregir - CarKeeper Backend

Este documento contiene los bugs identificados con sus soluciones específicas.

---

## 🔴 Bugs Críticos

### Bug #1: Import No Utilizado en Usuario.js
**Archivo:** `models/Usuario.js:3`
**Código actual:**
```javascript
import { type } from "os";
```

**Solución:**
```javascript
// Eliminar completamente la línea 3
```

---

### Bug #2: Opciones Deprecated de Mongoose
**Archivo:** `config/db.js:5-8`
**Código actual:**
```javascript
const connection = await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

**Solución:**
```javascript
const connection = await mongoose.connect(process.env.MONGO_URI);
```

---

### Bug #3: JSON.parse Sin Try-Catch
**Archivo:** `controllers/usuarioController.js:393, 447, 494`
**Código actual:**
```javascript
const subData = JSON.parse(usuario.subscriptionData);
```

**Solución:**
```javascript
let subData;
try {
  subData = typeof usuario.subscriptionData === 'string'
    ? JSON.parse(usuario.subscriptionData)
    : usuario.subscriptionData;
} catch (error) {
  console.error("Error parsing subscriptionData:", error);
  subData = {};
}
```

---

### Bug #4: Response en Función No-Handler
**Archivo:** `controllers/usuarioController.js:884`
**Código actual:**
```javascript
const sendPushNotification = async (id, title, message) => {
  try {
    // ...
    if (!Expo.isExpoPushToken(usuario.tokenNotification)) {
      return res.status(400).json({ msg: "Token Expo no válido" });
    }
```

**Solución:**
```javascript
const sendPushNotification = async (id, title, message) => {
  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      console.log("Usuario no existe");
      return null;
    }

    // Validar que el token sea un token Expo válido
    if (!Expo.isExpoPushToken(usuario.tokenNotification)) {
      console.log("Token Expo no válido");
      return null;
    }
    // ... resto del código
```

---

### Bug #5: Status Code Incorrecto
**Archivo:** `controllers/usuarioController.js:930`
**Código actual:**
```javascript
usuario.allowNotifications = !usuario.allowNotifications;
const usuarioAlmacenado = await usuario.save();

res.status(500).json(usuarioAlmacenado);
```

**Solución:**
```javascript
usuario.allowNotifications = !usuario.allowNotifications;
const usuarioAlmacenado = await usuario.save();

res.status(200).json(usuarioAlmacenado);
```

---

### Bug #6: Código Inalcanzable en checkAuth
**Archivo:** `middleware/checkAuth.js:34-38`
**Código actual:**
```javascript
if (!token) {
  return res.status(401).json({ msg: "Token no válido" });
}

next();
```

**Solución:**
```javascript
if (!token) {
  return res.status(401).json({ msg: "Token no válido" });
}
// Eliminar el next() porque nunca se alcanza
```

---

## 🟡 Bugs Moderados

### Bug #7: Variable de Entorno Inconsistente
**Archivo:** `helpers/revenueCatService.js:10`
**Código actual:**
```javascript
"Authorization": `Bearer ${process.env.API_KEY_REVENUE}`,
```

**Solución (opción 1 - cambiar código):**
```javascript
"Authorization": `Bearer ${process.env.REVENUECAT_API_KEY}`,
```

**Solución (opción 2 - cambiar .env.example):**
```env
# En .env.example, cambiar:
# REVENUECAT_API_KEY=tu_revenuecat_api_key
# Por:
API_KEY_REVENUE=tu_revenuecat_api_key
```

---

### Bug #8: Usuario Null No Validado
**Archivo:** `middleware/checkAuth.js:12-19`
**Código actual:**
```javascript
try {
  token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.usuario = await Usuario.findById(decoded.id).select(
    "-password -confirmado -token -createdAt -updatedAt -__v"
  );

  return next();
```

**Solución:**
```javascript
try {
  token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.usuario = await Usuario.findById(decoded.id).select(
    "-password -confirmado -token -createdAt -updatedAt -__v"
  );

  if (!req.usuario) {
    return res.status(401).json({
      msg: "Usuario no encontrado o token inválido"
    });
  }

  return next();
```

---

### Bug #9: Conversión de ObjectId en Aggregate
**Archivo:** `controllers/gastoController.js:221-228`
**Código actual:**
```javascript
let matchQuery = {
  userId,
  date: { $gte: startDate, $lte: endDate },
};

if (vehicleId) {
  matchQuery.vehicleId = vehicleId;
}
```

**Solución:**
```javascript
import mongoose from 'mongoose';

let matchQuery = {
  userId: new mongoose.Types.ObjectId(userId),
  date: { $gte: startDate, $lte: endDate },
};

if (vehicleId) {
  matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
}
```

---

## 🟢 Mejoras Menores

### Mejora #1: Actualizar Comentario
**Archivo:** `index.js:53`
**Código actual:**
```javascript
// El puerto de produccion y desarrollo local es 4000
const PORT = process.env.PORT || 4002;
```

**Solución:**
```javascript
// El puerto de produccion y desarrollo local es 4002
const PORT = process.env.PORT || 4002;
```

---

### Mejora #2: Reemplazar console.log con Logger
**Archivos:** Múltiples
**Código actual:**
```javascript
console.log("Mensaje de debug");
console.error("Error:", error);
```

**Solución:**
Instalar winston:
```bash
npm install winston
```

Crear `helpers/logger.js`:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

Usar en controllers:
```javascript
import logger from '../helpers/logger.js';

// En lugar de:
console.log('Usuario creado:', usuario._id);

// Usar:
logger.info('Usuario creado', { userId: usuario._id });
```

---

## 🔒 Mejoras de Seguridad

### Seguridad #1: Configurar CORS Apropiadamente
**Archivo:** `index.js:23`
**Código actual:**
```javascript
app.use(cors());
```

**Solución:**
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:19000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

### Seguridad #2: Agregar Rate Limiting
**Instalación:**
```bash
npm install express-rate-limit
```

**Archivo:** `index.js`
**Agregar:**
```javascript
import rateLimit from 'express-rate-limit';

// Rate limiter para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: 'Demasiados intentos de login, por favor intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar a rutas de autenticación
app.use('/api/usuarios/login', authLimiter);
app.use('/api/usuarios/autenticar', authLimiter);
```

---

### Seguridad #3: Validación de Input con express-validator
**Instalación:**
```bash
npm install express-validator
```

**Ejemplo:** `routes/usuarioRoutes.js`
```javascript
import { body, validationResult } from 'express-validator';

// Middleware de validación
const validateRegistro = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('nombre').trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post("/", validateRegistro, registrar);
```

---

## 📝 Checklist de Correcciones

- [ ] Bug #1: Eliminar import no utilizado
- [ ] Bug #2: Actualizar opciones de Mongoose
- [ ] Bug #3: Agregar try-catch a JSON.parse (3 lugares)
- [ ] Bug #4: Corregir sendPushNotification
- [ ] Bug #5: Cambiar status code de 500 a 200
- [ ] Bug #6: Eliminar next() inalcanzable
- [ ] Bug #7: Unificar variable de entorno RevenueCat
- [ ] Bug #8: Validar usuario no null en checkAuth
- [ ] Bug #9: Convertir ObjectId en aggregates
- [ ] Mejora #1: Actualizar comentario de puerto
- [ ] Mejora #2: Implementar winston logger
- [ ] Seguridad #1: Configurar CORS
- [ ] Seguridad #2: Agregar rate limiting
- [ ] Seguridad #3: Implementar validación de input
- [ ] Ejecutar `npm audit fix` para resolver vulnerabilidades
- [ ] Actualizar tests que fallan
- [ ] Generar cobertura de tests: `npm run test:coverage`

---

**Total de Correcciones:** 9 bugs + 5 mejoras = 14 items
**Tiempo Estimado:** 2-4 horas
**Prioridad:** Alta para bugs críticos, Media para mejoras

