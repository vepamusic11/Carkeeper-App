import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  BounceIn,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import useLanguage from '../../hooks/useLanguage';
import { t } from '../../utils/i18n';

const { width } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }) => {
  const { user, userData, updateUserData, getUserStats } = useAuth();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { currentLanguage, availableLanguages, changeLanguage, isLoading: languageLoading } = useLanguage();
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState(null);

  // Animaciones
  const saveButtonScale = useSharedValue(1);
  const avatarScale = useSharedValue(1);

  // Cargar datos del usuario cuando cambien
  useEffect(() => {
    if (user || userData) {
      console.log('EditProfile - Loading user data:', { 
        user: user, 
        userData: userData,
        userKeys: user ? Object.keys(user) : [],
        userDataKeys: userData ? Object.keys(userData) : []
      });
      
      // Construir el nombre completo si existe nombre y apellido separados
      const fullName = user?.nombre && user?.apellido 
        ? `${user.nombre} ${user.apellido}`.trim()
        : '';
      
      const newFormData = {
        displayName: userData?.displayName || user?.displayName || fullName || user?.nombre || user?.name || user?.email?.split('@')[0] || '',
        phone: userData?.phone || user?.phone || user?.telefono || '',
        location: userData?.location || user?.location || user?.ubicacion || '',
        bio: userData?.bio || user?.bio || user?.biografia || ''
      };
      
      console.log('EditProfile - Setting form data:', newFormData);
      setFormData(newFormData);
    }
  }, [user, userData]);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadStats = async () => {
      const result = await getUserStats();
      if (result.success) {
        setStats(result.data);
      }
    };
    loadStats();
  }, []);

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }]
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }]
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = t('fieldRequired');
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = t('invalidPhoneFormat');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Animación del botón
    saveButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    try {
      const result = await updateUserData(formData);
      
      if (result.success) {
        // Animación del avatar
        avatarScale.value = withSequence(
          withSpring(1.2),
          withSpring(1)
        );
        
        Alert.alert(
          t('perfect'), 
          t('profileUpdatedSuccessfully'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(t('error'), result.error || t('couldNotUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLanguageChange = async (languageCode) => {
    const result = await changeLanguage(languageCode);
    if (result.success) {
      Alert.alert(t('success'), t('languageChanged'), [
        { text: t('ok'), onPress: () => {
          // Forzar re-render de la pantalla para mostrar el nuevo idioma
          navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileMain' }],
          });
        }}
      ]);
    } else {
      Alert.alert(t('error'), result.error || t('couldNotChangeLanguage'));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    keyboardView: {
      flex: 1
    },
    
    // Header
    headerGradient: {
      paddingBottom: spacing.lg,
      ...shadows.lg
    },
    safeArea: {
      flex: 0
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white'
    },
    placeholder: {
      width: 44
    },

    // Scroll
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl * 2
    },

    // Avatar
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      position: 'relative'
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg
    },
    avatarText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: 'white'
    },
    cameraButton: {
      position: 'absolute',
      bottom: 5,
      right: width / 2 - 80,
      borderRadius: 18,
      overflow: 'hidden',
      ...shadows.md
    },
    cameraGradient: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center'
    },

    // Form
    formContainer: {
      marginBottom: spacing.xl
    },
    fieldContainer: {
      marginBottom: spacing.lg
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm
    },
    inputError: {
      borderColor: colors.danger
    },
    textAreaContainer: {
      alignItems: 'flex-start'
    },
    inputIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      margin: spacing.sm
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: spacing.md,
      paddingRight: spacing.md,
      minHeight: 44
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
      paddingTop: spacing.md
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      marginTop: spacing.xs,
      marginLeft: spacing.sm
    },
    fieldDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
      lineHeight: 16
    },

    // Email Info
    emailContainer: {
      marginBottom: spacing.xl
    },
    emailCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.warning + '15',
      ...shadows.sm
    },
    emailIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.warning + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md
    },
    emailInfo: {
      flex: 1
    },
    emailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.warning,
      marginBottom: 2
    },
    emailValue: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 2
    },
    emailDescription: {
      fontSize: 12,
      color: colors.textSecondary
    },
    emailButton: {
      padding: spacing.sm
    },

    // Stats
    statsContainer: {
      marginBottom: spacing.xl
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    },
    statItem: {
      width: '48%',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: spacing.md,
      minHeight: 100,
      ...shadows.sm
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm
    },
    statValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
      numberOfLines: 2
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      numberOfLines: 1
    },

    // Language Section
    languageContainer: {
      marginBottom: spacing.xl
    },
    languageTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md
    },
    languageOptions: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      ...shadows.sm
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    lastLanguageOption: {
      borderBottomWidth: 0
    },
    languageFlag: {
      fontSize: 24,
      marginRight: spacing.md
    },
    languageInfo: {
      flex: 1
    },
    languageName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text
    },
    languageCode: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2
    },
    selectedLanguage: {
      backgroundColor: colors.primary + '10'
    },
    checkIcon: {
      marginLeft: spacing.sm
    },

    // Save Button
    saveContainer: {
      marginTop: spacing.lg
    },
    saveButton: {
      borderRadius: 16,
      overflow: 'hidden'
    },
    saveGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      gap: spacing.sm
    },
    saveButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white'
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm
    }
  });

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editProfile')}</Text>
          <View style={styles.placeholder} />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderAvatar = () => (
    <Animated.View 
      entering={BounceIn.delay(400)}
      style={[styles.avatarContainer, avatarStyle]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>
          {(formData.displayName || user?.displayName || user?.nombre || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
        </Text>
      </LinearGradient>
      <TouchableOpacity 
        style={styles.cameraButton}
        onPress={() => Alert.alert(t('comingSoon'), t('changePhotoFeatureSoon'))}
      >
        <LinearGradient
          colors={[colors.success, colors.successDark || colors.success]}
          style={styles.cameraGradient}
        >
          <Ionicons name="camera" size={16} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFormField = (field, label, placeholder, options = {}) => (
    <Animated.View 
      entering={SlideInRight.delay(600 + options.index * 100)}
      style={styles.fieldContainer}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        errors[field] && styles.inputError,
        options.multiline && styles.textAreaContainer
      ]}>
        <View style={[styles.inputIcon, { backgroundColor: options.color + '15' }]}>
          <Ionicons name={options.icon} size={20} color={options.color} />
        </View>
        <TextInput
          style={[styles.textInput, options.multiline && styles.textArea]}
          value={formData[field]}
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline={options.multiline}
          numberOfLines={options.multiline ? 3 : 1}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'words'}
        />
      </View>
      {errors[field] && (
        <Animated.View entering={SlideInRight.duration(300)}>
          <Text style={styles.errorText}>{errors[field]}</Text>
        </Animated.View>
      )}
      {options.description && (
        <Text style={styles.fieldDescription}>{options.description}</Text>
      )}
    </Animated.View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      {renderFormField('displayName', t('fullName'), formData.displayName || t('fullNameExample'), {
        index: 0,
        icon: 'person',
        color: '#667eea',
        description: t('nameWillAppearOnProfile')
      })}

      {renderFormField('phone', t('phoneOptional'), formData.phone || t('phoneExample'), {
        index: 1,
        icon: 'call',
        color: '#16A34A',
        keyboardType: 'phone-pad',
        autoCapitalize: 'none',
        description: t('forEmergencyContact')
      })}

      {renderFormField('location', t('locationOptional'), formData.location || t('locationExample'), {
        index: 2,
        icon: 'location',
        color: '#EA580C',
        description: t('helpsNearbyServices')
      })}

      {renderFormField('bio', t('aboutYouOptional'), formData.bio || t('tellUsAboutYou'), {
        index: 3,
        icon: 'document-text',
        color: '#8B5CF6',
        multiline: true,
        autoCapitalize: 'sentences',
        description: t('briefPersonalDescription')
      })}
    </View>
  );

  const renderEmailInfo = () => (
    <Animated.View 
      entering={SlideInRight.delay(1000)}
      style={styles.emailContainer}
    >
      <View style={styles.emailCard}>
        <View style={styles.emailIcon}>
          <Ionicons name="mail" size={20} color={colors.warning} />
        </View>
        <View style={styles.emailInfo}>
          <Text style={styles.emailLabel}>{t('emailNotEditable')}</Text>
          <Text style={styles.emailValue}>{user?.email || userData?.email || t('notAvailable')}</Text>
          <Text style={styles.emailDescription}>
            {t('changeEmailContactSupport')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => Alert.alert(t('contactSupport'), t('comingSoonAvailable'))}
        >
          <Ionicons name="help-circle" size={20} color={colors.warning} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStats = () => (
    <Animated.View 
      entering={BounceIn.delay(1200)}
      style={styles.statsContainer}
    >
      <Text style={styles.statsTitle}>{t('yourAccount')}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>
            {stats?.fechaRegistro 
              ? new Date(stats.fechaRegistro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
              : t('recently')
            }
          </Text>
          <Text style={styles.statLabel}>{t('memberSince')}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="car" size={16} color={colors.success} />
          </View>
          <Text style={styles.statValue}>{stats?.vehiculos || 0}</Text>
          <Text style={styles.statLabel}>{t('vehicles')}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="wallet" size={16} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats?.gastos || 0}</Text>
          <Text style={styles.statLabel}>{t('expensesRecorded')}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.primaryLight + '15' }]}>
            <Ionicons name="build" size={16} color={colors.primaryLight} />
          </View>
          <Text style={styles.statValue}>{stats?.mantenimientos || 0}</Text>
          <Text style={styles.statLabel}>{t('maintenance')}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderLanguageSelector = () => (
    <Animated.View 
      entering={BounceIn.delay(1300)}
      style={styles.languageContainer}
    >
      <Text style={styles.languageTitle}>{t('language')}</Text>
      <View style={styles.languageOptions}>
        {availableLanguages.map((language, index) => {
          const isSelected = language.code === currentLanguage;
          const isLast = index === availableLanguages.length - 1;
          
          return (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                isSelected && styles.selectedLanguage,
                isLast && styles.lastLanguageOption
              ]}
              onPress={() => handleLanguageChange(language.code)}
              disabled={languageLoading || isSelected}
              activeOpacity={0.7}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageCode}>
                  {language.code.toUpperCase()} • {isSelected ? t('currentLanguage') : t('selectLanguage')}
                </Text>
              </View>
              {isSelected && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={colors.primary} 
                  style={styles.checkIcon}
                />
              )}
              {languageLoading && !isSelected && (
                <Ionicons 
                  name="hourglass" 
                  size={16} 
                  color={colors.textSecondary} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderSaveButton = () => (
    <Animated.View 
      entering={BounceIn.delay(1400)}
      style={[styles.saveContainer, saveButtonStyle]}
    >
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={loading ? [colors.textSecondary, colors.textLight] : [colors.primary, colors.primaryDark]}
          style={styles.saveGradient}
        >
          {loading ? (
            <Animated.View 
              entering={BounceIn}
              style={styles.loadingContainer}
            >
              <Ionicons name="hourglass" size={20} color="white" />
              <Text style={styles.saveButtonText}>{t('saving')}</Text>
            </Animated.View>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderAvatar()}
          {renderForm()}
          {renderEmailInfo()}
          {renderStats()}
          {renderLanguageSelector()}
          {renderSaveButton()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;