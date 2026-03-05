import express from "express";

const router = express.Router();

import {
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
} from "../controllers/mantenimientoController.js";

import checkAuth from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { createMaintenanceSchema, updateMaintenanceSchema, completeMaintenanceSchema } from "../validators/schemas.js";

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Rutas para mantenimientos
router.route("/").get(obtenerMantenimientos).post(validate(createMaintenanceSchema), crearMantenimiento);

// Rutas especiales
router.get("/proximos", obtenerMantenimientosProximos);
router.get("/estadisticas", obtenerEstadisticasMantenimiento);
router.get("/intervalos", obtenerIntervalosMantenimiento);
router.post("/recordatorios", enviarRecordatorios);

router
	.route("/:id")
	.get(obtenerMantenimiento)
	.put(validate(updateMaintenanceSchema), actualizarMantenimiento)
	.delete(eliminarMantenimiento);

// Ruta para marcar como completado
router.put("/:id/completar", validate(completeMaintenanceSchema), marcarComoCompletado);

// Rutas para manejo de recibos
router.post("/:id/recibo", upload.single("receipt"), subirReciboMantenimiento);
router.delete("/:id/recibo", eliminarReciboMantenimiento);

export default router;