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
import useMantenimientos from '../../hooks/useMantenimientos';
import useVehiculos from '../../hooks/useVehiculos';
import { useTheme } from '../../hooks/useTheme';
import { t, isSpanish } from '../../utils/i18n';
import { sanitizeText } from '../../utils/validation';
import { getTip, suggestNext } from '../../constants/maintenanceTips';

const getMaintenanceTypes = () => [
  { id: 'cambio_aceite', name: t('oilChange'), icon: 'water', defaultIntervalKm: 10000, defaultIntervalMonths: 6 },
  { id: 'cambio_filtros', name: t('filterChange'), icon: 'funnel', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  { id: 'frenos', name: t('brakeService'), icon: 'disc', defaultIntervalKm: 20000, defaultIntervalMonths: 12 },
  { id: 'neumaticos', name: t('tires'), icon: 'sync', defaultIntervalKm: 40000, defaultIntervalMonths: 24 },
  { id: 'alineacion', name: t('alignment'), icon: 'resize', defaultIntervalKm: 15000, defaultIntervalMonths: 12 },
  { id: 'balanceado', name: t('balancing'), icon: 'refresh', defaultIntervalKm: 10000, defaultIntervalMonths: 6 },
  { id: 'bateria', name: t('battery'), icon: 'battery-charging', defaultIntervalKm: null, defaultIntervalMonths: 24 },
  { id: 'aire_acondicionado', name: t('airConditioning'), icon: 'snow', defaultIntervalKm: null, defaultIntervalMonths: 12 },
  { id: 'revision_general', name: t('generalInspection'), icon: 'eye', defaultIntervalKm: 10000, defaultIntervalMonths: 6 },
  { id: 'otro', name: t('other'), icon: 'build', defaultIntervalKm: null, defaultIntervalMonths: null }
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl
  },
  section: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md
  },
  vehicleSelector: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  selectedVehicle: {
    backgroundColor: colors.primary + '10'
  },
  vehicleText: {
    fontSize: fontSize.base,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  typeCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm
  },
  selectedType: {
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary
  },
  typeIcon: {
    marginBottom: spacing.sm
  },
  typeName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center'
  },
  selectedTypeName: {
    color: colors.primary
  },
  dateContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm
  },
  dateText: {
    fontSize: fontSize.base,
    color: colors.text,
    marginLeft: spacing.sm
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  switchLabel: {
    fontSize: fontSize.base,
    color: colors.text,
    flex: 1
  },
  switchDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  saveButton: {
    marginTop: spacing.lg
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
  },
  addVehicleButton: {
    marginTop: spacing.md
  },
  vehicleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10'
  },
  vehicleOptionText: {
    fontSize: fontSize.base,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '15',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg
  },
  vehicleDetails: {
    marginLeft: spacing.md,
    flex: 1
  },
  vehicleName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text
  },
  vehicleKm: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  changeVehicle: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600'
  },
  form: {
    marginTop: spacing.lg
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10'
  },
  typeNameSelected: {
    color: colors.primary,
    fontWeight: '600'
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
  row: {
    flexDirection: 'row',
    gap: spacing.md
  },
  halfInput: {
    flex: 1
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md
  },
  scheduleSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  nextDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight + '10',
    borderRadius: borderRadius.sm
  },
  nextDateText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600'
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.xs
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '10',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30'
  },
  infoCardContent: {
    marginLeft: spacing.md,
    flex: 1
  },
  infoCardTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  infoCardDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sm
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: spacing.xl
  }
});

const AddMaintenanceScreen = ({ navigation, route }) => {
  const { vehicleId, scheduleMode = false, editMode = false, maintenanceId } = route.params || {};
  const { addMantenimiento, updateMantenimiento, mantenimientos, loadMaintenancesByVehicle, loading } = useMantenimientos();
  const { vehiculos } = useVehiculos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, fontSize, borderRadius, shadows), [colors, spacing, fontSize, borderRadius, shadows]);

  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId);
  const [selectedType, setSelectedType] = useState('cambio_aceite');
  const [isScheduleMode, setIsScheduleMode] = useState(scheduleMode);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: '',
    provider: '',
    location: '',
    notas: '',
    kilometraje: '',
    nextMaintenanceKm: '',
    nextMaintenanceMonths: '6',
    priority: 'medium'
  });
  const [date, setDate] = useState(isScheduleMode ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : new Date());
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [scheduleNext, setScheduleNext] = useState(!isScheduleMode);

  const selectedVehicle = vehiculos.find(v => v._id === selectedVehicleId);
  const maintenanceTypes = getMaintenanceTypes();
  const selectedMaintenanceType = maintenanceTypes.find(type => type.id === selectedType);

  // Load existing maintenance data when in edit mode
  useEffect(() => {
    if (isEditMode && maintenanceId && selectedVehicleId) {
      loadMaintenanceData();
    }
  }, [isEditMode, maintenanceId, selectedVehicleId]);

  const loadMaintenanceData = async () => {
    if (!selectedVehicleId) return;
    
    const result = await loadMaintenancesByVehicle(selectedVehicleId);
    let maintenance = null;
    
    if (result.data) {
      maintenance = result.data.find(m => m._id === maintenanceId);
    } else {
      maintenance = mantenimientos.find(m => m._id === maintenanceId);
    }
    
    if (maintenance) {
      setSelectedType(maintenance.type || 'cambio_aceite');
      setDate(new Date(maintenance.date));
      setIsScheduleMode(maintenance.status === 'pending');
      
      if (maintenance.nextMaintenanceDate) {
        setNextMaintenanceDate(new Date(maintenance.nextMaintenanceDate));
        setScheduleNext(true);
      }
      
      setFormData({
        title: maintenance.title || '',
        description: maintenance.description || '',
        cost: maintenance.cost ? maintenance.cost.toString() : '',
        provider: maintenance.provider || '',
        location: maintenance.location || '',
        notas: maintenance.notas || '',
        kilometraje: maintenance.kilometraje ? maintenance.kilometraje.toString() : '',
        nextMaintenanceKm: maintenance.nextMaintenanceKm ? maintenance.nextMaintenanceKm.toString() : '',
        nextMaintenanceMonths: '6',
        priority: maintenance.priority || 'medium'
      });
    }
  };

  useEffect(() => {
    if (selectedMaintenanceType && selectedVehicle) {
      const { defaultIntervalKm, defaultIntervalMonths, name } = selectedMaintenanceType;
      
      setFormData(prev => ({
        ...prev,
        title: prev.title || name,
        nextMaintenanceKm: defaultIntervalKm ? String(selectedVehicle.kilometraje + defaultIntervalKm) : '',
        nextMaintenanceMonths: defaultIntervalMonths ? String(defaultIntervalMonths) : '6',
        kilometraje: prev.kilometraje || String(selectedVehicle.kilometraje || '')
      }));

      if (defaultIntervalMonths && scheduleNext) {
        const nextDate = new Date(date);
        nextDate.setMonth(nextDate.getMonth() + defaultIntervalMonths);
        setNextMaintenanceDate(nextDate);
      }
    }
  }, [selectedType, selectedVehicle, date, scheduleNext]);

  // Actualizar automáticamente el título cuando se selecciona un tipo de mantenimiento
  useEffect(() => {
    if (selectedMaintenanceType && !isEditMode) {
      // Obtener todos los nombres de tipos de mantenimiento para verificar si el título actual es uno de ellos
      const allMaintenanceNames = maintenanceTypes.map(type => type.name);
      const currentTitleIsMaintenanceType = allMaintenanceNames.includes(formData.title.trim());
      
      // Solo actualizar si el título actual NO es el que debería ser
      if (formData.title !== selectedMaintenanceType.name && 
          (!formData.title.trim() || currentTitleIsMaintenanceType)) {
        setFormData(prev => ({ ...prev, title: selectedMaintenanceType.name }));
      }
    }
  }, [selectedType, selectedMaintenanceType, isEditMode]); // Removí maintenanceTypes y formData.title de las dependencias

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedVehicleId) {
      newErrors.vehicle = t('vehicleRequired');
    } else if (!selectedVehicle) {
      newErrors.vehicle = t('vehicleNotExists');
      console.error('VALIDATION ERROR: Vehicle with ID', selectedVehicleId, 'not found in vehicles list:', vehiculos);
    }

    if (!selectedType) {
      newErrors.type = t('selectMaintenanceType');
    }

    if (!formData.title.trim()) {
      newErrors.title = t('titleRequired');
    }

    if (formData.cost && !/^\d+(\.\d{1,2})?$/.test(formData.cost)) {
      newErrors.cost = t('invalidCost');
    }

    if (formData.kilometraje && !/^\d+$/.test(formData.kilometraje)) {
      newErrors.kilometraje = t('invalidMileage');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const maintenanceData = {
      vehicleId: selectedVehicleId,
      type: selectedType,
      title: sanitizeText(formData.title),
      description: sanitizeText(formData.description),
      date: date,
      status: isScheduleMode ? 'pending' : 'completed',
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      provider: sanitizeText(formData.provider),
      location: sanitizeText(formData.location),
      notas: sanitizeText(formData.notas),
      kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : selectedVehicle?.kilometraje,
      // Información para el backend sobre el próximo mantenimiento (solo para referencia)
      nextMaintenanceKm: scheduleNext && formData.nextMaintenanceKm ? parseInt(formData.nextMaintenanceKm) : null,
      nextMaintenanceDate: scheduleNext ? nextMaintenanceDate : null,
      priority: formData.priority,
      completedAt: isScheduleMode ? null : new Date()
    };

    try {
      let result;
      
      if (isEditMode && maintenanceId) {
        // Update existing maintenance
        result = await updateMantenimiento(maintenanceId, maintenanceData);
      } else {
        // Create new maintenance
        result = await addMantenimiento(maintenanceData);
      }
      
      if (result.success) {
        // El backend se encarga automáticamente de crear el próximo mantenimiento
        // cuando el mantenimiento está completado, así que no necesitamos crear uno aquí
        Alert.alert(
          t('success'),
          isEditMode 
            ? t('maintenanceUpdated')
            : isScheduleMode 
              ? t('maintenanceScheduledSuccess') 
              : scheduleNext 
                ? t('maintenanceRegisteredAndScheduled')
                : t('maintenanceAdded'),
          [{ text: t('ok'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(t('error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('error'), `${t('error')} ${isEditMode ? t('edit') : t('save')} ${t('maintenance').toLowerCase()}`);
    }
  };

  if (vehiculos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('registerMaintenance')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{t('noVehicles')}</Text>
          <Text style={styles.emptyText}>
            {t('needsVehicleForMaintenance')}
          </Text>
          <Button
            title={t('addVehicle')}
            onPress={() => navigation.navigate('Vehicles')}
            style={styles.addVehicleButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            {isEditMode 
              ? t('editMaintenance')
              : isScheduleMode 
                ? t('scheduleMaintenance') 
                : t('registerMaintenance')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Vehicle Selector */}
          {!selectedVehicleId && vehiculos.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('selectVehicle')}</Text>
              {vehiculos.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle._id}
                  style={[
                    styles.vehicleOption,
                    selectedVehicleId === vehicle._id && styles.vehicleOptionSelected
                  ]}
                  onPress={() => setSelectedVehicleId(vehicle._id)}
                >
                  <Ionicons name="car" size={24} color={colors.primary} />
                  <Text style={styles.vehicleOptionText}>
                    {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                  </Text>
                  {selectedVehicleId === vehicle._id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {errors.vehicle && <Text style={styles.errorText}>{errors.vehicle}</Text>}
            </View>
          )}

          {/* Vehicle Info */}
          {selectedVehicle && (
            <View style={styles.vehicleInfo}>
              <Ionicons name="car" size={24} color={colors.primary} />
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleName}>
                  {selectedVehicle.marca} {selectedVehicle.modelo} {selectedVehicle.ano}
                </Text>
                <Text style={styles.vehicleKm}>
                  {selectedVehicle.kilometraje?.toLocaleString()} km
                </Text>
              </View>
              {vehiculos.length > 1 && (
                <TouchableOpacity onPress={() => setSelectedVehicleId(null)}>
                  <Text style={styles.changeVehicle}>{t('change')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <Animated.View
            entering={FadeInDown.duration(800).springify()}
            style={styles.form}
          >
            {/* Maintenance Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('maintenanceType')}</Text>
              <View style={styles.typeGrid}>
                {maintenanceTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      selectedType === type.id && styles.typeCardSelected
                    ]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={20}
                      color={selectedType === type.id ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.typeName,
                      selectedType === type.id && styles.typeNameSelected
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            {/* Maintenance Tip Banner */}
            {selectedType && (() => {
              const tip = getTip(selectedType, isSpanish() ? 'es' : 'en');
              if (!tip || selectedType === 'otro') return null;
              return (
                <View style={{
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.lg,
                  backgroundColor: colors.primary + '10',
                  borderRadius: 12,
                  padding: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                }}>
                  <Ionicons name="information-circle" size={20} color={colors.primary} style={{ marginRight: spacing.sm, marginTop: 2 }} />
                  <Text style={{ flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 }}>
                    {tip.description}
                  </Text>
                </View>
              );
            })()}

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('basicInformation')}</Text>
              
              <Input
                label={t('title')}
                placeholder={t('titlePlaceholder')}
                value={formData.title}
                onChangeText={(value) => updateField('title', value)}
                error={errors.title}
              />

              <Input
                label={t('descriptionOptional')}
                placeholder={t('descriptionPlaceholder')}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateLabel}>
                  {isScheduleMode ? t('scheduledDate') : t('maintenanceDate')}
                </Text>
                <View style={styles.dateValue}>
                  <Text style={styles.dateText}>
                    {date.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>

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
                  maximumDate={isScheduleMode ? null : new Date()}
                  minimumDate={isScheduleMode ? new Date() : null}
                />
              )}

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label={t('mileage')}
                    placeholder={selectedVehicle?.kilometraje?.toString() || "0"}
                    value={formData.kilometraje}
                    onChangeText={(value) => updateField('kilometraje', value)}
                    keyboardType="numeric"
                    error={errors.kilometraje}
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <Input
                    label={t('cost')}
                    placeholder={t('costPlaceholder')}
                    value={formData.cost}
                    onChangeText={(value) => updateField('cost', value)}
                    keyboardType="decimal-pad"
                    error={errors.cost}
                  />
                </View>
              </View>
            </View>

            {/* Service Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('serviceInformation')}</Text>
              
              <Input
                label={t('providerOptional')}
                placeholder={t('providerPlaceholder')}
                value={formData.provider}
                onChangeText={(value) => updateField('provider', value)}
              />

              <Input
                label={t('locationOptional')}
                placeholder={t('locationPlaceholder')}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
              />

              <Input
                label={t('additionalNotesOptional')}
                placeholder={t('additionalNotesPlaceholder')}
                value={formData.notas}
                onChangeText={(value) => updateField('notas', value)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Expense Integration - Información sobre creación automática */}
            {parseFloat(formData.cost) > 0 && !isScheduleMode && (
              <View style={styles.section}>
                <View style={styles.infoCard}>
                  <Ionicons name="wallet" size={20} color={colors.primary} />
                  <View style={styles.infoCardContent}>
                    <Text style={styles.infoCardTitle}>{t('automaticExpense')}</Text>
                    <Text style={styles.infoCardDescription}>
                      {t('automaticExpenseMessage')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Next Maintenance Scheduling */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>{t('scheduleNextMaintenance')}</Text>
                  <Text style={styles.switchDescription}>
                    {t('scheduleNextMaintenanceDescription')}
                  </Text>
                </View>
                <Switch
                  value={scheduleNext}
                  onValueChange={(value) => {
                    setScheduleNext(value);

                    // Si se activa y tenemos meses configurados, calcular la fecha
                    if (value && formData.nextMaintenanceMonths) {
                      const nextDate = new Date(date);
                      nextDate.setMonth(nextDate.getMonth() + parseInt(formData.nextMaintenanceMonths));
                      setNextMaintenanceDate(nextDate);
                    } else if (!value) {
                      setNextMaintenanceDate(null);
                    }
                  }}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={scheduleNext ? colors.primary : colors.textSecondary}
                />
              </View>

              {scheduleNext && (
                <View style={styles.scheduleSection}>
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Input
                        label={t('nextInKm')}
                        placeholder={t('nextInKmPlaceholder')}
                        value={formData.nextMaintenanceKm}
                        onChangeText={(value) => updateField('nextMaintenanceKm', value)}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.halfInput}>
                      <Input
                        label={t('orInMonths')}
                        placeholder={t('orInMonthsPlaceholder')}
                        value={formData.nextMaintenanceMonths}
                        onChangeText={(value) => {
                          updateField('nextMaintenanceMonths', value);
                          if (value) {
                            const nextDate = new Date(date);
                            nextDate.setMonth(nextDate.getMonth() + parseInt(value));
                            setNextMaintenanceDate(nextDate);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {nextMaintenanceDate && (
                    <View style={styles.nextDateInfo}>
                      <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                      <Text style={styles.nextDateText}>
                        {t('nextMaintenance', { date: nextMaintenanceDate.toLocaleDateString('es-ES') })}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isEditMode 
              ? t('updateMaintenance')
              : isScheduleMode 
                ? t('scheduleMaintenance') 
                : t('registerMaintenance')}
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

export default AddMaintenanceScreen;