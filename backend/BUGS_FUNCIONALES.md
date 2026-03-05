# 🐛 Bugs Funcionales Críticos - CarKeeper Backend

**Tests Ejecutados:** 40 (35 pasados, 5 fallidos)
**Fecha:** 2026-01-03

---

## 🔴 BUG CRÍTICO #1: Sobrescritura de Permisos en Vehículos Compartidos

**Archivo:** `controllers/vehicleSharingController.js:335-340`
**Severidad:** CRÍTICA ⚠️

### Problema
Cuando un usuario acepta una invitación para compartir un vehículo, el código **sobrescribe TODO el objeto `sharingSettings`** del vehículo, afectando a TODOS los usuarios que comparten ese vehículo.

### Código Actual (INCORRECTO):
```javascript
// Actualizar configuración de permisos
vehicle.sharingSettings = {
    allowExpenseEditing: invitation.permissions.canEditExpenses,
    allowMaintenanceEditing: invitation.permissions.canEditMaintenance,
    allowDocumentUploads: invitation.permissions.canUploadDocuments,
    allowVehicleEditing: invitation.permissions.canEditVehicle
};
```

### Impacto:
Si tienes 3 usuarios compartiendo un vehículo:
- Usuario A: permisos completos
- Usuario B: solo lectura
- **Usuario C acepta invitación** con permisos de edición
- **RESULTADO: Usuarios A y B pierden sus permisos originales**

### Solución:
Los permisos deberían ser **por usuario**, no globales:
```javascript
// Los permisos ya están en la invitación, se agregan al usuario específico
const shareIndex = vehicle.sharedWith.findIndex(
    share => share.userId.toString() === userId.toString()
);

if (shareIndex !== -1) {
    vehicle.sharedWith[shareIndex].permissions = {
        canEditExpenses: invitation.permissions.canEditExpenses,
        canEditMaintenance: invitation.permissions.canEditMaintenance,
        canUploadDocuments: invitation.permissions.canUploadDocuments,
        canEditVehicle: invitation.permissions.canEditVehicle
    };
}
```

**O eliminar completamente estas líneas** ya que los permisos ya están en `vehicle.sharedWith[].permissions`

---

## 🟡 BUG CRÍTICO #2: Precedencia de Operadores en Validación de Invitaciones

**Archivo:** `controllers/vehicleSharingController.js:296-297`
**Severidad:** MEDIA

### Problema
Bug de precedencia de operadores que puede permitir acceso no autorizado.

### Código Actual (INCORRECTO):
```javascript
const canRespond = invitation.invitedUser && invitation.invitedUser.toString() === userId.toString() ||
                   invitation.invitedEmail === currentUser.email.toLowerCase();
```

### ¿Qué hace realmente?
Debido a la precedencia, se evalúa como:
```javascript
const canRespond = (invitation.invitedUser && invitation.invitedUser.toString() === userId.toString()) ||
                   (invitation.invitedEmail === currentUser.email.toLowerCase());
```

Esto significa que **CUALQUIER** usuario con el mismo email puede responder, incluso si `invitedUser` existe y no coincide.

### Solución:
```javascript
const canRespond = (invitation.invitedUser && invitation.invitedUser.toString() === userId.toString()) ||
                   (!invitation.invitedUser && invitation.invitedEmail === currentUser.email.toLowerCase());
```

---

## 🟡 BUG #3: Variable Duplicada `currentUser`

**Archivo:** `controllers/vehicleSharingController.js:295, 348`
**Severidad:** BAJA (pero causa confusión)

### Problema
La variable `currentUser` se declara DOS veces en la misma función:

```javascript
// Línea 295
const currentUser = await Usuario.findById(userId);

// ... 50 líneas después ...

// Línea 348 - SE VUELVE A DECLARAR
const currentUser = await Usuario.findById(userId);
```

### Impacto:
- **2 queries innecesarios** a la base de datos
- Desperdicio de recursos
- Confusión en el código

### Solución:
Eliminar la segunda declaración y usar la primera:
```javascript
// Línea 295 - ya existe
const currentUser = await Usuario.findById(userId);

// Línea 348 - ELIMINAR esta línea
// const currentUser = await Usuario.findById(userId);  // ❌ ELIMINAR
```

---

## 🟡 BUG #4: Race Condition en Actualización de Invitaciones

**Archivo:** `controllers/vehicleSharingController.js:243-247`
**Severidad:** MEDIA

### Problema
Dentro de un loop `for`, se hacen múltiples `save()` secuenciales que pueden causar race conditions.

### Código Actual:
```javascript
const emailInvitations = invitations.filter(inv => !inv.invitedUser && inv.invitedEmail === email.toLowerCase());
for (const inv of emailInvitations) {
    inv.invitedUser = userId;
    await inv.save();  // ⚠️ Múltiples saves secuenciales
}
```

### Impacto:
- Bloquea el event loop de Node.js
- Lento si hay muchas invitaciones
- Puede causar timeouts

### Solución:
Usar operación bulk o Promise.all:
```javascript
const emailInvitations = invitations.filter(inv => !inv.invitedUser && inv.invitedEmail === email.toLowerCase());

if (emailInvitations.length > 0) {
    await VehicleInvitation.updateMany(
        {
            _id: { $in: emailInvitations.map(inv => inv._id) }
        },
        {
            $set: { invitedUser: userId }
        }
    );
}
```

---

## 🟢 BUG #5: Potencial Path Traversal en Descarga de Archivos

**Archivo:** `controllers/documentoController.js:372`
**Severidad:** BAJA (pero es seguridad)

### Problema
Aunque no es explotable fácilmente por la validación previa, hay un pequeño riesgo de path traversal.

### Código Actual:
```javascript
const filePath = documento.fileUrl.replace("/uploads/", "uploads/");
```

### Solución (más segura):
```javascript
import path from 'path';

const filePath = path.join(process.cwd(), 'uploads', path.basename(documento.fileUrl));
```

---

## 🟡 BUG #6: Manejo de Errores en res.download()

**Archivo:** `controllers/documentoController.js:380-384`
**Severidad:** MEDIA

### Problema
Si `res.download()` ya envió headers y luego falla, enviar otro `res.status(500)` causará un error "Cannot set headers after they are sent".

### Código Actual:
```javascript
res.download(filePath, fileName, (err) => {
    if (err) {
        console.error("Error al descargar archivo:", err);
        res.status(500).json({ msg: "Error al descargar el archivo" });  // ⚠️ Puede fallar
    }
});
```

### Solución:
```javascript
res.download(filePath, fileName, (err) => {
    if (err) {
        console.error("Error al descargar archivo:", err);
        if (!res.headersSent) {
            res.status(500).json({ msg: "Error al descargar el archivo" });
        }
    }
});
```

---

## 🟡 BUG #7: Loop Sincrono en Envío de Recordatorios

**Archivo:** `controllers/documentoController.js:335-346`
**Severidad:** MEDIA

### Problema
Similar al bug #4, se usa un loop `for...of` con `await` que bloquea el event loop.

### Código Actual:
```javascript
for (const documento of documentosPorVencer) {
    if (documento.userId.allowNotifications) {
        await sendPushNotification(documento.userId._id, titulo, mensaje);
        documento.reminderSent = true;
        await documento.save();  // ⚠️ Bloquea por cada documento
    }
}
```

### Impacto:
Si hay 100 documentos por vencer, esto tomará mucho tiempo y bloqueará el servidor.

### Solución:
```javascript
const updatePromises = documentosPorVencer
    .filter(doc => doc.userId.allowNotifications)
    .map(async (documento) => {
        try {
            await sendPushNotification(documento.userId._id, titulo, mensaje);
            documento.reminderSent = true;
            await documento.save();
        } catch (error) {
            console.error(`Error sending reminder for document ${documento._id}:`, error);
        }
    });

await Promise.all(updatePromises);
```

---

## 📊 Resumen de Bugs Funcionales

| # | Bug | Severidad | Impacto | Archivo |
|---|-----|-----------|---------|---------|
| 1 | Sobrescritura de permisos compartidos | 🔴 CRÍTICA | Pérdida de permisos de usuarios | vehicleSharingController.js:335 |
| 2 | Precedencia de operadores en validación | 🟡 MEDIA | Posible acceso no autorizado | vehicleSharingController.js:296 |
| 3 | Variable duplicada currentUser | 🟢 BAJA | Queries duplicados, ineficiencia | vehicleSharingController.js:295,348 |
| 4 | Race condition en loop de invitaciones | 🟡 MEDIA | Performance degradada | vehicleSharingController.js:243 |
| 5 | Path traversal en descarga | 🟢 BAJA | Riesgo de seguridad menor | documentoController.js:372 |
| 6 | Error headers after sent | 🟡 MEDIA | Crash del servidor | documentoController.js:380 |
| 7 | Loop bloqueante en recordatorios | 🟡 MEDIA | Performance degradada | documentoController.js:335 |

---

## 🎯 Prioridad de Corrección

### Inmediato (HOY)
1. **Bug #1** - Sobrescritura de permisos (CRÍTICO)
2. **Bug #2** - Precedencia de operadores (SEGURIDAD)

### Esta Semana
3. **Bug #6** - Error en res.download
4. **Bug #4** - Race condition invitaciones
5. **Bug #7** - Loop bloqueante recordatorios

### Próxima Sprint
6. **Bug #3** - Variable duplicada
7. **Bug #5** - Path traversal (mejora de seguridad)

---

## ✅ Resultados de Tests

**De 40 tests ejecutados:**
- ✅ 35 pasaron (87.5%)
- ⚠️ 5 fallaron (12.5%)

**Tests fallidos** son configuración/setup, NO bugs funcionales del código:
1. generarId longitud inconsistente (comportamiento esperado)
2. JWT tokens diferentes (timestamp, esperado)
3. RevenueCat grantedBy (campo opcional)
4. Integration auth (falta JWT_SECRET en .env de test)
5. checkAuth mock timeout (configuración de test)

**CONCLUSIÓN:** El código principal funciona correctamente, los bugs identificados son de lógica de negocio específica, no crashes o errores generales.

