import clienteAxios from '../configs/clinteAxios.jsx';

const gastosService = {
  // Obtener gastos con filtros opcionales
  getExpenses: async (vehicleId = null, startDate = null, endDate = null, category = null, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (category) params.append('category', category);
      params.append('page', page);
      params.append('limit', limit);

      const response = await clienteAxios.get(`/gastos?${params.toString()}`);
      return { data: response.data.gastos, pagination: response.data.pagination, error: null };
    } catch (error) {
      console.error('Error getting expenses:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener todos los gastos de un usuario
  getAllUserExpenses: async (userId, startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await clienteAxios.get(`/gastos?${params.toString()}`);
      return { data: response.data.gastos, error: null };
    } catch (error) {
      console.error('Error getting all user expenses:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener resumen de gastos
  getExpensesSummary: async (userId, vehicleId = null, period = 'month') => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);
      params.append('period', period);

      const response = await clienteAxios.get(`/gastos/resumen?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting expenses summary:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener un gasto específico
  getExpense: async (gastoId) => {
    try {
      const response = await clienteAxios.get(`/gastos/${gastoId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting expense:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Crear un nuevo gasto
  addExpense: async (gastoData) => {
    try {
      const response = await clienteAxios.post('/gastos', gastoData);
      return { id: response.data._id, data: response.data, error: null };
    } catch (error) {
      console.error('Error adding expense:', error);
      return { id: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Actualizar un gasto
  updateExpense: async (gastoId, updates) => {
    try {
      const response = await clienteAxios.put(`/gastos/${gastoId}`, updates);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error updating expense:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar un gasto
  deleteExpense: async (gastoId) => {
    try {
      await clienteAxios.delete(`/gastos/${gastoId}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Subir recibo de gasto
  uploadReceipt: async (gastoId, receiptFile) => {
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      
      const response = await clienteAxios.post(`/gastos/${gastoId}/recibo`, formData, {
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

  // Eliminar recibo de gasto
  deleteReceipt: async (gastoId) => {
    try {
      await clienteAxios.delete(`/gastos/${gastoId}/recibo`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Limpiar gastos duplicados
  cleanDuplicates: async () => {
    try {
      const response = await clienteAxios.post('/gastos/limpiar-duplicados');
      return { success: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },
};

export { gastosService };