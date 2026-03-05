import React, { useState, useEffect, createContext } from 'react';
import { vehiculosService } from '../services/vehiculos';
import useAuth from '../hooks/useAuth';

const VehiculosContext = createContext();

const VehiculosProvider = ({ children }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, vehicleLimit } = useAuth();

  useEffect(() => {
    if (!user) {
      setVehiculos([]);
      return;
    }

    loadVehiculos();
  }, [user]);

  const loadVehiculos = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await vehiculosService.getVehiculos();

    if (data) {
      console.log('Vehículos cargados:', data);
      // Log de las URLs de imágenes para debug
      data.forEach(vehiculo => {
        if (vehiculo.imageUrl) {
          console.log(`Imagen para ${vehiculo.marca} ${vehiculo.modelo}:`, vehiculo.imageUrl);
        }
      });
      setVehiculos(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
  };

  const uploadVehicleImage = async (imageUri, vehicleId) => {
    if (!imageUri) return null;
    
    // Create file object from URI for React Native
    const imageFile = {
      uri: imageUri,
      type: 'image/jpeg',
      name: `vehicle_${vehicleId}_${Date.now()}.jpg`,
    };
    
    const { data, error } = await vehiculosService.uploadVehicleImage(vehicleId, imageFile);
    
    if (data) {
      return data.imageUrl;
    } else {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addVehiculo = async (vehiculoData, imageFile = null) => {
    // Si vehicleLimit es -1, significa vehículos ilimitados (PRO/Premium)
    if (vehicleLimit !== -1 && vehiculos.length >= vehicleLimit) {
      setError(`Has alcanzado el límite de ${vehicleLimit} vehículo(s) en tu plan actual`);
      return { success: false, error: 'Límite de vehículos alcanzado' };
    }

    setLoading(true);
    setError(null);
    
    const { data, error } = await vehiculosService.addVehiculo({
      ...vehiculoData,
      kilometraje: parseInt(vehiculoData.kilometraje) || 0,
    });
    
    if (data) {
      // Si hay imagen, subirla después de crear el vehículo
      if (imageFile) {
        await uploadVehicleImage(imageFile, data._id);
      }
      
      // Recargar la lista de vehículos
      await loadVehiculos();
      setLoading(false);
      return { success: true, id: data._id };
    } else {
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const updateVehiculo = async (vehiculoId, updates, newImageUri = null) => {
    setLoading(true);
    setError(null);
    
    const updateData = { ...updates };
    if (updates.kilometraje) {
      updateData.kilometraje = parseInt(updates.kilometraje) || 0;
    }

    const { data, error } = await vehiculosService.updateVehiculo(vehiculoId, updateData);
    
    if (data) {
      // Solo subir imagen si es una nueva imagen (no la URL existente)
      if (newImageUri && !newImageUri.startsWith('http')) {
        await uploadVehicleImage(newImageUri, vehiculoId);
      }
      
      // Recargar la lista de vehículos
      await loadVehiculos();
      setLoading(false);
      return { success: true };
    } else {
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const deleteVehiculo = async (vehiculoId) => {
    setLoading(true);
    setError(null);
    
    const { success, error } = await vehiculosService.deleteVehiculo(vehiculoId);
    
    if (success) {
      // Recargar la lista de vehículos
      await loadVehiculos();
      setLoading(false);
      return { success: true };
    } else {
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const getVehiculo = (vehiculoId) => {
    return vehiculos.find(v => v._id === vehiculoId);
  };

  const canAddVehicle = () => {
    // Si vehicleLimit es -1, significa vehículos ilimitados (PRO/Premium)
    return vehicleLimit === -1 || vehiculos.length < vehicleLimit;
  };

  return (
    <VehiculosContext.Provider value={{
      vehiculos,
      loading,
      error,
      addVehiculo,
      updateVehiculo,
      deleteVehiculo,
      getVehiculo,
      canAddVehicle,
      loadVehiculos,
      vehicleCount: vehiculos.length,
      vehicleLimit
    }}>
      {children}
    </VehiculosContext.Provider>
  );
};

export { VehiculosProvider };
export default VehiculosContext;