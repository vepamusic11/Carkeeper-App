import Mantenimiento from "../models/Mantenimiento.js";
import Vehiculo from "../models/Vehiculo.js";
import Usuario from "../models/Usuario.js";
import Gasto from "../models/Gasto.js";
import { sendPushNotification } from "./usuarioController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de intervalos de mantenimiento por tipo
const INTERVALOS_MANTENIMIENTO = {
	cambio_aceite: {
		kilometros: 10000, // cada 10,000 km
		meses: 6,          // cada 6 meses
		description: "Cambio de aceite y filtro"
	},
	cambio_filtros: {
		kilometros: 20000, // cada 20,000 km  
		meses: 12,         // cada 12 meses
		description: "Cambio de filtros (aire, combustible, habitáculo)"
	},
	alineacion: {
		kilometros: 15000, // cada 15,000 km
		meses: 12,         // cada 12 meses
		description: "Alineación y balanceado"
	},
	balanceado: {
		kilometros: 15000, // cada 15,000 km
		meses: 12,         // cada 12 meses
		description: "Balanceado de ruedas"
	},
	frenos: {
		kilometros: 40000, // cada 40,000 km
		meses: 24,         // cada 24 meses
		description: "Revisión del sistema de frenos"
	},
	neumaticos: {
		kilometros: 60000, // cada 60,000 km
		meses: 48,         // cada 48 meses
		description: "Cambio de neumáticos"
	},
	bateria: {
		kilometros: null,  // no depende de kilometraje
		meses: 36,         // cada 36 meses
		description: "Cambio de batería"
	},
	transmision: {
		kilometros: 80000, // cada 80,000 km
		meses: 48,         // cada 48 meses
		description: "Servicio de transmisión"
	},
	suspension: {
		kilometros: 100000, // cada 100,000 km
		meses: 60,          // cada 60 meses
		description: "Revisión de suspensión"
	},
	aire_acondicionado: {
		kilometros: null,  // no depende de kilometraje
		meses: 12,         // cada 12 meses
		description: "Servicio de aire acondicionado"
	},
	sistema_electrico: {
		kilometros: null,  // no depende de kilometraje
		meses: 24,         // cada 24 meses
		description: "Revisión del sistema eléctrico"
	},
	revision_general: {
		kilometros: 20000, // cada 20,000 km
		meses: 12,         // cada 12 meses
		description: "Revisión general del vehículo"
	}
};

// Helper function to create next maintenance automatically
const crearProximoMantenimiento = async (mantenimientoCompletado) => {
	try {
		const intervalo = INTERVALOS_MANTENIMIENTO[mantenimientoCompletado.type];
		
		// Si no hay configuración para este tipo, no crear próximo mantenimiento
		if (!intervalo) {
			console.log(`No hay configuración de intervalo para tipo: ${mantenimientoCompletado.type}`);
			return null;
		}

		// Verificar si ya existe un mantenimiento pendiente del mismo tipo para el mismo vehículo
		const mantenimientoPendiente = await Mantenimiento.findOne({
			userId: mantenimientoCompletado.userId,
			vehicleId: mantenimientoCompletado.vehicleId,
			type: mantenimientoCompletado.type,
			status: { $in: ['pending', 'in_progress'] }
		});

		if (mantenimientoPendiente) {
			console.log(`Ya existe un mantenimiento pendiente de tipo ${mantenimientoCompletado.type} para este vehículo`);
			return null;
		}

		// Obtener datos del vehículo actual
		const vehiculo = await Vehiculo.findById(mantenimientoCompletado.vehicleId);
		if (!vehiculo) {
			console.log('Vehículo no encontrado para crear próximo mantenimiento');
			return null;
		}

		const kilometrajeActual = mantenimientoCompletado.kilometraje || vehiculo.kilometraje || 0;
		const fechaActual = new Date(mantenimientoCompletado.completedAt || mantenimientoCompletado.date);

		// Usar información del frontend si está disponible, sino usar intervalos predefinidos
		let nextMaintenanceKm = mantenimientoCompletado.nextMaintenanceKm || null;
		let nextMaintenanceDate = mantenimientoCompletado.nextMaintenanceDate ? 
			new Date(mantenimientoCompletado.nextMaintenanceDate) : null;

		// Solo crear próximo mantenimiento si se especificó información personalizada
		// (no usar intervalos predefinidos automáticamente)
		if (!nextMaintenanceKm && !nextMaintenanceDate) {
			console.log('No se especificaron datos de próximo mantenimiento, no crear automáticamente');
			return null;
		}

		// Determinar fecha de vencimiento (la que ocurra primero)
		let fechaVencimiento = nextMaintenanceDate;
		
		// Si tenemos ambos criterios, usar el que venza primero (esto requiere estimar cuándo se alcanzará el kilometraje)
		if (nextMaintenanceKm && nextMaintenanceDate) {
			// Estimar fecha basada en kilometraje (asumiendo promedio de 15,000 km/año)
			const kmPendientes = nextMaintenanceKm - kilometrajeActual;
			const mesesEstimados = (kmPendientes / 15000) * 12;
			const fechaEstimadaPorKm = new Date(fechaActual);
			fechaEstimadaPorKm.setMonth(fechaEstimadaPorKm.getMonth() + mesesEstimados);
			
			// Usar la fecha que ocurra primero
			if (fechaEstimadaPorKm < nextMaintenanceDate) {
				fechaVencimiento = fechaEstimadaPorKm;
			}
		}

		// Crear el próximo mantenimiento
		const proximoMantenimiento = new Mantenimiento({
			userId: mantenimientoCompletado.userId,
			vehicleId: mantenimientoCompletado.vehicleId,
			type: mantenimientoCompletado.type,
			title: `Próximo ${mantenimientoCompletado.title || intervalo.description}`,
			description: `${intervalo.description} programado automáticamente`,
			date: fechaVencimiento,
			status: 'pending',
			kilometraje: nextMaintenanceKm,
			nextMaintenanceKm: nextMaintenanceKm,
			nextMaintenanceDate: nextMaintenanceDate,
			priority: 'medium'
		});

		const proximoMantenimientoGuardado = await proximoMantenimiento.save();
		console.log(`Próximo mantenimiento creado: ${proximoMantenimientoGuardado._id} para ${mantenimientoCompletado.type}`);
		
		return proximoMantenimientoGuardado;

	} catch (error) {
		console.error('Error creando próximo mantenimiento:', error);
		return null;
	}
};

// Helper function to create or update expense for maintenance
const crearOActualizarGastoMantenimiento = async (mantenimiento, isUpdate = false) => {
	try {
		console.log('crearOActualizarGastoMantenimiento called with:', {
			id: mantenimiento._id,
			status: mantenimiento.status,
			cost: mantenimiento.cost,
			isUpdate
		});

		// Solo crear gasto si el mantenimiento está completado y tiene costo > 0
		if (mantenimiento.status !== 'completed' || !mantenimiento.cost || mantenimiento.cost <= 0) {
			console.log('No creating expense - conditions not met:', {
				status: mantenimiento.status,
				cost: mantenimiento.cost,
				completed: mantenimiento.status === 'completed',
				hasCost: mantenimiento.cost > 0
			});
			return null;
		}

		// Obtener datos del vehículo para la descripción
		const vehiculo = await Vehiculo.findById(mantenimiento.vehicleId);
		
		const gastoData = {
			userId: mantenimiento.userId,
			vehicleId: mantenimiento.vehicleId,
			amount: mantenimiento.cost,
			category: 'maintenance',
			description: `${mantenimiento.title || mantenimiento.type} - ${vehiculo?.marca} ${vehiculo?.modelo}`,
			date: mantenimiento.completedAt || mantenimiento.date,
			kilometraje: mantenimiento.kilometraje,
			location: mantenimiento.location,
			notas: `Mantenimiento: ${mantenimiento.description || ''}`.trim(),
			maintenanceId: mantenimiento._id,
		};

		if (isUpdate) {
			// Buscar si ya existe un gasto para este mantenimiento usando maintenanceId
			let gasto = await Gasto.findOne({ 
				maintenanceId: mantenimiento._id
			});

			if (gasto) {
				// Actualizar gasto existente
				Object.assign(gasto, gastoData);
				await gasto.save();
				console.log('Updated existing expense:', gasto._id);
				return gasto;
			}
		}

		// Verificar si ya existe un gasto duplicado (para casos legacy sin maintenanceId)
		const existingGasto = await Gasto.findOne({
			userId: mantenimiento.userId,
			vehicleId: mantenimiento.vehicleId,
			category: 'maintenance',
			amount: mantenimiento.cost,
			date: mantenimiento.completedAt || mantenimiento.date
		});

		if (existingGasto && !existingGasto.maintenanceId) {
			// Actualizar gasto legacy con maintenanceId
			existingGasto.maintenanceId = mantenimiento._id;
			await existingGasto.save();
			console.log('Updated legacy expense with maintenanceId:', existingGasto._id);
			return existingGasto;
		}

		// Crear nuevo gasto
		const nuevoGasto = new Gasto(gastoData);
		await nuevoGasto.save();
		console.log('Created new expense:', nuevoGasto._id);
		return nuevoGasto;

	} catch (error) {
		console.error('Error al crear/actualizar gasto de mantenimiento:', error);
		return null;
	}
};

// Configuración de multer para subida de recibos
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadPath = "uploads/mantenimientos/";
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "mantenimiento-" + uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|gif|pdf/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase()
		);
		const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error("Solo se permiten imágenes y PDFs"));
		}
	},
});

const obtenerMantenimientos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId, status, startDate, endDate, limit = 50, page = 1 } = req.query;

		let query = { userId };

		if (vehicleId) {
			query.vehicleId = vehicleId;
		}

		if (status) {
			query.status = status;
		}

		if (startDate || endDate) {
			query.date = {};
			if (startDate) query.date.$gte = new Date(startDate);
			if (endDate) query.date.$lte = new Date(endDate);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const mantenimientos = await Mantenimiento.find(query)
			.populate("vehicleId", "marca modelo año patente")
			.sort({ date: -1 })
			.limit(parseInt(limit))
			.skip(skip)
			.lean();

		const total = await Mantenimiento.countDocuments(query);

		res.json({
			mantenimientos,
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

const obtenerMantenimiento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId })
			.populate("vehicleId", "marca modelo año patente");

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		res.json(mantenimiento);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const crearMantenimiento = async (req, res) => {
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

		const mantenimiento = new Mantenimiento({
			...req.body,
			userId,
		});

		const mantenimientoGuardado = await mantenimiento.save();
		await mantenimientoGuardado.populate("vehicleId", "marca modelo año patente");

		console.log('=== MANTENIMIENTO GUARDADO ===');
		console.log('ID:', mantenimientoGuardado._id);
		console.log('Status:', mantenimientoGuardado.status);
		console.log('Cost:', mantenimientoGuardado.cost);
		console.log('Type:', typeof mantenimientoGuardado.cost);

		// Crear gasto automáticamente si el mantenimiento está completado y tiene costo
		const gastoResult = await crearOActualizarGastoMantenimiento(mantenimientoGuardado);
		console.log('Resultado creación gasto:', gastoResult ? 'Creado exitosamente' : 'No se creó gasto');

		// Si se crea ya completado y se solicitó programar el siguiente, crear automáticamente el próximo mantenimiento
		if (mantenimientoGuardado.status === 'completed' && 
			(mantenimientoGuardado.nextMaintenanceDate || mantenimientoGuardado.nextMaintenanceKm)) {
			console.log('Mantenimiento creado como completado con próximo programado, creando próximo mantenimiento automáticamente...');
			await crearProximoMantenimiento(mantenimientoGuardado);
		}

		res.status(201).json(mantenimientoGuardado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al crear el mantenimiento" });
	}
};

const actualizarMantenimiento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId });

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		const updateData = { ...req.body };

		// Si se está marcando como completado y no tiene fecha de completado
		if (updateData.status === 'completed' && !updateData.completedAt) {
			updateData.completedAt = new Date();
		}

		const mantenimientoActualizado = await Mantenimiento.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		).populate("vehicleId", "marca modelo año patente");

		// Crear o actualizar gasto automáticamente si el mantenimiento está completado y tiene costo
		await crearOActualizarGastoMantenimiento(mantenimientoActualizado, true);

		// Si se marcó como completado y tiene datos de próximo mantenimiento, crear automáticamente el próximo mantenimiento
		if (mantenimientoActualizado.status === 'completed' && updateData.status === 'completed' &&
			(mantenimientoActualizado.nextMaintenanceDate || mantenimientoActualizado.nextMaintenanceKm)) {
			console.log('Mantenimiento completado con próximo programado, creando próximo mantenimiento automáticamente...');
			await crearProximoMantenimiento(mantenimientoActualizado);
		}

		res.json(mantenimientoActualizado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al actualizar el mantenimiento" });
	}
};

const eliminarMantenimiento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId });

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		// Eliminar archivo de recibo si existe
		if (mantenimiento.receipt) {
			const receiptPath = mantenimiento.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(receiptPath); } catch {}
		}

		// Eliminar gasto asociado si existe
		const deletedExpense = await Gasto.findOneAndDelete({
			maintenanceId: mantenimiento._id
		});
		
		if (deletedExpense) {
			console.log('Deleted associated expense:', deletedExpense._id);
		}

		await Mantenimiento.findByIdAndDelete(id);

		res.json({ msg: "Mantenimiento eliminado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el mantenimiento" });
	}
};

const obtenerMantenimientosProximos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { daysAhead = 30 } = req.query;

		const fechaLimite = new Date();
		fechaLimite.setDate(fechaLimite.getDate() + parseInt(daysAhead));

		const mantenimientosProximos = await Mantenimiento.find({
			userId,
			status: { $in: ['pending', 'in_progress'] },
			date: { $lte: fechaLimite },
		})
			.populate("vehicleId", "marca modelo año patente")
			.sort({ date: 1 })
			.lean();

		// Calcular días hasta el mantenimiento
		const mantenimientosConDias = mantenimientosProximos.map(mantenimiento => ({
			...mantenimiento,
			daysUntilMaintenance: Math.ceil(
				(new Date(mantenimiento.date) - new Date()) / (1000 * 60 * 60 * 24)
			),
		}));

		res.json(mantenimientosConDias);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener mantenimientos próximos" });
	}
};

const marcarComoCompletado = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;
		const { cost, notas, receipt } = req.body;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId });

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		const updateData = {
			status: 'completed',
			completedAt: new Date(),
		};

		if (cost !== undefined) updateData.cost = cost;
		if (notas !== undefined) updateData.notas = notas;
		if (receipt !== undefined) updateData.receipt = receipt;

		const mantenimientoActualizado = await Mantenimiento.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		).populate("vehicleId", "marca modelo año patente");

		// Crear gasto automáticamente cuando se marca como completado
		await crearOActualizarGastoMantenimiento(mantenimientoActualizado, true);

		// Crear automáticamente el próximo mantenimiento solo si tiene datos de próximo mantenimiento
		if (mantenimientoActualizado.nextMaintenanceDate || mantenimientoActualizado.nextMaintenanceKm) {
			console.log('Mantenimiento marcado como completado con próximo programado, creando próximo mantenimiento automáticamente...');
			await crearProximoMantenimiento(mantenimientoActualizado);
		}

		res.json(mantenimientoActualizado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al marcar como completado" });
	}
};

const obtenerEstadisticasMantenimiento = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId, year } = req.query;

		let matchQuery = { userId };

		if (vehicleId) {
			matchQuery.vehicleId = vehicleId;
		}

		if (year) {
			const startDate = new Date(parseInt(year), 0, 1);
			const endDate = new Date(parseInt(year), 11, 31);
			matchQuery.date = { $gte: startDate, $lte: endDate };
		}

		const estadisticas = await Mantenimiento.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: null,
					totalMantenimientos: { $sum: 1 },
					costoTotal: { $sum: "$cost" },
					costoPromedio: { $avg: "$cost" },
					completados: {
						$sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
					},
					pendientes: {
						$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
					},
					enProgreso: {
						$sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] }
					},
				},
			},
		]);

		// Estadísticas por tipo de mantenimiento
		const mantenimientosPorTipo = await Mantenimiento.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: "$type",
					total: { $sum: 1 },
					costoTotal: { $sum: "$cost" },
					completados: {
						$sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
					},
				},
			},
			{ $sort: { total: -1 } },
		]);

		res.json({
			estadisticas: estadisticas[0] || {
				totalMantenimientos: 0,
				costoTotal: 0,
				costoPromedio: 0,
				completados: 0,
				pendientes: 0,
				enProgreso: 0,
			},
			mantenimientosPorTipo,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener estadísticas" });
	}
};

const enviarRecordatorios = async (req, res) => {
	try {
		// Esta función se puede ejecutar desde un cron job
		const ahora = new Date();
		const enUnaSemanana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

		const mantenimientosPorVencer = await Mantenimiento.find({
			status: { $in: ['pending', 'in_progress'] },
			date: { $lte: enUnaSemanana, $gte: ahora },
			reminderSent: false,
		}).populate("vehicleId", "marca modelo").populate("userId", "allowNotifications tokenNotification");

		let recordatoriosEnviados = 0;

		for (const mantenimiento of mantenimientosPorVencer) {
			if (mantenimiento.userId.allowNotifications && mantenimiento.userId.tokenNotification) {
				const diasRestantes = Math.ceil((new Date(mantenimiento.date) - ahora) / (1000 * 60 * 60 * 24));
				const vehicleName = `${mantenimiento.vehicleId.marca} ${mantenimiento.vehicleId.modelo}`;
				
				let titulo, mensaje;
				
				if (diasRestantes <= 1) {
					titulo = "🔧 Mantenimiento HOY";
					mensaje = `Es hora de realizar: ${getMaintenanceDisplayName(mantenimiento.type)} en ${vehicleName}`;
				} else {
					titulo = "⚠️ Mantenimiento próximo";
					mensaje = `${getMaintenanceDisplayName(mantenimiento.type)} programado para ${vehicleName} en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
				}

				console.log(`Enviando notificación push a usuario ${mantenimiento.userId._id}: ${titulo}`);
				await sendPushNotification(mantenimiento.userId._id, titulo, mensaje);

				// Marcar recordatorio como enviado
				mantenimiento.reminderSent = true;
				await mantenimiento.save();
				recordatoriosEnviados++;
			}
		}

		res.json({
			msg: `Recordatorios enviados para ${recordatoriosEnviados} mantenimientos`,
			total: mantenimientosPorVencer.length,
			enviados: recordatoriosEnviados
		});
	} catch (error) {
		console.error("Error enviando recordatorios:", error);
		res.status(500).json({ msg: "Error al enviar recordatorios" });
	}
};

// Helper function para obtener nombres amigables de tipos de mantenimiento
const getMaintenanceDisplayName = (type) => {
	const displayNames = {
		cambio_aceite: "Cambio de aceite",
		cambio_filtros: "Cambio de filtros",
		alineacion: "Alineación",
		balanceado: "Balanceado",
		frenos: "Revisión de frenos",
		neumaticos: "Cambio de neumáticos",
		bateria: "Cambio de batería",
		transmision: "Servicio de transmisión",
		suspension: "Revisión de suspensión",
		aire_acondicionado: "Servicio de A/C",
		sistema_electrico: "Revisión eléctrica",
		revision_general: "Revisión general",
		otro: "Mantenimiento"
	};
	
	return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Función automatizada para ejecutar diariamente (sin autenticación)
const enviarRecordatoriosAutomatico = async (req, res) => {
	try {
		console.log('🔔 Ejecutando envío automático de recordatorios de mantenimiento...');
		
		const ahora = new Date();
		const enUnaSemanana = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

		const mantenimientosPorVencer = await Mantenimiento.find({
			status: { $in: ['pending', 'in_progress'] },
			date: { $lte: enUnaSemanana, $gte: ahora },
			reminderSent: false,
		}).populate("vehicleId", "marca modelo").populate("userId", "allowNotifications tokenNotification");

		let recordatoriosEnviados = 0;

		for (const mantenimiento of mantenimientosPorVencer) {
			if (mantenimiento.userId.allowNotifications && mantenimiento.userId.tokenNotification) {
				const diasRestantes = Math.ceil((new Date(mantenimiento.date) - ahora) / (1000 * 60 * 60 * 24));
				const vehicleName = `${mantenimiento.vehicleId.marca} ${mantenimiento.vehicleId.modelo}`;
				
				let titulo, mensaje;
				
				if (diasRestantes <= 1) {
					titulo = "🔧 Mantenimiento HOY";
					mensaje = `Es hora de realizar: ${getMaintenanceDisplayName(mantenimiento.type)} en ${vehicleName}`;
				} else {
					titulo = "⚠️ Mantenimiento próximo";
					mensaje = `${getMaintenanceDisplayName(mantenimiento.type)} programado para ${vehicleName} en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`;
				}

				console.log(`📱 Enviando notificación push a usuario ${mantenimiento.userId._id}: ${titulo}`);
				await sendPushNotification(mantenimiento.userId._id, titulo, mensaje);

				// Marcar recordatorio como enviado
				mantenimiento.reminderSent = true;
				await mantenimiento.save();
				recordatoriosEnviados++;
			}
		}

		const resultado = {
			timestamp: new Date().toISOString(),
			msg: `Recordatorios automáticos enviados`,
			total: mantenimientosPorVencer.length,
			enviados: recordatoriosEnviados,
			success: true
		};

		console.log('✅ Recordatorios automáticos completados:', resultado);
		
		if (res) {
			res.json(resultado);
		}
		
		return resultado;
	} catch (error) {
		console.error("❌ Error enviando recordatorios automáticos:", error);
		
		const errorResult = {
			timestamp: new Date().toISOString(),
			msg: "Error al enviar recordatorios automáticos",
			error: error.message,
			success: false
		};
		
		if (res) {
			res.status(500).json(errorResult);
		}
		
		return errorResult;
	}
};

const subirReciboMantenimiento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId });

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		if (!req.file) {
			return res.status(400).json({ msg: "No se subió ningún archivo" });
		}

		// Eliminar recibo anterior si existe
		if (mantenimiento.receipt) {
			const oldReceiptPath = mantenimiento.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(oldReceiptPath); } catch {}
		}

		const receiptUrl = `/uploads/mantenimientos/${req.file.filename}`;
		mantenimiento.receipt = receiptUrl;
		await mantenimiento.save();

		res.json({
			msg: "Recibo subido correctamente",
			receiptUrl,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al subir el recibo" });
	}
};

const eliminarReciboMantenimiento = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const mantenimiento = await Mantenimiento.findOne({ _id: id, userId });

		if (!mantenimiento) {
			return res.status(404).json({ msg: "Mantenimiento no encontrado" });
		}

		if (mantenimiento.receipt) {
			const receiptPath = mantenimiento.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(receiptPath); } catch {}
		}

		mantenimiento.receipt = null;
		await mantenimiento.save();

		res.json({
			msg: "Recibo eliminado correctamente",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el recibo" });
	}
};

const obtenerIntervalosMantenimiento = async (req, res) => {
	try {
		// Devolver la configuración de intervalos para que el frontend pueda mostrarla
		const intervalosFormateados = Object.entries(INTERVALOS_MANTENIMIENTO).map(([tipo, config]) => ({
			type: tipo,
			kilometros: config.kilometros,
			meses: config.meses,
			description: config.description,
			displayName: tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
		}));

		res.json({
			intervalos: intervalosFormateados
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener intervalos de mantenimiento" });
	}
};

export {
	obtenerMantenimientos,
	obtenerMantenimiento,
	crearMantenimiento,
	actualizarMantenimiento,
	eliminarMantenimiento,
	obtenerMantenimientosProximos,
	marcarComoCompletado,
	obtenerEstadisticasMantenimiento,
	enviarRecordatorios,
	enviarRecordatoriosAutomatico,
	subirReciboMantenimiento,
	eliminarReciboMantenimiento,
	obtenerIntervalosMantenimiento,
	upload,
};