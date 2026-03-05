import express from "express";

const router = express.Router();

import {
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
} from "../controllers/documentoController.js";

import checkAuth from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { createDocumentSchema, updateDocumentSchema } from "../validators/schemas.js";

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Rutas para documentos
router.route("/").get(obtenerDocumentos);
router.post("/", upload.single("file"), validate(createDocumentSchema), crearDocumento);

// Rutas especiales
router.get("/proximos-vencer", obtenerDocumentosProximosAVencer);
router.get("/estadisticas", obtenerEstadisticasDocumentos);
router.post("/recordatorios", enviarRecordatoriosVencimiento);

router
	.route("/:id")
	.get(obtenerDocumento)
	.delete(eliminarDocumento);

router.put("/:id", upload.single("file"), validate(updateDocumentSchema), actualizarDocumento);

// Rutas para manejo de archivos
router.get("/:id/descargar", descargarDocumento);
router.delete("/:id/archivo", eliminarArchivoDocumento);

export default router;