import { useContext } from 'react';
import GastosContext from '../context/GastosProvider';

const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe ser usado dentro de GastosProvider');
  }
  return context;
};

export default useGastos;