import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Button from '../../components/Button';
import useVehiculos from '../../hooks/useVehiculos';
import useGastos from '../../hooks/useGastos';
import useMantenimientos from '../../hooks/useMantenimientos';
import useDocuments from '../../hooks/useDocuments';
import { exportService } from '../../services/export';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

const ExportScreen = ({ navigation }) => {
  const { vehiculos } = useVehiculos();
  const { gastos } = useGastos();
  const { mantenimientos } = useMantenimientos();
  const { documents } = useDocuments();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  
  const [selectedTypes, setSelectedTypes] = useState({
    vehicles: true,
    expenses: true,
    maintenances: true,
    documents: false
  });
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Inicio del año
    end: new Date()
  });
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const getExportTypes = () => [
    {
      key: 'vehicles',
      name: t('vehicles'),
      description: t('basicVehicleInformation'),
      icon: 'car',
      count: vehiculos.length
    },
    {
      key: 'expenses',
      name: t('expenses'),
      description: t('completeExpenseRecord'),
      icon: 'wallet',
      count: gastos.length
    },
    {
      key: 'maintenances',
      name: t('maintenances'),
      description: t('maintenanceHistory'),
      icon: 'build',
      count: mantenimientos.length
    },
    {
      key: 'documents',
      name: t('documents'),
      description: t('documentsInfoNoAttachments'),
      icon: 'document-text',
      count: documents.length
    }
  ];

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleExport = async () => {
    const selectedCount = Object.values(selectedTypes).filter(Boolean).length;
    if (selectedCount === 0) {
      Alert.alert(t('error'), t('selectAtLeastOneDataType'));
      return;
    }

    setLoading(true);

    try {
      const results = [];

      if (selectedTypes.vehicles) {
        // Intentar primero desde el backend
        let result = await exportService.exportVehiclesFromBackend();
        
        // Si falla, usar datos locales como fallback
        if (result.error) {
          console.log('Fallback to local vehicles export:', result.error);
          result = await exportService.exportVehicles(vehiculos);
        }
        
        if (result.uri) {
          results.push({ type: t('vehicles'), uri: result.uri });
        }
      }

      if (selectedTypes.expenses) {
        // Intentar primero desde el backend
        let result = await exportService.exportExpensesFromBackend(dateRange.start, dateRange.end);
        
        // Si falla, usar datos locales como fallback
        if (result.error) {
          console.log('Fallback to local expenses export:', result.error);
          const filteredExpenses = gastos.filter(exp => {
            const expDate = exp.date.toDate ? exp.date.toDate() : new Date(exp.date);
            return expDate >= dateRange.start && expDate <= dateRange.end;
          });
          result = await exportService.exportExpenses(filteredExpenses, vehiculos);
        }
        
        if (result.uri) {
          results.push({ type: t('expenses'), uri: result.uri });
        }
      }

      if (selectedTypes.maintenances) {
        // Intentar primero desde el backend
        let result = await exportService.exportMaintenancesFromBackend(dateRange.start, dateRange.end);
        
        // Si falla, usar datos locales como fallback
        if (result.error) {
          console.log('Fallback to local maintenances export:', result.error);
          const filteredMaintenances = mantenimientos.filter(maint => {
            const maintDate = maint.date.toDate ? maint.date.toDate() : new Date(maint.date);
            return maintDate >= dateRange.start && maintDate <= dateRange.end;
          });
          result = await exportService.exportMaintenances(filteredMaintenances, vehiculos);
        }
        
        if (result.uri) {
          results.push({ type: t('maintenances'), uri: result.uri });
        }
      }

      if (selectedTypes.documents) {
        // Intentar primero desde el backend
        let result = await exportService.exportDocumentsFromBackend();
        
        // Si falla, usar datos locales como fallback
        if (result.error) {
          console.log('Fallback to local documents export:', result.error);
          result = await exportService.exportDocuments(documents, vehiculos);
        }
        
        if (result.uri) {
          results.push({ type: t('documents'), uri: result.uri });
        }
      }

      if (results.length > 0) {
        // Si solo hay un archivo, compartirlo directamente
        if (results.length === 1) {
          const shareResult = await exportService.shareFile(
            results[0].uri,
            t('exportOf', { type: results[0].type })
          );
          
          if (shareResult.success) {
            Alert.alert(t('success'), t('dataExportedAndSharedSuccessfully'));
          } else {
            Alert.alert(t('error'), shareResult.error);
          }
        } else {
          // Múltiples archivos - mostrar opciones
          showMultipleFilesOptions(results);
        }
      } else {
        Alert.alert(t('error'), t('couldNotExportData'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('errorExportingData') + ': ' + error.message);
    }

    setLoading(false);
  };

  const handleCompleteBackup = async () => {
    setLoading(true);

    try {
      // Intentar primero desde el backend
      let result = await exportService.exportCompleteDataFromBackend();
      
      // Si falla, usar datos locales como fallback
      if (result.error) {
        console.log('Fallback to local complete backup:', result.error);
        result = await exportService.exportCompleteData(
          vehiculos,
          gastos,
          mantenimientos,
          documents
        );
      }

      if (result.uri) {
        const shareResult = await exportService.shareFile(
          result.uri,
          t('completeCarKeeperBackup')
        );
        
        if (shareResult.success) {
          Alert.alert(
            t('completeBackup'),
            t('completeBackupCreatedJSON')
          );
        } else {
          Alert.alert(t('error'), shareResult.error);
        }
      } else {
        Alert.alert(t('error'), result.error);
      }
    } catch (error) {
      Alert.alert(t('error'), t('errorCreatingBackup') + ': ' + error.message);
    }

    setLoading(false);
  };

  const showMultipleFilesOptions = (results) => {
    Alert.alert(
      t('exportedFiles'),
      t('filesCreatedWhatToDo', { count: results.length }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('shareByEmail'),
          onPress: () => sendByEmail(results)
        },
        {
          text: t('shareFirstFile'),
          onPress: () => exportService.shareFile(results[0].uri)
        }
      ]
    );
  };

  const sendByEmail = async (results) => {
    const subject = t('carKeeperDataExportEmail', { date: new Date().toLocaleDateString('es-ES') });
    const body = t('emailBodyText', {
      types: results.map(r => `• ${r.type}`).join('\n'),
      startDate: dateRange.start.toLocaleDateString('es-ES'),
      endDate: dateRange.end.toLocaleDateString('es-ES')
    });

    // Para simplificar, enviamos solo el primer archivo
    // En una implementación completa podrías crear un ZIP
    const emailResult = await exportService.sendByEmail(
      results[0].uri,
      results[0].type,
      subject,
      body
    );

    if (!emailResult.success) {
      Alert.alert(t('error'), emailResult.error);
    }
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
      color: colors.text
    },
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.md
    },
    sectionSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.md
    },
    typesContainer: {
      gap: spacing.md
    },
    typeCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm
    },
    typeCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight + '10'
    },
    typeCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    typeInfo: {
      flex: 1
    },
    typeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm
    },
    typeName: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginLeft: spacing.sm,
      flex: 1
    },
    typeNameSelected: {
      color: colors.primary
    },
    typeCount: {
      backgroundColor: colors.border,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm
    },
    typeCountText: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textSecondary
    },
    typeDescription: {
      fontSize: fontSize.sm,
      color: colors.textSecondary
    },
    dateRangeSection: {
      marginTop: spacing.lg
    },
    dateRow: {
      flexDirection: 'row',
      gap: spacing.md
    },
    dateInput: {
      flex: 1
    },
    dateLabel: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm
    },
    dateButton: {
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
    actionsSection: {
      marginTop: spacing.xl,
      gap: spacing.md
    },
    backupButton: {
      marginTop: spacing.sm
    },
    infoSection: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border
    },
    infoTitle: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md
    },
    infoText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      lineHeight: 20
    }
  });

  const renderExportType = (type, index) => (
    <Animated.View
      key={type.key}
      entering={FadeInDown.duration(600).delay(index * 100).springify()}
    >
      <TouchableOpacity
        style={[
          styles.typeCard,
          selectedTypes[type.key] && styles.typeCardSelected
        ]}
        onPress={() => handleTypeToggle(type.key)}
        activeOpacity={0.7}
      >
        <View style={styles.typeCardContent}>
          <View style={styles.typeInfo}>
            <View style={styles.typeHeader}>
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={selectedTypes[type.key] ? colors.primary : colors.textSecondary} 
              />
              <Text style={[
                styles.typeName,
                selectedTypes[type.key] && styles.typeNameSelected
              ]}>
                {type.name}
              </Text>
              <View style={styles.typeCount}>
                <Text style={styles.typeCountText}>{type.count}</Text>
              </View>
            </View>
            <Text style={styles.typeDescription}>{type.description}</Text>
          </View>
          
          <Switch
            value={selectedTypes[type.key]}
            onValueChange={() => handleTypeToggle(type.key)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={selectedTypes[type.key] ? colors.primary : colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('exportData')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('selectDataToExport')}</Text>
        
        <View style={styles.typesContainer}>
          {getExportTypes().map((type, index) => renderExportType(type, index))}
        </View>

        <Animated.View 
          entering={FadeInDown.duration(800).delay(400).springify()}
          style={styles.dateRangeSection}
        >
          <Text style={styles.sectionTitle}>{t('dateRange')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('onlyAppliesTo')}
          </Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>{t('from')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateText}>
                  {dateRange.start.toLocaleDateString('es-ES')}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>{t('to')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateText}>
                  {dateRange.end.toLocaleDateString('es-ES')}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={dateRange.start}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setDateRange(prev => ({ ...prev, start: selectedDate }));
                }
              }}
              maximumDate={dateRange.end}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={dateRange.end}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  setDateRange(prev => ({ ...prev, end: selectedDate }));
                }
              }}
              minimumDate={dateRange.start}
              maximumDate={new Date()}
            />
          )}
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(800).delay(600).springify()}
          style={styles.actionsSection}
        >
          <Button
            title={t('exportSelection')}
            onPress={handleExport}
            loading={loading}
            fullWidth
            size="lg"
            icon={<Ionicons name="download" size={20} color="#ffffff" />}
          />
          
          <Button
            title={t('completeBackupJSON')}
            onPress={handleCompleteBackup}
            loading={loading}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.backupButton}
            icon={<Ionicons name="archive" size={20} color={colors.primary} />}
          />
        </Animated.View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('informationIcon')}</Text>
          <Text style={styles.infoText}>
            {t('csvFilesCanBeOpened')}
          </Text>
          <Text style={styles.infoText}>
            {t('jsonBackupIncludesAll')}
          </Text>
          <Text style={styles.infoText}>
            {t('documentAttachmentsNotIncluded')}
          </Text>
          <Text style={styles.infoText}>
            {t('exportRespectsDateRange')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExportScreen;