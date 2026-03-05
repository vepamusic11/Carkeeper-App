import { z } from "zod";

// Helper: convierte empty string a undefined para campos opcionales numéricos
const optionalNumber = (schema) =>
	z.preprocess((val) => (val === "" || val === null ? undefined : val), schema.optional());

// === AUTH SCHEMAS ===

export const registerSchema = z.object({
	nombre: z.string().min(1).max(100).trim(),
	apellido: z.string().max(100).trim().optional(),
	email: z.string().email().max(255).trim().toLowerCase(),
	password: z.string().min(6).max(128),
	lengua: z.string().max(5).optional(),
	subscriptionData: z.any().optional(),
}).passthrough();

export const loginSchema = z.object({
	email: z.string().email().max(255).trim(),
	password: z.string().min(1).max(128),
});

export const loginGoogleSchema = z.object({
	email: z.string().email().max(255).trim(),
	sub: z.string().optional(),
	nombre: z.string().max(100).trim().optional(),
	apellido: z.string().max(100).trim().optional(),
	picture: z.string().optional(),
	subscriptionData: z.any().optional(),
	lengua: z.string().max(5).optional(),
}).passthrough();

export const registerGoogleSchema = z.object({
	email: z.string().email().max(255).trim(),
	nombre: z.string().max(100).trim().optional(),
	apellido: z.string().max(100).trim().optional(),
	picture: z.string().optional(),
	subscriptionData: z.any().optional(),
	lengua: z.string().max(5).optional(),
}).passthrough();

export const appleAuthSchema = z.object({
	identityToken: z.string().min(1),
	providerId: z.string().min(1),
	subscriptionData: z.any().optional(),
	lengua: z.string().max(5).optional(),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email().max(255).trim(),
});

export const newPasswordSchema = z.object({
	password: z.string().min(6).max(128),
});

// === PROFILE SCHEMAS ===

export const editProfileSchema = z.object({
	displayName: z.string().max(100).trim().optional(),
	phone: z.string().max(20).trim().optional(),
	location: z.string().max(200).trim().optional(),
	bio: z.string().max(500).trim().optional(),
	profileImage: z.string().max(500).optional(),
});

export const updateSettingsSchema = z.object({
	settings: z.object({
		notifications: z.boolean().optional(),
		darkMode: z.boolean().optional(),
		biometrics: z.boolean().optional(),
		language: z.string().max(5).optional(),
	}).passthrough(),
});

export const notificationTokenSchema = z.object({
	tokenNotification: z.string().min(1).max(500),
});

// === VEHICLE SCHEMAS ===

export const createVehicleSchema = z.object({
	marca: z.string().max(100).trim().optional(),
	modelo: z.string().max(100).trim().optional(),
	ano: optionalNumber(z.coerce.number().int().min(1900).max(2100)),
	patente: z.string().max(20).trim().optional(),
	color: z.string().max(50).trim().optional(),
	kilometraje: optionalNumber(z.coerce.number().min(0)),
	vin: z.string().max(50).trim().optional(),
	motor: z.string().max(100).trim().optional(),
	combustible: z.enum(["gasolina", "diesel", "electrico", "hibrido", "gas"]).optional(),
	transmision: z.enum(["manual", "automatica"]).optional(),
	notas: z.string().max(1000).trim().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

// === EXPENSE SCHEMAS ===

export const createExpenseSchema = z.object({
	vehicleId: z.string().min(1),
	amount: optionalNumber(z.coerce.number().min(0)),
	category: z.enum([
		"combustible", "mantenimiento", "maintenance", "seguro", "registro",
		"multas", "peajes", "estacionamiento", "lavado", "accesorios",
		"reparacion", "otro"
	]).optional(),
	description: z.string().max(500).trim().optional(),
	date: z.string().optional(),
	kilometraje: optionalNumber(z.coerce.number().min(0)),
	location: z.string().max(200).trim().optional(),
	notas: z.string().max(1000).trim().optional(),
	currency: z.string().max(10).trim().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// === MAINTENANCE SCHEMAS ===

export const createMaintenanceSchema = z.object({
	vehicleId: z.string().min(1),
	type: z.enum([
		"cambio_aceite", "cambio_filtros", "alineacion", "balanceado",
		"frenos", "neumaticos", "bateria", "transmision", "suspension",
		"aire_acondicionado", "sistema_electrico", "revision_general", "otro"
	]).optional(),
	title: z.string().max(200).trim().optional(),
	description: z.string().max(1000).trim().optional(),
	date: z.string().optional(),
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
	cost: optionalNumber(z.coerce.number().min(0)),
	currency: z.string().max(10).trim().optional(),
	kilometraje: optionalNumber(z.coerce.number().min(0)),
	nextMaintenanceKm: optionalNumber(z.coerce.number().min(0)),
	nextMaintenanceDate: z.string().optional(),
	location: z.string().max(200).trim().optional(),
	provider: z.string().max(200).trim().optional(),
	notas: z.string().max(1000).trim().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const completeMaintenanceSchema = z.object({
	cost: optionalNumber(z.coerce.number().min(0)),
	notas: z.string().max(1000).trim().optional(),
	receipt: z.string().optional(),
});

// === DOCUMENT SCHEMAS ===

export const createDocumentSchema = z.object({
	vehicleId: z.string().min(1),
	type: z.enum([
		"registro", "seguro", "vtv", "patente", "licencia_conducir",
		"poliza_seguro", "comprobante_pago", "manual_usuario", "garantia",
		"factura_compra", "revision_tecnica", "multa", "otro"
	]).optional(),
	title: z.string().max(200).trim().optional(),
	description: z.string().max(1000).trim().optional(),
	issueDate: z.string().optional(),
	expirationDate: z.string().optional(),
	documentNumber: z.string().max(100).trim().optional(),
	issuer: z.string().max(200).trim().optional(),
	tags: z.array(z.string().max(50).trim()).max(20).optional(),
	notas: z.string().max(1000).trim().optional(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

// === VEHICLE SHARING SCHEMAS ===

export const inviteUserSchema = z.object({
	vehicleId: z.string().min(1),
	email: z.string().email().max(255).trim().toLowerCase(),
	role: z.enum(["viewer", "editor", "admin"]).optional(),
	message: z.string().max(500).trim().optional(),
	permissions: z.object({
		canEditExpenses: z.boolean().optional(),
		canEditMaintenance: z.boolean().optional(),
		canUploadDocuments: z.boolean().optional(),
		canEditVehicle: z.boolean().optional(),
	}).optional(),
});

export const respondInvitationSchema = z.object({
	action: z.enum(["accept", "decline"]),
});

// === RECURRING EXPENSE SCHEMAS ===

export const createRecurringExpenseSchema = z.object({
	vehicleId: z.string().min(1),
	category: z.enum([
		"combustible", "mantenimiento", "maintenance", "seguro", "registro",
		"multas", "peajes", "estacionamiento", "lavado", "accesorios",
		"reparacion", "otro"
	]),
	description: z.string().max(500).trim().optional(),
	amount: z.coerce.number().min(0),
	frequency: z.enum(["weekly", "monthly", "bimonthly", "quarterly", "semiannual", "annual"]),
	nextDueDate: z.string().min(1),
	notes: z.string().max(1000).trim().optional(),
	currency: z.string().max(10).trim().optional(),
});

export const updateRecurringExpenseSchema = createRecurringExpenseSchema.partial();

// === FEEDBACK SCHEMAS ===

export const createFeedbackSchema = z.object({
	type: z.enum(["suggestion", "bug", "feature", "other"]),
	message: z.string().min(1).max(2000).trim(),
	rating: z.coerce.number().int().min(1).max(5).optional(),
});
