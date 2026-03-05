import React, { useState, useEffect, createContext } from 'react';
import { mantenimientosService } from '../services/mantenimientosApi';
import useAuth from '../hooks/useAuth';

const MantenimientosContext = createContext();

const MantenimientosProvider = ({ children }) => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [upcomingMaintenances, setUpcomingMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUpcomingMaintenances();
    } else {
      setMantenimientos([]);
      setUpcomingMaintenances([]);
    }
  }, [user]);

  const loadUpcomingMaintenances = async () => {
    if (!user) return;
    
    const { data, error } = await mantenimientosService.getUpcomingMaintenances(user._id);
    if (data) {
      setUpcomingMaintenances(data);
      // Las notificaciones ahora se manejan en el backend
    }
  };

  const loadMaintenancesByVehicle = async (vehicleId) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await mantenimientosService.getMaintenances(vehicleId);
    
    if (data) {
      setMantenimientos(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  const loadAllUserMaintenances = async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await mantenimientosService.getAllUserMaintenances();
    
    if (data) {
      setMantenimientos(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  const addMantenimiento = async (maintenanceDataOrVehicleId, maintenanceData = null) => {
    setLoading(true);
    setError(null);
    
    // Support both old and new API
    let completeData;
    let vehicleId;
    
    if (typeof maintenanceDataOrVehicleId === 'string' && maintenanceData) {
      // Old API: addMantenimiento(vehicleId, maintenanceData)
      vehicleId = maintenanceDataOrVehicleId;
      completeData = {
        ...maintenanceData,
        vehicleId,
        status: maintenanceData.status || 'pending' // Usar el status proporcionado o 'pending' por defecto
      };
    } else {
      // New API: addMantenimiento(maintenanceData) - maintenanceData already includes vehicleId
      completeData = maintenanceDataOrVehicleId;
      vehicleId = completeData.vehicleId;
    }
    
    const { id, error } = await mantenimientosService.addMaintenance(completeData);
    
    if (id) {
      // Solo recargar los datos necesarios
      await loadUpcomingMaintenances();
      // Solo recargar todos los mantenimientos si estamos en la vista general
      if (mantenimientos.length > 0) {
        await loadAllUserMaintenances();
      }
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success: !!id, error };
  };

  const updateMantenimiento = async (maintenanceId, updates) => {
    setLoading(true);
    setError(null);
    
    const { success, error } = await mantenimientosService.updateMaintenance(maintenanceId, updates);
    
    if (success) {
      await loadAllUserMaintenances();
      await loadUpcomingMaintenances();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const deleteMantenimiento = async (maintenanceId) => {
    setLoading(true);
    setError(null);
    
    const maintenance = mantenimientos.find(m => m._id === maintenanceId);
    const { success, error } = await mantenimientosService.deleteMaintenance(maintenanceId);
    
    if (success) {
      await loadAllUserMaintenances();
      await loadUpcomingMaintenances();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const markAsCompleted = async (maintenanceId, completionData = {}) => {
    return await mantenimientosService.markAsCompleted(mantenanceId, completionData);
  };

  const getNextMaintenance = (vehicleId) => {
    return upcomingMaintenances
      .filter(m => m.vehicleId === vehicleId)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  };

  return (
    <MantenimientosContext.Provider value={{
      mantenimientos,
      upcomingMaintenances,
      loading,
      error,
      loadMaintenancesByVehicle,
      loadAllUserMaintenances,
      addMantenimiento,
      updateMantenimiento,
      deleteMantenimiento,
      markAsCompleted,
      getNextMaintenance,
      refreshData: () => {
        loadAllUserMaintenances();
        loadUpcomingMaintenances();
      }
    }}>
      {children}
    </MantenimientosContext.Provider>
  );
};

export { MantenimientosProvider };
export default MantenimientosContext;