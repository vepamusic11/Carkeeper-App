import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import condicional: lottie-react-native no funciona en Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
let LottieView = null;
if (!isExpoGo) {
  try {
    LottieView = require('lottie-react-native').default;
  } catch (e) {
    console.log('LottieView not available, using fallback');
  }
}

// Fallback animado para cuando Lottie no está disponible
const AnimatedFallback = ({ iconName, accentColor }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={fallbackStyles.container}>
      <Animated.View style={[fallbackStyles.iconCircle, { backgroundColor: accentColor + '20' }, animatedIconStyle]}>
        <Ionicons name={iconName} size={80} color={accentColor} />
      </Animated.View>
    </View>
  );
};

const fallbackStyles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Datos de los slides del onboarding
  const slides = [
    {
      id: 1,
      title: t('onboardingWelcomeTitle'),
      subtitle: t('onboardingWelcomeSubtitle'),
      description: t('onboardingWelcomeDescription'),
      lottieSource: require('../../assets/lottie/welcome.json'), // Usa tu archivo Lottie
      accentColor: colors.primary,
      iconFallback: 'car-sport'
    },
    {
      id: 2,
      title: t('onboardingMaintenanceTitle'),
      subtitle: t('onboardingMaintenanceSubtitle'),
      description: t('onboardingMaintenanceDescription'),
      lottieSource: require('../../assets/lottie/maintenance.json'), // Usa tu archivo Lottie
      accentColor: '#F59E0B',
      iconFallback: 'build'
    },
    {
      id: 3,
      title: t('onboardingExpensesTitle'),
      subtitle: t('onboardingExpensesSubtitle'),
      description: t('onboardingExpensesDescription'),
      lottieSource: require('../../assets/lottie/expenses.json'), // Usa tu archivo Lottie
      accentColor: '#16A34A',
      iconFallback: 'wallet'
    },
    {
      id: 4,
      title: t('onboardingDocumentsTitle'),
      subtitle: t('onboardingDocumentsSubtitle'),
      description: t('onboardingDocumentsDescription'),
      lottieSource: require('../../assets/lottie/documents.json'), // Usa tu archivo Lottie
      accentColor: '#8B5CF6',
      iconFallback: 'document-text'
    },
    {
      id: 5,
      title: t('onboardingFinalTitle'),
      subtitle: t('onboardingFinalSubtitle'),
      description: t('onboardingFinalDescription'),
      lottieSource: require('../../assets/lottie/rocket.json'), // Usa tu archivo Lottie
      accentColor: '#EA580C',
      iconFallback: 'rocket'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setCurrentSlide)(currentSlide + 1);
        opacity.value = withTiming(1, { duration: 300 });
      });
    } else {
      // Último slide - marcar onboarding como visto e ir al WelcomeScreen
      AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.navigate('Welcome');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setCurrentSlide)(currentSlide - 1);
        opacity.value = withTiming(1, { duration: 300 });
      });
    }
  };

  const skipOnboarding = () => {
    // Marcar onboarding como visto y ir al WelcomeScreen
    AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.navigate('Welcome');
  };

  // Función para saltar onboarding removida - solo disponible en paywall

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderSlide = (slide) => (
    <Animated.View style={[styles.slide, animatedStyle]} key={slide.id}>
      <View style={styles.whiteBackground}>
        {/* Header con botón skip */}
        <SafeAreaView style={styles.header}>
          {/* Botón Skip dentro del SafeAreaView */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipOnboarding}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Animación Lottie */}
          <Animated.View 
            entering={FadeInUp.duration(800).springify()}
            style={styles.animationContainer}
          >
            {LottieView ? (
              <LottieView
                source={slide.lottieSource}
                style={styles.lottie}
                autoPlay
                loop
              />
            ) : (
              <AnimatedFallback iconName={slide.iconFallback} accentColor={slide.accentColor} />
            )}
          </Animated.View>

          {/* Texto */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.textContainer}
          >
            <Text style={[styles.title, { color: slide.accentColor }]}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>
        </View>

        {/* Indicadores y navegación */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.footer}
        >
          {/* Indicadores de página */}
          <View style={styles.indicators}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentSlide 
                      ? slides[currentSlide].accentColor 
                      : colors.textSecondary + '40',
                    width: index === currentSlide ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>

          {/* Botones de navegación */}
          <View style={styles.navigation}>
            {currentSlide > 0 && (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: slides[currentSlide].accentColor + '20' }]}
                onPress={prevSlide}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={slides[currentSlide].accentColor} />
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />

            <TouchableOpacity
              style={[styles.navButton, styles.nextButton, { backgroundColor: slides[currentSlide].accentColor }]}
              onPress={nextSlide}
              activeOpacity={0.7}
            >
              {currentSlide === slides.length - 1 ? (
                <Text style={styles.buttonText}>{t('onboardingStart')}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {renderSlide(slides[currentSlide])}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    flex: 1,
    width: width,
  },
  whiteBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    height: 60,
  },
  skipButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  lottie: {
    width: 280,
    height: 280,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    paddingHorizontal: 20,
    minWidth: 50,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
});

export default OnboardingScreen;