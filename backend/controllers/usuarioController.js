import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import { generarJWT } from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";
import { Expo } from "expo-server-sdk";
import { getRevenueCatSubscriberInfo, getUserSubscriptionStatus } from "../helpers/revenueCatService.js";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Crea una instancia del SDK de Expo
const expo = new Expo();

// Obtener un usuario por ID
const obtenerUsuario = async (req, res) => {
	try {
		const { id } = req.params;
		const usuario = await Usuario.findById(id);
		if (!usuario) {
			return res.status(404).json({ msg: "Usuario no encontrado" });
		}
		res.json(usuario);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

// Verificar que un usuario no exista (para registro)
const comprobarUsuario = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ msg: "Email es requerido" });
		}
		const existeUsuario = await Usuario.findOne({ email: email.toLowerCase() });
		if (existeUsuario) {
			return res.status(400).json({ msg: "Usuario ya registrado" });
		}
		res.json({ msg: "ok" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

// Verificar estado de autenticación del usuario
const verificarAuth = async (req, res) => {
	try {
		const { usuario } = req; // El middleware checkAuth ya pone el usuario en req
		if (!usuario) {
			return res.status(401).json({ msg: "Usuario no autenticado" });
		}
		
		// Obtener información actualizada del usuario
		const usuarioCompleto = await Usuario.findById(usuario._id).select('-password');
		
		let isSubscribed = false;
		let revenueCatInfo = null;

		if (usuarioCompleto.subscriptionData) {
			try {
				const subData = typeof usuarioCompleto.subscriptionData === 'string' 
					? JSON.parse(usuarioCompleto.subscriptionData) 
					: usuarioCompleto.subscriptionData;
				
				if (subData && subData.originalAppUserId) {
					const appUserId = subData.originalAppUserId;
					revenueCatInfo = await getRevenueCatSubscriberInfo(appUserId);
					if (revenueCatInfo?.subscriber?.activeSubscriptions?.length > 0) {
						isSubscribed = true;
					}
				}
			} catch (error) {
				console.error("Error consultando RevenueCat:", error);
			}
		}

		// Si el usuario es invitado, forzamos que tenga suscripción activa
		if (usuarioCompleto.isInvitado) {
			isSubscribed = true;
		}

		res.json({
			...usuarioCompleto.toObject(),
			authenticated: true,
			hasActiveSubscription: isSubscribed,
			revenueCatInfo
		});
	} catch (error) {
		console.error("Error verificando autenticación:", error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};
const registrar = async (req, res) => {
	try {
		let { email, subscriptionData, lengua } = req.body; // extraemos subscriptionData
		email = email.toLowerCase();

		const existeUsuario = await Usuario.findOne({ email });
		if (existeUsuario) {
			return res
				.status(400)
				.json({ msg: "Usuario ya registrado" });
		}

		// Creamos el nuevo usuario con campos específicos (no spread de req.body)
		const usuario = new Usuario({
			nombre: req.body.nombre,
			apellido: req.body.apellido,
			email,
			password: req.body.password,
			lengua,
			subscriptionData: subscriptionData || {},
		});

		const usuarioAlmacenado = await usuario.save();
		// Generar JWT con el ID del usuario guardado
		usuarioAlmacenado.token = generarJWT(usuarioAlmacenado._id);
		await usuarioAlmacenado.save();

		// Enviar email de confirmación
		emailRegistro({
			email: usuario.email,
			nombre: usuario.nombre,
			lang: lengua,
		});

		res.json({
			...usuarioAlmacenado.toObject(),
			isNewUser: true,
		});
	} catch (error) {
		console.error("Error registrando usuario:", error.message);
		res.status(500).json({
			msg: "Error al registrar el usuario",
		});
	}
};

const registrarGoogle = async (req, res) => {
	try {
		let { email, subscriptionData, lengua } = req.body;
		email = email.toLowerCase().trim();

		const existeUsuario = await Usuario.findOne({ email });
		if (existeUsuario) {
			return res
				.status(400)
				.json({ msg: "Usuario ya registrado" });
		}

		const usuario = new Usuario({
			nombre: req.body.nombre || email.split("@")[0],
			apellido: req.body.apellido || "",
			email,
			provider: "google",
			providerId: req.body.sub || req.body.providerId,
			profileImage: req.body.picture || req.body.profileImage,
			lengua,
			confirmado: true,
			subscriptionData: subscriptionData || {},
		});

		const usuarioAlmacenado = await usuario.save();
		usuarioAlmacenado.token = generarJWT(usuarioAlmacenado._id);
		await usuarioAlmacenado.save();

		// Enviar email de confirmación
		try {
			emailRegistro({
				email: usuario.email,
				nombre: usuario.nombre,
				lang: lengua,
			});
		} catch (emailError) {
			console.error("Error enviando email de bienvenida:", emailError.message);
		}

		return res.json({
			...usuarioAlmacenado.toObject(),
			isNewUser: true,
		});
	} catch (error) {
		console.error("Error registrando con Google:", error.message);
		return res.status(500).json({
			msg: "Error al registrar el usuario",
		});
	}
};

const client = jwksClient({
	jwksUri: "https://appleid.apple.com/auth/keys",
});

function getAppleKey(header, callback) {
	client.getSigningKey(header.kid, function (err, key) {
		if (err) return callback(err);
		const signingKey = key.getPublicKey();
		callback(null, signingKey);
	});
}

const appleAuth = async (req, res) => {
	try {
		const { identityToken, providerId, subscriptionData, lengua } = req.body;
		if (!identityToken || !providerId) {
			return res.status(400).json({
				msg: "Faltan datos de autorización",
			});
		}

		// 1) Verificamos y decodificamos el JWT de Apple
		const decoded = await new Promise((resolve, reject) => {
			jwt.verify(
				identityToken,
				getAppleKey,
				{
					issuer: "https://appleid.apple.com",
					audience: ['com.deepyze.carkeeper', 'host.exp.Exponent'],
					algorithms: ["RS256"],
				},
				(err, payload) => {
					if (err) return reject(err);
					resolve(payload);
				}
			);
		});

		// payload.email siempre existe (aunque sea relayed), payload.email_verified indica si está verificado
		const email = (decoded.email || "").toLowerCase();
		// Solo la primera vez Apple envía nombre
		const givenName = decoded?.given_name || "";
		const familyName = decoded?.family_name || "";

		// 2) Buscamos usuario por providerId o email
		let usuario = await Usuario.findOne({
			$or: [
				{ providerId, provider: "apple" },
				{ email }
			]
		});

		let wasCreated = false; // Track if this is a new user registration

		if (!usuario) {
			// 3) Si no existe, registramos uno nuevo
			//   - Nombre: si no vino, tomamos la parte local del email
			const nombre = givenName || email.split("@")[0];
			const apellido = familyName || "";
			usuario = new Usuario({
				nombre,
				apellido,
				email,
				provider: "apple",
				providerId,
				subscriptionData: subscriptionData || {},
				lengua,
			});
			usuario.token = generarJWT(usuario._id);
			await usuario.save();
			wasCreated = true; // Mark that this is a new user

			// Enviar email de bienvenida
			try {
				await emailRegistro({
					email: usuario.email,
					nombre: usuario.nombre,
					lang: lengua || 'es',
				});
				console.log('Welcome email sent to:', usuario.email);
			} catch (emailError) {
				console.error('Error sending welcome email:', emailError);
			}
		} else {
			// Si el usuario existe pero no tiene Apple como provider, actualizamos
			if (!usuario.providerId || usuario.provider !== "apple") {
				usuario.provider = "apple";
				usuario.providerId = providerId;
				await usuario.save();
			}
		}

		// 4) Generamos nuevo JWT de sesión
		const token = generarJWT(usuario._id);
		usuario.token = token;
		await usuario.save();

		// Subscription status should be checked on the frontend via RevenueCat SDK
		// Backend only indicates if user is invited (has special access)
		const isSubscribed = usuario.isInvitado || false;

		return res.json({
			...usuario.toObject(),
			authenticated: true,
			hasActiveSubscription: isSubscribed,
			isNewUser: wasCreated, // Indicate if this was a new registration
		});
	} catch (error) {
		console.error("appleAuth error:", error.message);
		return res.status(500).json({
			msg: "Error autenticando con Apple",
		});
	}
};

// Registro mediante login social (Google, Apple, etc.)
const registrarSocial = async (req, res) => {
	try {
		// Se espera recibir en el body: email, provider (ej. "google", "apple"), providerId, nombre, apellido, etc.
		let { email, provider, providerId, nombre, apellido } = req.body;
		email = email.toLowerCase();

		// Buscamos si ya existe un usuario con ese email
		let usuario = await Usuario.findOne({ email });
		if (usuario) {
			// Si existe pero no tiene configurado el login social, lo actualizamos
			if (!usuario.provider || usuario.provider === "local") {
				usuario.provider = provider;
				usuario.providerId = providerId;
				usuario.confirmado = true; // Asumimos que el proveedor ya verificó el email
				await usuario.save();
			}
		} else {
			// Crear nuevo usuario con datos de social login
			usuario = new Usuario({
				email,
				nombre,
				apellido,
				provider,
				providerId,
				confirmado: true, // Marcar como confirmado por autenticación social
			});
			await usuario.save();
		}
		// Generamos JWT
		const token = generarJWT(usuario._id);
		res.json({
			_id: usuario._id,
			nombre: usuario.nombre,
			apellido: usuario.apellido,
			email: usuario.email,
			token,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error en el registro social" });
	}
};
const autenticar = async (req, res) => {
	try {
		const { email, password } = req.body;
		// Búsqueda case-insensitive segura (sin RegExp para evitar inyección)
		let usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

		if (!usuario) {
			// Intentar buscar por nombre de usuario
			usuario = await Usuario.findOne({ nombreUsuario: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
		}

		if (!usuario) {
			return res
				.status(404)
				.json({ msg: "El usuario no existe" });
		}

		if (usuario.provider !== "local" || !usuario.password) {
			return res.status(403).json({
				msg: "Este usuario se registró con Google, Apple u otro proveedor externo. Inicie sesión desde ese método.",
				code: "external_provider",
			});
		}

		const isMatch = await usuario.comprobarPassword(password);
		if (!isMatch) {
			return res
				.status(403)
				.json({ msg: "Password incorrecto" });
		}

		const token = generarJWT(usuario._id);
		usuario.token = token;
		const usuarioAutenticado = await usuario.save();

		// Subscription status should be checked on the frontend via RevenueCat SDK
		// Backend only indicates if user is invited (has special access)
		const isSubscribed = usuario.isInvitado || false;

		res.json({
			...usuarioAutenticado.toObject(),
			authenticated: true,
			hasActiveSubscription: isSubscribed,
			isNewUser: false, // This is a login, not a new registration
		});
	} catch (error) {
		console.error("Error en autenticación:", error.message);
		res
			.status(500)
			.json({ msg: "Error en la autenticación" });
	}
};

const autenticarGoogle = async (req, res) => {
	try {
		const { email, sub } = req.body;
		let usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

		if (!usuario) {
			return res
				.status(404)
				.json({ msg: "El usuario no existe" });
		}

		const token = generarJWT(usuario._id);
		usuario.token = token;
		const usuarioAutenticado = await usuario.save();

		// Subscription status should be checked on the frontend via RevenueCat SDK
		// Backend only indicates if user is invited (has special access)
		const isSubscribed = usuario.isInvitado || false;

		res.json({
			...usuarioAutenticado.toObject(),
			authenticated: true,
			hasActiveSubscription: isSubscribed,
			isNewUser: false, // This is a login, not a new registration
		});
	} catch (error) {
		console.error("Error en autenticación Google:", error.message);
		res
			.status(500)
			.json({ msg: "Error en la autenticación" });
	}
};

const consultarSuscripcionRevenueCat = async (req, res) => {
	const { id } = req.params;

	try {
		const usuario = await Usuario.findById(id);

		if (!usuario) {
			return res.status(404).json({ msg: "Usuario no encontrado" });
		}

		let isSubscribed = false;
		let revenueCatInfo = null;
		if (usuario.subscriptionData) {
			try {
				const subData = JSON.parse(usuario.subscriptionData);
				const appUserId = subData.originalAppUserId;
				revenueCatInfo = await getRevenueCatSubscriberInfo(appUserId);
				if (
					revenueCatInfo &&
					revenueCatInfo.subscriber &&
					revenueCatInfo.subscriber.activeSubscriptions &&
					revenueCatInfo.subscriber.activeSubscriptions.length > 0
				) {
					isSubscribed = true;
				}
			} catch (error) {
				console.error("Error consultando RevenueCat:", error);
			}
		}
		if (usuario.isInvitado) {
			isSubscribed = true;
		}
		res.json({
			...usuario.toObject(),
			authenticated: true,
			hasActiveSubscription: isSubscribed,
			revenueCatInfo,
		});
	} catch (error) {
		console.log(error);
	}
};

// Autenticación mediante login social
const autenticarSocial = async (req, res) => {
	try {
		// Se espera recibir: email, provider, providerId (y opcionalmente otros datos) en el body
		let { email, provider, providerId } = req.body;
		email = email.toLowerCase();

		// Buscar usuario que coincida con email y datos del proveedor
		const usuario = await Usuario.findOne({ email, provider, providerId });
		if (!usuario) {
			return res
				.status(404)
				.json({ msg: "Usuario no registrado con este proveedor" });
		}
		const token = generarJWT(usuario._id);
		res.json({
			_id: usuario._id,
			nombre: usuario.nombre,
			apellido: usuario.apellido,
			email: usuario.email,
			token,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error en la autenticación social" });
	}
};

// Confirmar cuenta mediante token
const confirmar = async (req, res) => {
	try {
		const { token } = req.params;
		const usuarioConfirmar = await Usuario.findOne({ token });
		if (!usuarioConfirmar) {
			return res.status(403).json({ msg: "Token no válido" });
		}
		usuarioConfirmar.confirmado = true;
		usuarioConfirmar.token = "";
		await usuarioConfirmar.save();
		res.json({ msg: "Usuario confirmado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al confirmar usuario" });
	}
};

// Olvidé contraseña
const olvidePassword = async (req, res) => {
	try {
		const { email } = req.body;
		const usuario = await Usuario.findOne({ email });
		if (!usuario) {
			return res.status(404).json({ msg: "El usuario no existe" });
		}
		if (usuario.isActivo === "no") {
			return res
				.status(404)
				.json({ msg: "Contacta a soporte para poder ingresar" });
		}
		usuario.token = generarId();
		await usuario.save();

		// Enviar email de recuperación de contraseña
		emailOlvidePassword({
			email: usuario.email,
			nombre: usuario.nombre,
			token: usuario.token,
		});
		res.json({ msg: "Hemos enviado un email con las instrucciones" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error en el proceso de recuperación" });
	}
};

// Comprobar token
const comprobarToken = async (req, res) => {
	try {
		const { token } = req.params;
		const tokenValido = await Usuario.findOne({ token });
		if (tokenValido) {
			res.json({ msg: "Token válido y el usuario existe" });
		} else {
			res.status(404).json({ msg: "Token no válido" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al comprobar el token" });
	}
};

// Nuevo password (usado en flujo de olvido de contraseña)
const nuevoPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;
		const usuario = await Usuario.findOne({ token });
		if (!usuario) {
			return res.status(404).json({ msg: "Token no válido" });
		}
		usuario.password = password;
		usuario.token = "";
		await usuario.save();
		res.json({ msg: "Password modificado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al actualizar password" });
	}
};

// Crear password (flujo de creación inicial)
const crearPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;
		const usuario = await Usuario.findOne({ token });
		if (!usuario) {
			return res.status(404).json({ msg: "Token no válido" });
		}
		usuario.password = password;
		usuario.token = "";
		usuario.confirmado = true;
		await usuario.save();
		res.json({ msg: "Password guardado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al crear password" });
	}
};

// Perfil del usuario autenticado (se asume que se protege con middleware de auth)
const perfil = async (req, res) => {
	try {
		const { usuario } = req; // Se asume que req.usuario se establece tras la verificación del JWT
		const user = await Usuario.findById(usuario._id).lean();
		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener perfil" });
	}
};

const editProfile = async (req, res) => {
	try {
		const { usuario } = req; // Viene del middleware checkAuth
		const { displayName, phone, location, bio, profileImage } = req.body;

		if (!usuario) {
			return res.status(401).json({ 
				success: false,
				error: "Usuario no autenticado" 
			});
		}

		// Buscar el usuario en la base de datos
		const usuarioAActualizar = await Usuario.findById(usuario._id);
		if (!usuarioAActualizar) {
			return res.status(404).json({ 
				success: false,
				error: "Usuario no encontrado" 
			});
		}

		// Actualizar solo los campos que se enviaron
		if (displayName !== undefined) usuarioAActualizar.displayName = displayName;
		if (phone !== undefined) usuarioAActualizar.phone = phone;
		if (location !== undefined) usuarioAActualizar.location = location;
		if (bio !== undefined) usuarioAActualizar.bio = bio;
		if (profileImage !== undefined) usuarioAActualizar.profileImage = profileImage;

		// Actualizar la fecha de última modificación
		usuarioAActualizar.updatedAt = new Date();

		const usuarioAlmacenado = await usuarioAActualizar.save();

		// Devolver el usuario actualizado sin datos sensibles
		const { password, token, ...usuarioLimpio } = usuarioAlmacenado.toObject();

		res.status(200).json({
			success: true,
			data: usuarioLimpio,
			message: "Perfil actualizado correctamente"
		});
	} catch (error) {
		console.error("Error editando perfil:", error);
		res.status(500).json({ 
			success: false,
			error: "Error al actualizar el perfil" 
		});
	}
};

// Obtener estadísticas del usuario
const getUserStats = async (req, res) => {
	try {
		const { usuario } = req;
		
		if (!usuario) {
			return res.status(401).json({ 
				success: false,
				error: "Usuario no autenticado" 
			});
		}

		// Importar dinámicamente los otros modelos para evitar dependencias circulares
		const Vehiculo = (await import("../models/Vehiculo.js")).default;
		const Gasto = (await import("../models/Gasto.js")).default;
		const Mantenimiento = (await import("../models/Mantenimiento.js")).default;
		const Documento = (await import("../models/Documento.js")).default;

		const stats = await Promise.all([
			Vehiculo.countDocuments({ usuario: usuario._id }),
			Gasto.countDocuments({ usuario: usuario._id }),
			Mantenimiento.countDocuments({ usuario: usuario._id }),
			Documento.countDocuments({ usuario: usuario._id })
		]);

		// Calcular gasto total del último mes
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		
		const gastosRecientes = await Gasto.find({ 
			usuario: usuario._id,
			fecha: { $gte: lastMonth }
		});

		const gastoTotalMes = gastosRecientes.reduce((total, gasto) => total + (gasto.monto || 0), 0);

		res.json({
			success: true,
			data: {
				vehiculos: stats[0],
				gastos: stats[1],
				mantenimientos: stats[2],
				documentos: stats[3],
				gastoTotalMes,
				fechaRegistro: usuario.createdAt || new Date()
			}
		});
	} catch (error) {
		console.error("Error obteniendo estadísticas:", error);
		res.status(500).json({ 
			success: false,
			error: "Error al obtener estadísticas del usuario" 
		});
	}
};

// Cambiar configuraciones del usuario
const updateUserSettings = async (req, res) => {
	try {
		const { usuario } = req;
		const { settings } = req.body;

		if (!usuario) {
			return res.status(401).json({ 
				success: false,
				error: "Usuario no autenticado" 
			});
		}

		const usuarioAActualizar = await Usuario.findById(usuario._id);
		if (!usuarioAActualizar) {
			return res.status(404).json({ 
				success: false,
				error: "Usuario no encontrado" 
			});
		}

		// Actualizar configuraciones
		usuarioAActualizar.settings = {
			...usuarioAActualizar.settings,
			...settings
		};
		usuarioAActualizar.updatedAt = new Date();

		await usuarioAActualizar.save();

		res.json({
			success: true,
			data: usuarioAActualizar.settings,
			message: "Configuraciones actualizadas correctamente"
		});
	} catch (error) {
		console.error("Error actualizando configuraciones:", error);
		res.status(500).json({ 
			success: false,
			error: "Error al actualizar configuraciones" 
		});
	}
};

const allowNotifications = async (req, res) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const usuario = await Usuario.findOne({ token });
		const { tokenNotification } = req.body;

		if (!usuario) {
			console.log("No existe el usuario");
			res.status(500).json({ msg: "El usuario no existe" });
		}
		usuario.tokenNotification = tokenNotification;
		usuario.allowNotifications = true;
		const usuarioAlmacenado = await usuario.save();
		res.status(200).json(usuarioAlmacenado);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Error al guardar token de notificacion" });
	}
};

const saveNotificationToken = async (req, res) => {
	try {
		const { usuario } = req; // Viene del middleware checkAuth
		const { tokenNotification } = req.body;

		if (!usuario) {
			return res.status(401).json({ msg: "Usuario no autenticado" });
		}

		if (!tokenNotification) {
			return res.status(400).json({ msg: "Token de notificación requerido" });
		}

		// Buscar el usuario en la base de datos
		const usuarioAActualizar = await Usuario.findById(usuario._id);
		if (!usuarioAActualizar) {
			return res.status(404).json({ msg: "Usuario no encontrado" });
		}

		// Actualizar el token de notificación
		usuarioAActualizar.tokenNotification = tokenNotification;
		usuarioAActualizar.allowNotifications = true;
		
		const usuarioAlmacenado = await usuarioAActualizar.save();
		
		console.log(`Token de notificación guardado para usuario ${usuario._id}: ${tokenNotification}`);
		
		res.status(200).json({ 
			msg: "Token de notificación guardado correctamente",
			allowNotifications: usuarioAlmacenado.allowNotifications
		});
	} catch (error) {
		console.error("Error guardando token de notificación:", error);
		res.status(500).json({ msg: "Error al guardar token de notificación" });
	}
};

const sendPushNotification = async (id, title, message) => {
	try {
		let data = {};

		const usuario = await Usuario.findById(id);
		if (!usuario) {
			console.log("Usuario no existe");
			return;
		}

		// Validar que el token sea un token Expo válido
		if (!Expo.isExpoPushToken(usuario.tokenNotification)) {
			return res.status(400).json({ msg: "Token Expo no válido" });
		}

		// Construir el mensaje
		const messages = [
			{
				to: usuario.tokenNotification,
				sound: "default", // o puedes omitirlo si no deseas sonido
				title: title,
				body: message,
				data: data || {},
			},
		];

		// Dividir en chunks por si hay múltiples mensajes (útil para enviar a varios dispositivos)
		const chunks = expo.chunkPushNotifications(messages);
		let tickets = [];

		// Enviar cada chunk y acumular los tickets
		for (const chunk of chunks) {
			let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
			tickets.push(...ticketChunk);
		}

		return;
	} catch (error) {
		console.error("Error enviando notificaciones push:", error);
		return;
	}
};

const activarDesactivarNotification = async (req, res) => {
	const { id } = req.params;

	try {
		// Verificar que el usuario solo pueda modificar sus propias notificaciones
		if (req.usuario._id.toString() !== id.toString()) {
			return res.status(403).json({ msg: "No autorizado para modificar este usuario" });
		}

		const usuario = await Usuario.findById(id);

		if (!usuario) {
			return res.status(404).json({ msg: "El usuario no existe" });
		}

		usuario.allowNotifications = !usuario.allowNotifications;
		const usuarioAlmacenado = await usuario.save();

		res.json(usuarioAlmacenado);
	} catch (error) {
		res.status(500).json({ msg: "Error cambiando estado de notificaciones" });
	}
};



const eliminarUsuario = async (req, res) => {
	try {
		const { id } = req.params;

		// Verificar que el usuario solo pueda eliminar su propia cuenta
		if (req.usuario._id.toString() !== id.toString()) {
			return res.status(403).json({ msg: "No autorizado" });
		}

		const usuario = await Usuario.findById(id);

		if (!usuario) {
			return res.status(404).json({ msg: "El usuario no existe" });
		}

		// Importar modelos dinámicamente para evitar circular dependencies
		const { default: Vehiculo } = await import("../models/Vehiculo.js");
		const { default: Gasto } = await import("../models/Gasto.js");
		const { default: Mantenimiento } = await import("../models/Mantenimiento.js");
		const { default: Documento } = await import("../models/Documento.js");
		const { default: VehicleInvitation } = await import("../models/VehicleInvitation.js");

		// Cascade delete: eliminar todos los datos del usuario
		await Promise.all([
			Vehiculo.deleteMany({ userId: id }),
			Gasto.deleteMany({ userId: id }),
			Mantenimiento.deleteMany({ userId: id }),
			Documento.deleteMany({ userId: id }),
			VehicleInvitation.deleteMany({ $or: [{ invitedBy: id }, { invitedUser: id }] }),
		]);

		// Remover al usuario de vehículos compartidos
		await Vehiculo.updateMany(
			{ "sharedWith.userId": id },
			{ $pull: { sharedWith: { userId: id } } }
		);

		// Eliminar el usuario
		await Usuario.findByIdAndDelete(id);

		res.json({
			msg: "Usuario y toda su información asociada fueron eliminados correctamente.",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el usuario" });
	}
};

// Activar cuenta PRO (Easter Egg)
const activateProAccount = async (req, res) => {
	try {
		const { id } = req.params;

		const usuario = await Usuario.findById(id);

		if (!usuario) {
			return res.status(404).json({ 
				success: false, 
				msg: "Usuario no encontrado" 
			});
		}

		// Marcar usuario como invitado (esto le da acceso PRO)
		usuario.isInvitado = true;
		usuario.proActivatedAt = new Date();
		usuario.proActivatedBy = 'easter_egg';

		await usuario.save();

		console.log(`🎉 Usuario ${usuario.email} activado como PRO via Easter Egg`);

		res.json({
			success: true,
			msg: "Cuenta PRO activada exitosamente",
			data: {
				isPro: true,
				isInvitado: true,
				activatedAt: usuario.proActivatedAt
			}
		});

	} catch (error) {
		console.error("Error activating PRO account:", error);
		res.status(500).json({ 
			success: false, 
			msg: "Error al activar cuenta PRO" 
		});
	}
};

// Debug endpoint para verificar suscripción
const debugSubscription = async (req, res) => {
	try {
		const { id } = req.usuario;
		const user = await Usuario.findById(id);
		
		const subscriptionStatus = await getUserSubscriptionStatus(id);
		
		res.json({
			success: true,
			userId: id,
			userFound: !!user,
			isInvitado: user?.isInvitado,
			proActivatedBy: user?.proActivatedBy,
			proActivatedAt: user?.proActivatedAt,
			subscriptionData: user?.subscriptionData,
			calculatedSubscription: subscriptionStatus
		});
	} catch (error) {
		console.error('Debug subscription error:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
};

export {
	registrar,
	autenticar,
	confirmar,
	olvidePassword,
	comprobarToken,
	nuevoPassword,
	perfil,
	crearPassword,
	comprobarUsuario,
	verificarAuth,
	obtenerUsuario,
	registrarSocial,
	autenticarSocial,
	registrarGoogle,
	autenticarGoogle,
	editProfile,
	getUserStats,
	updateUserSettings,
	allowNotifications,
	sendPushNotification,
	activarDesactivarNotification,
	consultarSuscripcionRevenueCat,
	eliminarUsuario,
	appleAuth,
	saveNotificationToken,
	activateProAccount,
	debugSubscription,
};
