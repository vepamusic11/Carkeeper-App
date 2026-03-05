import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { createFeedbackSchema } from "../validators/schemas.js";
import { crearFeedback, obtenerMisFeedbacks } from "../controllers/feedbackController.js";

const router = express.Router();

router.use(checkAuth);

router.post('/', validate(createFeedbackSchema), crearFeedback);
router.get('/', obtenerMisFeedbacks);

export default router;
