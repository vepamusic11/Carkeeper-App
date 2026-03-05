import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useDocuments from '../../hooks/useDocuments';
import useVehiculos from '../../hooks/useVehiculos';
// Servicio eliminado - ahora se usa a través del provider
import { colors, spacing, fontSize, borderRadius, shadows } from '../../constants/theme';
import { t } from '../../utils/i18n';

const getDocumentTypes = () => [
  { id: 'insurance', name: t('insurance'), icon: 'shield-checkmark' },
  { id: 'registration', name: t('registration'), icon: 'document-text' },
  { id: 'inspection', name: t('inspectionVTV'), icon: 'checkmark-circle' },
  { id: 'license', name: t('license'), icon: 'card' },
  { id: 'manual', name: t('manual'), icon: 'book' },
  { id: 'receipt', name: t('receiptInvoice'), icon: 'receipt' },
  { id: 'warranty', name: t('warranty'), icon: 'ribbon' },
  { id: 'other', name: t('others'), icon: 'document' }
];

const AddDocumentScreen = ({ navigation, route }) => {
  const { vehicleId: routeVehicleId } = route.params || {};
  const { addDocument, loading, pickDocument } = useDocuments();
  const { vehiculos } = useVehiculos();
  
  const [selectedVehicle, setSelectedVehicle] = useState(routeVehicleId || vehiculos[0]?.id || '');
  const [selectedType, setSelectedType] = useState('insurance');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    issuer: '',
    documentNumber: '',
    notes: ''
  });
  const [expirationDate, setExpirationDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePickDocument = async () => {
    const result = await pickDocument();
    
    if (result.uri) {
      setSelectedFile({
        uri: result.uri,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType
      });
    } else if (result.error && result.error !== t('selectionCanceled')) {
      Alert.alert(t('error'), result.error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedVehicle) {
      newErrors.vehicle = t('selectVehicle');
    }

    if (!selectedType) {
      newErrors.type = t('selectDocumentType');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('fieldRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedVehicleData = vehiculos.find(v => v.id === selectedVehicle);
    
    const documentData = {
      type: selectedType,
      name: formData.name,
      description: formData.description,
      issuer: formData.issuer,
      documentNumber: formData.documentNumber,
      notes: formData.notes,
      vehicleName: selectedVehicleData ? `${selectedVehicleData.marca} ${selectedVehicleData.modelo}` : 'Vehículo',
      expirationDate: expirationDate ? expirationDate.toISOString() : null,
      fileName: selectedFile?.name || null,
      fileSize: selectedFile?.size || null,
      mimeType: selectedFile?.mimeType || null
    };

    const result = await addDocument(selectedVehicle, documentData, selectedFile?.uri);
    
    if (result.success) {
      Alert.alert(
        t('success'),
        t('documentAddedSuccessfully'),
        [{ text: t('ok'), onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(t('error'), result.error);
    }
  };

  const renderVehicleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{t('vehicle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.vehicleOptions}>
          {vehiculos.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleOption,
                selectedVehicle === vehicle.id && styles.vehicleOptionSelected
              ]}
              onPress={() => setSelectedVehicle(vehicle.id)}
            >
              <Ionicons
                name="car"
                size={20}
                color={selectedVehicle === vehicle.id ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.vehicleOptionText,
                selectedVehicle === vehicle.id && styles.vehicleOptionTextSelected
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
          <Text style={styles.headerTitle}>{t('newDocument')}</Text>
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
              <Text style={styles.sectionTitle}>{t('documentType')}</Text>
              <View style={styles.typeGrid}>
                {getDocumentTypes().map((type) => (
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
                      size={24}
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('documentInformation')}</Text>
              
              <Input
                label={t('documentName')}
                placeholder={t('documentNamePlaceholder')}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
              />

              <Input
                label={t('descriptionOptional')}
                placeholder={t('additionalDocumentDescription')}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label={t('issuerOptional')}
                    placeholder={t('insuranceCompanyEtc')}
                    value={formData.issuer}
                    onChangeText={(value) => updateField('issuer', value)}
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <Input
                    label={t('numberOptional')}
                    placeholder={t('policyNumberEtc')}
                    value={formData.documentNumber}
                    onChangeText={(value) => updateField('documentNumber', value)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateLabel}>{t('expirationDateOptional')}</Text>
                <View style={styles.dateValue}>
                  <Text style={styles.dateText}>
                    {expirationDate 
                      ? expirationDate.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : t('noExpirationDate')
                    }
                  </Text>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={expirationDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setExpirationDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              <TouchableOpacity
                style={styles.fileButton}
                onPress={handlePickDocument}
              >
                <View style={styles.fileButtonContent}>
                  <Ionicons 
                    name={selectedFile ? "document-text" : "add-circle-outline"} 
                    size={24} 
                    color={colors.primary} 
                  />
                  <View style={styles.fileButtonText}>
                    <Text style={styles.fileButtonTitle}>
                      {selectedFile ? t('fileSelected') : t('attachFile')}
                    </Text>
                    <Text style={styles.fileButtonSubtitle}>
                      {selectedFile 
                        ? `${selectedFile.name} (${documentsService.formatFileSize(selectedFile.size)})`
                        : t('pdfImageOrTextDocument')
                      }
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <Input
                label={t('additionalNotesOptional')}
                placeholder={t('additionalInfoObservations')}
                value={formData.notes}
                onChangeText={(value) => updateField('notes', value)}
                multiline
                numberOfLines={3}
              />
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('saveDocument')}
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

const styles = StyleSheet.create({
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  typeCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10'
  },
  typeName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center'
  },
  typeNameSelected: {
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
  fileButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  fileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileButtonText: {
    marginLeft: spacing.md,
    flex: 1
  },
  fileButtonTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs
  },
  fileButtonSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary
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
  }
});

export default AddDocumentScreen;