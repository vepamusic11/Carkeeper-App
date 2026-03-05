import mongoose from "mongoose";

const gastoRecurrenteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: true
  },
  category: {
    type: String,
    enum: ['combustible', 'mantenimiento', 'maintenance', 'seguro', 'registro', 'multas', 'peajes', 'estacionamiento', 'lavado', 'accesorios', 'reparacion', 'otro'],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'],
    required: true
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastGeneratedDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 10
  }
}, {
  timestamps: true
});

gastoRecurrenteSchema.index({ userId: 1, isActive: 1 });
gastoRecurrenteSchema.index({ userId: 1, nextDueDate: 1 });
gastoRecurrenteSchema.index({ vehicleId: 1 });

const GastoRecurrente = mongoose.model('GastoRecurrente', gastoRecurrenteSchema);

export default GastoRecurrente;
