import express from "express";
import checkAuth from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { createRecurringExpenseSchema, updateRecurringExpenseSchema } from "../validators/schemas.js";
import {
  obtenerGastosRecurrentes,
  obtenerPendientes,
  crearGastoRecurrente,
  actualizarGastoRecurrente,
  eliminarGastoRecurrente,
  toggleGastoRecurrente
} from "../controllers/gastoRecurrenteController.js";

const router = express.Router();

router.use(checkAuth);

router.get('/', obtenerGastosRecurrentes);
router.get('/pendientes', obtenerPendientes);
router.post('/', validate(createRecurringExpenseSchema), crearGastoRecurrente);
router.put('/:id', validate(updateRecurringExpenseSchema), actualizarGastoRecurrente);
router.delete('/:id', eliminarGastoRecurrente);
router.patch('/:id/toggle', toggleGastoRecurrente);

export default router;
