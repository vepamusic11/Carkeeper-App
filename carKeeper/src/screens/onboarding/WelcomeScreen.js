import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import useAuth from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const videoSource = require('../../../assets/fondo.mp4');

const WelcomeScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { handleAppleAuth, loginApple, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const benefitsAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const buttonsScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Marcar onboarding como completado
    AsyncStorage.setItem('onboardingCompleted', 'true');

    // Secuencia de animaciones
    Animated.sequence([
      // 1. Fade in inicial
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // 2. Logo y header
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Benefits con stagger
    setTimeout(() => {
      const benefitAnimations = benefitsAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      );
      Animated.stagger(120, benefitAnimations).start();
    }, 1000);

    // 4. Botones
    setTimeout(() => {
      Animated.spring(buttonsScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 1600);
  }, []);

  const handleAppleSignIn = async () => {
    if (loading) return; // Evitar múltiples toques

    setLoading(true);
    try {
      console.log('🍎 Iniciando Apple Sign In...');

      // Verificar disponibilidad
      const isAvailable = await AppleAuthentication.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          t('appleSignInNotAvailable'),
          t('appleSignInNotSupported'),
          [{ text: t('ok') }]
        );
        setLoading(false);
        return;
      }

      // Solicitar autenticación
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('🍎 Credencial obtenida:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName
      });

      // Preparar datos para el backend
      const appleData = {
        identityToken: credential.identityToken,
        providerId: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      };

      // Llamar al AuthProvider para manejar el login con Apple
      const result = await loginApple(appleData);

      if (result.data) {
        console.log('🍎 Apple Sign In exitoso');
        // La navegación es manejada por el AuthProvider
        // No ponemos setLoading(false) aquí porque vamos a navegar
      } else {
        console.error('🍎 Error en Apple Sign In:', result.error);
        Alert.alert(
          t('error'),
          result.error || t('appleSignInFailed')
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('🍎 Error en Apple Sign In:', error);

      if (error.code === 'ERR_CANCELED') {
        console.log('🍎 Usuario canceló el Apple Sign In');
        setLoading(false);
        return;
      }

      Alert.alert(
        t('authError'),
        t('appleSignInFailed'),
        [{ text: t('ok') }]
      );
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        if (result.error && !result.error.includes('cancelado') && !result.error.includes('cancel')) {
          Alert.alert(t('error'), result.error);
        }
        setGoogleLoading(false);
      }
    } catch (error) {
      Alert.alert(t('error'), error.message || t('authError'));
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const benefits = [
    t('welcomeBenefit1'),
    t('welcomeBenefit2'),
    t('welcomeBenefit3'),
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Video Background */}
      <VideoView
        player={player}
        style={styles.background}
        nativeControls={false}
        contentFit="cover"
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScaleAnim },
                  { rotate: logoRotation }
                ]
              }
            ]}
          >
            <View style={[styles.logoBackground, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Ionicons name="car-sport" size={50} color="white" />
            </View>
          </Animated.View>

          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            CarKeeper
          </Animated.Text>
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            {t('welcomeTagline')}
          </Animated.Text>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <View style={styles.benefitsContainer}>
            <Animated.Text
              style={[
                styles.benefitsTitle,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }]
                }
              ]}
            >
              {t('welcomeBenefitsTitle')}
            </Animated.Text>

            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.benefitItem,
                    {
                      opacity: benefitsAnimations[index],
                      transform: [{
                        translateX: benefitsAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Animated.View
                    style={{
                      transform: [{
                        scale: benefitsAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        })
                      }]
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </Animated.View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

        </Animated.View>

        {/* Footer with auth options */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ scale: buttonsScaleAnim }]
            }
          ]}
        >
          {/* Apple Sign In Button */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.appleButton, loading && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              activeOpacity={0.9}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#000" />
                  <Text style={styles.appleButtonText}>{t('continueWithApple')}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.9}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>{t('continueWithGoogle')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Email/Password Button */}
          <TouchableOpacity
            style={[styles.emailButton, { borderColor: 'rgba(255, 255, 255, 0.4)' }]}
            onPress={handleEmailAuth}
            activeOpacity={0.9}
          >
            <Ionicons name="mail-outline" size={20} color="white" />
            <Text style={styles.emailButtonText}>{t('continueWithEmail')}</Text>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={handleRegister}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              {t('noAccount')} <Text style={styles.registerLinkBold}>{t('register')}</Text>
            </Text>
          </TouchableOpacity>

          {/* Additional info */}
          <Animated.View
            style={[
              styles.additionalInfo,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.securityText}>
                {t('welcomeSecurityText')}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  benefitsContainer: {
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  benefitsList: {
    alignSelf: 'stretch',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  benefitText: {
    marginLeft: 14,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 45 : 25,
    paddingTop: 35,
    marginTop: 10,
  },
  appleButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  emailButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  registerLinkText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  registerLinkBold: {
    fontWeight: 'bold',
    color: 'white',
  },
  additionalInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 6,
    textAlign: 'center',
  },
});

export default WelcomeScreen;