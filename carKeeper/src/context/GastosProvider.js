import React, { useState, useEffect, createContext } from 'react';
import { gastosService } from '../services/gastosApi';
import useAuth from '../hooks/useAuth';

const GastosContext = createContext();

const GastosProvider = ({ children }) => {
  const [gastos, setGastos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSummary();
    } else {
      setGastos([]);
      setSummary(null);
    }
  }, [user]);

  const loadSummary = async (period = 'month', vehicleId = null) => {
    if (!user) return;
    
    const { data, error } = await gastosService.getExpensesSummary(user._id, vehicleId, period);
    if (data) {
      setSummary(data);
    }
  };

  const loadGastosByVehicle = async (vehicleId, startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await gastosService.getExpenses(vehicleId, startDate, endDate);
    
    if (data) {
      setGastos(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  const loadAllGastos = async (startDate = null, endDate = null) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await gastosService.getAllUserExpenses(user._id, startDate, endDate);
    
    if (data) {
      setGastos(data);
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { data, error };
  };

  const addGasto = async (vehicleId, gastoData) => {
    setLoading(true);
    setError(null);
    
    const completeData = {
      ...gastoData,
      vehicleId,
      amount: parseFloat(gastoData.amount) || 0
    };
    
    const { id, error } = await gastosService.addExpense(completeData);
    
    if (id) {
      await loadAllGastos();
      await loadSummary();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success: !!id, error };
  };

  const updateGasto = async (gastoId, updates) => {
    setLoading(true);
    setError(null);
    
    if (updates.amount) {
      updates.amount = parseFloat(updates.amount) || 0;
    }
    
    const { success, error } = await gastosService.updateExpense(gastoId, updates);
    
    if (success) {
      await loadAllGastos();
      await loadSummary();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const deleteGasto = async (gastoId) => {
    setLoading(true);
    setError(null);
    
    const { success, error } = await gastosService.deleteExpense(gastoId);
    
    if (success) {
      await loadAllGastos();
      await loadSummary();
    } else {
      setError(error);
    }
    
    setLoading(false);
    return { success, error };
  };

  const getGastosByCategory = (categoryFilter = null) => {
    if (!categoryFilter) return gastos;
    return gastos.filter(gasto => gasto.category === categoryFilter);
  };

  const getGastosByVehicle = (vehicleId) => {
    return gastos.filter(gasto => gasto.vehicleId === vehicleId);
  };

  return (
    <GastosContext.Provider value={{
      gastos,
      summary,
      loading,
      error,
      loadGastosByVehicle,
      loadAllGastos,
      addGasto,
      updateGasto,
      deleteGasto,
      getGastosByCategory,
      getGastosByVehicle,
      loadSummary,
      refreshData: () => {
        loadAllGastos();
        loadSummary();
      }
    }}>
      {children}
    </GastosContext.Provider>
  );
};

export { GastosProvider };
export default GastosContext;