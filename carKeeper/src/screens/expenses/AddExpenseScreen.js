import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useGastos from '../../hooks/useGastos';
import useVehiculos from '../../hooks/useVehiculos';
import useGastosRecurrentes from '../../hooks/useGastosRecurrentes';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import { sanitizeText } from '../../utils/validation';

// Mapeo de categorías frontend -> backend
const categoryMapping = {
  'fuel': 'combustible',
  'maintenance': 'mantenimiento',
  'insurance': 'seguro',
  'parking': 'estacionamiento',
  'tolls': 'peajes',
  'other': 'otro'
};

const expenseCategories = [
  { id: 'fuel', nameKey: 'fuel', icon: 'car' },
  { id: 'maintenance', nameKey: 'maintenance', icon: 'build' },
  { id: 'insurance', nameKey: 'insurance', icon: 'shield-checkmark' },
  { id: 'parking', nameKey: 'parking', icon: 'location' },
  { id: 'tolls', nameKey: 'tolls', icon: 'card' },
  { id: 'other', nameKey: 'other', icon: 'ellipsis-horizontal' }
];

const frequencyOptions = [
  { id: 'weekly', labelKey: 'weekly' },
  { id: 'monthly', labelKey: 'monthly' },
  { id: 'bimonthly', labelKey: 'bimonthly' },
  { id: 'quarterly', labelKey: 'quarterly' },
  { id: 'semiannual', labelKey: 'semiannual' },
  { id: 'annual', labelKey: 'annual' },
];

const createStyles = (colors, spacing, fontSize, borderRadius, shadows) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
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
    color: colors.text
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacing.xl
  },
  form: {
    marginTop: spacing.lg
  },
  selectorContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl
  },
  selectorLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md
  },
  vehicleOptions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm
  },
  vehicleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10'
  },
  vehicleOptionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm
  },
  vehicleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600'
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  categoryCard: {
    width: '31%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10'
  },
  categoryName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center'
  },
  categoryNameSelected: {
    color: colors.primary,
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md
  },
  halfInput: {
    flex: 1
  },
  dateButton: {
    marginBottom: spacing.md
  },
  dateLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm
  },
  dateValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  dateText: {
    fontSize: fontSize.base,
    color: colors.text
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sm
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md
  },
  recurringLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  recurringText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  frequencyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border
  },
  frequencyChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '15'
  },
  frequencyChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary
  },
  frequencyChipTextSelected: {
    color: colors.primary,
    fontWeight: '600'
  }
});

const AddExpenseScreen = ({ navigation, route }) => {
  const { vehicleId: routeVehicleId, expenseId, editMode = false, isRecurring: routeIsRecurring = false } = route.params || {};
  const { addGasto, updateGasto, gastos, loading } = useGastos();
  const { vehiculos } = useVehiculos();
  const { addGastoRecurrente } = useGastosRecurrentes();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);

  const [selectedVehicle, setSelectedVehicle] = useState(routeVehicleId || vehiculos[0]?._id || '');
  const [selectedCategory, setSelectedCategory] = useState('fuel');
  const [isRecurring, setIsRecurring] = useState(routeIsRecurring);
  const [selectedFrequency, setSelectedFrequency] = useState('monthly');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    location: '',
    notes: '',
    liters: '',
    odometer: ''
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(editMode);

  // Cargar datos del gasto si estamos en modo edición
  useEffect(() => {
    if (isEditMode && expenseId) {
      const expense = gastos.find(g => g._id === expenseId || g.id === expenseId);
      if (expense) {
        setSelectedVehicle(expense.vehicleId);
        // Mapear categoría del backend al frontend
        const frontendCategory = Object.keys(categoryMapping).find(
          key => categoryMapping[key] === expense.category
        ) || 'other';
        setSelectedCategory(frontendCategory);
        setFormData({
          description: expense.description || '',
          amount: expense.amount ? expense.amount.toString() : '',
          location: expense.location || '',
          notes: expense.notes || '',
          liters: expense.liters ? expense.liters.toString() : '',
          odometer: expense.odometer ? expense.odometer.toString() : ''
        });
        setDate(expense.date.toDate ? expense.date.toDate() : new Date(expense.date));
      }
    }
  }, [isEditMode, expenseId, gastos]);

  // Efecto para auto-seleccionar vehículo si solo hay uno
  useEffect(() => {
    if (vehiculos.length === 1 && !selectedVehicle && !isEditMode) {
      setSelectedVehicle(vehiculos[0]._id);
    }
  }, [vehiculos, isEditMode]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedVehicle) {
      newErrors.vehicle = t('selectVehicleError');
    }

    if (!selectedCategory) {
      newErrors.category = t('selectCategoryError');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('descriptionRequired');
    }

    if (!formData.amount.trim()) {
      newErrors.amount = t('amountRequired');
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('invalidAmount');
    }

    if (selectedCategory === 'fuel') {
      if (formData.liters && !/^\d+(\.\d{1,2})?$/.test(formData.liters)) {
        newErrors.liters = t('invalidLiters');
      }
    }

    if (formData.odometer && !/^\d+$/.test(formData.odometer)) {
      newErrors.odometer = t('invalidMileage');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedVehicleData = vehiculos.find(v => v._id === selectedVehicle);
    
    const expenseData = {
      category: categoryMapping[selectedCategory] || selectedCategory, // Mapear categoría al formato del backend
      description: sanitizeText(formData.description),
      amount: formData.amount,
      date: date.toISOString(),
      location: sanitizeText(formData.location),
      notes: sanitizeText(formData.notes),
      vehicleName: selectedVehicleData ? `${selectedVehicleData.marca} ${selectedVehicleData.modelo}` : 'Vehículo',
      liters: formData.liters ? parseFloat(formData.liters) : null,
      odometer: formData.odometer ? parseInt(formData.odometer) : null
    };

    let result;
    if (isEditMode && expenseId) {
      result = await updateGasto(expenseId, expenseData);
    } else {
      result = await addGasto(selectedVehicle, expenseData);
    }

    if (result.success && isRecurring && !isEditMode) {
      const recurringData = {
        vehicleId: selectedVehicle,
        category: categoryMapping[selectedCategory] || selectedCategory,
        description: sanitizeText(formData.description),
        amount: parseFloat(formData.amount),
        frequency: selectedFrequency,
        nextDueDate: date.toISOString(),
        notes: sanitizeText(formData.notes),
      };
      await addGastoRecurrente(recurringData);
    }

    if (result.success) {
      Alert.alert(
        t('success'),
        isEditMode ? t('expenseUpdated') : t('expenseAdded'),
        [{ text: t('ok'), onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  const renderVehicleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{t('vehicleSelection')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.vehicleOptions}>
          {vehiculos.map((vehicle) => (
            <TouchableOpacity
              key={vehicle._id}
              style={[
                styles.vehicleOption,
                selectedVehicle === vehicle._id && styles.vehicleOptionSelected
              ]}
              onPress={() => setSelectedVehicle(vehicle._id)}
            >
              <Ionicons
                name="car"
                size={20}
                color={selectedVehicle === vehicle._id ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.vehicleOptionText,
                selectedVehicle === vehicle._id && styles.vehicleOptionTextSelected
              ]}>
                {vehicle.marca} {vehicle.modelo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? t('editExpense') : t('newExpense')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(800).springify()}
            style={styles.form}
          >
            {renderVehicleSelector()}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('categorySelection')}</Text>
              <View style={styles.categoryGrid}>
                {expenseCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.categoryCardSelected
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={selectedCategory === category.id ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.categoryName,
                      selectedCategory === category.id && styles.categoryNameSelected
                    ]}>
                      {t(category.nameKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('details')}</Text>
              
              <Input
                label={t('descriptionLabel')}
                placeholder={t('descriptionPlaceholder')}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                error={errors.description}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label={t('amountLabel')}
                    placeholder={t('amountPlaceholder')}
                    value={formData.amount}
                    onChangeText={(value) => updateField('amount', value)}
                    keyboardType="decimal-pad"
                    error={errors.amount}
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateLabel}>{t('date')}</Text>
                    <View style={styles.dateValue}>
                      <Text style={styles.dateText}>
                        {date.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </Text>
                      <Ionicons name="calendar" size={16} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  themeVariant={colors.background === '#0f172a' ? 'dark' : 'light'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              {selectedCategory === 'fuel' && (
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Input
                      label={t('litersOptional')}
                      placeholder={t('litersPlaceholder')}
                      value={formData.liters}
                      onChangeText={(value) => updateField('liters', value)}
                      keyboardType="decimal-pad"
                      error={errors.liters}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Input
                      label={t('mileageOptional')}
                      placeholder={t('mileagePlaceholder')}
                      value={formData.odometer}
                      onChangeText={(value) => updateField('odometer', value)}
                      keyboardType="numeric"
                      error={errors.odometer}
                    />
                  </View>
                </View>
              )}

              <Input
                label={t('locationOptional')}
                placeholder={t('locationPlaceholder')}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
              />

              <Input
                label={t('additionalNotesOptional')}
                placeholder={t('additionalNotesPlaceholder')}
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                multiline
                numberOfLines={3}
              />

              {!isEditMode && (
                <>
                  <View style={styles.recurringRow}>
                    <View style={styles.recurringLabel}>
                      <Ionicons name="repeat" size={20} color={isRecurring ? colors.primary : colors.textSecondary} />
                      <Text style={styles.recurringText}>{t('recurringExpense')}</Text>
                    </View>
                    <Switch
                      value={isRecurring}
                      onValueChange={setIsRecurring}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={isRecurring ? colors.primary : colors.textSecondary}
                    />
                  </View>

                  {isRecurring && (
                    <View>
                      <Text style={styles.sectionTitle}>{t('frequency')}</Text>
                      <View style={styles.frequencyGrid}>
                        {frequencyOptions.map((freq) => (
                          <TouchableOpacity
                            key={freq.id}
                            style={[
                              styles.frequencyChip,
                              selectedFrequency === freq.id && styles.frequencyChipSelected
                            ]}
                            onPress={() => setSelectedFrequency(freq.id)}
                          >
                            <Text style={[
                              styles.frequencyChipText,
                              selectedFrequency === freq.id && styles.frequencyChipTextSelected
                            ]}>
                              {t(freq.labelKey)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isEditMode ? t('updateExpense') : t('saveExpense')}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


export default AddExpenseScreen;