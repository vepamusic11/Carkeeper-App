import { useContext } from 'react';
import VehiculosContext from '../context/VehiculosProvider';

const useVehiculos = () => {
  const context = useContext(VehiculosContext);
  if (!context) {
    throw new Error('useVehiculos debe ser usado dentro de VehiculosProvider');
  }
  return context;
};

export default useVehiculos;