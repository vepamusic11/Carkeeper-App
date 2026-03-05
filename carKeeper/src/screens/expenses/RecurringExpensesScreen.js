import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useGastosRecurrentes from '../../hooks/useGastosRecurrentes';
import useVehiculos from '../../hooks/useVehiculos';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

const frequencyLabels = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual'
};

const categoryEmojis = {
  combustible: '⛽',
  mantenimiento: '🔧',
  maintenance: '🔧',
  seguro: '🛡️',
  estacionamiento: '🅿️',
  peajes: '🛣️',
  otro: '💰',
  registro: '📋',
  multas: '🚨',
  lavado: '🚿',
  accesorios: '🔩',
  reparacion: '🔨'
};

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerGradient: {
    paddingBottom: spacing.md,
    ...shadows.sm
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
  placeholder: {
    width: 40
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm
  },
  cardInactive: {
    opacity: 0.6
  },
  cardContent: {
    padding: spacing.md
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: spacing.md
  },
  cardInfo: {
    flex: 1
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2
  },
  cardCategory: {
    fontSize: fontSize.xs,
    color: colors.textSecondary
  },
  cardAmount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  deleteButton: {
    padding: 4
  },
  vehicleName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptyDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    right: 20,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.lg
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const RecurringExpensesScreen = ({ navigation }) => {
  const { gastosRecurrentes, loading, loadAll, toggleGastoRecurrente, deleteGastoRecurrente } = useGastosRecurrentes();
  const { vehiculos } = useVehiculos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleToggle = async (id) => {
    await toggleGastoRecurrente(id);
  };

  const handleDelete = (id, description) => {
    Alert.alert(
      t('deleteRecurringExpense'),
      t('deleteRecurringExpenseConfirm', { name: description }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const result = await deleteGastoRecurrente(id);
            if (result.error) {
              Alert.alert(t('error'), result.error);
            }
          }
        }
      ]
    );
  };

  const getVehicleName = (vehicleId) => {
    if (vehicleId && typeof vehicleId === 'object') {
      return `${vehicleId.marca} ${vehicleId.modelo}`;
    }
    const vehicle = vehiculos.find(v => v._id === vehicleId);
    return vehicle ? `${vehicle.marca} ${vehicle.modelo}` : '';
  };

  const renderItem = useCallback(({ item, index }) => {
    const emoji = categoryEmojis[item.category] || '💰';
    const freqLabel = frequencyLabels[item.frequency] || item.frequency;
    const nextDate = new Date(item.nextDueDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
        <View style={[styles.card, !item.isActive && styles.cardInactive]}>
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <Text style={styles.cardEmoji}>{emoji}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.description || t(item.category)}
                </Text>
                <Text style={styles.cardCategory}>{t(item.category)}</Text>
                <Text style={styles.vehicleName}>{getVehicleName(item.vehicleId)}</Text>
              </View>
              <Text style={styles.cardAmount}>${item.amount?.toLocaleString()}</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="repeat" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{freqLabel}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{nextDate}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id, item.description)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggle(item._id)}
                  trackColor={{ false: colors.border, true: colors.primary + '30' }}
                  thumbColor={item.isActive ? colors.primary : colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }, [colors, styles]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={styles.emptyTitle}>{t('noRecurringExpenses')}</Text>
      <Text style={styles.emptyDescription}>{t('noRecurringExpensesDescription')}</Text>
    </View>
  );

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
            <Text style={styles.headerTitle}>{t('recurringExpenses')}</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={gastosRecurrentes}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <Animated.View entering={SlideInRight.springify()} style={styles.addButton}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { isRecurring: true })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default RecurringExpensesScreen;
