import rateLimit from "express-rate-limit";

// Rate limiter estricto para auth (login, register, password reset)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 10, // 10 intentos por ventana
	message: {
		success: false,
		error: "Demasiados intentos. Intenta de nuevo en 15 minutos.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiter general para API
export const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minuto
	max: 100, // 100 requests por minuto
	message: {
		success: false,
		error: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiter para uploads (más restrictivo)
export const uploadLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minuto
	max: 20, // 20 uploads por minuto
	message: {
		success: false,
		error: "Demasiados archivos subidos. Intenta de nuevo en un momento.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
