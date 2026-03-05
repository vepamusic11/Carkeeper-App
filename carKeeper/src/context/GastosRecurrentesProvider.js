import React, { createContext, useState, useEffect } from 'react';
import { gastosRecurrentesService } from '../services/gastosRecurrentesApi';
import useAuth from '../hooks/useAuth';

export const GastosRecurrentesContext = createContext();

export const GastosRecurrentesProvider = ({ children }) => {
  const [gastosRecurrentes, setGastosRecurrentes] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      loadAll();
    } else {
      setGastosRecurrentes([]);
      setPendientes([]);
    }
  }, [user?._id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [allResult, pendResult] = await Promise.all([
        gastosRecurrentesService.getAll(),
        gastosRecurrentesService.getPending()
      ]);

      if (allResult.data) setGastosRecurrentes(allResult.data);
      if (pendResult.data) setPendientes(pendResult.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar gastos recurrentes');
    } finally {
      setLoading(false);
    }
  };

  const addGastoRecurrente = async (gastoData) => {
    const result = await gastosRecurrentesService.create(gastoData);
    if (result.data) {
      await loadAll();
    }
    return result;
  };

  const updateGastoRecurrente = async (id, updates) => {
    const result = await gastosRecurrentesService.update(id, updates);
    if (result.data) {
      await loadAll();
    }
    return result;
  };

  const deleteGastoRecurrente = async (id) => {
    const result = await gastosRecurrentesService.delete(id);
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  const toggleGastoRecurrente = async (id) => {
    const result = await gastosRecurrentesService.toggle(id);
    if (result.data) {
      await loadAll();
    }
    return result;
  };

  return (
    <GastosRecurrentesContext.Provider
      value={{
        gastosRecurrentes,
        pendientes,
        loading,
        error,
        loadAll,
        addGastoRecurrente,
        updateGastoRecurrente,
        deleteGastoRecurrente,
        toggleGastoRecurrente
      }}
    >
      {children}
    </GastosRecurrentesContext.Provider>
  );
};
