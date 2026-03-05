import mongoose from "mongoose";

const mantenimientoSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Usuario",
		},
		vehicleId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Vehiculo",
		},
		type: {
			type: String,
			enum: [
				"cambio_aceite",
				"cambio_filtros",
				"alineacion",
				"balanceado",
				"frenos",
				"neumaticos",
				"bateria",
				"transmision",
				"suspension",
				"aire_acondicionado",
				"sistema_electrico",
				"revision_general",
				"otro"
			],
		},
		title: {
			type: String,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		date: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["pending", "in_progress", "completed", "cancelled"],
			default: "pending",
		},
		cost: {
			type: Number,
			min: 0,
		},
		currency: {
			type: String,
			default: "USD",
			trim: true,
		},
		kilometraje: {
			type: Number,
			min: 0,
		},
		nextMaintenanceKm: {
			type: Number,
			min: 0,
		},
		nextMaintenanceDate: {
			type: Date,
		},
		location: {
			type: String,
			trim: true,
		},
		provider: {
			type: String,
			trim: true,
		},
		receipt: {
			type: String, // URL del recibo/factura
		},
		notas: {
			type: String,
			trim: true,
		},
		completedAt: {
			type: Date,
		},
		reminderSent: {
			type: Boolean,
			default: false,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "urgent"],
			default: "medium",
		},
	},
	{
		timestamps: true,
	}
);

// Índices para optimizar consultas
mantenimientoSchema.index({ userId: 1, date: -1 });
mantenimientoSchema.index({ vehicleId: 1, date: -1 });
mantenimientoSchema.index({ userId: 1, status: 1 });
mantenimientoSchema.index({ date: 1, status: 1 }); // Para recordatorios

const Mantenimiento = mongoose.model("Mantenimiento", mantenimientoSchema);

export default Mantenimiento;