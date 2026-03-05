import Gasto from "../models/Gasto.js";
import Vehiculo from "../models/Vehiculo.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de multer para subida de recibos
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadPath = "uploads/recibos/";
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "recibo-" + uniqueSuffix + path.extname(file.originalname));
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

const obtenerGastos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId, startDate, endDate, category, limit = 50, page = 1 } = req.query;

		let query = { userId };

		if (vehicleId) {
			query.vehicleId = vehicleId;
		}

		if (category) {
			query.category = category;
		}

		if (startDate || endDate) {
			query.date = {};
			if (startDate) query.date.$gte = new Date(startDate);
			if (endDate) query.date.$lte = new Date(endDate);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const gastos = await Gasto.find(query)
			.populate("vehicleId", "marca modelo año patente")
			.sort({ date: -1 })
			.limit(parseInt(limit))
			.skip(skip)
			.lean();

		const total = await Gasto.countDocuments(query);

		res.json({
			gastos,
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

const obtenerGasto = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const gasto = await Gasto.findOne({ _id: id, userId })
			.populate("vehicleId", "marca modelo año patente");

		if (!gasto) {
			return res.status(404).json({ msg: "Gasto no encontrado" });
		}

		res.json(gasto);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error del servidor" });
	}
};

const crearGasto = async (req, res) => {
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

		const gasto = new Gasto({
			...req.body,
			userId,
			amount: parseFloat(req.body.amount) || 0,
		});

		const gastoGuardado = await gasto.save();
		await gastoGuardado.populate("vehicleId", "marca modelo año patente");

		res.status(201).json(gastoGuardado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al crear el gasto" });
	}
};

const actualizarGasto = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const gasto = await Gasto.findOne({ _id: id, userId });

		if (!gasto) {
			return res.status(404).json({ msg: "Gasto no encontrado" });
		}

		const updateData = { ...req.body };
		if (updateData.amount) {
			updateData.amount = parseFloat(updateData.amount) || 0;
		}

		const gastoActualizado = await Gasto.findByIdAndUpdate(id, updateData, {
			new: true,
		}).populate("vehicleId", "marca modelo año patente");

		res.json(gastoActualizado);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al actualizar el gasto" });
	}
};

const eliminarGasto = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const gasto = await Gasto.findOne({ _id: id, userId });

		if (!gasto) {
			return res.status(404).json({ msg: "Gasto no encontrado" });
		}

		// Eliminar archivo de recibo si existe
		if (gasto.receipt) {
			const receiptPath = gasto.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(receiptPath); } catch {}
		}

		await Gasto.findByIdAndDelete(id);

		res.json({ msg: "Gasto eliminado correctamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el gasto" });
	}
};

const obtenerResumenGastos = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		const { vehicleId, period = "month" } = req.query;

		let startDate, endDate;
		const now = new Date();

		switch (period) {
			case "week":
				startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
				endDate = now;
				break;
			case "month":
				startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				endDate = now;
				break;
			case "year":
				startDate = new Date(now.getFullYear(), 0, 1);
				endDate = now;
				break;
			default:
				startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				endDate = now;
		}

		let matchQuery = {
			userId,
			date: { $gte: startDate, $lte: endDate },
		};

		if (vehicleId) {
			matchQuery.vehicleId = vehicleId;
		}

		const resumen = await Gasto.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: null,
					totalGastos: { $sum: "$amount" },
					totalRegistros: { $sum: 1 },
					gastoPromedio: { $avg: "$amount" },
					gastosPorCategoria: {
						$push: {
							category: "$category",
							amount: "$amount",
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					totalGastos: { $round: ["$totalGastos", 2] },
					totalRegistros: 1,
					gastoPromedio: { $round: ["$gastoPromedio", 2] },
					gastosPorCategoria: 1,
				},
			},
		]);

		// Agrupar gastos por categoría
		const gastosPorCategoria = await Gasto.aggregate([
			{ $match: matchQuery },
			{
				$group: {
					_id: "$category",
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { total: -1 } },
		]);

		res.json({
			resumen: resumen[0] || {
				totalGastos: 0,
				totalRegistros: 0,
				gastoPromedio: 0,
			},
			gastosPorCategoria,
			periodo: period,
			fechas: { startDate, endDate },
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al obtener el resumen" });
	}
};

const subirReciboGasto = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const gasto = await Gasto.findOne({ _id: id, userId });

		if (!gasto) {
			return res.status(404).json({ msg: "Gasto no encontrado" });
		}

		if (!req.file) {
			return res.status(400).json({ msg: "No se subió ningún archivo" });
		}

		// Eliminar recibo anterior si existe
		if (gasto.receipt) {
			const oldReceiptPath = gasto.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(oldReceiptPath); } catch {}
		}

		const receiptUrl = `/uploads/recibos/${req.file.filename}`;
		gasto.receipt = receiptUrl;
		await gasto.save();

		res.json({
			msg: "Recibo subido correctamente",
			receiptUrl,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al subir el recibo" });
	}
};

const eliminarReciboGasto = async (req, res) => {
	try {
		const { id } = req.params;
		const { id: userId } = req.usuario;

		const gasto = await Gasto.findOne({ _id: id, userId });

		if (!gasto) {
			return res.status(404).json({ msg: "Gasto no encontrado" });
		}

		if (gasto.receipt) {
			const receiptPath = gasto.receipt.replace("/uploads/", "uploads/");
			try { await fs.promises.unlink(receiptPath); } catch {}
		}

		gasto.receipt = null;
		await gasto.save();

		res.json({
			msg: "Recibo eliminado correctamente",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error al eliminar el recibo" });
	}
};

const limpiarGastosDuplicados = async (req, res) => {
	try {
		const { id: userId } = req.usuario;
		
		console.log('Starting duplicate cleanup for user:', userId);
		
		// Buscar gastos duplicados basados en criterios similares
		const duplicates = await Gasto.aggregate([
			{ $match: { userId: userId } },
			{
				$group: {
					_id: {
						userId: '$userId',
						vehicleId: '$vehicleId',
						category: '$category',
						amount: '$amount',
						date: '$date'
					},
					count: { $sum: 1 },
					docs: { $push: '$$ROOT' }
				}
			},
			{ $match: { count: { $gt: 1 } } }
		]);
		
		let removedCount = 0;
		
		for (const duplicate of duplicates) {
			// Mantener el primer documento, eliminar los demás
			const docsToRemove = duplicate.docs.slice(1);
			
			for (const doc of docsToRemove) {
				await Gasto.findByIdAndDelete(doc._id);
				removedCount++;
				console.log('Removed duplicate expense:', doc._id);
			}
		}
		
		res.json({
			msg: `Limpieza completada. Se eliminaron ${removedCount} gastos duplicados.`,
			removedCount
		});
		
	} catch (error) {
		console.error('Error cleaning duplicates:', error);
		res.status(500).json({ msg: "Error al limpiar duplicados" });
	}
};

export {
	obtenerGastos,
	obtenerGasto,
	crearGasto,
	actualizarGasto,
	eliminarGasto,
	obtenerResumenGastos,
	subirReciboGasto,
	eliminarReciboGasto,
	limpiarGastosDuplicados,
	upload,
};