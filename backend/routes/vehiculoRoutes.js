import express from "express";

const router = express.Router();

import {
	obtenerVehiculos,
	obtenerVehiculo,
	crearVehiculo,
	actualizarVehiculo,
	eliminarVehiculo,
	subirImagenVehiculo,
	eliminarImagenVehiculo,
	upload,
} from "../controllers/vehiculoController.js";

import checkAuth from "../middleware/checkAuth.js";
import { checkVehicleLimit } from "../middleware/checkSubscription.js";
import validate from "../middleware/validate.js";
import { createVehicleSchema, updateVehicleSchema } from "../validators/schemas.js";

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Rutas para vehículos
router.route("/").get(obtenerVehiculos).post(checkVehicleLimit, validate(createVehicleSchema), crearVehiculo);

router
	.route("/:id")
	.get(obtenerVehiculo)
	.put(validate(updateVehicleSchema), actualizarVehiculo)
	.delete(eliminarVehiculo);

// Rutas para manejo de imágenes
router.post("/:id/imagen", upload.single("image"), subirImagenVehiculo);
router.delete("/:id/imagen", eliminarImagenVehiculo);

export default router;