import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import clienteAxios from '../../configs/clinteAxios.jsx';

const feedbackTypes = [
  { key: 'suggestion', icon: 'bulb', color: '#f59e0b' },
  { key: 'bug', icon: 'bug', color: '#ef4444' },
  { key: 'feature', icon: 'rocket', color: '#8b5cf6' },
  { key: 'other', icon: 'chatbubble-ellipses', color: '#6b7280' },
];

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerGradient: {
    paddingBottom: spacing.md,
    ...shadows.sm
  },
  safeArea: { flex: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  placeholder: { width: 40 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  typeButtonActive: {
    borderWidth: 2
  },
  typeLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  typeLabelActive: {
    fontWeight: '600'
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.lg
  },
  ratingSection: {
    marginBottom: spacing.xl
  },
  ratingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.md
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm
  },
  submitText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: '#fff'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl
  },
  feedbackItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  feedbackType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  feedbackTypeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text
  },
  feedbackDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary
  },
  feedbackMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20
  },
  feedbackStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm
  },
  feedbackStatusText: {
    fontSize: fontSize.xs
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl
  }
});

const FeedbackScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);
  const [selectedType, setSelectedType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const { data } = await clienteAxios.get('/feedback');
      setFeedbacks(data);
    } catch (error) {
      // silently fail
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('error'), t('feedbackMessageRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: selectedType,
        message: message.trim(),
      };
      if (rating > 0) payload.rating = rating;

      await clienteAxios.post('/feedback', payload);
      Alert.alert(t('thankYou'), t('feedbackSent'));
      setMessage('');
      setRating(0);
      loadFeedbacks();
    } catch (error) {
      Alert.alert(t('error'), t('feedbackSendError'));
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeInfo = (type) => feedbackTypes.find(ft => ft.key === type) || feedbackTypes[3];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('feedback')}</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(600)}>
            <Text style={styles.sectionTitle}>{t('feedbackType')}</Text>
            <View style={styles.typeSelector}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    selectedType === type.key && [styles.typeButtonActive, { borderColor: type.color }]
                  ]}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedType === type.key ? type.color : colors.textSecondary}
                  />
                  <Text style={[
                    styles.typeLabel,
                    selectedType === type.key && [styles.typeLabelActive, { color: type.color }]
                  ]}>
                    {t(type.key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('yourMessage')}</Text>
            <TextInput
              style={styles.messageInput}
              placeholder={t('feedbackPlaceholder')}
              placeholderTextColor={colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              maxLength={2000}
            />

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>{t('rateExperience')}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#f59e0b' : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.submitGradient}
              >
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.submitText}>
                  {submitting ? t('sending') : t('sendFeedback')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {feedbacks.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>{t('previousFeedbacks')}</Text>
              {feedbacks.map((fb, index) => {
                const typeInfo = getTypeInfo(fb.type);
                return (
                  <Animated.View key={fb._id} entering={SlideInRight.delay(index * 80)}>
                    <View style={styles.feedbackItem}>
                      <View style={styles.feedbackHeader}>
                        <View style={styles.feedbackType}>
                          <Ionicons name={typeInfo.icon} size={16} color={typeInfo.color} />
                          <Text style={styles.feedbackTypeText}>{t(fb.type)}</Text>
                        </View>
                        <Text style={styles.feedbackDate}>
                          {new Date(fb.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                      <Text style={styles.feedbackMessage} numberOfLines={3}>{fb.message}</Text>
                      <View style={styles.feedbackStatus}>
                        <Ionicons
                          name={fb.status === 'reviewed' ? 'checkmark-circle' : 'time'}
                          size={14}
                          color={fb.status === 'reviewed' ? colors.success : colors.warning}
                        />
                        <Text style={[
                          styles.feedbackStatusText,
                          { color: fb.status === 'reviewed' ? colors.success : colors.warning }
                        ]}>
                          {fb.status === 'reviewed' ? t('reviewed') : t('pending')}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
            </>
          )}

          {feedbacks.length === 0 && !loadingFeedbacks && (
            <Text style={styles.emptyText}>{t('noPreviousFeedbacks')}</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default FeedbackScreen;
