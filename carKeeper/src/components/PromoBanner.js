import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { t } from '../utils/i18n';

const { width } = Dimensions.get('window');

const PromoBanner = ({
  onPress,
  onDismiss,
  type = 'premium', // 'premium' | 'pro'
  style
}) => {
  const { colors } = useTheme();

  const getBannerConfig = () => {
    switch (type) {
      case 'pro':
        return {
          title: t('upgradeToPro'),
          subtitle: t('unlockAllFeatures'),
          icon: 'diamond',
          colors: ['#667eea', '#764ba2'],
          iconColor: '#FFD700'
        };
      case 'premium':
      default:
        return {
          title: t('upgradeToPremium'),
          subtitle: t('unlimitedVehiclesAndFeatures'),
          icon: 'star',
          colors: ['#16a085', '#27ae60'],
          iconColor: '#FFD700'
        };
    }
  };

  const config = getBannerConfig();

  return (
    <Animated.View
      entering={FadeInUp.duration(600).springify()}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Animated.View
            entering={SlideInRight.duration(800).delay(200)}
            style={styles.iconContainer}
          >
            <Ionicons
              name={config.icon}
              size={24}
              color={config.iconColor}
            />
          </Animated.View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          <Animated.View
            entering={SlideInRight.duration(800).delay(400)}
            style={styles.arrowContainer}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="white"
            />
          </Animated.View>
        </TouchableOpacity>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={16}
              color="rgba(255, 255, 255, 0.8)"
            />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PromoBanner;