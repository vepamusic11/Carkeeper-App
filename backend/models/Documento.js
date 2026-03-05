import mongoose from "mongoose";

const documentoSchema = mongoose.Schema(
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
				"registro",
				"seguro",
				"vtv",
				"patente",
				"licencia_conducir",
				"poliza_seguro",
				"comprobante_pago",
				"manual_usuario",
				"garantia",
				"factura_compra",
				"revision_tecnica",
				"multa",
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
		issueDate: {
			type: Date,
		},
		expirationDate: {
			type: Date,
		},
		documentNumber: {
			type: String,
			trim: true,
		},
		issuer: {
			type: String,
			trim: true,
		},
		fileUrl: {
			type: String, // URL del archivo en storage
		},
		fileName: {
			type: String,
			trim: true,
		},
		fileSize: {
			type: Number,
		},
		fileType: {
			type: String,
			trim: true,
		},
		isExpired: {
			type: Boolean,
			default: false,
		},
		reminderSent: {
			type: Boolean,
			default: false,
		},
		tags: [{
			type: String,
			trim: true,
		}],
		notas: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

// Middleware para actualizar isExpired
documentoSchema.pre('save', function(next) {
	if (this.expirationDate) {
		this.isExpired = new Date() > this.expirationDate;
	}
	next();
});

// Índices para optimizar consultas
documentoSchema.index({ userId: 1, expirationDate: 1 });
documentoSchema.index({ vehicleId: 1, type: 1 });
documentoSchema.index({ userId: 1, type: 1 });
documentoSchema.index({ expirationDate: 1, isExpired: 1 }); // Para recordatorios

const Documento = mongoose.model("Documento", documentoSchema);

export default Documento;