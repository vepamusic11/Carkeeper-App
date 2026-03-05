import fetch from "node-fetch";
import Usuario from "../models/Usuario.js";

export const getRevenueCatSubscriberInfo = async (appUserId) => {
  const endpoint = `https://api.revenuecat.com/v1/subscribers/${appUserId}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.API_KEY_REVENUE}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("RevenueCat API error: " + response.statusText);
  }

  const data = await response.json();
  return data;
};

export const handleRevenueCatWebhook = async (webhookData) => {
  try {
    const { event } = webhookData;
    const subscriberInfo = event.subscriber;
    const appUserId = event.app_user_id;
    
    console.log('RevenueCat webhook received:', event.type, 'for user:', appUserId);
    
    // Find user in database
    const user = await Usuario.findById(appUserId);
    if (!user) {
      console.log('User not found for RevenueCat webhook:', appUserId);
      return { success: false, error: 'User not found' };
    }
    
    // Process different webhook events
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        await updateUserSubscription(user, subscriberInfo);
        break;
      case 'CANCELLATION':
      case 'EXPIRATION':
        await handleSubscriptionCancellation(user, subscriberInfo);
        break;
      case 'BILLING_ISSUE':
        await handleBillingIssue(user, subscriberInfo);
        break;
      default:
        console.log('Unhandled webhook event type:', event.type);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error);
    return { success: false, error: error.message };
  }
};

const updateUserSubscription = async (user, subscriberInfo) => {
  try {
    const subscriptionType = getSubscriptionTypeFromEntitlements(subscriberInfo.entitlements);
    const isSubscribed = Object.keys(subscriberInfo.entitlements).length > 0;
    
    // Update user subscription data
    user.subscriptionData = {
      subscriptionType,
      isSubscribed,
      customerInfo: {
        originalAppUserId: subscriberInfo.original_app_user_id,
        firstSeen: subscriberInfo.first_seen,
        lastSeen: subscriberInfo.last_seen,
        managementURL: subscriberInfo.management_url,
        entitlements: subscriberInfo.entitlements,
        subscriptions: subscriberInfo.subscriptions
      },
      lastUpdated: new Date()
    };
    
    await user.save();
    console.log(`Updated subscription for user ${user._id}: ${subscriptionType}`);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

const handleSubscriptionCancellation = async (user, subscriberInfo) => {
  try {
    // Mark subscription as cancelled but keep data for grace period
    user.subscriptionData = {
      ...user.subscriptionData,
      subscriptionType: 'free',
      isSubscribed: false,
      cancelled: true,
      cancelledAt: new Date(),
      lastUpdated: new Date()
    };
    
    await user.save();
    console.log(`Cancelled subscription for user ${user._id}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
};

const handleBillingIssue = async (user, subscriberInfo) => {
  try {
    // Mark subscription as having billing issues
    user.subscriptionData = {
      ...user.subscriptionData,
      billingIssue: true,
      billingIssueDate: new Date(),
      lastUpdated: new Date()
    };
    
    await user.save();
    console.log(`Billing issue detected for user ${user._id}`);
  } catch (error) {
    console.error('Error handling billing issue:', error);
    throw error;
  }
};

const getSubscriptionTypeFromEntitlements = (entitlements) => {
  const activeEntitlements = Object.keys(entitlements).filter(
    key => entitlements[key].expires_date === null || 
           new Date(entitlements[key].expires_date) > new Date()
  );
  
  if (activeEntitlements.includes('pro') || activeEntitlements.includes('annual')) {
    return 'pro';
  } else if (activeEntitlements.includes('premium') || activeEntitlements.includes('monthly')) {
    return 'premium';
  } else {
    return 'free';
  }
};

export const getUserSubscriptionStatus = async (userId) => {
  try {
    const user = await Usuario.findById(userId);
    if (!user) {
      console.log('User not found for subscription check:', userId);
      return { subscriptionType: 'free', isSubscribed: false, features: getFeaturesBySubscriptionType('free') };
    }
    
    console.log('User found for subscription check:', {
      userId: user._id,
      isInvitado: user.isInvitado,
      proActivatedBy: user.proActivatedBy,
      subscriptionData: user.subscriptionData
    });
    
    // Si el usuario fue invitado (Easter Egg o cuenta especial), tiene acceso PRO
    if (user.isInvitado) {
      console.log('User has PRO access via easter egg/invitation');
      return {
        subscriptionType: 'pro',
        isSubscribed: true,
        features: getFeaturesBySubscriptionType('pro'),
        grantedBy: user.proActivatedBy || 'manual'
      };
    }
    
    const subscriptionData = user.subscriptionData || {};
    const subscriptionType = subscriptionData.subscriptionType || 'free';
    
    console.log('User subscription type:', subscriptionType);
    
    return {
      subscriptionType,
      isSubscribed: subscriptionData.isSubscribed || false,
      features: getFeaturesBySubscriptionType(subscriptionType)
    };
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    return { subscriptionType: 'free', isSubscribed: false, features: getFeaturesBySubscriptionType('free') };
  }
};

const getFeaturesBySubscriptionType = (subscriptionType) => {
  const features = {
    free: {
      vehicleLimit: 1,
      remindersLimit: 5,
      categoriesLimit: 3,
      backups: false,
      exportData: false,
      vehicleSharing: false,
      userInvitations: false,
      adsRemoved: false
    },
    premium: {
      vehicleLimit: -1, // Unlimited
      remindersLimit: 50,
      categoriesLimit: 10,
      backups: true,
      exportData: true,
      vehicleSharing: true, // Puede compartir vehículos
      userInvitations: false, // Solo Pro puede invitar
      adsRemoved: true
    },
    pro: {
      vehicleLimit: -1, // Unlimited
      remindersLimit: -1, // Unlimited
      categoriesLimit: -1, // Unlimited
      backups: true,
      exportData: true,
      vehicleSharing: true, // Puede compartir vehículos
      userInvitations: true, // Puede invitar usuarios
      adsRemoved: true,
      multipleUsers: true,
      prioritySupport: true,
      apiAccess: true
    }
  };
  
  return features[subscriptionType] || features.free;
};