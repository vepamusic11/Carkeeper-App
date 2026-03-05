import clienteAxios from '../configs/clinteAxios.jsx';

const vehiculosService = {
  // Obtener todos los vehículos del usuario
  getVehiculos: async () => {
    try {
      const response = await clienteAxios.get('/vehiculos');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener un vehículo específico
  getVehiculo: async (vehiculoId) => {
    try {
      const response = await clienteAxios.get(`/vehiculos/${vehiculoId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Crear un nuevo vehículo
  addVehiculo: async (vehiculoData) => {
    try {
      const response = await clienteAxios.post('/vehiculos', vehiculoData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Actualizar un vehículo
  updateVehiculo: async (vehiculoId, updates) => {
    try {
      const response = await clienteAxios.put(`/vehiculos/${vehiculoId}`, updates);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar un vehículo
  deleteVehiculo: async (vehiculoId) => {
    try {
      await clienteAxios.delete(`/vehiculos/${vehiculoId}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Subir imagen de vehículo
  uploadVehicleImage: async (vehiculoId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await clienteAxios.post(`/vehiculos/${vehiculoId}/imagen`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error uploading vehicle image:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar imagen de vehículo
  deleteVehicleImage: async (vehiculoId) => {
    try {
      await clienteAxios.delete(`/vehiculos/${vehiculoId}/imagen`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting vehicle image:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },
};

export { vehiculosService };