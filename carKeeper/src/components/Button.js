import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.md
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: spacing.sm
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.5
  },

  // Variants
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  danger: {
    backgroundColor: colors.danger
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0
  },

  // Sizes
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg
  },

  // Text styles
  text: {
    fontWeight: '600'
  },
  primaryText: {
    color: '#ffffff'
  },
  secondaryText: {
    color: '#ffffff'
  },
  dangerText: {
    color: '#ffffff'
  },
  outlineText: {
    color: colors.primary
  },
  ghostText: {
    color: colors.primary
  },

  // Text sizes
  smText: {
    fontSize: fontSize.sm
  },
  mdText: {
    fontSize: fontSize.base
  },
  lgText: {
    fontSize: fontSize.lg
  }
});

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  fullWidth = false,
  style = {}
}) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : '#ffffff'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`]
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
