import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import conectarDB from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import routerUsuarios from "./routes/usuarioRoutes.js";
import routerVehiculos from "./routes/vehiculoRoutes.js";
import routerGastos from "./routes/gastoRoutes.js";
import routerMantenimientos from "./routes/mantenimientoRoutes.js";
import routerDocumentos from "./routes/documentoRoutes.js";
import routerExport from "./routes/exportRoutes.js";
import routerSubscription from "./routes/subscriptionRoutes.js";
import routerVehicleSharing from "./routes/vehicleSharingRoutes.js";
import routerGastosRecurrentes from "./routes/gastoRecurrenteRoutes.js";
import routerFeedback from "./routes/feedbackRoutes.js";
import { enviarRecordatoriosAutomatico } from "./controllers/mantenimientoController.js";

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
	crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir servir uploads
}));

app.use(express.json());

// Rate limiting global
app.use("/api/", apiLimiter);

conectarDB();

// CORS restringido a orígenes conocidos
const allowedOrigins = [
	process.env.FRONTEND_URL,
	"https://deepyze.com.ar",
	"http://localhost:3000",
	"http://localhost:19006",
].filter(Boolean);

app.use(cors({
	origin: (origin, callback) => {
		// Permitir requests sin origin (mobile apps, curl, etc.)
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(null, true); // En mobile apps el origin puede variar
		}
	},
	credentials: true
}));

// Routing
app.use("/api/usuarios", routerUsuarios);
app.use("/api/vehiculos", routerVehiculos);
app.use("/api/gastos", routerGastos);
app.use("/api/mantenimientos", routerMantenimientos);
app.use("/api/documentos", routerDocumentos);
app.use("/api/export", routerExport);
app.use("/api/subscription", routerSubscription);
app.use("/api/vehicle-sharing", routerVehicleSharing);
app.use("/api/gastos-recurrentes", routerGastosRecurrentes);
app.use("/api/feedback", routerFeedback);

// Servir archivos estáticos de uploads
app.use("/uploads", express.static("uploads"));

// Ruta para cron job de recordatorios (protegida con token secreto)
app.get("/api/cron/recordatorios-mantenimiento", (req, res, next) => {
	const cronSecret = req.headers["x-cron-secret"] || req.query.secret;
	if (cronSecret !== process.env.CRON_SECRET) {
		return res.status(403).json({ msg: "No autorizado" });
	}
	next();
}, enviarRecordatoriosAutomatico);

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
	console.log(`Servidor corriendo en el puerto ${PORT}`);
});
