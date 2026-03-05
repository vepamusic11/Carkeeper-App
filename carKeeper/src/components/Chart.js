import React from 'react';
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

  const chartWidth = width - (spacing.lg * 2);

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
      fontSize: fontSize.sm
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginVertical: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
      textAlign: 'center'
    },
    chart: {
      borderRadius: borderRadius.lg
    },
    emptyChart: {
      backgroundColor: colors.borderLight,
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  });

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            {...props}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            {...props}
          />
        );

      case 'pie':
        return (
          <PieChart
            data={data}
            width={chartWidth}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            {...props}
          />
        );

      default:
        return null;
    }
  };

  if (!data || (data.datasets && data.datasets.length === 0) || (Array.isArray(data) && data.length === 0)) {
    return (
      <View style={[styles.container, style]}>
        {showTitle && title && (
          <Text style={styles.title}>{title}</Text>
        )}
        <View style={[styles.emptyChart, { height }]}>
          <Text style={styles.emptyText}>No hay datos para mostrar</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showTitle && title && (
        <Text style={styles.title}>{title}</Text>
      )}
      {renderChart()}
    </View>
  );
};

const ExpenseChart = ({ expenses, period = 'month', vehicleId = null }) => {
  const { colors, fontSize, spacing } = useTheme();
  const { width } = useWindowDimensions();

  const processExpenseData = () => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    // Filtrar por vehículo si se especifica
    let filteredExpenses = expenses;
    if (vehicleId) {
      filteredExpenses = expenses.filter(expense => expense.vehicleId === vehicleId);
    }

    // Agrupar por período
    const groupedData = {};
    const now = new Date();

    filteredExpenses.forEach(expense => {
      const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
      let key;

      switch (period) {
        case 'week':
          // Últimas 7 semanas
          const weeksDiff = Math.floor((now - expenseDate) / (7 * 24 * 60 * 60 * 1000));
          if (weeksDiff < 7) {
            key = `Sem ${7 - weeksDiff}`;
          }
          break;
        case 'month':
          // Últimos 6 meses
          const monthsDiff = (now.getFullYear() - expenseDate.getFullYear()) * 12 +
                           (now.getMonth() - expenseDate.getMonth());
          if (monthsDiff < 6) {
            key = expenseDate.toLocaleDateString('es-ES', { month: 'short' });
          }
          break;
        case 'year':
          // Últimos 3 años
          const yearsDiff = now.getFullYear() - expenseDate.getFullYear();
          if (yearsDiff < 3) {
            key = expenseDate.getFullYear().toString();
          }
          break;
      }

      if (key) {
        if (!groupedData[key]) {
          groupedData[key] = 0;
        }
        groupedData[key] += expense.amount || 0;
      }
    });

    const labels = Object.keys(groupedData);
    const data = Object.values(groupedData);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const chartData = processExpenseData();

  return (
    <Chart
      type="line"
      data={chartData}
      title={`Gastos por ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}`}
      height={200}
    />
  );
};

const ExpenseCategoryChart = ({ expenses }) => {
  const { colors, fontSize, spacing } = useTheme();
  const { width } = useWindowDimensions();

  const processCategoryData = () => {
    if (!expenses || expenses.length === 0) {
      return [];
    }

    const categoryTotals = {};
    const categoryColors = {
      fuel: colors.primary,
      maintenance: colors.secondary,
      insurance: colors.accent,
      parking: colors.warning,
      tolls: colors.danger,
      other: colors.textSecondary
    };

    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += expense.amount || 0;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      population: amount,
      color: categoryColors[category] || colors.textSecondary,
      legendFontColor: colors.text,
      legendFontSize: fontSize.sm
    }));
  };

  const chartData = processCategoryData();

  return (
    <Chart
      type="pie"
      data={chartData}
      title={t('expensesByCategory')}
      height={200}
    />
  );
};

const FuelConsumptionChart = ({ fuelExpenses }) => {
  const { colors, fontSize, spacing } = useTheme();
  const { width } = useWindowDimensions();

  const processFuelData = () => {
    if (!fuelExpenses || fuelExpenses.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    // Filtrar solo gastos de combustible que tengan litros y odómetro
    const validFuelExpenses = fuelExpenses
      .filter(expense => expense.category === 'fuel' && expense.liters && expense.odometer)
      .sort((a, b) => {
        const dateA = a.date.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date.toDate ? b.date.toDate() : new Date(b.date);
        return dateA - dateB;
      });

    if (validFuelExpenses.length < 2) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    const consumptionData = [];
    const labels = [];

    for (let i = 1; i < validFuelExpenses.length; i++) {
      const current = validFuelExpenses[i];
      const previous = validFuelExpenses[i - 1];

      const kmDiff = current.odometer - previous.odometer;
      if (kmDiff > 0) {
        const consumption = (current.liters / kmDiff) * 100; // L/100km
        consumptionData.push(Math.round(consumption * 10) / 10);
        const currentDate = current.date.toDate ? current.date.toDate() : new Date(current.date);
        labels.push(currentDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        }));
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
  };

  const chartData = processFuelData();

  return (
    <Chart
      type="line"
      data={chartData}
      title={t('fuelConsumption')}
      height={200}
    />
  );
};

export const MaintenanceCostChart = ({ data = [], height = 220, title }) => {
  const { colors, fontSize, spacing } = useTheme();
  const { width } = useWindowDimensions();

  if (!data || data.length === 0) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          {t('noDataAvailable')}
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{ data: data.map(d => d.value) }]
  };

  return (
    <View>
      {title && <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginLeft: spacing.md }}>{title}</Text>}
      <BarChart
        data={chartData}
        width={width - 48}
        height={height}
        yAxisLabel="$"
        chartConfig={{
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: () => colors.textSecondary,
          barPercentage: 0.6,
          propsForBackgroundLines: { stroke: colors.border },
        }}
        style={{ borderRadius: 12 }}
      />
    </View>
  );
};

export const MaintenanceTypeChart = ({ data = [], height = 220, title }) => {
  const { colors, fontSize, spacing } = useTheme();
  const { width } = useWindowDimensions();

  if (!data || data.length === 0) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          {t('noDataAvailable')}
        </Text>
      </View>
    );
  }

  const pieColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  const chartData = data.map((item, index) => ({
    name: item.name,
    count: item.count,
    color: pieColors[index % pieColors.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12
  }));

  return (
    <View>
      {title && <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginLeft: spacing.md }}>{title}</Text>}
      <PieChart
        data={chartData}
        width={width - 48}
        height={height}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
      />
    </View>
  );
};

export default Chart;
export { ExpenseChart, ExpenseCategoryChart, FuelConsumptionChart };
