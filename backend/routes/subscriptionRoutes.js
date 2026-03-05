import express from "express";
import { handleRevenueCatWebhook, getUserSubscriptionStatus } from "../helpers/revenueCatService.js";
import checkAuth from "../middleware/checkAuth.js";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// RevenueCat webhook endpoint (protegido con authorization header)
router.post("/webhook", async (req, res) => {
  try {
    // Verificar autenticidad del webhook con Authorization header
    const authHeader = req.headers.authorization;
    const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return res.status(401).json({ error: "Unauthorized webhook request" });
    }

    const result = await handleRevenueCatWebhook(req.body);

    if (result.success) {
      res.status(200).json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user subscription status
router.get("/status", checkAuth, async (req, res) => {
  try {
    const userId = req.usuario._id;
    const subscriptionStatus = await getUserSubscriptionStatus(userId);
    
    res.json({
      success: true,
      subscription: subscriptionStatus
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el estado de la suscripción'
    });
  }
});

// Update user subscription manually (for testing)
router.post("/update", checkAuth, async (req, res) => {
  try {
    const userId = req.usuario._id;
    const { subscriptionType, isSubscribed } = req.body;
    
    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    // Update subscription data
    user.subscriptionData = {
      ...user.subscriptionData,
      subscriptionType: subscriptionType || 'free',
      isSubscribed: isSubscribed || false,
      lastUpdated: new Date()
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Suscripción actualizada correctamente',
      subscription: {
        subscriptionType: user.subscriptionData.subscriptionType,
        isSubscribed: user.subscriptionData.isSubscribed
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la suscripción'
    });
  }
});

export default router;