import { useState, useEffect } from 'react';
import { vehicleSharingService } from '../services/vehicleSharingApi';
import useSubscription from './useSubscription';

const useVehicleSharing = () => {
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sharedVehicles, setSharedVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { canShareVehicles, canInviteUsers } = useSubscription();

  // Cargar todos los datos de compartir vehículos
  const loadSharingData = async () => {
    if (!canShareVehicles) return;

    setLoading(true);
    setError(null);

    try {
      const [sentResult, receivedResult, sharedResult] = await Promise.all([
        vehicleSharingService.getSentInvitations(),
        vehicleSharingService.getReceivedInvitations(),
        vehicleSharingService.getSharedVehicles()
      ]);

      if (sentResult.error) {
        console.error('Error loading sent invitations:', sentResult.error);
      } else {
        setSentInvitations(sentResult.data);
      }

      if (receivedResult.error) {
        console.error('Error loading received invitations:', receivedResult.error);
      } else {
        setReceivedInvitations(receivedResult.data);
      }

      if (sharedResult.error) {
        console.error('Error loading shared vehicles:', sharedResult.error);
      } else {
        setSharedVehicles(sharedResult.data);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error loading sharing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Invitar usuario
  const inviteUser = async (invitationData) => {
    if (!canInviteUsers) {
      throw new Error('Esta función requiere suscripción Pro');
    }

    setLoading(true);
    try {
      const result = await vehicleSharingService.inviteUser(invitationData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Recargar invitaciones enviadas
      await loadSentInvitations();
      
      return result.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Responder a invitación
  const respondToInvitation = async (invitationToken, action) => {
    setLoading(true);
    try {
      const result = await vehicleSharingService.respondToInvitation(invitationToken, action);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Recargar datos después de responder
      await Promise.all([
        loadReceivedInvitations(),
        loadSharedVehicles()
      ]);
      
      return result.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cargar invitaciones enviadas
  const loadSentInvitations = async () => {
    const result = await vehicleSharingService.getSentInvitations();
    if (result.error) {
      setError(result.error);
    } else {
      setSentInvitations(result.data);
    }
  };

  // Cargar invitaciones recibidas
  const loadReceivedInvitations = async () => {
    const result = await vehicleSharingService.getReceivedInvitations();
    if (result.error) {
      setError(result.error);
    } else {
      setReceivedInvitations(result.data);
    }
  };

  // Cargar vehículos compartidos
  const loadSharedVehicles = async () => {
    const result = await vehicleSharingService.getSharedVehicles();
    if (result.error) {
      setError(result.error);
    } else {
      setSharedVehicles(result.data);
    }
  };

  // Remover usuario de vehículo
  const removeUserFromVehicle = async (vehicleId, userId) => {
    setLoading(true);
    try {
      const result = await vehicleSharingService.removeUserFromVehicle(vehicleId, userId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Recargar datos
      await loadSharingData();
      
      return result.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Salir de vehículo compartido
  const leaveSharedVehicle = async (vehicleId) => {
    setLoading(true);
    try {
      const result = await vehicleSharingService.leaveSharedVehicle(vehicleId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Recargar vehículos compartidos
      await loadSharedVehicles();
      
      return result.data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Limpiar error
  const clearError = () => {
    setError(null);
  };

  // Cargar datos cuando el usuario tenga permisos
  useEffect(() => {
    if (canShareVehicles) {
      loadSharingData();
    }
  }, [canShareVehicles]);

  return {
    // Data
    sentInvitations,
    receivedInvitations,
    sharedVehicles,
    loading,
    error,

    // Actions
    inviteUser,
    respondToInvitation,
    removeUserFromVehicle,
    leaveSharedVehicle,
    loadSharingData,
    clearError,

    // Helpers
    canShareVehicles,
    canInviteUsers,
    
    // Counts
    pendingInvitationsCount: receivedInvitations.filter(inv => inv.status === 'pending').length,
    sharedVehiclesCount: sharedVehicles.length,
    sentInvitationsCount: sentInvitations.length
  };
};

export default useVehicleSharing;