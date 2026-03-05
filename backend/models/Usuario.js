import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { type } from "os";

const usuarioSchema = mongoose.Schema(
	{
		nombre: {
			type: String,
			trim: true,
		},
		apellido: {
			type: String,
			trim: true,
		},
		password: {
			type: String,
			trim: true,
		},
		picture: {
			type: String,
		},
		email: {
			type: String,
			trim: true,
			unique: true,
		},
		token: {
			type: String,
		},
		role: {
			type: String,
			default: "user",
		},
		sub: {
			type: String,
		},

		provider: {
			type: String,
			default: "local",
		},
		providerId: {
			type: String,
		},
		lastLogin: {
			type: Date,
		},
		tokenNotification: {
			type: String,
		},
		allowNotifications: {
			type: Boolean,
			default: false,
		},
		lengua: {
			type: String,
			default: "en",
		},
		// Nuevo campo para almacenar la data de RevenueCat
		subscriptionData: {
			type: mongoose.Schema.Types.Mixed,
			default: {}, // Lo inicializamos como un objeto vacío
		},
		isInvitado: {
			type: Boolean,
			default: false,
		},
		// Campos para el perfil extendido
		displayName: {
			type: String,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		location: {
			type: String,
			trim: true,
		},
		bio: {
			type: String,
			trim: true,
		},
		profileImage: {
			type: String,
		},
		// Configuraciones del usuario
		settings: {
			type: mongoose.Schema.Types.Mixed,
			default: {
				notifications: true,
				autoBackup: false,
				darkMode: false,
				biometrics: false,
				analytics: true,
				crashReporting: true,
				language: 'es'
			}
		},
	},
	{
		timestamps: true,
	}
);

// Antes de guardar, se hashea la contraseña (si ha sido modificada)
usuarioSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	const salt = await bcryptjs.genSalt(10);
	this.password = await bcryptjs.hash(this.password, salt);
});

usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
	return await bcryptjs.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
