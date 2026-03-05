import { useContext } from 'react';
import MantenimientosContext from '../context/MantenimientosProvider';

const useMantenimientos = () => {
  const context = useContext(MantenimientosContext);
  if (!context) {
    throw new Error('useMantenimientos debe ser usado dentro de MantenimientosProvider');
  }
  return context;
};

export default useMantenimientos;