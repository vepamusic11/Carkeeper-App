import { getUserSubscriptionStatus } from "../helpers/revenueCatService.js";

// Middleware to check if user has required subscription level
export const requireSubscription = (requiredLevel = 'free') => {
  return async (req, res, next) => {
    try {
      const userId = req.usuario._id;
      const subscriptionStatus = await getUserSubscriptionStatus(userId);
      
      // Define subscription hierarchy
      const subscriptionLevels = {
        'free': 0,
        'premium': 1,
        'pro': 2
      };
      
      const userLevel = subscriptionLevels[subscriptionStatus.subscriptionType] || 0;
      const requiredLevelValue = subscriptionLevels[requiredLevel] || 0;
      
      if (userLevel < requiredLevelValue) {
        return res.status(403).json({
          success: false,
          error: 'Esta función requiere una suscripción de nivel superior',
          requiredSubscription: requiredLevel,
          currentSubscription: subscriptionStatus.subscriptionType
        });
      }
      
      // Add subscription info to request for use in controllers
      req.subscriptionStatus = subscriptionStatus;
      next();
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar la suscripción'
      });
    }
  };
};

// Middleware to check vehicle limit
export const checkVehicleLimit = async (req, res, next) => {
  try {
    const userId = req.usuario._id;
    const subscriptionStatus = await getUserSubscriptionStatus(userId);
    const features = subscriptionStatus.features;
    
    // Update user object with subscription data for compatibility
    req.usuario.subscriptionData = {
      subscriptionType: subscriptionStatus.subscriptionType,
      isSubscribed: subscriptionStatus.isSubscribed,
      vehicleLimit: features.vehicleLimit,
      features: features
    };
    
    // Add subscription info to request for use in controllers
    req.vehicleLimit = features.vehicleLimit;
    req.subscriptionFeatures = features;
    req.subscriptionStatus = subscriptionStatus;
    
    next();
  } catch (error) {
    console.error('Error checking vehicle limit:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el límite de vehículos'
    });
  }
};

// Middleware to check storage limit for document uploads
export const checkStorageLimit = (req, res, next) => {
  // This will be used for document upload endpoints
  // The actual implementation would check current storage usage
  try {
    const subscriptionStatus = req.subscriptionStatus;
    if (!subscriptionStatus) {
      return res.status(400).json({
        success: false,
        error: 'Información de suscripción no disponible'
      });
    }
    
    const storageLimit = subscriptionStatus.features.storageLimit * 1024 * 1024; // Convert MB to bytes
    
    // Add storage info to request
    req.storageLimit = storageLimit;
    
    next();
  } catch (error) {
    console.error('Error checking storage limit:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el límite de almacenamiento'
    });
  }
};

// Middleware to check feature access
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      let subscriptionStatus = req.subscriptionStatus;
      
      // Si no hay subscriptionStatus en el request, obtenerlo
      if (!subscriptionStatus) {
        const userId = req.usuario._id || req.usuario.id;
        subscriptionStatus = await getUserSubscriptionStatus(userId);
        req.subscriptionStatus = subscriptionStatus;
      }
      
      if (!subscriptionStatus) {
        return res.status(400).json({
          success: false,
          error: 'Información de suscripción no disponible'
        });
      }
      
      const hasFeature = subscriptionStatus.features[featureName] === true;
      
      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          error: `Esta función requiere una suscripción que incluya: ${featureName}`,
          currentSubscription: subscriptionStatus.subscriptionType
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar el acceso a la función'
      });
    }
  };
};