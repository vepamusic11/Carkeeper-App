import mongoose from "mongoose";

const vehiculoSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Usuario",
		},
		marca: {
			type: String,
			trim: true,
		},
		modelo: {
			type: String,
			trim: true,
		},
		ano: {
			type: Number,
		},
		patente: {
			type: String,
			trim: true,
		},
		color: {
			type: String,
			trim: true,
		},
		kilometraje: {
			type: Number,
			default: 0,
		},
		vin: {
			type: String,
			trim: true,
		},
		motor: {
			type: String,
			trim: true,
		},
		combustible: {
			type: String,
			enum: ["gasolina", "diesel", "electrico", "hibrido", "gas"],
			default: "gasolina",
		},
		transmision: {
			type: String,
			enum: ["manual", "automatica"],
			default: "manual",
		},
		imageUrl: {
			type: String,
		},
		notas: {
			type: String,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		// Sistema de usuarios compartidos
		sharedWith: [{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Usuario",
				required: true
			},
			role: {
				type: String,
				enum: ["viewer", "editor", "admin"],
				default: "viewer"
			},
			invitedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Usuario",
				required: true
			},
			invitedAt: {
				type: Date,
				default: Date.now
			},
			acceptedAt: {
				type: Date
			},
			status: {
				type: String,
				enum: ["pending", "accepted", "declined"],
				default: "pending"
			},
			permissions: {
				canEditExpenses: {
					type: Boolean,
					default: true
				},
				canEditMaintenance: {
					type: Boolean,
					default: true
				},
				canUploadDocuments: {
					type: Boolean,
					default: false
				},
				canEditVehicle: {
					type: Boolean,
					default: false
				}
			}
		}],
		// Configuración de compartir
		sharingSettings: {
			allowExpenseEditing: {
				type: Boolean,
				default: true
			},
			allowMaintenanceEditing: {
				type: Boolean,
				default: true
			},
			allowDocumentUploads: {
				type: Boolean,
				default: false
			},
			allowVehicleEditing: {
				type: Boolean,
				default: false
			}
		},
	},
	{
		timestamps: true,
	}
);

// Índices para optimizar consultas
vehiculoSchema.index({ userId: 1, isActive: 1 });
vehiculoSchema.index({ 'sharedWith.userId': 1, 'sharedWith.status': 1 });

const Vehiculo = mongoose.model("Vehiculo", vehiculoSchema);

export default Vehiculo;