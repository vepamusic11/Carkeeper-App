import express from "express";

const router = express.Router();

import {
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
} from "../controllers/gastoController.js";

import checkAuth from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { createExpenseSchema, updateExpenseSchema } from "../validators/schemas.js";

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Rutas para gastos
router.route("/").get(obtenerGastos).post(validate(createExpenseSchema), crearGasto);

// Ruta para obtener resumen
router.get("/resumen", obtenerResumenGastos);

router
	.route("/:id")
	.get(obtenerGasto)
	.put(validate(updateExpenseSchema), actualizarGasto)
	.delete(eliminarGasto);

// Rutas para manejo de recibos
router.post("/:id/recibo", upload.single("receipt"), subirReciboGasto);
router.delete("/:id/recibo", eliminarReciboGasto);

// Ruta de utilidad para limpiar duplicados
router.post("/limpiar-duplicados", limpiarGastosDuplicados);

export default router;