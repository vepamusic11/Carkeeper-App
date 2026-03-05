import React, { useState, useEffect, createContext } from 'react';
import { authService } from '../services/authApi';
import { socialAuthService } from '../services/socialAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Import condicional: react-native-purchases no funciona en Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
let Purchases = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (e) {
    if (__DEV__) console.log('react-native-purchases not available');
  }
}

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nuevos estados para verificación de suscripción
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [needsPaywall, setNeedsPaywall] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = await authService.getStoredToken();

      if (token) {
        // Timeout de seguridad: si checkAuth tarda más de 12s, asumir token inválido
        const authPromise = authService.checkAuth();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 12000)
        );

        let result;
        try {
          result = await Promise.race([authPromise, timeoutPromise]);
        } catch (timeoutError) {
          console.warn('⚠️ Auth check timeout - clearing stale token');
          result = { data: null, error: 'timeout' };
        }

        const { data, error } = result;

        if (data) {
          setUser(data);
          setUserData(data);
          await AsyncStorage.setItem('userData', JSON.stringify(data));

          // Verificar suscripción después de restaurar sesión - NO es registro nuevo
          await checkSubscriptionAfterAuth(data._id || data.id, false);
        } else {
          // Token inválido o timeout, limpiar
          await authService.logout();
          setUser(null);
          setUserData(null);
          setSubscriptionChecked(true);
          setNeedsPaywall(false);
        }
      } else {
        setSubscriptionChecked(true);
        setNeedsPaywall(false);
      }
    } catch (err) {
      console.error('❌ Error in checkAuthStatus:', err);
      // En caso de error inesperado, limpiar todo para no quedar en loading
      await authService.logout();
      setUser(null);
      setUserData(null);
      setSubscriptionChecked(true);
      setNeedsPaywall(false);
    }

    setLoading(false);
  };

  // Verificar suscripción después de login/registro
  const checkSubscriptionAfterAuth = async (userId, isNewRegistration = false) => {
    try {
      console.log('🔍 [AUTH] Verificando suscripción para userId:', userId, 'isNewRegistration:', isNewRegistration);

      let hasActiveSub = false;

      if (!Purchases) {
        // Expo Go mode: simular PRO access para desarrollo
        if (__DEV__) console.log('[AUTH] Expo Go mode - granting dev access');
        hasActiveSub = true;
      } else {
        // Configurar RevenueCat con el userId
        const loginResult = await Purchases.logIn(userId);

        // Obtener información del cliente de RevenueCat
        const customerInfo = await Purchases.getCustomerInfo();

        // LÓGICA CRÍTICA: Si es un REGISTRO NUEVO, NO aceptar suscripciones transferidas del dispositivo
        if (isNewRegistration && loginResult.created) {
          hasActiveSub = false;
        } else {
          hasActiveSub =
            customerInfo.activeSubscriptions.length > 0 ||
            Object.keys(customerInfo.entitlements.active).length > 0;
        }
      }

      setHasActiveSubscription(hasActiveSub);
      setNeedsPaywall(!hasActiveSub);
      setSubscriptionChecked(true);

      return hasActiveSub;
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      // En caso de error, mostrar paywall por seguridad
      setNeedsPaywall(true);
      setSubscriptionChecked(true);
      return false;
    }
  };

  // Actualizar estado de suscripción (llamado después de compra)
  const updateSubscriptionStatus = async () => {
    if (user) {
      await checkSubscriptionAfterAuth(user._id || user.id);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await authService.register(userData);

    if (data) {
      setUser(data);
      setUserData(data);
      await AsyncStorage.setItem('userData', JSON.stringify(data));

      // Verificar suscripción después de registro - ES REGISTRO NUEVO
      await checkSubscriptionAfterAuth(data._id || data.id, true);
    } else {
      setError(error);
    }

    setLoading(false);
    return { data, error };
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await authService.login(email, password);

    if (data) {
      setUser(data);
      setUserData(data);
      await AsyncStorage.setItem('userData', JSON.stringify(data));

      // Verificar suscripción después de login - NO es registro nuevo
      await checkSubscriptionAfterAuth(data._id || data.id, false);
    } else {
      setError(error);
    }

    setLoading(false);
    return { data, error };
  };

  const logout = async () => {
    setLoading(true);

    try {
      // Logout de RevenueCat primero (solo si disponible)
      if (Purchases) {
        await Purchases.logOut();
      }
    } catch (error) {
      console.error('❌ Error en logout RevenueCat:', error);
    }

    await authService.logout();
    setUser(null);
    setUserData(null);

    // Resetear estados de suscripción
    setSubscriptionChecked(false);
    setNeedsPaywall(false);
    setHasActiveSubscription(false);

    await AsyncStorage.removeItem('userData');
    setLoading(false);
    return { success: true };
  };

  const loginGoogle = async (googleData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await authService.loginGoogle(googleData);

    if (data) {
      setUser(data);
      setUserData(data);
      await AsyncStorage.setItem('userData', JSON.stringify(data));

      // Verificar suscripción después de login con Google
      // Detectar si es nuevo usuario por el campo isNewUser del backend
      const isNewUser = data.isNewUser || false;
      await checkSubscriptionAfterAuth(data._id || data.id, isNewUser);
    } else {
      setError(error);
    }

    setLoading(false);
    return { data, error };
  };

  const loginApple = async (appleData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await authService.loginApple(appleData);

      if (data) {
        setUser(data);
        setUserData(data);
        await AsyncStorage.setItem('userData', JSON.stringify(data));

        // Verificar suscripción después de login con Apple
        // Detectar si es nuevo usuario por el campo isNewUser del backend
        const isNewUser = data.isNewUser || false;
        await checkSubscriptionAfterAuth(data._id || data.id, isNewUser);
      } else {
        setError(error);
      }

      setLoading(false);
      return { data, error };
    } catch (error) {
      console.error('❌ Error en login Apple:', error);
      setError(error.message);
      setLoading(false);
      return { data: null, error: error.message };
    }
  };

  const handleAppleAuth = loginApple;

  const editProfile = async (profileData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    setError(null);
    const { data, error } = await authService.updateProfile(profileData);
    
    if (data) {
      setUser(data);
      setUserData(data);
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      setLoading(false);
      return { success: true, data };
    } else {
      setError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const updateUserData = async (newData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    try {
      setLoading(true);
      const { data, error } = await authService.updateProfile(newData);
      
      if (data) {
        setUser(data);
        setUserData(data);
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        setLoading(false);
        return { success: true, data };
      } else {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const getUserStats = async () => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    try {
      const { data, error } = await authService.getUserStats();
      if (data) {
        return { success: true, data };
      } else {
        return { success: false, error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateUserSettings = async (settings) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    try {
      setLoading(true);
      const { data, error } = await authService.updateUserSettings(settings);
      
      if (data) {
        setUserData(prev => ({ ...prev, settings: data }));
        await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, settings: data }));
        setLoading(false);
        return { success: true, data };
      } else {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Autenticación social - Google
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener datos de Google
      const googleResult = await socialAuthService.signInWithGoogle();
      
      if (!googleResult.success) {
        setError(googleResult.error);
        setLoading(false);
        return { success: false, error: googleResult.error };
      }

      // Intentar login primero (usuario existente)
      const loginResult = await authService.loginGoogle(googleResult.data);
      
      if (loginResult.data) {
        // Usuario existente logueado exitosamente
        setUser(loginResult.data);
        setUserData(loginResult.data);
        await AsyncStorage.setItem('userData', JSON.stringify(loginResult.data));
        setLoading(false);
        return { success: true, data: loginResult.data };
      }
      
      // Si login falla, intentar registro (usuario nuevo)
      const registerResult = await authService.registerGoogle(googleResult.data);
      
      if (registerResult.data) {
        setUser(registerResult.data);
        setUserData(registerResult.data);
        await AsyncStorage.setItem('userData', JSON.stringify(registerResult.data));
        setLoading(false);
        return { success: true, data: registerResult.data, isNewUser: true };
      } else {
        setError(registerResult.error);
        setLoading(false);
        return { success: false, error: registerResult.error };
      }
      
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión con Google';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Autenticación social - Apple
  const loginWithApple = async () => {
    setLoading(true);
    setError(null);

    try {
      const appleResult = await socialAuthService.signInWithApple();

      if (!appleResult.success) {
        setError(appleResult.error);
        setLoading(false);
        return { success: false, error: appleResult.error };
      }

      const authResult = await authService.loginApple(appleResult.data);

      if (authResult.data) {
        setUser(authResult.data);
        setUserData(authResult.data);
        await AsyncStorage.setItem('userData', JSON.stringify(authResult.data));

        // Verificar suscripción - detectar si es nuevo usuario
        const isNewUser = authResult.data.isNewUser || false;
        await checkSubscriptionAfterAuth(authResult.data._id || authResult.data.id, isNewUser);

        setLoading(false);
        return { success: true, data: authResult.data };
      } else {
        setError(authResult.error);
        setLoading(false);
        return { success: false, error: authResult.error };
      }

    } catch (error) {
      console.error('❌ Error en login Apple:', error);
      const errorMessage = error.message || 'Error al iniciar sesión con Apple';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Logout mejorado que incluye limpieza de sesiones sociales
  const logoutComplete = async () => {
    setLoading(true);
    
    try {
      // Logout del backend
      await authService.logout();
      
      // Logout de servicios sociales (manejo seguro de errores)
      try {
        if (socialAuthService.revokeAccess) {
          await socialAuthService.revokeAccess();
        }
      } catch (socialError) {
        console.log('Error al limpiar sesiones sociales:', socialError);
        // No fallar por esto, continuar con el logout
      }
      
      // Limpiar estado local
      setUser(null);
      setUserData(null);
      await AsyncStorage.removeItem('userData');
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      // Aunque haya error, limpiar estado local
      setUser(null);
      setUserData(null);
      await AsyncStorage.removeItem('userData');
      setLoading(false);
      return { success: true }; // Siempre exitoso localmente
    }
  };

  // Eliminar cuenta del usuario
  const deleteAccount = async () => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    
    try {
      const { data, error } = await authService.deleteUser(user._id || user.id);
      
      if (data) {
        // Limpiar estado local después de eliminar cuenta
        setUser(null);
        setUserData(null);
        await AsyncStorage.removeItem('userData');
        
        // Logout de servicios sociales (manejo seguro de errores)
        try {
          if (socialAuthService.revokeAccess) {
            await socialAuthService.revokeAccess();
          }
        } catch (socialError) {
          console.log('Error al limpiar sesiones sociales:', socialError);
          // No fallar por esto, continuar con la eliminación
        }
        
        setLoading(false);
        return { success: true, data };
      } else {
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar la cuenta';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      error,
      register,
      login,
      logout,
      loginGoogle,
      loginApple,
      handleAppleAuth,
      loginWithGoogle,
      loginWithApple,
      logoutComplete,
      editProfile,
      updateUserData,
      getUserStats,
      updateUserSettings,
      deleteAccount,
      checkAuthStatus,
      isAuthenticated: !!user,
      isPremium: userData?.hasActiveSubscription || false,
      vehicleLimit: userData?.vehicleLimit || 1,
      // Nuevos valores para verificación de suscripción
      subscriptionChecked,
      needsPaywall,
      hasActiveSubscription,
      updateSubscriptionStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;