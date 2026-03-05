import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detectar si estamos en Expo Go (no soporta módulos nativos custom)
const isExpoGo = Constants.appOwnership === 'expo';

// Import condicional de react-native-purchases
let Purchases = null;
if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (e) {
    if (__DEV__) console.log('react-native-purchases not available (Expo Go mode)');
  }
}

const revenueCatConfig = {
  apiKeys: {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID
  }
};

// Mock de customerInfo para desarrollo en Expo Go
const MOCK_CUSTOMER_INFO = {
  originalAppUserId: 'dev-user',
  managementURL: null,
  firstSeen: new Date().toISOString(),
  activeSubscriptions: {},
  entitlements: {
    active: {
      // En dev, simular PRO para poder probar todas las features
      'com.deepyze.carkeeper.lifetime': {
        identifier: 'com.deepyze.carkeeper.lifetime',
        isActive: true,
        periodType: 'NORMAL',
      }
    }
  }
};

export const subscriptionService = {
  async initialize() {
    try {
      if (isExpoGo) {
        if (__DEV__) console.log('RevenueCat: Running in Expo Go - using mock (PRO access)');
        return { success: true, error: null };
      }

      if (!Purchases) {
        return { success: false, error: 'Purchases module not available' };
      }

      if (__DEV__) console.log('Initializing RevenueCat for', Platform.OS);

      const apiKey = Platform.OS === 'ios'
        ? revenueCatConfig.apiKeys.ios
        : revenueCatConfig.apiKeys.android;

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured');
      }

      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      await Purchases.configure({ apiKey });

      return { success: true, error: null };
    } catch (error) {
      console.error('RevenueCat initialization error:', error.message);
      return { success: false, error: error.message };
    }
  },

  async getOfferings() {
    try {
      if (isExpoGo || !Purchases) {
        return { offerings: null, packages: [], error: null };
      }

      await Purchases.syncPurchases();
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current !== undefined) {
        const realPackages = offerings.current.availablePackages.filter(pkg => {
          const isPreview = pkg.identifier?.includes('preview') ||
                           pkg.product?.identifier?.includes('preview') ||
                           pkg.offeringIdentifier?.includes('preview');
          return !isPreview;
        });

        if (offerings.current.availablePackages.length > 0 && realPackages.length === 0) {
          return {
            offerings: null,
            packages: [],
            error: 'Products not configured in App Store Connect',
            isPreviewOnly: true
          };
        }

        return {
          offerings: offerings.current,
          packages: realPackages,
          error: null
        };
      } else {
        return { offerings: null, packages: [], error: 'No offerings available' };
      }
    } catch (error) {
      console.error('Error getting offerings:', error.message);
      return { offerings: null, packages: [], error: error.message };
    }
  },

  async purchasePackage(packageToPurchase) {
    try {
      if (isExpoGo || !Purchases) {
        return { success: true, customerInfo: MOCK_CUSTOMER_INFO, error: null };
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, customerInfo, error: null };
    } catch (error) {
      let errorMessage = 'Error al procesar la compra';
      if (error.code === 'PURCHASE_CANCELLED') {
        errorMessage = 'Compra cancelada';
      } else if (error.code === 'PAYMENT_PENDING') {
        errorMessage = 'Pago pendiente';
      } else if (error.code === 'PRODUCT_NOT_AVAILABLE') {
        errorMessage = 'Producto no disponible';
      }
      return { success: false, customerInfo: null, error: errorMessage };
    }
  },

  async restorePurchases() {
    try {
      if (isExpoGo || !Purchases) {
        return { success: true, customerInfo: MOCK_CUSTOMER_INFO, error: null };
      }

      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo, error: null };
    } catch (error) {
      return { success: false, customerInfo: null, error: 'Error al restaurar compras' };
    }
  },

  async getCustomerInfo() {
    try {
      if (isExpoGo || !Purchases) {
        return {
          customerInfo: MOCK_CUSTOMER_INFO,
          isSubscribed: true,
          subscriptionType: 'pro',
          error: null
        };
      }

      await Purchases.syncPurchases();
      const customerInfo = await Purchases.getCustomerInfo();
      return {
        customerInfo,
        isSubscribed: this.isUserSubscribed(customerInfo),
        subscriptionType: this.getSubscriptionType(customerInfo),
        error: null
      };
    } catch (error) {
      return {
        customerInfo: null,
        isSubscribed: false,
        subscriptionType: 'free',
        error: error.message
      };
    }
  },

  isUserSubscribed(customerInfo) {
    return Object.keys(customerInfo.entitlements.active).length > 0;
  },

  getSubscriptionType(customerInfo) {
    const activeEntitlements = customerInfo.entitlements.active;

    if (activeEntitlements['com.deepyze.carkeeper.lifetime']) {
      return 'pro';
    } else if (activeEntitlements['com.deepyze.carkeeper.weekly'] ||
               activeEntitlements['com.deepyze.carkeeper.monthly'] ||
               activeEntitlements['com.deepyze.carkeeper.annual']) {
      return 'premium';
    } else {
      return 'free';
    }
  },

  async setUserId(userId) {
    try {
      if (isExpoGo || !Purchases) {
        return { success: true, error: null };
      }
      await Purchases.logIn(userId);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async logout() {
    try {
      if (isExpoGo || !Purchases) {
        return { success: true, error: null };
      }
      await Purchases.logOut();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  formatPrice(packageInfo) {
    if (packageInfo.product && packageInfo.product.priceString) {
      return packageInfo.product.priceString;
    }
    return 'Precio no disponible';
  },

  getPackageDescription(packageInfo) {
    const descriptions = {
      '$rc_monthly': 'Premium - Mensual',
      '$rc_annual': 'Pro - Anual',
      '$rc_weekly': 'Semanal',
      '$rc_lifetime': 'De por vida'
    };
    return descriptions[packageInfo.identifier] || packageInfo.identifier;
  },

  async syncSubscriptionWithBackend(userId, customerInfo) {
    try {
      return {
        userId,
        subscriptionType: this.getSubscriptionType(customerInfo),
        isSubscribed: this.isUserSubscribed(customerInfo),
        customerInfo: {
          originalAppUserId: customerInfo.originalAppUserId,
          managementURL: customerInfo.managementURL,
          firstSeen: customerInfo.firstSeen,
          activeSubscriptions: Object.keys(customerInfo.activeSubscriptions || {}),
          entitlements: Object.keys(customerInfo.entitlements.active)
        }
      };
    } catch (error) {
      return null;
    }
  }
};

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    features: {
      vehicleLimit: 1,
      remindersLimit: 5,
      categoriesLimit: 3,
      backups: false,
      exportData: false,
      vehicleSharing: false,
      userInvitations: false,
      adsRemoved: false
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    packageId: '$rc_monthly',
    features: {
      vehicleLimit: -1,
      remindersLimit: 50,
      categoriesLimit: 10,
      backups: true,
      exportData: true,
      vehicleSharing: true,
      userInvitations: false,
      adsRemoved: true
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    packageId: '$rc_annual',
    features: {
      vehicleLimit: -1,
      remindersLimit: -1,
      categoriesLimit: -1,
      backups: true,
      exportData: true,
      vehicleSharing: true,
      userInvitations: true,
      adsRemoved: true,
      multipleUsers: true,
      prioritySupport: true,
      apiAccess: true
    }
  }
};

export const getFeaturesByPlan = (planType) => {
  const plan = SUBSCRIPTION_PLANS[planType.toUpperCase()];
  return plan ? plan.features : SUBSCRIPTION_PLANS.FREE.features;
};
