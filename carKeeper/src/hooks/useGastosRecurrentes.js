import { useContext } from 'react';
import { GastosRecurrentesContext } from '../context/GastosRecurrentesProvider';

const useGastosRecurrentes = () => {
  const context = useContext(GastosRecurrentesContext);
  if (!context) {
    throw new Error('useGastosRecurrentes debe ser usado dentro de GastosRecurrentesProvider');
  }
  return context;
};

export default useGastosRecurrentes;
