import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { ExpenseChart, ExpenseCategoryChart, FuelConsumptionChart, MaintenanceCostChart, MaintenanceTypeChart } from '../../components/Chart';
import useGastos from '../../hooks/useGastos';
import useVehiculos from '../../hooks/useVehiculos';
import useMantenimientos from '../../hooks/useMantenimientos';
import { useTheme } from '../../hooks/useTheme';
import { CURRENCIES } from '../../context/ThemeProvider';
import { t } from '../../utils/i18n';

const createStyles = (colors, spacing, fontSize, borderRadius, shadows, width) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text
  },
  shareButton: {
    padding: spacing.sm
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacing.xl
  },
  selectorContainer: {
    marginBottom: spacing.lg
  },
  selectorButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginLeft: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  selectorButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary
  },
  selectorButtonTextActive: {
    color: '#ffffff'
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: 4,
    ...shadows.sm
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md
  },
  periodButtonActive: {
    backgroundColor: colors.primary
  },
  periodButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary
  },
  periodButtonTextActive: {
    color: '#ffffff'
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  kpiCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm
  },
  trendText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginLeft: 2
  },
  kpiValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs
  },
  kpiTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  kpiSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  maintenanceKpi: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  maintenanceKpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  maintenanceKpiValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  maintenanceKpiLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  insightCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent + '30',
    ...shadows.sm
  },
  insightTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md
  },
  insightText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm
  },
  insightHighlight: {
    fontWeight: '600',
    color: colors.text
  }
});

const AnalyticsScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius, shadows, currency } = useTheme();
  const { width } = useWindowDimensions();

  const { gastos, summary, loadAllGastos, loadSummary } = useGastos();
  const { vehiculos } = useVehiculos();
  const { mantenimientos, upcomingMaintenances } = useMantenimientos();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState('resumen');

  const styles = useMemo(
    () => createStyles(colors, spacing, fontSize, borderRadius, shadows, width),
    [colors, spacing, fontSize, borderRadius, shadows, width]
  );

  const maintenanceStats = useMemo(() => {
    if (!mantenimientos || mantenimientos.length === 0) return { costByMonth: [], byType: [], totalCost: 0, pendingCount: 0 };

    const totalCost = mantenimientos.reduce((sum, m) => sum + (m.cost || 0), 0);
    const pendingCount = mantenimientos.filter(m => m.status === 'pending').length;

    // Cost by month (last 6 months)
    const costByMonth = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleDateString('es-ES', { month: 'short' });
      const monthCost = mantenimientos
        .filter(m => {
          const d = new Date(m.date);
          return d >= monthDate && d <= monthEnd;
        })
        .reduce((sum, m) => sum + (m.cost || 0), 0);
      costByMonth.push({ label: monthName, value: monthCost || 0 });
    }

    // By type
    const typeMap = {};
    mantenimientos.forEach(m => {
      const type = m.type || 'otro';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const byType = Object.entries(typeMap).map(([name, count]) => ({ name, count }));

    return { costByMonth, byType, totalCost, pendingCount };
  }, [mantenimientos]);

  useEffect(() => {
    loadAnalytics();
  }, [gastos, selectedPeriod, selectedVehicle]);

  const loadAnalytics = () => {
    const vehicleGastos = selectedVehicle === 'all'
      ? gastos
      : gastos.filter(g => g.vehicleId === selectedVehicle);

    const computedAnalytics = calculateAnalytics(vehicleGastos);
    setAnalytics(computedAnalytics);
  };

  const calculateAnalytics = (expenses) => {
    const now = new Date();
    const result = {
      totalExpenses: 0,
      averagePerMonth: 0,
      mostExpensiveCategory: null,
      fuelEfficiency: 0,
      maintenanceFrequency: 0,
      costPerKm: 0,
      projectedYearlyExpense: 0,
      monthlyTrend: 0
    };

    if (expenses.length === 0) return result;

    // Total de gastos
    result.totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Gastos por categoría
    const categoryTotals = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });

    // Categoría más costosa
    const maxCategory = Object.entries(categoryTotals).reduce((max, [category, amount]) =>
      amount > max.amount ? { category, amount } : max, { category: null, amount: 0 });
    result.mostExpensiveCategory = maxCategory;

    // Gastos de los últimos 6 meses para tendencias
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentExpenses = expenses.filter(expense => {
      const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
      return expenseDate >= sixMonthsAgo;
    });

    if (recentExpenses.length > 0) {
      const monthlyExpenses = {};
      recentExpenses.forEach(expense => {
        const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
        const monthKey = expenseDate.toISOString().substring(0, 7); // YYYY-MM
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + expense.amount;
      });

      const monthlyAmounts = Object.values(monthlyExpenses);
      result.averagePerMonth = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;

      // Proyección anual
      result.projectedYearlyExpense = result.averagePerMonth * 12;

      // Tendencia (comparar últimos 3 meses vs anteriores 3 meses)
      const months = Object.keys(monthlyExpenses).sort();
      if (months.length >= 6) {
        const recent3 = months.slice(-3).reduce((sum, month) => sum + monthlyExpenses[month], 0) / 3;
        const previous3 = months.slice(-6, -3).reduce((sum, month) => sum + monthlyExpenses[month], 0) / 3;
        result.monthlyTrend = ((recent3 - previous3) / previous3) * 100;
      }
    }

    // Análisis de combustible
    const fuelExpenses = expenses.filter(e => e.category === 'fuel' && e.liters && e.odometer);
    if (fuelExpenses.length >= 2) {
      const sortedFuel = fuelExpenses.sort((a, b) => a.odometer - b.odometer);
      let totalLiters = 0;
      let totalKm = 0;

      for (let i = 1; i < sortedFuel.length; i++) {
        totalLiters += sortedFuel[i].liters;
        totalKm += sortedFuel[i].odometer - sortedFuel[i-1].odometer;
      }

      if (totalKm > 0) {
        result.fuelEfficiency = (totalLiters / totalKm) * 100; // L/100km
      }
    }

    // Costo por kilómetro (solo si tenemos datos de odómetro)
    const expensesWithKm = expenses.filter(e => e.odometer);
    if (expensesWithKm.length >= 2) {
      const sortedByKm = expensesWithKm.sort((a, b) => a.odometer - b.odometer);
      const totalCost = expensesWithKm.reduce((sum, e) => sum + e.amount, 0);
      const kmDiff = sortedByKm[sortedByKm.length - 1].odometer - sortedByKm[0].odometer;
      if (kmDiff > 0) {
        result.costPerKm = totalCost / kmDiff;
      }
    }

    return result;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllGastos();
    await loadSummary(selectedPeriod, selectedVehicle === 'all' ? null : selectedVehicle);
    setRefreshing(false);
  };

  const currencySymbol = useMemo(() => {
    const cur = CURRENCIES.find(c => c.code === currency);
    return cur ? cur.symbol : '$';
  }, [currency]);

  const formatCurrency = (amount) => {
    return `${currencySymbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const renderKPICard = (title, value, subtitle, icon, color = colors.primary, trend = null) => (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <View style={styles.kpiHeader}>
        <Ionicons name={icon} size={24} color={color} />
        {trend !== null && (
          <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? colors.success + '15' : colors.danger + '15' }]}>
            <Ionicons
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={trend >= 0 ? colors.success : colors.danger}
            />
            <Text style={[styles.trendText, { color: trend >= 0 ? colors.success : colors.danger }]}>
              {Math.abs(trend).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderVehicleSelector = () => (
    <View style={styles.selectorContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            selectedVehicle === 'all' && styles.selectorButtonActive
          ]}
          onPress={() => setSelectedVehicle('all')}
        >
          <Text style={[
            styles.selectorButtonText,
            selectedVehicle === 'all' && styles.selectorButtonTextActive
          ]}>
            {t('allVehicles')}
          </Text>
        </TouchableOpacity>

        {vehiculos.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.selectorButton,
              selectedVehicle === vehicle.id && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedVehicle(vehicle.id)}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedVehicle === vehicle.id && styles.selectorButtonTextActive
            ]}>
              {vehicle.marca} {vehicle.modelo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: 'week', label: t('week') },
        { key: 'month', label: t('month') },
        { key: 'year', label: t('year') }
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.key && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredGastos = selectedVehicle === 'all'
    ? gastos
    : gastos.filter(g => g.vehicleId === selectedVehicle);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('analytics')}</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {/* Implementar export/share */}}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderVehicleSelector()}
        {renderPeriodSelector()}

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          {[
            { key: 'resumen', label: t('summary') },
            { key: 'gastos', label: t('expenses') },
            { key: 'mantenimiento', label: t('maintenance') }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumen Tab */}
        {activeTab === 'resumen' && (
          <>
            <Animated.View entering={FadeInDown.duration(600).springify()}>
              <Text style={styles.sectionTitle}>{t('keyMetrics')}</Text>

              <View style={styles.kpiGrid}>
                {renderKPICard(
                  t('totalExpense'),
                  formatCurrency(analytics.totalExpenses || 0),
                  selectedPeriod === 'month' ? t('thisMonth') : selectedPeriod === 'week' ? t('thisWeek') : t('thisYear'),
                  'wallet',
                  colors.primary
                )}

                {renderKPICard(
                  t('monthlyAverage'),
                  formatCurrency(analytics.averagePerMonth || 0),
                  t('lastSixMonths'),
                  'trending-up',
                  colors.secondary,
                  analytics.monthlyTrend
                )}

                {analytics.fuelEfficiency > 0 && renderKPICard(
                  t('averageConsumption'),
                  `${analytics.fuelEfficiency.toFixed(1)} L/100km`,
                  t('fuelEfficiency'),
                  'speedometer',
                  colors.accent
                )}

                {analytics.costPerKm > 0 && renderKPICard(
                  t('costPerKm'),
                  `${currencySymbol}${analytics.costPerKm.toFixed(2)}`,
                  t('includesAllExpenses'),
                  'car',
                  colors.warning
                )}
              </View>
            </Animated.View>

            <Animated.View entering={SlideInUp.duration(800).delay(200).springify()}>
              <Text style={styles.sectionTitle}>{t('trendCharts')}</Text>

              <ExpenseChart
                expenses={filteredGastos}
                period={selectedPeriod}
                vehicleId={selectedVehicle === 'all' ? null : selectedVehicle}
              />

              <ExpenseCategoryChart expenses={filteredGastos} />
            </Animated.View>

            {maintenanceStats.totalCost > 0 && (
              <Animated.View entering={FadeInDown.delay(300)} style={styles.chartContainer}>
                <MaintenanceCostChart data={maintenanceStats.costByMonth} title={t('maintenanceCostByMonth')} />
              </Animated.View>
            )}

            {analytics.mostExpensiveCategory?.category && (
              <Animated.View
                entering={FadeInDown.duration(800).delay(400).springify()}
                style={styles.insightCard}
              >
                <Text style={styles.insightTitle}>{t('insightsIcon')}</Text>
                <Text style={styles.insightText}>
                  {t('topExpenseCategoryIs')} <Text style={styles.insightHighlight}>
                    {analytics.mostExpensiveCategory.category}
                  </Text> {t('with')} {formatCurrency(analytics.mostExpensiveCategory.amount)}.
                </Text>

                {analytics.projectedYearlyExpense > 0 && (
                  <Text style={styles.insightText}>
                    {t('atCurrentPaceProjectedYearly')}{' '}
                    <Text style={styles.insightHighlight}>
                      {formatCurrency(analytics.projectedYearlyExpense)}
                    </Text>.
                  </Text>
                )}

                {upcomingMaintenances.length > 0 && (
                  <Text style={styles.insightText}>
                    {t('youHave')} <Text style={styles.insightHighlight}>{upcomingMaintenances.length}</Text>{' '}
                    {t('upcomingMaintenances', { count: upcomingMaintenances.length })}.
                  </Text>
                )}
              </Animated.View>
            )}
          </>
        )}

        {/* Gastos Tab */}
        {activeTab === 'gastos' && (
          <>
            <Animated.View entering={FadeInDown.duration(600).springify()}>
              <Text style={styles.sectionTitle}>{t('keyMetrics')}</Text>

              <View style={styles.kpiGrid}>
                {renderKPICard(
                  t('totalExpense'),
                  formatCurrency(analytics.totalExpenses || 0),
                  selectedPeriod === 'month' ? t('thisMonth') : selectedPeriod === 'week' ? t('thisWeek') : t('thisYear'),
                  'wallet',
                  colors.primary
                )}

                {renderKPICard(
                  t('monthlyAverage'),
                  formatCurrency(analytics.averagePerMonth || 0),
                  t('lastSixMonths'),
                  'trending-up',
                  colors.secondary,
                  analytics.monthlyTrend
                )}
              </View>
            </Animated.View>

            <Animated.View entering={SlideInUp.duration(800).delay(200).springify()}>
              <Text style={styles.sectionTitle}>{t('trendCharts')}</Text>

              <ExpenseChart
                expenses={filteredGastos}
                period={selectedPeriod}
                vehicleId={selectedVehicle === 'all' ? null : selectedVehicle}
              />

              <ExpenseCategoryChart expenses={filteredGastos} />

              {selectedVehicle !== 'all' && (
                <FuelConsumptionChart
                  fuelExpenses={filteredGastos.filter(g => g.category === 'fuel')}
                />
              )}
            </Animated.View>
          </>
        )}

        {/* Mantenimiento Tab */}
        {activeTab === 'mantenimiento' && (
          <>
            <View style={styles.maintenanceKpi}>
              <View style={styles.maintenanceKpiCard}>
                <Text style={styles.maintenanceKpiValue}>{currencySymbol}{maintenanceStats.totalCost.toLocaleString()}</Text>
                <Text style={styles.maintenanceKpiLabel}>{t('totalCost')}</Text>
              </View>
              <View style={styles.maintenanceKpiCard}>
                <Text style={styles.maintenanceKpiValue}>{maintenanceStats.pendingCount}</Text>
                <Text style={styles.maintenanceKpiLabel}>{t('pending')}</Text>
              </View>
            </View>
            <Animated.View entering={FadeInDown.delay(200)} style={styles.chartContainer}>
              <MaintenanceCostChart data={maintenanceStats.costByMonth} title={t('maintenanceCostByMonth')} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(400)} style={styles.chartContainer}>
              <MaintenanceTypeChart data={maintenanceStats.byType} title={t('maintenanceByType')} />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
