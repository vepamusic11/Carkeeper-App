import GastoRecurrente from "../models/GastoRecurrente.js";
import Vehiculo from "../models/Vehiculo.js";

const obtenerGastosRecurrentes = async (req, res) => {
  try {
    const gastos = await GastoRecurrente.find({ userId: req.user._id })
      .populate('vehicleId', 'marca modelo ano')
      .sort({ nextDueDate: 1 });
    res.json(gastos);
  } catch (error) {
    console.error('Error al obtener gastos recurrentes:', error);
    res.status(500).json({ msg: 'Error al obtener gastos recurrentes' });
  }
};

const obtenerPendientes = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const pendientes = await GastoRecurrente.find({
      userId: req.user._id,
      isActive: true,
      nextDueDate: { $lte: nextWeek }
    })
      .populate('vehicleId', 'marca modelo ano')
      .sort({ nextDueDate: 1 });

    res.json(pendientes);
  } catch (error) {
    console.error('Error al obtener pendientes:', error);
    res.status(500).json({ msg: 'Error al obtener gastos pendientes' });
  }
};

const crearGastoRecurrente = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const vehiculo = await Vehiculo.findOne({ _id: vehicleId, userId: req.user._id, isActive: true });
    if (!vehiculo) {
      return res.status(404).json({ msg: 'Vehículo no encontrado' });
    }

    const gasto = new GastoRecurrente({
      ...req.body,
      userId: req.user._id
    });

    await gasto.save();

    const populated = await GastoRecurrente.findById(gasto._id)
      .populate('vehicleId', 'marca modelo ano');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error al crear gasto recurrente:', error);
    res.status(500).json({ msg: 'Error al crear gasto recurrente' });
  }
};

const actualizarGastoRecurrente = async (req, res) => {
  try {
    const gasto = await GastoRecurrente.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!gasto) {
      return res.status(404).json({ msg: 'Gasto recurrente no encontrado' });
    }

    Object.assign(gasto, req.body);
    await gasto.save();

    const populated = await GastoRecurrente.findById(gasto._id)
      .populate('vehicleId', 'marca modelo ano');

    res.json(populated);
  } catch (error) {
    console.error('Error al actualizar gasto recurrente:', error);
    res.status(500).json({ msg: 'Error al actualizar gasto recurrente' });
  }
};

const eliminarGastoRecurrente = async (req, res) => {
  try {
    const gasto = await GastoRecurrente.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!gasto) {
      return res.status(404).json({ msg: 'Gasto recurrente no encontrado' });
    }

    res.json({ msg: 'Gasto recurrente eliminado' });
  } catch (error) {
    console.error('Error al eliminar gasto recurrente:', error);
    res.status(500).json({ msg: 'Error al eliminar gasto recurrente' });
  }
};

const toggleGastoRecurrente = async (req, res) => {
  try {
    const gasto = await GastoRecurrente.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!gasto) {
      return res.status(404).json({ msg: 'Gasto recurrente no encontrado' });
    }

    gasto.isActive = !gasto.isActive;
    await gasto.save();

    const populated = await GastoRecurrente.findById(gasto._id)
      .populate('vehicleId', 'marca modelo ano');

    res.json(populated);
  } catch (error) {
    console.error('Error al togglear gasto recurrente:', error);
    res.status(500).json({ msg: 'Error al cambiar estado' });
  }
};

export {
  obtenerGastosRecurrentes,
  obtenerPendientes,
  crearGastoRecurrente,
  actualizarGastoRecurrente,
  eliminarGastoRecurrente,
  toggleGastoRecurrente
};
