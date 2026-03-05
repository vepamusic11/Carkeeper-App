import mongoose from "mongoose";

const vehicleInvitationSchema = mongoose.Schema(
	{
		// Usuario que envía la invitación (debe ser Pro)
		invitedBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Usuario",
		},
		// Usuario que recibe la invitación (opcional - pueden invitarse usuarios no registrados)
		invitedUser: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: "Usuario",
		},
		// Email del usuario invitado (por si no está registrado)
		invitedEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		// Vehículo compartido
		vehicleId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Vehiculo",
		},
		// Rol asignado al usuario invitado
		role: {
			type: String,
			enum: ["viewer", "editor", "admin"],
			default: "viewer",
		},
		// Estado de la invitación
		status: {
			type: String,
			enum: ["pending", "accepted", "declined", "expired"],
			default: "pending",
		},
		// Mensaje personalizado de la invitación
		message: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		// Token único para la invitación
		invitationToken: {
			type: String,
			required: true,
			unique: true,
		},
		// Fecha de expiración (7 días)
		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
		},
		// Fecha de aceptación
		acceptedAt: {
			type: Date,
		},
		// Fecha de respuesta (aceptación o rechazo)
		respondedAt: {
			type: Date,
		},
		// Configuración de permisos
		permissions: {
			canEditExpenses: {
				type: Boolean,
				default: true,
			},
			canEditMaintenance: {
				type: Boolean,
				default: true,
			},
			canUploadDocuments: {
				type: Boolean,
				default: false,
			},
			canEditVehicle: {
				type: Boolean,
				default: false,
			},
		},
	},
	{
		timestamps: true,
	}
);

// Índices para optimizar consultas
vehicleInvitationSchema.index({ invitedEmail: 1, status: 1 });
vehicleInvitationSchema.index({ invitedBy: 1, status: 1 });
vehicleInvitationSchema.index({ vehicleId: 1, status: 1 });
vehicleInvitationSchema.index({ invitationToken: 1 }, { unique: true });
vehicleInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método para verificar si la invitación ha expirado
vehicleInvitationSchema.methods.isExpired = function() {
	return this.expiresAt < new Date();
};

// Método para aceptar la invitación
vehicleInvitationSchema.methods.accept = function() {
	this.status = 'accepted';
	this.acceptedAt = new Date();
	this.respondedAt = new Date();
	return this.save();
};

// Método para rechazar la invitación
vehicleInvitationSchema.methods.decline = function() {
	this.status = 'declined';
	this.respondedAt = new Date();
	return this.save();
};

const VehicleInvitation = mongoose.model("VehicleInvitation", vehicleInvitationSchema);

export default VehicleInvitation;