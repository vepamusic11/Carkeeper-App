import express from "express";

const router = express.Router();

import {
	registrar,
	autenticar,
	olvidePassword,
	comprobarToken,
	nuevoPassword,
	crearPassword,
	comprobarUsuario,
	verificarAuth,
	registrarGoogle,
	autenticarGoogle,
	editProfile,
	getUserStats,
	updateUserSettings,
	allowNotifications,
	activarDesactivarNotification,
	consultarSuscripcionRevenueCat,
	eliminarUsuario,
	appleAuth,
	saveNotificationToken,
	activateProAccount,
	debugSubscription,
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";
import {
	loginSchema,
	loginGoogleSchema,
	registerSchema,
	registerGoogleSchema,
	appleAuthSchema,
	forgotPasswordSchema,
	newPasswordSchema,
	editProfileSchema,
	updateSettingsSchema,
	notificationTokenSchema,
} from "../validators/schemas.js";

// Auth routes (rate limited + validated)
router.post("/login", authLimiter, validate(loginSchema), autenticar);
router.post("/login-google", authLimiter, validate(loginGoogleSchema), autenticarGoogle);
router.route("/crear-password/:token").get(comprobarToken).post(validate(newPasswordSchema), crearPassword);
router.post("/olvide-password", authLimiter, validate(forgotPasswordSchema), olvidePassword);
router.route("/olvide-password/:token").get(comprobarToken).post(validate(newPasswordSchema), nuevoPassword);
router.post("/comprobar", checkAuth, verificarAuth);
router.post("/registrar", authLimiter, validate(registerSchema), registrar);
router.post("/registrar-google", authLimiter, validate(registerGoogleSchema), registrarGoogle);
router.post("/apple-auth", authLimiter, validate(appleAuthSchema), appleAuth);

// Perfil y configuraciones
router.put("/perfil", checkAuth, validate(editProfileSchema), editProfile);
router.get("/estadisticas", checkAuth, getUserStats);
router.put("/configuraciones", checkAuth, validate(updateSettingsSchema), updateUserSettings);

// Rutas legacy (mantener compatibilidad)
router.post("/editar-usuario/:id", checkAuth, validate(editProfileSchema), editProfile);

// Notificaciones
router.post("/allow-notifications", checkAuth, allowNotifications);
router.post("/notification-token", checkAuth, validate(notificationTokenSchema), saveNotificationToken);
router.post(
	"/active-desactive-notifications/:id",
	checkAuth,
	activarDesactivarNotification
);


router.post(
	"/consultar-suscripcion-revenuecat/:id",
	checkAuth,
	consultarSuscripcionRevenueCat
);

router.post("/eliminar-usuario/:id", checkAuth, eliminarUsuario);

// Easter Egg - Activar cuenta PRO
router.post("/activate-pro/:id", checkAuth, activateProAccount);

// Debug - Verificar suscripción
router.get("/debug-subscription", checkAuth, debugSubscription);

export default router;
