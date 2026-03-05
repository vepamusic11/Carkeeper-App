import Documento from "../models/Documento.js";
import Vehiculo from "../models/Vehiculo.js";
import Usuario from "../models/Usuario.js";
import { sendPushNotification } from "./usuarioController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de multer para subida de documentos
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadPath = "uploads/documentos/";
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "documento-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 15 * 1024 * 1024, // 15MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const allowedMimes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/gif',
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'text/plain'
		];
		const mimetype = allowedMimes.includes(file.mimetype);

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Solo se permiten imágenes, PDFs y documentos de texto"));
		}
	},
});

const obtenerDocumentos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId, type, expired, limit = 50, page = 1 } = req.query;

		let query = { userId };

		if (vehicleId) {
			query.vehicleId = vehicleId;
		}

		if (type) {
			query.type = type;
		}

		if (expired !== undefined) {
			query.isExpired = expired === 'true';
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const documentos = await Documento.find(query)
			.populate("vehicleId", "marca modelo año patente")
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip)
			.lean();

		const total = await Documento.countDocuments(query);

		res.json({
			documentos,
			pagination: {
				total,
				page: parseInt(page),
				pages: Math.ceil(total / parseInt(limit)),
				limit: parseInt(limit),
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const obtenerDocumento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const documento = await Documento.findOne({ _id: id, userId })
			.populate("vehicleId", "marca modelo año patente");

		if (!documento) {
			return res.status(404).json({ msg: "Documento no encontrado" });
		}

		res.json(documento);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const crearDocumento = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId } = req.body;

		// Verificar que el vehículo pertenezca al usuario
		const vehiculo = await Vehiculo.findOne({
			_id: vehicleId,
			userId,
			isActive: true,
		});

		if (!vehiculo) {
			return res.status(404).json({ msg: "Vehículo no encontrado" });
		}

		const documentData = {
			...req.body,
			userId,
		};

		// Si se subió un archivo
		if (req.file) {
			documentData.fileUrl = `/uploads/documentos/${req.file.filename}`;
			documentData.fileName = req.file.originalname;
			documentData.fileSize = req.file.size;
			documentData.fileType = req.file.mimetype;
		}

		const documento = new Documento(documentData);
		const documentoGuardado = await documento.save();
		await documentoGuardado.populate("vehicleId", "marca modelo año patente");

		res.status(201).json(documentoGuardado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al crear el documento" });
	}
};

const actualizarDocumento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const documento = await Documento.findOne({ _id: id, userId });

		if (!documento) {
			return res.status(404).json({ msg: "Documento no encontrado" });
		}

		const updateData = { ...req.body };

		// Si se subió un nuevo archivo
		if (req.file) {
			// Eliminar archivo anterior si existe
			if (documento.fileUrl) {
				const oldFilePath = documento.fileUrl.replace("/uploads/", "uploads/");
				try { await fs.promises.unlink(oldFilePath); } catch {}
			}

			updateData.fileUrl = `/uploads/documentos/${req.file.filename}`;
			updateData.fileName = req.file.originalname;
			updateData.fileSize = req.file.size;
			updateData.fileType = req.file.mimetype;
		}

		const documentoActualizado = await Documento.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		).populate("vehicleId", "marca modelo año patente");

		res.json(documentoActualizado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al actualizar el documento" });
	}
};

const eliminarDocumento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const documento = await Documento.findOne({ _id: id, userId });

		if (!documento) {
			return res.status(404).json({ msg: "Documento no encontrado" });
		}

		// Eliminar archivo si existe
		if (documento.fileUrl) {
			const filePath = documento.fileUrl.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(filePath); } catch {}
		}

		await Documento.findByIdAndDelete(id);

		res.json({ msg: "Documento eliminado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el documento" });
	}
};

const obtenerDocumentosProximosAVencer = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { daysAhead = 30 } = req.query;

		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() + parseInt(daysAhead));

		const documentosProximos = await Documento.find({
			userId,
			expirationDate: { $exists: true, $lte: fechaLimite },
			isExpired: false,
		})
			.populate("vehicleId", "marca modelo año patente")
			.sort({ expirationDate: 1 })
			.lean();

		// Calcular días hasta el vencimiento
		const documentosConDias = documentosProximos.map(documento => ({
			...documento,
			daysUntilExpiration: Math.ceil(
				(new Date(documento.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
			),
		}));

		res.json(documentosConDias);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener documentos próximos a vencer" });
	}
};

const obtenerEstadisticasDocumentos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId } = req.query;

		let matchQuery = { userId };

		if (vehicleId) {
			matchQuery.vehicleId = vehicleId;
		}

		const estadisticas = await Documento.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: null,
					totalDocumentos: { $sum: 1 },
					expirados: {
						$sum: { $cond: [{ $eq: ["$isExpired", true] }, 1, 0] }
					},
					activos: {
						$sum: { $cond: [{ $eq: ["$isExpired", false] }, 1, 0] }
					},
					conArchivo: {
						$sum: { $cond: [{ $ne: ["$fileUrl", null] }, 1, 0] }
					},
				},
			},
		]);

		// Estadísticas por tipo de documento
		const documentosPorTipo = await Documento.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: "$type",
					total: { $sum: 1 },
					expirados: {
						$sum: { $cond: [{ $eq: ["$isExpired", true] }, 1, 0] }
					},
					activos: {
						$sum: { $cond: [{ $eq: ["$isExpired", false] }, 1, 0] }
					},
				},
			},
			{ $sort: { total: -1 } },
		]);

		res.json({
			estadisticas: estadisticas[0] || {
				totalDocumentos: 0,
				expirados: 0,
				activos: 0,
				conArchivo: 0,
			},
			documentosPorTipo,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener estadísticas" });
	}
};

const enviarRecordatoriosVencimiento = async (req, res) => {
	try {
		// Esta función se puede ejecutar desde un cron job
		const ahora = new Date();
		const enUnaSemanana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

		const documentosPorVencer = await Documento.find({
			expirationDate: { $lte: enUnaSemanana, $gte: ahora },
			isExpired: false,
			reminderSent: false,
		}).populate("vehicleId", "marca modelo").populate("userId", "allowNotifications");

		const updatePromises = documentosPorVencer
			.filter(doc => doc.userId.allowNotifications)
			.map(async (documento) => {
				try {
					const titulo = "Documento próximo a vencer";
					const mensaje = `${documento.title} vence pronto para ${documento.vehicleId.marca} ${documento.vehicleId.modelo}`;

					await sendPushNotification(documento.userId._id, titulo, mensaje);

					// Marcar recordatorio como enviado
					documento.reminderSent = true;
					await documento.save();
				} catch (error) {
					console.error(`Error sending reminder for document ${documento._id}:`, error);
				}
			});

		await Promise.all(updatePromises);

		res.json({
			msg: `Recordatorios enviados para ${documentosPorVencer.length} documentos`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al enviar recordatorios" });
	}
};

const descargarDocumento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const documento = await Documento.findOne({ _id: id, userId });

		if (!documento) {
			return res.status(404).json({ msg: "Documento no encontrado" });
		}

		if (!documento.fileUrl) {
			return res.status(404).json({ msg: "Este documento no tiene archivo adjunto" });
		}

		const filePath = path.join("uploads", "documentos", path.basename(documento.fileUrl));

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ msg: "Archivo no encontrado" });
		}

		const fileName = documento.fileName || `documento-${documento._id}`;

		res.download(filePath, fileName, (err) => {
			if (err) {
				console.error("Error al descargar archivo:", err);
				if (!res.headersSent) {
					res.status(500).json({ msg: "Error al descargar el archivo" });
				}
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const eliminarArchivoDocumento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const documento = await Documento.findOne({ _id: id, userId });

		if (!documento) {
			return res.status(404).json({ msg: "Documento no encontrado" });
		}

		if (documento.fileUrl) {
			const filePath = documento.fileUrl.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(filePath); } catch {}
		}

		documento.fileUrl = null;
		documento.fileName = null;
		documento.fileSize = null;
		documento.fileType = null;
		await documento.save();

		res.json({
			msg: "Archivo eliminado correctamente",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el archivo" });
	}
};

export {
	obtenerDocumentos,
	obtenerDocumento,
	crearDocumento,
	actualizarDocumento,
	eliminarDocumento,
	obtenerDocumentosProximosAVencer,
	obtenerEstadisticasDocumentos,
	enviarRecordatoriosVencimiento,
	descargarDocumento,
	eliminarArchivoDocumento,
	upload,
};
