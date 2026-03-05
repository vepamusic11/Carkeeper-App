import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import Button from '../../components/Button';
import useSubscription from '../../hooks/useSubscription';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingPaywallScreen = ({ navigation }) => {
  const { 
    subscriptionType, 
    packages = [], // Valor por defecto
    purchasePackage, 
    restorePurchases,
    loading,
    isPremium,
    isPro,
    refreshOfferings
  } = useSubscription();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [purchasing, setPurchasing] = useState(false);
  const scale = useSharedValue(1);

  // Debug: Ver qué packages tenemos disponibles
  console.log('=== OnboardingPaywall Debug ===');
  console.log('Available packages:', packages);
  console.log('Package count:', packages?.length || 0);
  // Solo hacer forEach si packages existe y es un array
  if (packages && Array.isArray(packages)) {
    packages.forEach((pkg, index) => {
      console.log(`Package ${index}:`, {
        identifier: pkg.identifier,
        productId: pkg.product?.identifier,
        price: pkg.product?.priceString,
        packageType: pkg.packageType
      });
    });
  }

  // Usar exactamente los productos que vienen de RevenueCat
  const weeklyPackage = packages?.find(pkg => pkg.packageType === 'WEEKLY');
  const lifetimePackage = packages?.find(pkg => pkg.packageType === 'LIFETIME');
  
  console.log('Selected weeklyPackage:', weeklyPackage?.identifier);
  console.log('Selected lifetimePackage:', lifetimePackage?.identifier);

  // Solo mostrar los planes si tenemos los datos de RevenueCat
  // Si no hay datos, no mostrar nada de precio
  const plans = [];
  
  // Plan gratuito siempre está disponible
  plans.push({
    id: 'free',
    name: t('onboardingPaywallFree'),
    subtitle: t('onboardingPaywallFreeSubtitle'),
    price: '$0',
    period: t('forever'),
    features: [
      t('onboardingFreeFeature1'), // 1 vehículo
      t('onboardingFreeFeature2'), // Mantenimientos básicos
      t('onboardingFreeFeature3'), // Historial de gastos
      t('onboardingFreeFeature4'), // 5 recordatorios
      t('onboardingFreeFeature5')  // 3 categorías de gastos
    ],
    color: colors.textSecondary,
    popular: false,
    packageId: null
  });
  
  // Agregar plan weekly si está disponible
  if (weeklyPackage?.product?.priceString) {
    const product = weeklyPackage.product;
    let trialInfo = null;

    // Detectar trial period
    if (product.introPrice) {
      const introPeriod = product.introPrice;
      const trialDays = introPeriod.periodNumberOfUnits || 3;
      const periodUnit = introPeriod.periodUnit || 'DAY';

      if (introPeriod.price === 0 || introPeriod.priceString === '$0.00' || introPeriod.priceString === '0') {
        if (periodUnit === 'DAY') {
          trialInfo = t('freeTrial', { days: trialDays });
        }
      }
    }

    plans.push({
      id: 'weekly',
      name: product.title || t('weeklyPlan'),
      subtitle: product.description || t('weeklyAccess'),
      price: product.priceString,
      period: t('perWeek'),
      trialInfo,
      features: [
        t('onboardingPremiumFeature1'), // Vehículos ilimitados
        t('onboardingPremiumFeature2'), // Compartir vehículos
        t('onboardingPremiumFeature3'), // Respaldos en la nube
        t('onboardingPremiumFeature4'), // Exportar datos
        t('onboardingPremiumFeature5'), // Análisis avanzados
        t('onboardingPremiumFeature6'), // Sin anuncios
        t('onboardingPremiumFeature7')  // Recordatorios ilimitados
      ],
      color: colors.primary,
      popular: false,
      packageId: weeklyPackage.identifier
    });
  }
  
  // Agregar plan lifetime si está disponible
  if (lifetimePackage?.product?.priceString) {
    const product = lifetimePackage.product;

    plans.push({
      id: 'lifetime',
      name: product.title || t('lifetimePlan'),
      subtitle: product.description || t('lifetimeSubtitle'),
      price: product.priceString,
      period: t('oneTimePayment'),
      trialInfo: null, // Lifetime no tiene trial
      features: [
        t('onboardingPremiumFeature1'), // Mismas características
        t('onboardingPremiumFeature2'),
        t('onboardingPremiumFeature3'),
        t('onboardingPremiumFeature4'),
        t('onboardingPremiumFeature5'),
        t('onboardingPremiumFeature6'),
        t('onboardingPremiumFeature7'),
        t('permanentAccess')
      ],
      color: colors.accent || '#10B981',
      popular: true, // Marcar lifetime como popular
      packageId: lifetimePackage.identifier
    });
  }

  // Seleccionar el primer plan disponible por defecto, o free si no hay ninguno
  const defaultPlan = plans.length > 1 ? plans[1].id : plans.length > 0 ? plans[0].id : 'free';
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    
    if (selectedPlan === 'free') {
      // Usuario eligió plan gratuito, ir directamente al login
      navigation.navigate('Auth');
      return;
    }

    // Usuario eligió plan premium/pro, proceder con la compra
    const selectedPlanInfo = plans.find(plan => plan.id === selectedPlan);
    console.log('Selected plan:', selectedPlan);
    console.log('Selected plan info:', selectedPlanInfo);
    console.log('Looking for package with ID:', selectedPlanInfo?.packageId);
    
    const packageToPurchase = packages.find(pkg => 
      pkg.identifier === selectedPlanInfo?.packageId
    );
    console.log('Package to purchase:', packageToPurchase);
    
    if (!packageToPurchase) {
      Alert.alert(t('error'), t('planNotAvailable'));
      return;
    }

    setPurchasing(true);
    const result = await purchasePackage(packageToPurchase);
    
    if (result.success) {
      Alert.alert(
        t('onboardingPaywallWelcomeTitle'),
        t('onboardingPaywallWelcomeMessage'),
        [{ 
          text: t('onboardingPaywallContinue'), 
          onPress: () => navigation.navigate('Auth')
        }]
      );
    } else if (result.error !== t('purchaseCanceled')) {
      Alert.alert(t('error'), result.error);
    }
    
    setPurchasing(false);
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Auth');
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const onPlanPress = (planId) => {
    setSelectedPlan(planId);
    scale.value = withSpring(1.05, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const renderPlan = (plan, index) => {
    const isSelected = selectedPlan === plan.id;
    const isPremiumSelected = plan.popular && isSelected;
    
    return (
      <Animated.View
        key={plan.id}
        entering={ZoomIn.duration(600).delay(index * 100)}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          isPremiumSelected && { borderColor: plan.color, borderWidth: 3 }
        ]}
      >
        <TouchableOpacity
          onPress={() => onPlanPress(plan.id)}
          activeOpacity={0.7}
          style={styles.planContent}
        >
          {plan.popular && (
            <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
              <Text style={styles.popularText}>{t('onboardingPaywallMostPopular')}</Text>
            </View>
          )}

          {plan.trialInfo && (
            <View style={[styles.trialBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.trialBadgeText}>{plan.trialInfo}</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
            <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
            
            {plan.savings && (
              <View style={[styles.savingsBadge, { backgroundColor: plan.color + '20' }]}>
                <Text style={[styles.savingsText, { color: plan.color }]}>
                  {t('savingsPercentage', { percentage: plan.savings })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, featureIndex) => (
              <Animated.View
                key={featureIndex}
                entering={FadeInDown.duration(400).delay(index * 100 + featureIndex * 50)}
                style={styles.featureRow}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={18} 
                  color={plan.color} 
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>

          {isSelected && (
            <Animated.View 
              entering={ZoomIn.duration(300)}
              style={styles.selectedIndicator}
            >
              <Ionicons name="checkmark-circle" size={24} color={plan.color} />
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Si está cargando los packages de RevenueCat, mostrar loading
  if (loading && packages.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loadingSubscriptionData')}</Text>
      </View>
    );
  }
  
  // Si no hay packages de RevenueCat disponibles, mostrar mensaje de error
  if (!loading && packages.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>{t('subscriptionUnavailable')}</Text>
        <Text style={styles.errorMessage}>{t('subscriptionUnavailableMessage')}</Text>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>{t('continueWithFree')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.skipButton, { marginTop: 16, backgroundColor: colors.primary }]} onPress={refreshOfferings}>
          <Text style={styles.skipButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientHeader}
      >
        <SafeAreaView style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <Animated.View 
            entering={FadeInDown.duration(800)}
            style={styles.headerContent}
          >
            <Text style={styles.headerTitle}>{t('onboardingPaywallTitle')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('onboardingPaywallSubtitle')}
            </Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.plansContainer}>
          {plans.map((plan, index) => renderPlan(plan, index))}
        </View>

        <Animated.View 
          entering={FadeInDown.duration(600).delay(800)}
          style={styles.benefitsContainer}
        >
          <Text style={styles.benefitsTitle}>{t('onboardingPaywallWhyChoose')}</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: 'shield-checkmark', text: t('onboardingPaywallSecurityGuaranteed'), color: '#16A34A' },
              { icon: 'sync', text: t('onboardingPaywallAutoSync'), color: '#3B82F6' },
              { icon: 'people', text: t('onboardingPaywallSupport247'), color: '#8B5CF6' },
              { icon: 'trending-up', text: t('onboardingPaywallContinuousImprovement'), color: '#F59E0B' }
            ].map((benefit, index) => (
              <Animated.View
                key={index}
                entering={SlideInRight.duration(400).delay(900 + index * 100)}
                style={styles.benefitItem}
              >
                <View style={[styles.benefitIcon, { backgroundColor: benefit.color + '15' }]}>
                  <Ionicons name={benefit.icon} size={20} color={benefit.color} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        entering={FadeInDown.duration(600).delay(1000)}
        style={[styles.footer, animatedButtonStyle]}
      >
        <SafeAreaView edges={['bottom']}>
          <View style={styles.footerContent}>
            <Button
              title={selectedPlan === 'free' ? t('onboardingPaywallContinueFree') : t('onboardingPaywallStartNow')}
              onPress={handleContinue}
              loading={purchasing}
              style={[
                styles.continueButton,
                { backgroundColor: plans.find(p => p.id === selectedPlan)?.color || colors.primary }
              ]}
            />
            
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={restorePurchases}
              activeOpacity={0.7}
            >
              <Text style={styles.restoreText}>{t('onboardingPaywallRestorePurchases')}</Text>
            </TouchableOpacity>
            
            <View style={styles.legalLinksContainer}>
              <TouchableOpacity onPress={() => Linking.openURL('https://deepyze.dev/mileageApp/terms')}>
                <Text style={styles.legalLink}>{t('termsOfService')}</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}> • </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://deepyze.dev/mileageApp/privacy')}>
                <Text style={styles.legalLink}>{t('privacyPolicy')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientHeader: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedPlanCard: {
    borderColor: '#667eea',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  planContent: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ translateY: -12 }],
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  trialBadge: {
    position: 'absolute',
    top: -1,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    transform: [{ translateY: -12 }],
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    color: '#64748B',
    marginLeft: 4,
  },
  savingsBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  benefitsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  footerContent: {
    padding: 20,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: 12,
  },
  restoreButton: {
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingBottom: 8,
  },
  legalLink: {
    fontSize: 12,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#64748B',
    marginHorizontal: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default OnboardingPaywallScreen;