import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import useGastos from '../../hooks/useGastos';
import useVehiculos from '../../hooks/useVehiculos';
import Button from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

const expenseCategories = {
  combustible: { 
    nameKey: 'fuel', 
    icon: 'car-sport', 
    colors: ['#FF6B6B', '#FF8E53'],
    emoji: '⛽'
  },
  mantenimiento: { 
    nameKey: 'maintenance', 
    icon: 'construct', 
    colors: ['#4ECDC4', '#44A08D'],
    emoji: '🔧'
  },
  seguro: { 
    nameKey: 'insurance', 
    icon: 'shield-checkmark', 
    colors: ['#A8E6CF', '#7FCDCD'],
    emoji: '🛡️'
  },
  estacionamiento: { 
    nameKey: 'parking', 
    icon: 'car', 
    colors: ['#FFD93D', '#6BCF7F'],
    emoji: '🅿️'
  },
  peajes: { 
    nameKey: 'tolls', 
    icon: 'card', 
    colors: ['#FF8A80', '#FF5722'],
    emoji: '🛣️'
  },
  otro: { 
    nameKey: 'other', 
    icon: 'ellipsis-horizontal-circle', 
    colors: ['#CE93D8', '#BA68C8'],
    emoji: '💰'
  }
};

const ExpenseDetailScreen = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const { gastos, deleteGasto, loading } = useGastos();
  const { vehiculos } = useVehiculos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    const foundExpense = gastos.find(g => g._id === expenseId || g.id === expenseId);
    setExpense(foundExpense);
  }, [expenseId, gastos]);

  const handleDeleteExpense = () => {
    if (!expense) return;
    
    Alert.alert(
      t('deleteExpenseConfirm'),
      t('deleteExpenseConfirmMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: async () => {
            const result = await deleteGasto(expense._id || expense.id);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert(t('error'), result.error || t('couldNotDeleteExpense'));
            }
          }
        }
      ]
    );
  };

  const handleEditExpense = () => {
    navigation.navigate('AddExpense', { 
      expenseId: expense._id || expense.id, 
      editMode: true 
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    const expenseDate = date.toDate ? date.toDate() : new Date(date);
    return expenseDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: spacing.md
    },
    backButton: {
      padding: spacing.sm
    },
    editButton: {
      padding: spacing.sm
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    heroCard: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      marginVertical: spacing.lg,
      ...shadows.lg
    },
    heroGradient: {
      padding: spacing.xl,
      alignItems: 'center'
    },
    categoryEmoji: {
      fontSize: 60,
      marginBottom: spacing.md
    },
    expenseAmount: {
      fontSize: fontSize.xxxl,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: spacing.sm
    },
    categoryName: {
      fontSize: fontSize.lg,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600'
    },
    detailsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.sm
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    detailRowLast: {
      borderBottomWidth: 0
    },
    detailIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md
    },
    detailContent: {
      flex: 1
    },
    detailLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs
    },
    detailValue: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text
    },
    vehicleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      ...shadows.sm
    },
    vehicleImage: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.md,
      backgroundColor: colors.border,
      marginRight: spacing.md
    },
    vehicleImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md
    },
    vehicleInfo: {
      flex: 1
    },
    vehicleName: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs
    },
    vehicleDetails: {
      fontSize: fontSize.sm,
      color: colors.textSecondary
    },
    actionsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.sm
    },
    actionButton: {
      marginBottom: spacing.md
    },
    deleteButton: {
      marginBottom: 0
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl
    },
    emptyTitle: {
      fontSize: fontSize.xl,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.sm
    },
    emptyText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl
    }
  });

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('expenseNotFound')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('expenseNotFound')}</Text>
          <Text style={styles.emptyText}>
            {t('expenseNotFoundDesc')}
          </Text>
          <Button
            title={t('back')}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const category = expenseCategories[expense.category] || expenseCategories.otro;
  const vehicle = vehiculos.find(v => v._id === expense.vehicleId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('expenseDetail')}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditExpense}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
          style={styles.heroCard}
        >
          <LinearGradient
            colors={category.colors}
            style={styles.heroGradient}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text style={styles.expenseAmount}>
              {formatCurrency(expense.amount)}
            </Text>
            <Text style={styles.categoryName}>{t(category.nameKey)}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Vehicle Info */}
        {vehicle && (
          <Animated.View 
            entering={SlideInRight.duration(600).delay(200)}
            style={styles.vehicleCard}
          >
            {vehicle.imageUrl ? (
              <Image 
                source={{ uri: vehicle.imageUrl }} 
                style={styles.vehicleImage}
              />
            ) : (
              <View style={styles.vehicleImagePlaceholder}>
                <Ionicons name="car" size={24} color={colors.primary} />
              </View>
            )}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {vehicle.marca} {vehicle.modelo}
              </Text>
              <Text style={styles.vehicleDetails}>
                {vehicle.ano} • {vehicle.patente}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Details Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(400)}
          style={styles.detailsCard}
        >
          <Text style={styles.sectionTitle}>{t('expenseInformation')}</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('description')}</Text>
              <Text style={styles.detailValue}>{expense.description}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>{t('date')}</Text>
              <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
            </View>
          </View>

          {expense.liters && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="water" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('liters')}</Text>
                <Text style={styles.detailValue}>{expense.liters} L</Text>
              </View>
            </View>
          )}

          {expense.odometer && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="speedometer" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('mileage')}</Text>
                <Text style={styles.detailValue}>{expense.odometer.toLocaleString()} km</Text>
              </View>
            </View>
          )}

          {expense.location && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('location')}</Text>
                <Text style={styles.detailValue}>{expense.location}</Text>
              </View>
            </View>
          )}

          {expense.notes && (
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <View style={styles.detailIcon}>
                <Ionicons name="chatbox" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('notes')}</Text>
                <Text style={styles.detailValue}>{expense.notes}</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Actions Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(600)}
          style={styles.actionsCard}
        >
          <Text style={styles.sectionTitle}>{t('actions')}</Text>
          
          <Button
            title={t('editExpenseAction')}
            onPress={handleEditExpense}
            icon={<Ionicons name="pencil" size={20} color="#ffffff" />}
            style={styles.actionButton}
            size="lg"
          />
          
          <Button
            title={t('deleteExpenseAction')}
            onPress={handleDeleteExpense}
            variant="outline"
            icon={<Ionicons name="trash" size={20} color={colors.danger} />}
            style={[styles.deleteButton, { borderColor: colors.danger }]}
            textStyle={{ color: colors.danger }}
            loading={loading}
            size="lg"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpenseDetailScreen;