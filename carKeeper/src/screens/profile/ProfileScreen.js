import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import useAuth from '../../hooks/useAuth';
import useSubscription from '../../hooks/useSubscription';
import useNotifications from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import PremiumModal from '../../components/PremiumModal';

const ProfileScreen = ({ navigation }) => {
  const { user, userData, logout, updateUserData, deleteAccount } = useAuth();
  const { subscriptionType, isPremium, isPro, isFree, refreshData } = useSubscription();
  const {
    permissionsGranted,
    requestPermissions,
    cancelAllNotifications,
    notificationCount
  } = useNotifications();
  const { isDarkMode, toggleTheme, colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(permissionsGranted);
  const [easterEggTaps, setEasterEggTaps] = useState(0);
  const [easterEggTimeout, setEasterEggTimeout] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (easterEggTimeout) {
        clearTimeout(easterEggTimeout);
      }
    };
  }, [easterEggTimeout]);

  const handleEasterEgg = async () => {
    // Limpiar timeout anterior si existe
    if (easterEggTimeout) {
      clearTimeout(easterEggTimeout);
    }

    const newTapCount = easterEggTaps + 1;
    setEasterEggTaps(newTapCount);

    console.log(`Easter egg tap ${newTapCount}/7`);

    if (newTapCount === 7) {
      // Activar cuenta PRO
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/usuarios/activate-pro/${user._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Refrescar datos de suscripción
          console.log('Refreshing subscription data...');
          await refreshData();
          
          // Pequeño delay para asegurar que la UI se actualice
          setTimeout(() => {
            Alert.alert(
              '🎉 ¡Cuenta PRO Activada!',
              '¡Felicitaciones! Tu cuenta ha sido activada como PRO. Ahora tienes acceso a todas las funciones premium incluyendo:\n\n• Vehículos ilimitados\n• Invitar usuarios\n• Compartir vehículos\n• Soporte prioritario\n• Y mucho más...',
              [{ text: '¡Genial! 🚗', style: 'default' }]
            );
          }, 500);
          
          // Resetear contador
          setEasterEggTaps(0);
          setEasterEggTimeout(null);
        } else {
          Alert.alert(t('error'), t('couldNotActivatePro'));
          setEasterEggTaps(0);
        }
      } catch (error) {
        console.error('Error activating PRO account:', error);
        console.error('Backend URL:', process.env.EXPO_PUBLIC_BACKEND_URL);
        console.error('User ID:', user?._id);
        console.error('User token exists:', !!user?.token);
        Alert.alert(t('error'), t('errorActivatingPro', { error: error.message }));
        setEasterEggTaps(0);
      }
    } else if (newTapCount === 5) {
      Alert.alert('🤫', t('onlyMoreTaps', { count: 7 - newTapCount }), [{ text: t('ok'), style: 'default' }]);
    } else if (newTapCount === 6) {
      Alert.alert('🔓', t('almostThere'), [{ text: t('ok'), style: 'default' }]);
    }

    // Configurar nuevo timeout para resetear contador
    const timeout = setTimeout(() => {
      console.log('Easter egg timeout - resetting counter');
      setEasterEggTaps(0);
      setEasterEggTimeout(null);
    }, 5000);
    
    setEasterEggTimeout(timeout);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.error) {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Eliminar cuenta',
      'Esta acción eliminará permanentemente:\n\n• Tu cuenta de usuario\n• Todos tus vehículos\n• Todos los gastos registrados\n• Todos los mantenimientos\n• Todos los documentos\n• Todas las configuraciones\n\nEsta acción NO se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entiendo, eliminar cuenta',
          style: 'destructive',
          onPress: () => {
            // Segunda confirmación
            Alert.alert(
              '🚨 Confirmación final',
              '¿Estás completamente seguro? Esta acción es irreversible y perderás todos tus datos.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sí, eliminar todo',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await deleteAccount();
                    if (result.success) {
                      Alert.alert(
                        t('accountDeleted'),
                        t('accountDeletedSuccess'),
                        [{ text: t('ok') }]
                      );
                    } else {
                      Alert.alert(t('error'), result.error || t('couldNotDeleteAccount'));
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleNotificationToggle = async (enabled) => {
    if (enabled) {
      const result = await requestPermissions();
      if (result.success) {
        setNotificationsEnabled(true);
        Alert.alert(t('success'), t('notificationsEnabledSuccess'));
      } else {
        Alert.alert(t('error'), result.error);
      }
    } else {
      const result = await cancelAllNotifications();
      if (result.success) {
        setNotificationsEnabled(false);
        Alert.alert(t('notificationsDisabled'), t('allScheduledNotificationsCancelled'));
      }
    }
  };

  const getSubscriptionBadge = () => {
    if (isPro) return { text: 'PRO', color: colors.accent };
    if (isPremium) return { text: 'PREMIUM', color: colors.primary };
    return { text: 'FREE', color: colors.textSecondary };
  };

  const getSubscriptionDescription = () => {
    if (isPro) return 'Acceso completo a todas las funciones';
    if (isPremium) return 'Vehículos ilimitados y funciones avanzadas';
    return 'Plan básico con funciones limitadas';
  };

  const handleBlockedFeature = (featureName) => {
    setShowPremiumModal(true);
  };

  const handleExportPress = () => {
    if (isFree) {
      handleBlockedFeature('Export');
    } else {
      navigation.navigate('Export');
    }
  };

  const handleAnalyticsPress = () => {
    if (isFree) {
      handleBlockedFeature('Analytics');
    } else {
      navigation.navigate('Analytics');
    }
  };

  const menuItems = [
    {
      title: t('editProfile'),
      subtitle: t('updatePersonalInfo'),
      icon: 'person',
      onPress: () => navigation.navigate('EditProfile'),
      showArrow: true
    },
    // Only show subscription option for free users
    ...(isFree ? [{
      title: t('subscription'),
      subtitle: getSubscriptionDescription(),
      icon: 'star',
      badge: getSubscriptionBadge(),
      onPress: () => navigation.navigate('Subscription'),
      showArrow: true
    }] : []),
    ...(isPro ? [{
      title: 'Compartir Vehículos',
      subtitle: 'Invitar usuarios y gestionar accesos',
      icon: 'people',
      onPress: () => navigation.navigate('VehicleSharing'),
      showArrow: true,
      badge: { text: 'PRO', color: colors.accent }
    }] : []),
    {
      title: t('notifications'),
      subtitle: t('scheduledNotifications', { count: notificationCount }),
      icon: 'notifications',
      toggle: notificationsEnabled,
      onToggle: handleNotificationToggle
    },
    {
      title: t('darkMode'),
      subtitle: isDarkMode ? t('darkModeEnabled') : t('lightModeEnabled'),
      icon: isDarkMode ? 'moon' : 'sunny',
      toggle: isDarkMode,
      onToggle: toggleTheme
    },
    {
      title: t('exportData'),
      subtitle: isFree ? 'Solo disponible en Premium' : t('exportOrBackupInfo'),
      icon: 'download',
      onPress: handleExportPress,
      showArrow: !isFree,
      isBlocked: isFree,
      badge: isFree ? { text: 'PREMIUM', color: colors.primary } : undefined
    },
    {
      title: t('analytics'),
      subtitle: isFree ? 'Solo disponible en Premium' : t('viewDetailedStats'),
      icon: 'analytics',
      onPress: handleAnalyticsPress,
      showArrow: !isFree,
      isBlocked: isFree,
      badge: isFree ? { text: 'PREMIUM', color: colors.primary } : undefined
    }
  ];

  const supportItems = [
    {
      title: t('helpCenter'),
      subtitle: t('faqAndGuides'),
      icon: 'help-circle',
      onPress: () => navigation.navigate('HelpCenter'),
      showArrow: true
    },
    {
      title: t('contactSupport'),
      subtitle: t('getTechnicalHelp'),
      icon: 'mail',
      onPress: () => {
        Linking.openURL('mailto:info@deepyze.dev?subject=Consulta CarKeeper App&body=Hola equipo de CarKeeper,%0D%0A%0D%0AMi consulta es:%0D%0A%0D%0A');
      },
      showArrow: true
    },
    {
      title: t('privacyPolicy'),
      subtitle: t('viewTermsAndConditions'),
      icon: 'shield-checkmark',
      onPress: () => navigation.navigate('PrivacyPolicy'),
      showArrow: true
    },
    {
      title: t('feedback'),
      subtitle: t('sendSuggestionsOrReportBugs'),
      icon: 'chatbox-ellipses',
      onPress: () => navigation.navigate('Feedback'),
      showArrow: true
    },
    {
      title: t('aboutCarKeeper'),
      subtitle: t('version100'),
      icon: 'information-circle',
      onPress: () => Alert.alert(t('carKeeperVersion'), t('developedWithLove')),
      showArrow: true
    }
  ];

  const dangerItems = [
    {
      title: t('deleteAccount'),
      subtitle: t('permanentlyDeleteAllData'),
      icon: 'trash',
      onPress: handleDeleteAccount,
      showArrow: true,
      isDanger: true
    }
  ];

  const renderUserInfo = () => (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()}
      style={styles.userInfoCard}
    >
      <View style={styles.userAvatar}>
        {userData?.profileImage ? (
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}${userData.profileImage}` }}
            style={styles.userImage}
          />
        ) : (
          <Text style={styles.userInitials}>
            {userData?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        )}
      </View>
      
      <View style={styles.userDetails}>
        <Text style={styles.userName}>
          {userData?.displayName || t('user')}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <View style={styles.subscriptionBadgeContainer}>
          <View style={[
            styles.subscriptionBadge,
            { backgroundColor: getSubscriptionBadge().color + '15' }
          ]}>
            <Text style={[
              styles.subscriptionBadgeText,
              { color: getSubscriptionBadge().color }
            ]}>
              {getSubscriptionBadge().text}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderMenuItem = (item, index, section = 'main') => {
    const isDanger = item.isDanger || false;
    const isBlocked = item.isBlocked || false;
    const iconColor = isDanger ? colors.danger : (isBlocked ? colors.textSecondary : colors.primary);
    const iconBgColor = isDanger ? colors.danger + '15' : (isBlocked ? colors.textSecondary + '15' : colors.primary + '15');
    const titleColor = isDanger ? colors.danger : (isBlocked ? colors.textSecondary : colors.text);
    
    return (
      <Animated.View
        key={`${section}-${index}`}
        entering={SlideInRight.duration(600).delay(index * 100).springify()}
      >
        <TouchableOpacity
          style={[
            styles.menuItem,
            isDanger && styles.dangerMenuItem,
            isBlocked && styles.blockedMenuItem
          ]}
          onPress={item.onPress}
          disabled={!item.onPress && !item.onToggle}
          activeOpacity={isBlocked ? 0.5 : 0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[
              styles.menuItemIcon,
              { backgroundColor: iconBgColor }
            ]}>
              <Ionicons name={item.icon} size={20} color={iconColor} />
            </View>
            
            <View style={styles.menuItemText}>
              <Text style={[
                styles.menuItemTitle,
                { color: titleColor }
              ]}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.menuItemRight}>
            {item.badge && (
              <View style={[
                styles.menuItemBadge,
                { backgroundColor: item.badge.color + '15' }
              ]}>
                <Text style={[
                  styles.menuItemBadgeText,
                  { color: item.badge.color }
                ]}>
                  {item.badge.text}
                </Text>
              </View>
            )}
            
            {item.onToggle && (
              <Switch
                value={item.toggle}
                onValueChange={item.onToggle}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={item.toggle ? colors.primary : colors.textLight}
              />
            )}
            
            {item.showArrow && (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDanger ? colors.danger : colors.textLight} 
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md
    },
    headerTitle: {
      fontSize: fontSize.xxl,
      fontWeight: 'bold',
      color: colors.text
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    userInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      ...shadows.md
    },
    userAvatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg
    },
    userInitials: {
      fontSize: fontSize.xxxl,
      fontWeight: 'bold',
      color: '#ffffff'
    },
    userDetails: {
      flex: 1
    },
    userName: {
      fontSize: fontSize.xl,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs
    },
    userEmail: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      marginBottom: spacing.md
    },
    subscriptionBadgeContainer: {
      alignSelf: 'flex-start'
    },
    subscriptionBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm
    },
    subscriptionBadgeText: {
      fontSize: fontSize.sm,
      fontWeight: '600'
    },
    section: {
      marginBottom: spacing.xl
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm
    },
    dangerMenuItem: {
      borderWidth: 1,
      borderColor: colors.danger + '20'
    },
    blockedMenuItem: {
      opacity: 0.6
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    menuItemIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md
    },
    menuItemText: {
      flex: 1
    },
    menuItemTitle: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs
    },
    menuItemSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm
    },
    menuItemBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm
    },
    menuItemBadgeText: {
      fontSize: fontSize.xs,
      fontWeight: '600'
    },
    logoutSection: {
      marginTop: spacing.lg
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger + '10',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.danger + '30'
    },
    logoutButtonText: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.danger,
      marginLeft: spacing.sm
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    footerText: {
      fontSize: fontSize.sm,
      color: colors.textLight,
      marginBottom: spacing.xs
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderUserInfo()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('accountAndSubscription')}</Text>
          {menuItems.map((item, index) => renderMenuItem(item, index, 'main'))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('support')}</Text>
          {supportItems.map((item, index) => renderMenuItem(item, index, 'support'))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dangerZone')}</Text>
          {dangerItems.map((item, index) => renderMenuItem(item, index, 'danger'))}
        </View>

        <Animated.View 
          entering={FadeInDown.duration(800).delay(800).springify()}
          style={styles.logoutSection}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.footer}
          onPress={handleEasterEgg}
          activeOpacity={0.8}
        >
          <Text style={styles.footerText}>{t('carKeeperVersion')}</Text>
          <Text style={styles.footerText}>{t('madeWithLove')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={() => {
          setShowPremiumModal(false);
          navigation.navigate('Subscription');
        }}
        title="Función Premium requerida"
        description="Esta función solo está disponible para usuarios Premium. Actualiza tu plan para acceder a todas las características."
        featureIcon="star-outline"
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;