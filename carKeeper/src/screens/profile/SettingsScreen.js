import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
  StatusBar,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  SlideInRight, 
  BounceIn,
  ZoomIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

const { width } = Dimensions.get('window');

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
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

  // Sections
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md
  },

  // Profile Card
  profileCard: {
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.md
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  profileInfo: {
    flex: 1
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },

  // Settings
  settingItem: {
    marginBottom: spacing.sm
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    ...shadows.sm
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  settingText: {
    flex: 1
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 16
  },
  disabledText: {
    color: colors.textSecondary
  },

  // Data Options
  dataItem: {
    marginBottom: spacing.sm
  },
  dataGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    ...shadows.sm
  },
  dataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  dataIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  dataText: {
    flex: 1
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  dataSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 16
  },

  // About Section
  aboutSection: {
    marginTop: spacing.lg
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 20,
    ...shadows.lg
  },
  aboutContent: {
    flex: 1
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4
  },
  aboutSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm
  },
  aboutDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18
  },
  aboutIcon: {
    marginLeft: spacing.md
  }
});

const SettingsScreen = ({ navigation }) => {
  const { user, userData, updateUserData, updateUserSettings } = useAuth();
  const { colors, spacing, fontSize, borderRadius, shadows, fontScale, setFontScale, isDarkMode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState(
    userData?.settings || {
      notifications: true,
      autoBackup: false,
      darkMode: false,
      biometrics: false,
      analytics: true,
      crashReporting: true,
      language: 'es'
    }
  );

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert(t('error'), t('nameCannotBeEmpty'));
      return;
    }

    try {
      const result = await updateUserData({ displayName: displayName.trim() });
      if (result.success) {
        setIsEditing(false);
        Alert.alert(t('perfect'), t('profileUpdated'));
      } else {
        Alert.alert(t('error'), result.error || t('couldNotUpdateProfile'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('unexpectedError'));
    }
  };

  const handleSettingToggle = async (key, value) => {
    // Dark mode uses ThemeProvider directly
    if (key === 'darkMode') {
      toggleTheme();
      return;
    }

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const messages = {
      notifications: value ? t('notificationsEnabledWithIcon') : t('notificationsDisabledWithIcon'),
      autoBackup: value ? t('autoBackupEnabledWithIcon') : t('autoBackupDisabled'),
      biometrics: value ? t('comingSoonFinger') : t('biometricsDisabled'),
      analytics: value ? t('analyticsEnabledWithIcon') : t('analyticsDisabled'),
      crashReporting: value ? t('crashReportingEnabledWithIcon') : t('crashReportingDisabled')
    };

    try {
      const result = await updateUserSettings(newSettings);
      if (result.success) {
        Alert.alert(t('settingsUpdated'), messages[key]);
      } else {
        setSettings(prev => ({ ...prev, [key]: !value }));
        Alert.alert(t('error'), result.error || t('couldNotUpdateSettings'));
      }
    } catch (error) {
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert(t('error'), t('errorUpdatingSettings'));
    }

    if (key === 'biometrics') {
      setTimeout(() => setSettings(prev => ({ ...prev, [key]: false })), 1000);
    }
  };

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
          <Text style={styles.headerTitle}>{t('settings')}</Text>
          <View style={styles.placeholder} />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderProfileSection = () => (
    <Animated.View 
      entering={FadeInDown.duration(800).delay(200)}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{t('personalProfileIcon')}</Text>
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={styles.profileCard}
      >
        <View style={styles.profileRow}>
          <View style={styles.profileLeft}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>
                {displayName.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>{t('username')}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "close" : "create"} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {isEditing && (
          <Animated.View 
            entering={SlideInRight.duration(400)}
            style={styles.editSection}
          >
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('enterYourName')}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.saveButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const renderFontScaleSection = () => (
    <Animated.View
      entering={FadeInDown.duration(800).delay(300)}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{t('fontSizeTitle')}</Text>
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={[styles.profileCard, { paddingVertical: spacing.md }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md }}>
          {[
            { key: 'small', label: 'A', size: 14 },
            { key: 'medium', label: 'A', size: 18 },
            { key: 'large', label: 'A', size: 24 }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setFontScale(option.key)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: fontScale === option.key ? colors.primary : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: fontScale === option.key ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{
                fontSize: option.size,
                fontWeight: '700',
                color: fontScale === option.key ? '#fff' : colors.text,
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{
          fontSize: fontSize.base,
          color: colors.textSecondary,
          textAlign: 'center',
        }}>
          {t('fontSizePreview')}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderSettingsSection = () => {
    const settingsData = [
      {
        key: 'notifications',
        title: t('pushNotifications'),
        subtitle: t('receiveMaintenanceReminders'),
        icon: 'notifications',
        color: '#667eea',
        available: true
      },
      {
        key: 'autoBackup',
        title: t('automaticBackup'),
        subtitle: t('syncDataToCloud'),
        icon: 'cloud-upload',
        color: '#16A34A',
        available: true
      },
      {
        key: 'darkMode',
        title: t('darkTheme'),
        subtitle: isDarkMode ? t('darkModeEnabled') : t('lightModeEnabled'),
        icon: 'moon',
        color: '#6366f1',
        available: true
      },
      {
        key: 'biometrics',
        title: t('biometricAuthentication'),
        subtitle: t('comingSoonAvailable'),
        icon: 'finger-print',
        color: '#EA580C',
        available: false
      },
      {
        key: 'analytics',
        title: t('usageAnalytics'),
        subtitle: t('helpImproveApp'),
        icon: 'analytics',
        color: '#8B5CF6',
        available: true
      },
      {
        key: 'crashReporting',
        title: t('errorReports'),
        subtitle: t('sendAutomaticCrashReports'),
        icon: 'bug',
        color: '#DC2626',
        available: true
      }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('preferencesIcon')}</Text>
        {settingsData.map((setting, index) => (
          <Animated.View
            key={setting.key}
            entering={SlideInRight.delay(400 + index * 100)}
            style={styles.settingItem}
          >
            <LinearGradient
              colors={[colors.surface, colors.background]}
              style={styles.settingGradient}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: setting.color + '15' }]}>
                  <Ionicons 
                    name={setting.icon} 
                    size={20} 
                    color={setting.available ? setting.color : colors.textSecondary} 
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    !setting.available && styles.disabledText
                  ]}>
                    {setting.title}
                  </Text>
                  <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
                </View>
              </View>
              <Switch
                value={setting.key === 'darkMode' ? isDarkMode : settings[setting.key]}
                onValueChange={(value) => handleSettingToggle(setting.key, value)}
                disabled={!setting.available}
                trackColor={{
                  false: colors.border,
                  true: setting.available ? setting.color + '30' : colors.border
                }}
                thumbColor={(setting.key === 'darkMode' ? isDarkMode : settings[setting.key]) && setting.available ? setting.color : colors.textSecondary}
              />
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderDataSection = () => {
    const dataOptions = [
      {
        title: t('exportData'),
        subtitle: t('downloadAllInformation'),
        icon: 'download',
        color: '#16A34A',
        onPress: () => navigation.navigate('Export')
      },
      {
        title: t('importData'),
        subtitle: t('restoreFromBackup'),
        icon: 'cloud-download',
        color: '#667eea',
        onPress: () => Alert.alert(t('comingSoon'), t('featureAvailableSoon'))
      },
      {
        title: t('clearCache'),
        subtitle: t('freeStorageSpace'),
        icon: 'trash',
        color: '#EA580C',
        onPress: () => {
          Alert.alert(
            t('clearCache'),
            t('clearCacheConfirm'),
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: t('clear'), 
                onPress: () => Alert.alert(t('doneWithBroom'), t('cacheClearedSuccessfully'))
              }
            ]
          );
        }
      },
      {
        title: t('deleteAccount'),
        subtitle: t('permanentlyDeleteAllData'),
        icon: 'person-remove',
        color: '#DC2626',
        onPress: () => {
          Alert.alert(
            t('deleteAccountTitle'),
            t('deleteAccountWarningShort'),
            [
              { text: t('cancel'), style: 'cancel' },
              { 
                text: t('delete'), 
                style: 'destructive',
                onPress: () => Alert.alert(t('featureNotAvailable'), t('contactSupportToDelete'))
              }
            ]
          );
        }
      }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dataAndPrivacyIcon')}</Text>
        {dataOptions.map((option, index) => (
          <Animated.View
            key={option.title}
            entering={SlideInRight.delay(800 + index * 100)}
          >
            <TouchableOpacity
              style={styles.dataItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.surface, colors.background]}
                style={styles.dataGradient}
              >
                <View style={styles.dataLeft}>
                  <View style={[styles.dataIcon, { backgroundColor: option.color + '15' }]}>
                    <Ionicons name={option.icon} size={20} color={option.color} />
                  </View>
                  <View style={styles.dataText}>
                    <Text style={[
                      styles.dataTitle,
                      option.color === '#DC2626' && { color: option.color }
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={styles.dataSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderAboutSection = () => (
    <Animated.View 
      entering={BounceIn.delay(1200)}
      style={styles.aboutSection}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.aboutCard}
      >
        <View style={styles.aboutContent}>
          <Text style={styles.aboutTitle}>{t('carKeeperVersion')}</Text>
          <Text style={styles.aboutSubtitle}>{t('digitalCompanionForVehicles')}</Text>
          <Text style={styles.aboutDescription}>
            {t('developedWithLoveByDeepyze')}
          </Text>
        </View>
        <View style={styles.aboutIcon}>
          <Ionicons name="car-sport" size={40} color="white" />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileSection()}
        {renderFontScaleSection()}
        {renderSettingsSection()}
        {renderDataSection()}
        {renderAboutSection()}
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;