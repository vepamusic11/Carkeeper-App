import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../hooks/useTheme';
import { t } from '../utils/i18n';

const Chart = ({
  type = 'line',
  data,
  title,
  height = 220,
  showTitle = true,
  style = {},
  ...props
}) => {
  const { colors, fontSize, spacing, borderRadius } = useTheme();
  const { width } = useWindowDimensions();

  // Chart width = screen width - container horizontal margin - container padding
  const chartWidth = width - (spacing.lg * 2) - (spacing.md * 2);

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: () => colors.text,
    style: {
      borderRadius: borderRadius.lg
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1
    },
    propsForLabels: {
      fontSize: Math.min(fontSize.sm, 11)
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginVertical: spacing.sm,
      marginHorizontal: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
      overflow: 'hidden',
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: 'center'
    },
    chartWrap: {
      alignItems: 'center',
      marginHorizontal: -spacing.sm,
    },
    emptyChart: {
      backgroundColor: colors.borderLight || colors.border + '20',
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      height,
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  }), [colors, fontSize, spacing, borderRadius, height]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <View style={styles.chartWrap}>
            <LineChart
              data={data}
              width={chartWidth}
              height={height}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: borderRadius.lg }}
              withInnerLines={true}
              withOuterLines={false}
              fromZero
              {...props}
            />
          </View>
        );

      case 'bar':
        return (
          <View style={styles.chartWrap}>
            <BarChart
              data={data}
              width={chartWidth}
              height={height}
              chartConfig={{
                ...chartConfig,
                barPercentage: Math.min(0.7, 6 / (data?.labels?.length || 6)),
              }}
              style={{ borderRadius: borderRadius.lg }}
              showValuesOnTopOfBars
              fromZero
              {...props}
            />
          </View>
        );

      case 'pie':
        return (
          <View style={styles.chartWrap}>
            <PieChart
              data={data}
              width={chartWidth}
              height={height}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={String(Math.max(0, (chartWidth - 300) / 4))}
              absolute
              style={{ borderRadius: borderRadius.lg }}
              {...props}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (!data || (data.datasets && data.datasets[0]?.data?.length === 0) || (Array.isArray(data) && data.length === 0)) {
    return (
      <View style={[styles.container, style]}>
        {showTitle && title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>{t('noDataAvailable')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showTitle && title && <Text style={styles.title}>{title}</Text>}
      {renderChart()}
    </View>
  );
};

const ExpenseChart = ({ expenses, period = 'month', vehicleId = null }) => {
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    let filteredExpenses = expenses;
    if (vehicleId) {
      filteredExpenses = expenses.filter(expense => expense.vehicleId === vehicleId);
    }

    const groupedData = {};
    const now = new Date();

    filteredExpenses.forEach(expense => {
      const expenseDate = expense.date?.toDate ? expense.date.toDate() : new Date(expense.date);
      let key;

      switch (period) {
        case 'week':
          const weeksDiff = Math.floor((now - expenseDate) / (7 * 24 * 60 * 60 * 1000));
          if (weeksDiff < 7) key = `S${7 - weeksDiff}`;
          break;
        case 'month':
          const monthsDiff = (now.getFullYear() - expenseDate.getFullYear()) * 12 +
                           (now.getMonth() - expenseDate.getMonth());
          if (monthsDiff < 6) key = expenseDate.toLocaleDateString('es-ES', { month: 'short' });
          break;
        case 'year':
          const yearsDiff = now.getFullYear() - expenseDate.getFullYear();
          if (yearsDiff < 3) key = expenseDate.getFullYear().toString();
          break;
      }

      if (key) {
        groupedData[key] = (groupedData[key] || 0) + (expense.amount || 0);
      }
    });

    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    if (labels.length === 0) return { labels: [], datasets: [{ data: [] }] };

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [expenses, period, vehicleId]);

  const title = period === 'week' ? t('expensesByCategory') : period === 'month' ? 'Gastos por mes' : 'Gastos por año';

  return <Chart type="line" data={chartData} title={title} height={200} />;
};

const ExpenseCategoryChart = ({ expenses }) => {
  const { colors, fontSize } = useTheme();

  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const categoryTotals = {};
    const categoryColors = {
      fuel: '#2563eb', combustible: '#2563eb',
      maintenance: '#10b981', mantenimiento: '#10b981',
      insurance: '#f59e0b', seguro: '#f59e0b',
      parking: '#8b5cf6', estacionamiento: '#8b5cf6',
      tolls: '#ef4444', peajes: '#ef4444',
      other: '#6b7280', otro: '#6b7280',
    };

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (expense.amount || 0);
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category.length > 8 ? category.substring(0, 7) + '.' : category,
      population: amount,
      color: categoryColors[category] || '#6b7280',
      legendFontColor: colors.text,
      legendFontSize: Math.min(fontSize.sm, 11)
    }));
  }, [expenses, colors.text, fontSize.sm]);

  return <Chart type="pie" data={chartData} title={t('expensesByCategory')} height={200} />;
};

const FuelConsumptionChart = ({ fuelExpenses }) => {
  const chartData = useMemo(() => {
    if (!fuelExpenses || fuelExpenses.length === 0) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const validFuelExpenses = fuelExpenses
      .filter(expense => expense.liters && expense.odometer)
      .sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
      });

    if (validFuelExpenses.length < 2) {
      return { labels: [], datasets: [{ data: [] }] };
    }

    const consumptionData = [];
    const labels = [];

    for (let i = 1; i < validFuelExpenses.length; i++) {
      const current = validFuelExpenses[i];
      const previous = validFuelExpenses[i - 1];
      const kmDiff = current.odometer - previous.odometer;
      if (kmDiff > 0) {
        const consumption = (current.liters / kmDiff) * 100;
        consumptionData.push(Math.round(consumption * 10) / 10);
        const currentDate = current.date?.toDate ? current.date.toDate() : new Date(current.date);
        labels.push(currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
      }
    }

    return {
      labels,
      datasets: [{
        data: consumptionData,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [fuelExpenses]);

  return <Chart type="line" data={chartData} title={t('fuelConsumption')} height={200} />;
};

export const MaintenanceCostChart = ({ data = [], title }) => {
  const { colors, fontSize, spacing, borderRadius } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    return {
      labels: data.map(d => d.label),
      datasets: [{ data: data.map(d => d.value || 0) }]
    };
  }, [data]);

  if (!chartData) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{t('noDataAvailable')}</Text>
      </View>
    );
  }

  return (
    <Chart
      type="bar"
      data={chartData}
      title={title}
      height={220}
      yAxisLabel="$"
      style={{ marginHorizontal: 0 }}
    />
  );
};

export const MaintenanceTypeChart = ({ data = [], title }) => {
  const { colors, fontSize, spacing } = useTheme();

  const pieColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => ({
      name: item.name.length > 10 ? item.name.substring(0, 9) + '.' : item.name,
      population: item.count,
      color: pieColors[index % pieColors.length],
      legendFontColor: colors.text,
      legendFontSize: Math.min(fontSize.sm, 11)
    }));
  }, [data, colors.text, fontSize.sm]);

  if (chartData.length === 0) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>{t('noDataAvailable')}</Text>
      </View>
    );
  }

  return (
    <Chart
      type="pie"
      data={chartData}
      title={title}
      height={220}
      style={{ marginHorizontal: 0 }}
    />
  );
};

export default Chart;
export { ExpenseChart, ExpenseCategoryChart, FuelConsumptionChart };
