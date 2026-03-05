import clienteAxios from '../configs/clinteAxios.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await clienteAxios.post('/usuarios/registrar', userData);
      
      // Guardar token si se devuelve
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error registering user:', error);
      return { data: null, error: error.response?.data?.msg || error.response?.data || error.message };
    }
  },

  // Registrar con Google
  registerGoogle: async (userData) => {
    try {
      const response = await clienteAxios.post('/usuarios/registrar-google', userData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error registering with Google:', error);
      return { data: null, error: error.response?.data?.msg || error.response?.data || error.message };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await clienteAxios.post('/usuarios/login', { email, password });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }

      return { data: response.data, error: null };
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error.response?.status, error.response?.data?.msg || error.message);
      return { data: null, error: error.response?.data?.msg || error.response?.data || error.message };
    }
  },

  // Login con Google
  loginGoogle: async (googleData) => {
    try {
      const response = await clienteAxios.post('/usuarios/login-google', googleData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error logging in with Google:', error);
      return { data: null, error: error.response?.data?.msg || error.response?.data || error.message };
    }
  },

  // Login con Apple
  loginApple: async (appleData) => {
    try {
      const response = await clienteAxios.post('/usuarios/apple-auth', appleData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error logging in with Apple:', error);
      return { data: null, error: error.response?.data?.msg || error.response?.data || error.message };
    }
  },

  // Verificar usuario autenticado
  checkAuth: async () => {
    try {
      const response = await clienteAxios.post('/usuarios/comprobar');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error checking auth:', error);
      // Si el token es inválido, eliminarlo
      await AsyncStorage.removeItem('token');
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Comprobar si usuario existe
  checkUserExists: async (email) => {
    try {
      const response = await clienteAxios.post('/usuarios/comprobar', { email });
      return { exists: false, error: null }; // Si no hay error, el usuario no existe
    } catch (error) {
      if (error.response?.status === 400) {
        return { exists: true, error: null }; // Usuario ya existe
      }
      return { exists: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Solicitar recuperación de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await clienteAxios.post('/usuarios/olvide-password', { email });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Verificar token de recuperación
  verifyResetToken: async (token) => {
    try {
      const response = await clienteAxios.get(`/usuarios/olvide-password/${token}`);
      return { valid: true, data: response.data, error: null };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      return { valid: false, error: error.response?.data?.msg || error.message };
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, password) => {
    try {
      const response = await clienteAxios.post(`/usuarios/olvide-password/${token}`, { password });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Crear contraseña (para nuevos usuarios)
  createPassword: async (token, password) => {
    try {
      const response = await clienteAxios.post(`/usuarios/crear-password/${token}`, { password });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error creating password:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Editar perfil (nuevo método)
  updateProfile: async (profileData) => {
    try {
      const response = await clienteAxios.put('/usuarios/perfil', profileData);
      return { 
        data: response.data.success ? response.data.data : response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        data: null, 
        error: error.response?.data?.error || error.response?.data?.msg || error.message 
      };
    }
  },

  // Editar perfil (método legacy para compatibilidad)
  editProfile: async (userId, profileData) => {
    try {
      const response = await clienteAxios.post(`/usuarios/editar-usuario/${userId}`, profileData);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error editing profile:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener estadísticas del usuario
  getUserStats: async () => {
    try {
      const response = await clienteAxios.get('/usuarios/estadisticas');
      return { 
        data: response.data.success ? response.data.data : response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { 
        data: null, 
        error: error.response?.data?.error || error.response?.data?.msg || error.message 
      };
    }
  },

  // Actualizar configuraciones del usuario
  updateUserSettings: async (settings) => {
    try {
      const response = await clienteAxios.put('/usuarios/configuraciones', { settings });
      return { 
        data: response.data.success ? response.data.data : response.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return { 
        data: null, 
        error: error.response?.data?.error || error.response?.data?.msg || error.message 
      };
    }
  },

  // Permitir notificaciones
  allowNotifications: async (tokenNotification) => {
    try {
      const response = await clienteAxios.post('/usuarios/allow-notifications', { tokenNotification });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error allowing notifications:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Activar/Desactivar notificaciones
  toggleNotifications: async (userId) => {
    try {
      const response = await clienteAxios.post(`/usuarios/active-desactive-notifications/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error toggling notifications:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Consultar suscripción RevenueCat
  checkSubscription: async (userId) => {
    try {
      const response = await clienteAxios.post(`/usuarios/consultar-suscripcion-revenuecat/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Obtener estado de suscripción
  getSubscriptionStatus: async () => {
    try {
      const response = await clienteAxios.get('/subscription/status');
      return { 
        success: true, 
        subscription: response.data.subscription, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { 
        success: false, 
        subscription: null, 
        error: error.response?.data?.error || error.message 
      };
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      const response = await clienteAxios.post(`/usuarios/eliminar-usuario/${userId}`);
      await AsyncStorage.removeItem('token'); // Eliminar token después de eliminar usuario
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { data: null, error: error.response?.data?.msg || error.message };
    }
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  // Obtener token almacenado
  getStoredToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  // Verificar si hay token válido
  hasValidToken: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }
};

export { authService };

// Export individual functions for convenience
export const getSubscriptionStatus = authService.getSubscriptionStatus;