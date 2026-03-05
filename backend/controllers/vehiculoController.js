import Vehiculo from "../models/Vehiculo.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadPath = "uploads/vehiculos/";
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "vehiculo-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Solo se permiten imágenes"));
		}
	},
});

const obtenerVehiculos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;

		// Obtener vehículos propios
		const vehiculosPropios = await Vehiculo.find({ userId, isActive: true })
			.populate('sharedWith.userId', 'nombre apellido email')
			.sort({ createdAt: -1 })
			.lean();

		// Obtener vehículos compartidos conmigo
		const vehiculosCompartidos = await Vehiculo.find({
			'sharedWith.userId': userId,
			'sharedWith.status': 'accepted',
			isActive: true
		})
		.populate('userId', 'nombre apellido email')
		.populate('sharedWith.userId', 'nombre apellido email')
		.sort({ createdAt: -1 })
		.lean();

		// Marcar vehículos compartidos y agregar información adicional
		const vehiculosCompartidosFormateados = vehiculosCompartidos.map(vehiculo => {
			const myShare = vehiculo.sharedWith.find(
				share => share.userId._id.toString() === userId.toString()
			);

			return {
				...vehiculo,
				isShared: true,
				sharedBy: vehiculo.userId,
				myRole: myShare?.role,
				acceptedAt: myShare?.acceptedAt
			};
		});

		// Marcar vehículos propios
		const vehiculosPropiosFormateados = vehiculosPropios.map(vehiculo => ({
			...vehiculo,
			isOwner: true,
			isShared: false
		}));

		// Combinar ambas listas
		const todosLosVehiculos = [...vehiculosPropiosFormateados, ...vehiculosCompartidosFormateados];

		// Convertir URLs relativas a URLs absolutas
		const vehiculosConImagenCompleta = todosLosVehiculos.map(vehiculo => {
			if (vehiculo.imageUrl && !vehiculo.imageUrl.startsWith('http')) {
				vehiculo.imageUrl = `${req.protocol}://${req.get('host')}${vehiculo.imageUrl}`;
			}
			return vehiculo;
		});

		res.json(vehiculosConImagenCompleta);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const obtenerVehiculo = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const vehiculo = await Vehiculo.findOne({
			_id: id,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		// Convertir URL relativa a URL absoluta
		if (vehiculo.imageUrl && !vehiculo.imageUrl.startsWith('http')) {
			vehiculo.imageUrl = `${req.protocol}://${req.get('host')}${vehiculo.imageUrl}`;
		}

		res.json(vehiculo);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const crearVehiculo = async (req, res) => {
	try {
		const { id: userId } = req.usuario;

		// Verificar límite de vehículos basado en suscripción
		const vehiculosCount = await Vehiculo.countDocuments({
			userId,
			isActive: true,
		});

		// Verificar límite de vehículos basado en suscripción
		const vehicleLimit = req.usuario.subscriptionData?.vehicleLimit || 1;

		// Si el límite es -1, significa vehículos ilimitados (PRO/Premium)
		if (vehicleLimit !== -1 && vehiculosCount >= vehicleLimit) {
			return res.status(400).json({
				msg: `Has alcanzado el límite de ${vehicleLimit} vehículo(s) en tu plan actual`,
			});
		}

		const vehiculo = new Vehiculo({
			...req.body,
			userId,
			kilometraje: parseInt(req.body.kilometraje) || 0,
		});

		const vehiculoGuardado = await vehiculo.save();
		res.status(201).json(vehiculoGuardado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al crear el vehículo" });
	}
};

const actualizarVehiculo = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const vehiculo = await Vehiculo.findOne({
			_id: id,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		const updateData = { ...req.body };
		if (updateData.kilometraje) {
			updateData.kilometraje = parseInt(updateData.kilometraje) || 0;
		}

		const vehiculoActualizado = await Vehiculo.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		res.json(vehiculoActualizado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al actualizar el vehículo" });
	}
};

const eliminarVehiculo = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const vehiculo = await Vehiculo.findOne({
			_id: id,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		// Soft delete - marcar como inactivo
		await Vehiculo.findByIdAndUpdate(id, { isActive: false });

		// Eliminar imagen si existe
		if (vehiculo.imageUrl) {
			const imagePath = vehiculo.imageUrl.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(imagePath); } catch {}
		}

		res.json({ msg: "Vehículo eliminado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el vehículo" });
	}
};

const subirImagenVehiculo = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const vehiculo = await Vehiculo.findOne({
			_id: id,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		if (!req.file) {
			return res.status(400).json({ msg: "No se subió ningún archivo" });
		}

		// Eliminar imagen anterior si existe
		if (vehiculo.imageUrl) {
			const oldImagePath = vehiculo.imageUrl.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(oldImagePath); } catch {}
		}

		const imageUrl = `/uploads/vehiculos/${req.file.filename}`;
		vehiculo.imageUrl = imageUrl;
		await vehiculo.save();

		// Devolver URL completa
		const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;

		res.json({
			msg: "Imagen subida correctamente",
			imageUrl: fullImageUrl,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al subir la imagen" });
	}
};

const eliminarImagenVehiculo = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const vehiculo = await Vehiculo.findOne({
			_id: id,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		if (vehiculo.imageUrl) {
			const imagePath = vehiculo.imageUrl.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(imagePath); } catch {}
		}

		vehiculo.imageUrl = null;
		await vehiculo.save();

		res.json({
			msg: "Imagen eliminada correctamente",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar la imagen" });
	}
};

export {
	obtenerVehiculos,
	obtenerVehiculo,
	crearVehiculo,
	actualizarVehiculo,
	eliminarVehiculo,
	subirImagenVehiculo,
	eliminarImagenVehiculo,
	upload,
};