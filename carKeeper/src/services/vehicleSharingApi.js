import clienteAxios from '../configs/clinteAxios.jsx';

const vehicleSharingService = {
  // Invitar usuario a compartir vehículo
  inviteUser: async (invitationData) => {
    try {
      console.log('Sending invitation request:', invitationData);
      const response = await clienteAxios.post('/vehicle-sharing/invite', invitationData);
      console.log('Invitation response:', response.data);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error inviting user:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message;
      
      return { data: null, error: errorMessage };
    }
  },

  // Obtener invitaciones enviadas
  getSentInvitations: async () => {
    try {
      const response = await clienteAxios.get('/vehicle-sharing/sent');
      return { data: response.data.invitations, error: null };
    } catch (error) {
      console.error('Error getting sent invitations:', error);
      return { data: [], error: error.response?.data?.error || error.message };
    }
  },

  // Obtener invitaciones recibidas
  getReceivedInvitations: async () => {
    try {
      const response = await clienteAxios.get('/vehicle-sharing/received');
      return { data: response.data.invitations, error: null };
    } catch (error) {
      console.error('Error getting received invitations:', error);
      return { data: [], error: error.response?.data?.error || error.message };
    }
  },

  // Responder a una invitación
  respondToInvitation: async (invitationToken, action) => {
    try {
      const response = await clienteAxios.post(`/vehicle-sharing/respond/${invitationToken}`, { action });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error responding to invitation:', error);
      return { data: null, error: error.response?.data?.error || error.message };
    }
  },

  // Obtener vehículos compartidos conmigo
  getSharedVehicles: async () => {
    try {
      const response = await clienteAxios.get('/vehicle-sharing/shared-vehicles');
      return { data: response.data.vehicles, error: null };
    } catch (error) {
      console.error('Error getting shared vehicles:', error);
      return { data: [], error: error.response?.data?.error || error.message };
    }
  },

  // Remover usuario de vehículo compartido (solo owner)
  removeUserFromVehicle: async (vehicleId, userId) => {
    try {
      const response = await clienteAxios.delete(`/vehicle-sharing/vehicle/${vehicleId}/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error removing user from vehicle:', error);
      return { data: null, error: error.response?.data?.error || error.message };
    }
  },

  // Salir de un vehículo compartido
  leaveSharedVehicle: async (vehicleId) => {
    try {
      const response = await clienteAxios.post(`/vehicle-sharing/leave/${vehicleId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error leaving shared vehicle:', error);
      return { data: null, error: error.response?.data?.error || error.message };
    }
  }
};

export { vehicleSharingService };