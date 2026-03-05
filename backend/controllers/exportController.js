import Vehiculo from "../models/Vehiculo.js";
import Gasto from "../models/Gasto.js";
import Mantenimiento from "../models/Mantenimiento.js";
import Documento from "../models/Documento.js";
import csvWriter from "csv-writer";

// Exportar vehículos en formato CSV
const exportVehicles = async (req, res) => {
	try {
		const { usuario } = req;
		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		const vehiculos = await Vehiculo.find({ userId: usuario._id, isActive: true });

		const csvStringifier = csvWriter.createObjectCsvStringifier({
			header: [
				{ id: '_id', title: 'ID' },
				{ id: 'marca', title: 'Marca' },
				{ id: 'modelo', title: 'Modelo' },
				{ id: 'ano', title: 'Año' },
				{ id: 'color', title: 'Color' },
				{ id: 'kilometraje', title: 'Kilometraje' },
				{ id: 'vin', title: 'VIN' },
				{ id: 'patente', title: 'Patente' },
				{ id: 'createdAt', title: 'Fecha de registro' }
			]
		});

		const csvContent = csvStringifier.getHeaderString() +
			csvStringifier.stringifyRecords(vehiculos.map(v => ({
				...v.toObject(),
				createdAt: v.createdAt ? v.createdAt.toLocaleDateString('es-ES') : ''
			})));

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="vehiculos_${new Date().toISOString().split('T')[0]}.csv"`);
		res.send(csvContent);

	} catch (error) {
		console.error("Error exportando vehículos:", error);
		res.status(500).json({
			success: false,
			error: "Error al exportar vehículos"
		});
	}
};

// Exportar gastos en formato CSV
const exportExpenses = async (req, res) => {
	try {
		const { usuario } = req;
		const { startDate, endDate, vehicleId } = req.query;

		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		let query = { userId: usuario._id };

		if (startDate && endDate) {
			query.date = {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			};
		}

		if (vehicleId && vehicleId !== 'all') {
			query.vehicleId = vehicleId;
		}

		const gastos = await Gasto.find(query).populate('vehicleId', 'marca modelo');

		const csvStringifier = csvWriter.createObjectCsvStringifier({
			header: [
				{ id: '_id', title: 'ID' },
				{ id: 'fecha', title: 'Fecha' },
				{ id: 'vehiculo', title: 'Vehículo' },
				{ id: 'categoria', title: 'Categoría' },
				{ id: 'descripcion', title: 'Descripción' },
				{ id: 'monto', title: 'Monto' },
				{ id: 'kilometraje', title: 'Kilometraje' },
				{ id: 'lugar', title: 'Lugar' },
				{ id: 'notas', title: 'Notas' }
			]
		});

		const csvContent = csvStringifier.getHeaderString() +
			csvStringifier.stringifyRecords(gastos.map(g => ({
				_id: g._id,
				fecha: g.date ? g.date.toLocaleDateString('es-ES') : '',
				vehiculo: g.vehicleId ? `${g.vehicleId.marca} ${g.vehicleId.modelo}` : 'Vehículo eliminado',
				categoria: getCategoryName(g.category),
				descripcion: g.description || '',
				monto: g.amount || 0,
				kilometraje: g.kilometraje || '',
				lugar: g.location || '',
				notas: g.notas || ''
			})));

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="gastos_${new Date().toISOString().split('T')[0]}.csv"`);
		res.send(csvContent);

	} catch (error) {
		console.error("Error exportando gastos:", error);
		res.status(500).json({
			success: false,
			error: "Error al exportar gastos"
		});
	}
};

// Exportar mantenimientos en formato CSV
const exportMaintenances = async (req, res) => {
	try {
		const { usuario } = req;
		const { startDate, endDate, vehicleId } = req.query;

		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		let query = { userId: usuario._id };

		if (startDate && endDate) {
			query.date = {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			};
		}

		if (vehicleId && vehicleId !== 'all') {
			query.vehicleId = vehicleId;
		}

		const mantenimientos = await Mantenimiento.find(query).populate('vehicleId', 'marca modelo');

		const csvStringifier = csvWriter.createObjectCsvStringifier({
			header: [
				{ id: '_id', title: 'ID' },
				{ id: 'fecha', title: 'Fecha' },
				{ id: 'vehiculo', title: 'Vehículo' },
				{ id: 'tipo', title: 'Tipo' },
				{ id: 'descripcion', title: 'Descripción' },
				{ id: 'costo', title: 'Costo' },
				{ id: 'taller', title: 'Taller' },
				{ id: 'kilometrajeActual', title: 'Kilometraje actual' },
				{ id: 'proximoMantenimiento', title: 'Próximo mantenimiento (km)' },
				{ id: 'estado', title: 'Estado' },
				{ id: 'notas', title: 'Notas' }
			]
		});

		const csvContent = csvStringifier.getHeaderString() +
			csvStringifier.stringifyRecords(mantenimientos.map(m => ({
				_id: m._id,
				fecha: m.date ? m.date.toLocaleDateString('es-ES') : '',
				vehiculo: m.vehicleId ? `${m.vehicleId.marca} ${m.vehicleId.modelo}` : 'Vehículo eliminado',
				tipo: getMaintenanceTypeName(m.type),
				descripcion: m.description || '',
				costo: m.cost || 0,
				taller: m.workshop || '',
				kilometrajeActual: m.currentKilometraje || '',
				proximoMantenimiento: m.nextMaintenanceKm || '',
				estado: m.status === 'completed' ? 'Completado' : 'Pendiente',
				notas: m.notes || ''
			})));

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="mantenimientos_${new Date().toISOString().split('T')[0]}.csv"`);
		res.send(csvContent);

	} catch (error) {
		console.error("Error exportando mantenimientos:", error);
		res.status(500).json({
			success: false,
			error: "Error al exportar mantenimientos"
		});
	}
};

// Exportar documentos en formato CSV
const exportDocuments = async (req, res) => {
	try {
		const { usuario } = req;
		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		const documentos = await Documento.find({ userId: usuario._id }).populate('vehicleId', 'marca modelo');

		const csvStringifier = csvWriter.createObjectCsvStringifier({
			header: [
				{ id: '_id', title: 'ID' },
				{ id: 'title', title: 'Nombre' },
				{ id: 'type', title: 'Tipo' },
				{ id: 'vehiculo', title: 'Vehículo' },
				{ id: 'description', title: 'Descripción' },
				{ id: 'expirationDate', title: 'Fecha vencimiento' },
				{ id: 'fechaCreacion', title: 'Fecha creación' },
				{ id: 'tieneArchivo', title: 'Tiene archivo' }
			]
		});

		const csvContent = csvStringifier.getHeaderString() +
			csvStringifier.stringifyRecords(documentos.map(d => ({
				_id: d._id,
				title: d.title || '',
				type: getDocumentTypeName(d.type),
				vehiculo: d.vehicleId ? `${d.vehicleId.marca} ${d.vehicleId.modelo}` : 'Vehículo eliminado',
				description: d.description || '',
				expirationDate: d.expirationDate ? d.expirationDate.toLocaleDateString('es-ES') : '',
				fechaCreacion: d.createdAt ? d.createdAt.toLocaleDateString('es-ES') : '',
				tieneArchivo: d.fileUrl ? 'Sí' : 'No'
			})));

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="documentos_${new Date().toISOString().split('T')[0]}.csv"`);
		res.send(csvContent);

	} catch (error) {
		console.error("Error exportando documentos:", error);
		res.status(500).json({
			success: false,
			error: "Error al exportar documentos"
		});
	}
};

// Exportar datos completos en formato JSON
const exportCompleteData = async (req, res) => {
	try {
		const { usuario } = req;
		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		const [vehiculos, gastos, mantenimientos, documentos] = await Promise.all([
			Vehiculo.find({ userId: usuario._id, isActive: true }),
			Gasto.find({ userId: usuario._id }).populate('vehicleId', 'marca modelo'),
			Mantenimiento.find({ userId: usuario._id }).populate('vehicleId', 'marca modelo'),
			Documento.find({ userId: usuario._id }).populate('vehicleId', 'marca modelo')
		]);

		const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.amount || 0), 0);

		const completeData = {
			exportDate: new Date().toISOString(),
			usuario: {
				id: usuario._id,
				email: usuario.email,
				nombre: usuario.nombre,
				apellido: usuario.apellido,
				displayName: usuario.displayName,
				fechaRegistro: usuario.createdAt
			},
			summary: {
				totalVehiculos: vehiculos.length,
				totalGastos: gastos.length,
				totalMantenimientos: mantenimientos.length,
				totalDocumentos: documentos.length,
				montoTotalGastos: totalGastos
			},
			vehiculos: vehiculos.map(v => v.toObject()),
			gastos: gastos.map(g => g.toObject()),
			mantenimientos: mantenimientos.map(m => m.toObject()),
			documentos: documentos.map(d => d.toObject())
		};

		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Disposition', `attachment; filename="carkeeper_backup_${new Date().toISOString().split('T')[0]}.json"`);
		res.json(completeData);

	} catch (error) {
		console.error("Error exportando datos completos:", error);
		res.status(500).json({
			success: false,
			error: "Error al exportar datos completos"
		});
	}
};

// Generar reporte de gastos
const generateExpenseReport = async (req, res) => {
	try {
		const { usuario } = req;
		const { startDate, endDate, vehicleId } = req.query;

		if (!usuario) {
			return res.status(401).json({
				success: false,
				error: "Usuario no autenticado"
			});
		}

		if (!startDate || !endDate) {
			return res.status(400).json({
				success: false,
				error: "Se requieren fechas de inicio y fin"
			});
		}

		let query = {
			userId: usuario._id,
			date: {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			}
		};

		if (vehicleId && vehicleId !== 'all') {
			query.vehicleId = vehicleId;
		}

		const gastos = await Gasto.find(query).populate('vehicleId', 'marca modelo');

		const totalMonto = gastos.reduce((sum, gasto) => sum + (gasto.amount || 0), 0);
		const categoryTotals = {};
		const vehicleTotals = {};

		gastos.forEach(gasto => {
			const categoria = gasto.category || 'otro';
			categoryTotals[categoria] = (categoryTotals[categoria] || 0) + (gasto.amount || 0);

			const vehiculo = gasto.vehicleId;
			const vehiculoNombre = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Vehículo eliminado';
			vehicleTotals[vehiculoNombre] = (vehicleTotals[vehiculoNombre] || 0) + (gasto.amount || 0);
		});

		const reportData = {
			periodo: {
				inicio: new Date(startDate).toLocaleDateString('es-ES'),
				fin: new Date(endDate).toLocaleDateString('es-ES')
			},
			resumen: {
				totalGastos: gastos.length,
				montoTotal: totalMonto,
				promedioGasto: gastos.length > 0 ? totalMonto / gastos.length : 0
			},
			porCategoria: Object.entries(categoryTotals).map(([categoria, monto]) => ({
				categoria: getCategoryName(categoria),
				monto,
				porcentaje: totalMonto > 0 ? ((monto / totalMonto) * 100).toFixed(1) : '0.0'
			})),
			porVehiculo: Object.entries(vehicleTotals).map(([vehiculo, monto]) => ({
				vehiculo,
				monto,
				porcentaje: totalMonto > 0 ? ((monto / totalMonto) * 100).toFixed(1) : '0.0'
			})),
			gastos: gastos.map(g => g.toObject())
		};

		res.json({
			success: true,
			data: reportData
		});

	} catch (error) {
		console.error("Error generando reporte:", error);
		res.status(500).json({
			success: false,
			error: "Error al generar reporte de gastos"
		});
	}
};

// Funciones auxiliares
const getCategoryName = (category) => {
	const categories = {
		combustible: 'Combustible',
		mantenimiento: 'Mantenimiento',
		maintenance: 'Mantenimiento',
		seguro: 'Seguro',
		registro: 'Registro',
		multas: 'Multas',
		peajes: 'Peajes',
		estacionamiento: 'Estacionamiento',
		lavado: 'Lavado',
		accesorios: 'Accesorios',
		reparacion: 'Reparación',
		otro: 'Otros',
		otros: 'Otros'
	};
	return categories[category] || category;
};

const getMaintenanceTypeName = (type) => {
	const types = {
		cambio_aceite: 'Cambio de aceite',
		rotacion_neumaticos: 'Rotación de neumáticos',
		servicio_frenos: 'Servicio de frenos',
		inspeccion: 'Inspección general',
		cambio_filtros: 'Cambio de filtros',
		bateria: 'Batería',
		alineacion: 'Alineación',
		general: 'General'
	};
	return types[type] || type;
};

const getDocumentTypeName = (type) => {
	const types = {
		seguro: 'Seguro',
		registro: 'Registro',
		inspeccion: 'Inspección/VTV',
		licencia: 'Licencia',
		manual: 'Manual',
		recibo: 'Recibo/Factura',
		garantia: 'Garantía',
		otros: 'Otros'
	};
	return types[type] || type;
};

export {
	exportVehicles,
	exportExpenses,
	exportMaintenances,
	exportDocuments,
	exportCompleteData,
	generateExpenseReport
};
