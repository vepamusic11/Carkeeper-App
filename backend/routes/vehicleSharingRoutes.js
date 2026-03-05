import express from "express";
import {
	inviteUserToVehicle,
	getSentInvitations,
	getReceivedInvitations,
	respondToInvitation,
	getSharedVehicles,
	removeUserFromVehicle,
	leaveSharedVehicle
} from "../controllers/vehicleSharingController.js";
import checkAuth from "../middleware/checkAuth.js";
import { requireFeature } from "../middleware/checkSubscription.js";
import validate from "../middleware/validate.js";
import { inviteUserSchema, respondInvitationSchema } from "../validators/schemas.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(checkAuth);

// Invitar usuario a compartir vehículo (requiere Pro)
router.post("/invite", requireFeature('userInvitations'), validate(inviteUserSchema), inviteUserToVehicle);

// Obtener invitaciones enviadas
router.get("/sent", getSentInvitations);

// Obtener invitaciones recibidas
router.get("/received", getReceivedInvitations);

// Responder a una invitación
router.post("/respond/:invitationToken", validate(respondInvitationSchema), respondToInvitation);

// Obtener vehículos compartidos conmigo
router.get("/shared-vehicles", getSharedVehicles);

// Remover usuario de vehículo compartido (solo owner)
router.delete("/vehicle/:vehicleId/user/:userId", removeUserFromVehicle);

// Salir de un vehículo compartido
router.post("/leave/:vehicleId", leaveSharedVehicle);

export default router;