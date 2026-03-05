import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async requestPermissions() {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          return { success: false, error: 'Permisos de notificación denegados' };
        }
        
        // Configurar canal de notificación para Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'CarKeeper Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563eb',
            sound: 'default'
          });
        }
        
        return { success: true, error: null };
      } else {
        return { success: false, error: 'Debe usar un dispositivo físico para notificaciones push' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPushToken() {
    try {
      if (!Device.isDevice) {
        console.warn('Push tokens require a physical device');
        return { token: null, error: 'Simulador no soporta push tokens' };
      }

      // Intentar obtener el token sin projectId primero
      let token;
      try {
        token = await Notifications.getExpoPushTokenAsync();
      } catch (error) {
        console.warn('Could not get push token:', error.message);
        return { token: null, error: 'Push token no disponible en desarrollo' };
      }
      
      return { token: token.data, error: null };
    } catch (error) {
      console.error('Error getting push token:', error);
      return { token: null, error: error.message };
    }
  },

  async scheduleMaintenanceNotification(maintenance) {
    try {
      const maintenanceDate = new Date(maintenance.date);
      const now = new Date();
      
      // Programar notificación 7 días antes
      const sevenDaysBefore = new Date(maintenanceDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      
      if (sevenDaysBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Mantenimiento próximo',
            body: `${maintenance.type} programado para ${maintenance.vehicleName} en 7 días`,
            data: { 
              type: 'maintenance_reminder',
              maintenanceId: maintenance.id,
              vehicleId: maintenance.vehicleId
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: sevenDaysBefore,
            channelId: 'default'
          },
          identifier: `maintenance_7d_${maintenance.id}`
        });
      }
      
      // Programar notificación el día del mantenimiento
      if (maintenanceDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔧 Mantenimiento hoy',
            body: `Es hora de realizar: ${maintenance.type} en ${maintenance.vehicleName}`,
            data: { 
              type: 'maintenance_today',
              maintenanceId: maintenance.id,
              vehicleId: maintenance.vehicleId
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: maintenanceDate,
            channelId: 'default'
          },
          identifier: `maintenance_today_${maintenance.id}`
        });
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error scheduling maintenance notification:', error);
      return { success: false, error: error.message };
    }
  },

  async scheduleExpenseReminder(vehicleId, vehicleName) {
    try {
      // Recordatorio semanal para registrar gastos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Recordatorio de gastos',
          body: `¿Has tenido gastos en ${vehicleName} esta semana?`,
          data: { 
            type: 'expense_reminder',
            vehicleId: vehicleId
          },
          sound: 'default',
        },
        trigger: {
          weekday: 1, // Lunes
          hour: 10,
          minute: 0,
          repeats: true,
          channelId: 'default'
        },
        identifier: `expense_reminder_${vehicleId}`
      });
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async scheduleDocumentExpiration(document) {
    try {
      const expirationDate = new Date(document.expirationDate);
      const now = new Date();
      
      // Notificación 30 días antes
      const thirtyDaysBefore = new Date(expirationDate);
      thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
      
      if (thirtyDaysBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📄 Documento próximo a vencer',
            body: `${document.type} de ${document.vehicleName} vence en 30 días`,
            data: { 
              type: 'document_expiration',
              documentId: document.id,
              vehicleId: document.vehicleId
            },
            sound: 'default',
          },
          trigger: {
            date: thirtyDaysBefore,
            channelId: 'default'
          },
          identifier: `doc_30d_${document.id}`
        });
      }
      
      // Notificación 7 días antes
      const sevenDaysBefore = new Date(expirationDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      
      if (sevenDaysBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Documento vence pronto',
            body: `${document.type} de ${document.vehicleName} vence en 7 días`,
            data: { 
              type: 'document_expiration_urgent',
              documentId: document.id,
              vehicleId: document.vehicleId
            },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            date: sevenDaysBefore,
            channelId: 'default'
          },
          identifier: `doc_7d_${document.id}`
        });
      }
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return { notifications, error: null };
    } catch (error) {
      return { notifications: [], error: error.message };
    }
  },

  addNotificationReceivedListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  },

  addNotificationResponseReceivedListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  },

  removeNotificationSubscription(subscription) {
    if (subscription) {
      Notifications.removeNotificationSubscription(subscription);
    }
  },

  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Inmediata
      });
      
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};