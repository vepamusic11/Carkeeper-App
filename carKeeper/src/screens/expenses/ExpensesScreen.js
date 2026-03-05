import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  SlideInRight,
  FadeInUp,
  BounceIn,
  SlideInLeft,
  ZoomIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useGastos from '../../hooks/useGastos';
import useVehiculos from '../../hooks/useVehiculos';
import useSubscription from '../../hooks/useSubscription';
import { gastosService } from '../../services/gastosApi';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import PremiumModal from '../../components/PremiumModal';

const { width, height } = Dimensions.get('window');
// const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Categorías con colores más vibrantes y gradientes
const expenseCategories = {
  combustible: {
    nameKey: 'fuel',
    icon: 'car-sport',
    colors: ['#FF6B6B', '#FF8E53'],
    lightColors: ['#FFE5E5', '#FFE0D6'],
    emoji: '⛽'
  },
  mantenimiento: {
    nameKey: 'maintenance',
    icon: 'construct',
    colors: ['#4ECDC4', '#44A08D'],
    lightColors: ['#E3F9F7', '#E0F5F0'],
    emoji: '🔧'
  },
  seguro: {
    nameKey: 'insurance',
    icon: 'shield-checkmark',
    colors: ['#A8E6CF', '#7FCDCD'],
    lightColors: ['#F0FBF6', '#E8F7F7'],
    emoji: '🛡️'
  },
  estacionamiento: {
    nameKey: 'parking',
    icon: 'car',
    colors: ['#FFD93D', '#6BCF7F'],
    lightColors: ['#FFF9E6', '#E8F5EA'],
    emoji: '🅿️'
  },
  peajes: {
    nameKey: 'tolls',
    icon: 'card',
    colors: ['#FF8A80', '#FF5722'],
    lightColors: ['#FFE9E7', '#FFE5DF'],
    emoji: '🛣️'
  },
  otro: {
    nameKey: 'other',
    icon: 'ellipsis-horizontal-circle',
    colors: ['#CE93D8', '#BA68C8'],
    lightColors: ['#F7ECF9', '#F4E8F6'],
    emoji: '💰'
  }
};

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  // Header Styles
  headerContainer: {
    ...shadows.sm
  },
  headerGradient: {
    paddingBottom: spacing.md
  },
  safeArea: {
    flex: 0
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff'
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addButtonHeader: {
    backgroundColor: 'rgba(255,255,255,0.25)'
  },

  // ScrollView / FlatList
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },

  // Dashboard Styles
  dashboardWrapper: {
    paddingTop: spacing.md
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  periodTabActive: {
    backgroundColor: colors.background,
    ...shadows.sm
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  periodTabTextActive: {
    color: colors.primary
  },

  summaryCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.md
  },
  summaryGradient: {
    padding: spacing.lg
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statEmoji: {
    fontSize: 20
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg
  },

  // Categories Styles
  categoriesSection: {
    marginTop: spacing.xl
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: spacing.lg,
    marginBottom: spacing.md
  },
  categoriesContent: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm
  },
  categoryCard: {
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.sm
  },
  categoryCardActive: {
    ...shadows.md
  },
  categoryGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 120
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 8
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4
  },
  categoryNameActive: {
    color: '#fff'
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  categoryAmountActive: {
    color: '#fff'
  },

  // Expenses List
  expensesList: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  listCount: {
    fontSize: 14,
    color: colors.textSecondary
  },
  listContainer: {
    gap: spacing.sm
  },

  // Expense Item
  expenseItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    ...shadows.sm,
    marginBottom: 8
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md
  },
  expenseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  expenseIcon: {
    fontSize: 24
  },
  expenseDetails: {
    flex: 1
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  expenseMeta: {
    fontSize: 13,
    color: colors.textSecondary
  },
  expenseDot: {
    fontSize: 12,
    color: colors.border,
    marginHorizontal: 6
  },
  expenseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  expensePrice: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl
  },
  emptyIcon: {
    fontSize: 60
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptyDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    gap: spacing.sm
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },

  // No Vehicles
  noVehiclesWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl
  },
  noVehiclesContent: {
    alignItems: 'center'
  },
  noVehiclesIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl
  },
  noVehiclesIcon: {
    fontSize: 70
  },
  noVehiclesTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  noVehiclesDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl * 1.5,
    lineHeight: 24
  },
  noVehiclesButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md
  },
  noVehiclesButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    gap: spacing.sm
  },
  noVehiclesButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff'
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    ...shadows.lg
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  usageContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  usageTitle: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.sm
  },
  usageBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  usageText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border + '40',
    borderRadius: borderRadius.xs,
    marginBottom: spacing.sm
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.xs
  },
  limitText: {
    fontSize: fontSize.xs,
    color: colors.danger,
    textAlign: 'center'
  }
});

const ExpensesScreen = ({ navigation }) => {
  const { gastos, summary, loading, loadAllGastos, loadSummary, refreshData } = useGastos();
  const { vehiculos } = useVehiculos();
  const { canAddExpense, getExpenseLimit, isFree } = useSubscription();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);

  useEffect(() => {
    loadInitialData();
  }, [selectedPeriod]);

  const loadInitialData = async () => {
    await loadAllGastos();
    await loadSummary(selectedPeriod);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCleanDuplicates = async () => {
    Alert.alert(
      t('cleanDuplicates'),
      t('cleanDuplicatesConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clean'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await gastosService.cleanDuplicates();
              if (result.success) {
                Alert.alert(t('ready'), result.data.msg);
                await handleRefresh();
              } else {
                Alert.alert(t('duplicatesCleanError'), result.error);
              }
            } catch (error) {
              Alert.alert(t('duplicatesCleanError'), t('duplicatesCleanErrorMsg'));
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    const expenseDate = date.toDate ? date.toDate() : new Date(date);
    return expenseDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredGastos = selectedCategory === 'all'
    ? gastos
    : gastos.filter(gasto => gasto.category === selectedCategory);

  const getTotalByCategory = (category) => {
    const categoryGastos = category === 'all' ? gastos : gastos.filter(g => g.category === category);
    return categoryGastos.reduce((sum, gasto) => sum + gasto.amount, 0);
  };

  const handleAddExpense = () => {
    // Check if user can add expense
    if (!canAddExpense(gastos)) {
      setShowPremiumModal(true);
      return;
    }
    navigation.navigate('AddExpense');
  };

  const getMonthlyExpenseCount = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return gastos.filter(item => {
      const itemDate = new Date(item.fecha || item.date);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerGreeting}>{t('hello')}</Text>
                <Text style={styles.headerTitle}>{t('yourExpenses')}</Text>
              </View>
              <TouchableOpacity
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => navigation.navigate('RecurringExpenses')}
              >
                <Ionicons name="repeat" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.dashboardWrapper}>
      <View style={styles.periodSelector}>
        {[
          { key: 'week', label: t('week') },
          { key: 'month', label: t('month') },
          { key: 'year', label: t('year') }
        ].map((period, index) => (
          <Animated.View
            key={period.key}
            entering={SlideInLeft.delay(100 * index).springify()}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              style={[
                styles.periodTab,
                selectedPeriod === period.key && styles.periodTabActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodTabText,
                selectedPeriod === period.key && styles.periodTabTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>


    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>{t('categories')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        <Animated.View entering={ZoomIn.delay(100)}>
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === 'all' && styles.categoryCardActive
            ]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={selectedCategory === 'all' ? [colors.primary, colors.primaryDark] : [colors.surface, colors.background]}
              style={styles.categoryGradient}
            >
              <Text style={styles.categoryEmoji}>✨</Text>
              <Text style={[
                styles.categoryName,
                selectedCategory === 'all' && styles.categoryNameActive
              ]}>
                {t('allCategories')}
              </Text>
              <Text style={[
                styles.categoryAmount,
                selectedCategory === 'all' && styles.categoryAmountActive
              ]}>
                {formatCurrency(getTotalByCategory('all'))}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {Object.entries(expenseCategories).map(([key, category], index) => (
          <Animated.View
            key={key}
            entering={ZoomIn.delay(200 + index * 100)}
          >
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === key && styles.categoryCardActive
              ]}
              onPress={() => setSelectedCategory(key)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={selectedCategory === key ? category.colors : category.lightColors}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === key && styles.categoryNameActive
                ]}>
                  {t(category.nameKey)}
                </Text>
                <Text style={[
                  styles.categoryAmount,
                  selectedCategory === key && styles.categoryAmountActive
                ]}>
                  {formatCurrency(getTotalByCategory(key))}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const renderExpense = useCallback(({ item, index }) => {
    const category = expenseCategories[item.category] || expenseCategories.otro;
    const vehicle = vehiculos.find(v => v._id === item.vehicleId);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <TouchableOpacity
          style={styles.expenseItem}
          onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item._id || item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.expenseContent}>
            <View style={[styles.expenseIconContainer, { backgroundColor: category.lightColors[0] }]}>
              <Text style={styles.expenseIcon}>{category.emoji}</Text>
            </View>

            <View style={styles.expenseDetails}>
              <Text style={styles.expenseTitle} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.expenseMetaRow}>

                <Text style={styles.expenseMeta}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>

            <View style={styles.expenseRight}>
              <Text style={styles.expensePrice}>
                {formatCurrency(item.amount)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [vehiculos, colors, navigation, styles]);

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInUp.duration(800)}
      style={styles.emptyState}
    >
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💸</Text>
      </View>
      <Text style={styles.emptyTitle}>
        {selectedCategory === 'all'
          ? t('noExpensesYet')
          : t('noExpensesInCategory', { category: t(expenseCategories[selectedCategory]?.nameKey || 'other') })
        }
      </Text>
      <Text style={styles.emptyDescription}>
        {t('startTrackingExpenses')}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.emptyButtonText}>{t('addFirstExpense')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderListHeader = () => (
    <>
      {renderDashboard()}
      {renderCategories()}

      <View style={styles.expensesList}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('recentExpenses')}</Text>
          {filteredGastos.length > 0 && (
            <Text style={styles.listCount}>{t('records', { count: filteredGastos.length })}</Text>
          )}
        </View>
      </View>
    </>
  );

  const renderListEmpty = () => (
    <View style={styles.expensesList}>
      {renderEmptyState()}
    </View>
  );

  if (vehiculos.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.noVehiclesWrapper}>
          <Animated.View
            entering={FadeInUp.duration(800)}
            style={styles.noVehiclesContent}
          >
            <View style={styles.noVehiclesIconContainer}>
              <Text style={styles.noVehiclesIcon}>🚗</Text>
            </View>
            <Text style={styles.noVehiclesTitle}>{t('addFirstVehicleToStartExpenses')}</Text>
            <Text style={styles.noVehiclesDescription}>
              {t('needVehicleForExpenses')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Vehicles')}
              style={styles.noVehiclesButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.noVehiclesButtonGradient}
              >
                <Ionicons name="car-sport" size={24} color="white" />
                <Text style={styles.noVehiclesButtonText}>{t('addVehicle')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      {/* Free user usage indicator */}
      {isFree && vehiculos.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.usageContainer}
        >
          <View style={styles.usageHeader}>
            <Ionicons name="wallet-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.usageTitle}>{t("expensesThisMonth")}</Text>
            <View style={styles.usageBadge}>
              <Text style={styles.usageText}>
                {getMonthlyExpenseCount()}/{getExpenseLimit()}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min((getMonthlyExpenseCount() / getExpenseLimit()) * 100, 100)}%`,
                  backgroundColor: getMonthlyExpenseCount() >= getExpenseLimit() ? colors.danger : colors.primary
                }
              ]}
            />
          </View>
          {getMonthlyExpenseCount() >= getExpenseLimit() && (
            <Text style={styles.limitText}>
              Has alcanzado el límite mensual. Actualiza a Premium para gastos ilimitados.
            </Text>
          )}
        </Animated.View>
      )}

      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={filteredGastos}
        keyExtractor={(item) => item._id}
        renderItem={renderExpense}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {gastos.length > 0 && (
        <Animated.View
          entering={SlideInRight.springify()}
          style={styles.floatingButton}
        >
          <TouchableOpacity
            onPress={handleAddExpense}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.floatingButtonGradient}
            >
              <Ionicons name="add" size={28} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSubscribe={() => {
          setShowPremiumModal(false);
          navigation.navigate('Subscription');
        }}
        title="Límite de gastos alcanzado"
        description="Has alcanzado el límite de 2 gastos por mes en tu plan gratuito."
        featureIcon="wallet-outline"
      />
    </View>
  );
};

export default ExpensesScreen;