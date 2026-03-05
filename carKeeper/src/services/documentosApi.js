import clienteAxios from '../configs/clinteAxios.jsx';

const documentosService = {
  // Obtener documentos con filtros opcionales
  getDocuments: async (vehicleId = null, type = null, expired = null, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);
      if (type) params.append('type', type);
      if (expired !== null) params.append('expired', expired);
      params.append('page', page);
      params.append('limit', limit);

      const response = await clienteAxios.get(`/documentos?${params.toString()}`);
      return { data: response.data.documentos, pagination: response.data.pagination, error: null };
    } catch (error) {
      console.error('Error getting documents:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener todos los documentos de un usuario
  getAllUserDocuments: async (userId) => {
    try {
      const response = await clienteAxios.get('/documentos');
      return { data: response.data.documentos, error: null };
    } catch (error) {
      console.error('Error getting all user documents:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener documentos próximos a vencer
  getExpiringDocuments: async (userId, daysAhead = 30) => {
    try {
      const params = new URLSearchParams();
      params.append('daysAhead', daysAhead);

      const response = await clienteAxios.get(`/documentos/proximos-vencer?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting expiring documents:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener un documento específico
  getDocument: async (documentoId) => {
    try {
      const response = await clienteAxios.get(`/documentos/${documentoId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting document:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Crear un nuevo documento
  addDocument: async (documentoData, fileUri = null) => {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos del documento
      Object.keys(documentoData).forEach(key => {
        if (documentoData[key] !== null && documentoData[key] !== undefined) {
          formData.append(key, documentoData[key]);
        }
      });

      // Si hay archivo, agregarlo
      if (fileUri) {
        formData.append('file', fileUri);
      }

      const response = await clienteAxios.post('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { id: response.data._id, data: response.data, error: null };
    } catch (error) {
      console.error('Error adding document:', error);
      return { id: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Actualizar un documento
  updateDocument: async (documentoId, updates, newFileUri = null) => {
    try {
      const formData = new FormData();
      
      // Agregar campos de actualización
      Object.keys(updates).forEach(key => {
        if (updates[key] !== null && updates[key] !== undefined) {
          formData.append(key, updates[key]);
        }
      });

      // Si hay nuevo archivo, agregarlo
      if (newFileUri) {
        formData.append('file', newFileUri);
      }

      const response = await clienteAxios.put(`/documentos/${documentoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar un documento
  deleteDocument: async (documentoId, filePath = null) => {
    try {
      await clienteAxios.delete(`/documentos/${documentoId}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Descargar documento
  downloadDocument: async (documentoId, fileName) => {
    try {
      const response = await clienteAxios.get(`/documentos/${documentoId}/descargar`, {
        responseType: 'blob'
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error downloading document:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Eliminar archivo de documento
  deleteDocumentFile: async (documentoId) => {
    try {
      await clienteAxios.delete(`/documentos/${documentoId}/archivo`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting document file:', error);
      return { success: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener estadísticas de documentos
  getDocumentStats: async (vehicleId = null) => {
    try {
      const params = new URLSearchParams();
      if (vehicleId) params.append('vehicleId', vehicleId);

      const response = await clienteAxios.get(`/documentos/estadisticas?${params.toString()}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting document stats:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Enviar recordatorios de vencimiento
  sendExpirationReminders: async () => {
    try {
      const response = await clienteAxios.post('/documentos/recordatorios');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error sending expiration reminders:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Función simulada para seleccionar documento (ya que no tenemos DocumentPicker en web)
  pickDocument: async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          resolve({
            success: true,
            uri: file,
            name: file.name,
            type: file.type,
            size: file.size
          });
        } else {
          resolve({ success: false });
        }
      };
      
      input.click();
    });
  },
};

export { documentosService };