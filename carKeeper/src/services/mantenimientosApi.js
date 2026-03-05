import clienteAxios from '../configs/clinteAxios.jsx';

const mantenimientosService = {
  // Obtener mantenimientos con filtros opcionales
  getMaintenances: async (vehicleId = null, status = null, startDate = null, endDate = null, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) {
        // Ensure vehicleId is a string
        let vehicleIdString;
        if (typeof vehicleId === 'object') {
          // If it's an object, try to extract the _id field
          vehicleIdString = vehicleId._id || vehicleId.id || vehicleId.toString();
        } else {
          vehicleIdString = vehicleId;
        }
        params.append('vehicleId', vehicleIdString);
      }
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page);
      params.append('limit', limit);

      const response = await clienteAxios.get(`/mantenimientos?${params.toString()}`);
      return { data: response.data.mantenimientos, pagination: response.data.pagination, error: null };
    } catch (error) {
      console.error('Error getting maintenances:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener todos los mantenimientos del usuario
  getAllUserMaintenances: async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', 1000); // Get all maintenances

      const response = await clienteAxios.get(`/mantenimientos?${params.toString()}`);
      return { data: response.data.mantenimientos, error: null };
    } catch (error) {
      console.error('Error getting all user maintenances:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener mantenimientos próximos
  getUpcomingMaintenances: async (userId, daysAhead = 30) => {
    try {
      const params = new URLSearchParams();
      params.append('daysAhead', daysAhead);

      const response = await clienteAxios.get(`/mantenimientos/proximos?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting upcoming maintenances:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener un mantenimiento específico
  getMaintenance: async (mantenimientoId) => {
    try {
      const response = await clienteAxios.get(`/mantenimientos/${mantenimientoId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting maintenance:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Crear un nuevo mantenimiento
  addMaintenance: async (mantenimientoData) => {
    try {
      console.log('=== SENDING MAINTENANCE DATA TO BACKEND ===');
      console.log('Data:', JSON.stringify(mantenimientoData, null, 2));
      console.log('VehicleId type:', typeof mantenimientoData.vehicleId);
      console.log('VehicleId value:', mantenimientoData.vehicleId);
      
      const response = await clienteAxios.post('/mantenimientos', mantenimientoData);
      return { id: response.data._id, data: response.data, error: null };
    } catch (error) {
      console.error('Error adding maintenance:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { id: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Actualizar un mantenimiento
  updateMaintenance: async (mantenimientoId, updates) => {
    try {
      const response = await clienteAxios.put(`/mantenimientos/${mantenimientoId}`, updates);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error updating maintenance:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar un mantenimiento
  deleteMaintenance: async (mantenimientoId) => {
    try {
      await clienteAxios.delete(`/mantenimientos/${mantenimientoId}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Marcar mantenimiento como completado
  markAsCompleted: async (mantenimientoId, completionData = {}) => {
    try {
      const response = await clienteAxios.put(`/mantenimientos/${mantenimientoId}/completar`, completionData);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error marking maintenance as completed:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener estadísticas de mantenimiento
  getMaintenanceStats: async (vehicleId = null, year = null) => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (year) params.append('year', year);

      const response = await clienteAxios.get(`/mantenimientos/estadisticas?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting maintenance stats:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Subir recibo de mantenimiento
  uploadReceipt: async (mantenimientoId, receiptFile) => {
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      
      const response = await clienteAxios.post(`/mantenimientos/${mantenimientoId}/recibo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error uploading receipt:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar recibo de mantenimiento
  deleteReceipt: async (mantenimientoId) => {
    try {
      await clienteAxios.delete(`/mantenimientos/${mantenimientoId}/recibo`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Enviar recordatorios
  sendReminders: async () => {
    try {
      const response = await clienteAxios.post('/mantenimientos/recordatorios');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error sending reminders:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },
};

export { mantenimientosService };