import mongoose from "mongoose";

const gastoSchema = mongoose.Schema(
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
		amount: {
			type: Number,
			min: 0,
		},
		category: {
			type: String,
			enum: [
				"combustible",
				"mantenimiento",
				"maintenance", // Para compatibilidad con gastos creados desde mantenimientos
				"seguro",
				"registro",
				"multas",
				"peajes",
				"estacionamiento",
				"lavado",
				"accesorios",
				"reparacion",
				"otro"
			],
		},
		description: {
			type: String,
			trim: true,
		},
		date: {
			type: Date,
		},
		kilometraje: {
			type: Number,
			min: 0,
		},
		location: {
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
		currency: {
			type: String,
			default: "USD",
			trim: true,
		},
		maintenanceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Mantenimiento",
			default: null
		},
	},
	{
		timestamps: true,
	}
);

// Índices para optimizar consultas
gastoSchema.index({ userId: 1, date: -1 });
gastoSchema.index({ vehicleId: 1, date: -1 });
gastoSchema.index({ userId: 1, category: 1 });
gastoSchema.index({ userId: 1, vehicleId: 1, date: -1 });

const Gasto = mongoose.model("Gasto", gastoSchema);

export default Gasto;