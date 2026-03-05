import express from "express";
import {
	exportVehicles,
	exportExpenses,
	exportMaintenances,
	exportDocuments,
	exportCompleteData,
	generateExpenseReport
} from "../controllers/exportController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Rutas de exportación
router.get("/vehiculos", exportVehicles);
router.get("/gastos", exportExpenses);
router.get("/mantenimientos", exportMaintenances);
router.get("/documentos", exportDocuments);
router.get("/completo", exportCompleteData);

// Ruta para generar reportes
router.get("/reporte-gastos", generateExpenseReport);

export default router;