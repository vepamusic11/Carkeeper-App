import { useMemo } from 'react';
import { useTheme as useThemeContext } from '../context/ThemeProvider';
import { colors as lightColors, spacing as baseSpacing, fontSize as baseFontSize, borderRadius, shadows } from '../constants/theme';
import { wp, ms } from '../utils/responsive';

// Colores para modo oscuro
const darkColors = {
  primary: '#60a5fa',
  primaryDark: '#3b82f6',
  primaryLight: '#93c5fd',
  secondary: '#34d399',
  accent: '#fbbf24',
  danger: '#f87171',
  warning: '#fb923c',
  success: '#4ade80',

  background: '#0f172a',
  surface: '#1e293b',
  surfaceSecondary: '#334155',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',

  border: '#374151',
  borderLight: '#4b5563',

  // Gradientes para modo oscuro
  gradientStart: '#1e293b',
  gradientEnd: '#334155'
};

const FONT_SCALE_MULTIPLIERS = {
  small: 0.85,
  medium: 1,
  large: 1.18
};

export const useTheme = () => {
  const { isDarkMode, toggleTheme, fontScale, setFontScale, currency, setCurrency } = useThemeContext();

  const colors = isDarkMode ? darkColors : lightColors;

  const scaledFontSize = useMemo(() => {
    const multiplier = FONT_SCALE_MULTIPLIERS[fontScale] || 1;
    return {
      xs: ms(baseFontSize.xs) * multiplier,
      sm: ms(baseFontSize.sm) * multiplier,
      base: ms(baseFontSize.base) * multiplier,
      lg: ms(baseFontSize.lg) * multiplier,
      xl: ms(baseFontSize.xl) * multiplier,
      xxl: ms(baseFontSize.xxl) * multiplier,
      xxxl: ms(baseFontSize.xxxl) * multiplier,
      title: ms(baseFontSize.title) * multiplier,
    };
  }, [fontScale]);

  const responsiveSpacing = useMemo(() => ({
    xs: wp(baseSpacing.xs),
    sm: wp(baseSpacing.sm),
    md: wp(baseSpacing.md),
    lg: wp(baseSpacing.lg),
    xl: wp(baseSpacing.xl),
    xxl: wp(baseSpacing.xxl),
  }), []);

  // Sombras adaptadas para modo oscuro
  const adaptedShadows = isDarkMode ? {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8
    }
  } : shadows;

  return {
    isDarkMode,
    toggleTheme,
    colors,
    spacing: responsiveSpacing,
    fontSize: scaledFontSize,
    borderRadius,
    shadows: adaptedShadows,
    fontScale,
    setFontScale,
    currency,
    setCurrency
  };
};
