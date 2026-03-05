import React, { useState, useEffect, createContext } from 'react';
import { subscriptionService } from '../services/revenuecat';
import useAuth from '../hooks/useAuth';

const SubscriptionContext = createContext();

const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState('free');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastStatePreservationTime, setLastStatePreservationTime] = useState(null);
  const [isOnTrial, setIsOnTrial] = useState(false); // Nuevo estado para trial
  const { user } = useAuth();

  useEffect(() => {
    let timeoutId;
    const initAndLoad = async () => {
      await initializeRevenueCat();
      // Esperar un poco antes de cargar offerings
      timeoutId = setTimeout(() => {
        loadOfferings();
      }, 1000);
    };
    initAndLoad();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (user) {
      setUserIdAndLoadData();
    } else {
      // No resetear todo, mantener las offerings cargadas
      setIsSubscribed(false);
      setSubscriptionType('free');
      setCustomerInfo(null);
      setLoading(false);
    }
  }, [user]);

  const initializeRevenueCat = async () => {
    const result = await subscriptionService.initialize();
    if (!result.success) {
      console.error('SubscriptionProvider: Failed to initialize RevenueCat:', result.error);
      setError(result.error);
    }
  };

  const setUserIdAndLoadData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Set user ID in RevenueCat
    await subscriptionService.setUserId(user._id);
    
    // Load customer info and offerings
    // Use forceUpdate=true porque es la primera carga después del login
    await Promise.all([
      loadCustomerInfo(true),
      loadOfferings()
    ]);
    
    setLoading(false);
  };

  const resetSubscriptionData = () => {
    setIsSubscribed(false);
    setSubscriptionType('free');
    setCustomerInfo(null);
    setIsOnTrial(false);
    setLoading(false);
    // NO resetear offerings ni packages para que estén disponibles en onboarding
  };

  const loadCustomerInfo = async (forceUpdate = false) => {
    const result = await subscriptionService.getCustomerInfo();

    if (result.customerInfo) {
      const newSubscriptionType = result.subscriptionType;
      const activeEntitlements = Object.keys(result.customerInfo.entitlements.active);

      // Lógica inteligente: Si el usuario actualmente es PRO/Premium y la nueva respuesta es FREE,
      // solo preservar si hay evidencia de que era premium antes (no en el estado inicial 'free')
      const shouldPreserveCurrentState =
        (subscriptionType === 'pro' || subscriptionType === 'premium') &&
        newSubscriptionType === 'free' &&
        activeEntitlements.length === 0 &&
        customerInfo !== null; // Solo preservar si ya teníamos customerInfo antes

      // Verificar si ya pasó suficiente tiempo desde la última preservación de estado (30 segundos)
      const now = Date.now();
      const STATE_PRESERVATION_TIMEOUT = 30000; // 30 segundos
      const hasPreservationTimedOut =
        lastStatePreservationTime &&
        (now - lastStatePreservationTime) > STATE_PRESERVATION_TIMEOUT;

      if (shouldPreserveCurrentState && !forceUpdate && !hasPreservationTimedOut) {
        // Marcar el tiempo de preservación solo la primera vez
        if (!lastStatePreservationTime) {
          setLastStatePreservationTime(now);
        }

        // No actualizar el estado, mantener el actual
        return;
      }

      // Si se procede con la actualización, limpiar el tiempo de preservación
      if (lastStatePreservationTime) {
        setLastStatePreservationTime(null);
      }

      // Detectar si tiene trial activo
      const hasActiveTrial = Object.values(result.customerInfo.entitlements.active).some(
        entitlement => entitlement.periodType === 'TRIAL'
      );

      // Si detectamos una mejora en el estado (free -> premium/pro) o el estado es consistente, actualizar
      setCustomerInfo(result.customerInfo);
      setIsSubscribed(result.isSubscribed);
      setSubscriptionType(newSubscriptionType);
      setIsOnTrial(hasActiveTrial);
    } else {
      setCustomerInfo(null);
      setIsSubscribed(false);
      setSubscriptionType('free');
      setIsOnTrial(false);
    }
  };

  const loadOfferings = async () => {
    setLoading(true);

    // Intentar varias veces si falla
    let attempts = 0;
    const maxAttempts = 3;
    let result = null;

    while (attempts < maxAttempts) {
      attempts++;

      result = await subscriptionService.getOfferings();
      
      // Verificar si solo tenemos productos preview
      if (result.isPreviewOnly) {
        console.error('SubscriptionProvider: Only preview products detected');
        setError('Los productos no están configurados en App Store Connect. Por favor, configura los productos primero.');
        setLoading(false);
        return;
      }
      
      if (result.offerings || result.packages.length > 0) {
        setOfferings(result.offerings);
        setPackages(result.packages);
        setLoading(false);
        return;
      }

      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.error('SubscriptionProvider: Failed to load offerings after', maxAttempts, 'attempts');
    setError(result?.error || 'No offerings available');
    setLoading(false);
  };

  const purchasePackage = async (packageToPurchase) => {
    setLoading(true);
    setError(null);
    
    const result = await subscriptionService.purchasePackage(packageToPurchase);

    if (result.success) {
      setCustomerInfo(result.customerInfo);
      setIsSubscribed(subscriptionService.isUserSubscribed(result.customerInfo));
      setSubscriptionType(subscriptionService.getSubscriptionType(result.customerInfo));
      
      // Sync with backend only if user exists
      if (user && user._id) {
        try {
          const syncData = await subscriptionService.syncSubscriptionWithBackend(
            user._id, 
            result.customerInfo
          );
        } catch (syncError) {
          console.error('❌ Error sincronizando suscripción:', syncError);
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const restorePurchases = async () => {
    setLoading(true);
    setError(null);
    
    const result = await subscriptionService.restorePurchases();

    if (result.success) {
      setCustomerInfo(result.customerInfo);
      setIsSubscribed(subscriptionService.isUserSubscribed(result.customerInfo));
      setSubscriptionType(subscriptionService.getSubscriptionType(result.customerInfo));
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  const getFeatures = () => {
    const features = {
      free: {
        vehicleLimit: 1,
        monthlyMaintenanceLimit: 2,
        monthlyExpenseLimit: 2,
        backups: false,
        exportData: false,
        vehicleSharing: false,
        userInvitations: false,
        advancedInsights: false,
        prioritySupport: false,
        adsRemoved: false,
        apiAccess: false,
        advancedReports: false,
        maintenanceReminders: 5,
        expenseCategories: 3
      },
      premium: {
        vehicleLimit: Infinity,
        monthlyMaintenanceLimit: Infinity,
        monthlyExpenseLimit: Infinity,
        backups: true,
        exportData: true,
        vehicleSharing: true, // Compartir vehículos con otros usuarios
        userInvitations: false, // Solo Pro puede invitar
        advancedInsights: true,
        prioritySupport: false,
        adsRemoved: true,
        apiAccess: false,
        advancedReports: true,
        maintenanceReminders: 50,
        expenseCategories: 10
      },
      pro: {
        vehicleLimit: Infinity,
        monthlyMaintenanceLimit: Infinity,
        monthlyExpenseLimit: Infinity,
        backups: true,
        exportData: true,
        vehicleSharing: true, // Compartir vehículos
        userInvitations: true, // Invitar usuarios
        advancedInsights: true,
        prioritySupport: true,
        adsRemoved: true,
        apiAccess: true,
        advancedReports: true,
        maintenanceReminders: Infinity,
        expenseCategories: Infinity
      }
    };
    
    return features[subscriptionType] || features.free;
  };

  const hasFeature = (feature) => {
    // Trial = acceso completo a todas las features
    if (isOnTrial) return true;

    const userFeatures = getFeatures();
    return userFeatures[feature] === true || userFeatures[feature] === Infinity;
  };

  const getFeatureLimit = (feature) => {
    // Trial = límites infinitos
    if (isOnTrial) return Infinity;

    const userFeatures = getFeatures();
    return userFeatures[feature] || 0;
  };

  const canAddVehicle = (currentVehicleCount) => {
    // Trial = vehículos ilimitados
    if (isOnTrial) return true;

    const limit = getVehicleLimit();
    return limit === Infinity || currentVehicleCount < limit;
  };

  const canShareVehicles = () => {
    // Trial = puede compartir vehículos
    if (isOnTrial) return true;

    return hasFeature('vehicleSharing');
  };

  const canInviteUsers = () => {
    // Trial = puede invitar usuarios
    if (isOnTrial) return true;

    return hasFeature('userInvitations');
  };

  const getVehicleLimit = () => {
    const userFeatures = getFeatures();
    return userFeatures.vehicleLimit;
  };

  // Helper para contar items del mes actual
  const getMonthlyCount = (items, dateField = 'fecha') => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  };

  const canAddMaintenance = (currentMaintenances) => {
    // Trial = mantenimientos ilimitados
    if (isOnTrial) return true;

    const limit = getFeatureLimit('monthlyMaintenanceLimit');
    if (limit === Infinity) return true;

    const monthlyCount = getMonthlyCount(currentMaintenances || []);
    return monthlyCount < limit;
  };

  const canAddExpense = (currentExpenses) => {
    // Trial = gastos ilimitados
    if (isOnTrial) return true;

    const limit = getFeatureLimit('monthlyExpenseLimit');
    if (limit === Infinity) return true;

    const monthlyCount = getMonthlyCount(currentExpenses || []);
    return monthlyCount < limit;
  };

  const getMaintenanceLimit = () => {
    const userFeatures = getFeatures();
    return userFeatures.monthlyMaintenanceLimit;
  };

  const getExpenseLimit = () => {
    const userFeatures = getFeatures();
    return userFeatures.monthlyExpenseLimit;
  };

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      subscriptionType,
      customerInfo,
      offerings,
      packages,
      loading,
      error,
      purchasePackage,
      restorePurchases,
      getFeatures,
      hasFeature,
      getFeatureLimit,
      getVehicleLimit,
      canAddVehicle,
      canShareVehicles,
      canInviteUsers,
      canAddMaintenance,
      canAddExpense,
      getMaintenanceLimit,
      getExpenseLimit,
      refreshData: () => loadCustomerInfo(true),
      refreshOfferings: loadOfferings,
      isPremium: subscriptionType === 'premium' || subscriptionType === 'pro',
      isPro: subscriptionType === 'pro',
      isFree: subscriptionType === 'free',
      isOnTrial // Nuevo valor exportado
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export { SubscriptionProvider };
export default SubscriptionContext;