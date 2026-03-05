import clienteAxios from '../configs/clinteAxios.jsx';

export const gastosRecurrentesService = {
  getAll: async () => {
    try {
      const { data } = await clienteAxios.get('/gastos-recurrentes');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.msg || 'Error al obtener gastos recurrentes' };
    }
  },

  getPending: async () => {
    try {
      const { data } = await clienteAxios.get('/gastos-recurrentes/pendientes');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.msg || 'Error al obtener pendientes' };
    }
  },

  create: async (gastoData) => {
    try {
      const { data } = await clienteAxios.post('/gastos-recurrentes', gastoData);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.msg || 'Error al crear gasto recurrente' };
    }
  },

  update: async (id, updates) => {
    try {
      const { data } = await clienteAxios.put(`/gastos-recurrentes/${id}`, updates);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.msg || 'Error al actualizar gasto recurrente' };
    }
  },

  delete: async (id) => {
    try {
      await clienteAxios.delete(`/gastos-recurrentes/${id}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Error al eliminar gasto recurrente' };
    }
  },

  toggle: async (id) => {
    try {
      const { data } = await clienteAxios.patch(`/gastos-recurrentes/${id}/toggle`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.msg || 'Error al cambiar estado' };
    }
  }
};
