import React, { useState, useEffect, createContext } from 'react';
import { notificationService } from '../services/notifications';
import clienteAxios from '../configs/clinteAxios.jsx';
import useAuth from '../hooks/useAuth';

const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const saveTokenToBackend = async (token) => {
    try {
      console.log('Guardando push token en el backend:', token);
      await clienteAxios.post('/usuarios/notification-token', {
        tokenNotification: token
      });
      console.log('Push token guardado correctamente');
    } catch (error) {
      console.error('Error guardando push token:', error);
    }
  };

  useEffect(() => {
    // Solo inicializar notificaciones si el usuario está autenticado
    if (user && user._id) {
      initializeNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    setLoading(true);
    
    // Solicitar permisos
    const permissionResult = await notificationService.requestPermissions();
    setPermissionsGranted(permissionResult.success);
    
    if (permissionResult.success) {
      // Obtener push token
      const tokenResult = await notificationService.getPushToken();
      if (tokenResult.token) {
        setPushToken(tokenResult.token);
        // Guardar el token en el backend para notificaciones push desde servidor
        await saveTokenToBackend(tokenResult.token);
      }
      
      // Cargar notificaciones programadas
      await loadScheduledNotifications();
      
      // Configurar listeners
      setupNotificationListeners();
    }
    
    setLoading(false);
  };

  const loadScheduledNotifications = async () => {
    const result = await notificationService.getScheduledNotifications();
    if (result.notifications) {
      setNotifications(result.notifications);
    }
  };

  const setupNotificationListeners = () => {
    // Listener para notificaciones recibidas cuando la app está en primer plano
    const notificationListener = notificationService.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Aquí puedes manejar la notificación recibida
    });

    // Listener para cuando el usuario toca una notificación
    const responseListener = notificationService.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
    });

    // Cleanup listeners when component unmounts
    return () => {
      notificationService.removeNotificationSubscription(notificationListener);
      notificationService.removeNotificationSubscription(responseListener);
    };
  };

  const handleNotificationResponse = (response) => {
    const { data } = response.notification.request.content;
    
    // Navegar según el tipo de notificación
    switch (data.type) {
      case 'maintenance_reminder':
      case 'maintenance_today':
        // Navegar a detalles del mantenimiento
        console.log('Navigate to maintenance:', data.maintenanceId);
        break;
      case 'expense_reminder':
        // Navegar a agregar gasto
        console.log('Navigate to add expense for vehicle:', data.vehicleId);
        break;
      case 'document_expiration':
      case 'document_expiration_urgent':
        // Navegar a documentos
        console.log('Navigate to documents:', data.documentId);
        break;
    }
  };

  const scheduleMaintenanceNotification = async (maintenance) => {
    if (!permissionsGranted) return { success: false, error: 'Permisos no otorgados' };
    
    const result = await notificationService.scheduleMaintenanceNotification(maintenance);
    if (result.success) {
      await loadScheduledNotifications();
    }
    return result;
  };

  const scheduleExpenseReminder = async (vehicleId, vehicleName) => {
    if (!permissionsGranted) return { success: false, error: 'Permisos no otorgados' };
    
    const result = await notificationService.scheduleExpenseReminder(vehicleId, vehicleName);
    if (result.success) {
      await loadScheduledNotifications();
    }
    return result;
  };

  const scheduleDocumentExpiration = async (document) => {
    if (!permissionsGranted) return { success: false, error: 'Permisos no otorgados' };
    
    const result = await notificationService.scheduleDocumentExpiration(document);
    if (result.success) {
      await loadScheduledNotifications();
    }
    return result;
  };

  const cancelNotification = async (identifier) => {
    const result = await notificationService.cancelNotification(identifier);
    if (result.success) {
      await loadScheduledNotifications();
    }
    return result;
  };

  const cancelAllNotifications = async () => {
    const result = await notificationService.cancelAllNotifications();
    if (result.success) {
      setNotifications([]);
    }
    return result;
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    if (!permissionsGranted) return { success: false, error: 'Permisos no otorgados' };
    
    return await notificationService.sendLocalNotification(title, body, data);
  };

  const requestPermissions = async () => {
    setLoading(true);
    const result = await notificationService.requestPermissions();
    setPermissionsGranted(result.success);
    
    if (result.success) {
      const tokenResult = await notificationService.getPushToken();
      if (tokenResult.token) {
        setPushToken(tokenResult.token);
      }
    }
    
    setLoading(false);
    return result;
  };

  return (
    <NotificationsContext.Provider value={{
      permissionsGranted,
      pushToken,
      notifications,
      loading,
      scheduleMaintenanceNotification,
      scheduleExpenseReminder,
      scheduleDocumentExpiration,
      cancelNotification,
      cancelAllNotifications,
      sendLocalNotification,
      requestPermissions,
      refreshNotifications: loadScheduledNotifications,
      notificationCount: notifications.length
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export { NotificationsProvider };
export default NotificationsContext;