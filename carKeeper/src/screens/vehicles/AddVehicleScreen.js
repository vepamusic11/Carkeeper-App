import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useVehiculos from '../../hooks/useVehiculos';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';
import { getImageUrl } from '../../utils/imageUtils';
import { sanitizeText } from '../../utils/validation';

const AddVehicleScreen = ({ navigation, route }) => {
  const { vehicleId, editMode } = route.params || {};
  const { addVehiculo, updateVehiculo, vehiculos, loading } = useVehiculos();
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    kilometraje: '',
    vin: '',
    patente: '',
    color: ''
  });
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Load vehicle data if in edit mode
  useEffect(() => {
    if (editMode && vehicleId) {
      setIsEditMode(true);
      const vehicle = vehiculos.find(v => v._id === vehicleId);
      if (vehicle) {
        setFormData({
          marca: vehicle.marca || '',
          modelo: vehicle.modelo || '',
          ano: vehicle.ano?.toString() || '',
          kilometraje: vehicle.kilometraje?.toString() || '',
          vin: vehicle.numeroChasis || vehicle.vin || '',
          patente: vehicle.patente || '',
          color: vehicle.color || ''
        });
        if (vehicle.imageUrl) {
          setImageUri(getImageUrl(vehicle.imageUrl));
        }
      }
    }
  }, [editMode, vehicleId, vehiculos]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(t('permissions'), t('needGalleryPermissions'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(t('permissions'), t('needCameraPermissions'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      t('addPhoto'),
      t('selectImageSource'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('takePhoto'), onPress: takePhoto },
        { text: t('selectFromGallery'), onPress: pickImage }
      ]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.marca.trim()) {
      newErrors.marca = t('brandRequired');
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = t('modelRequired');
    }

    if (!formData.ano.trim()) {
      newErrors.ano = t('yearRequired');
    } else if (!/^\d{4}$/.test(formData.ano) || parseInt(formData.ano) < 1900 || parseInt(formData.ano) > new Date().getFullYear() + 1) {
      newErrors.ano = t('invalidYear');
    }

    if (!formData.kilometraje.trim()) {
      newErrors.kilometraje = t('mileageRequired');
    } else if (!/^\d+$/.test(formData.kilometraje)) {
      newErrors.kilometraje = t('mustBeNumber');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const cleanData = {
      ...formData,
      marca: sanitizeText(formData.marca),
      modelo: sanitizeText(formData.modelo),
      vin: sanitizeText(formData.vin),
      patente: sanitizeText(formData.patente),
      color: sanitizeText(formData.color),
    };

    let result;
    if (isEditMode) {
      result = await updateVehiculo(vehicleId, cleanData, imageUri);
    } else {
      result = await addVehiculo(cleanData, imageUri);
    }
    
    if (result.success) {
      navigation.goBack();
    } else {
      Alert.alert(t('error'), result.error);
    }
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
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    imagePickerContainer: {
      marginVertical: spacing.xl,
      alignSelf: 'center'
    },
    vehicleImage: {
      width: 200,
      height: 150,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.border
    },
    imagePlaceholder: {
      width: 200,
      height: 150,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed'
    },
    imagePlaceholderText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.sm
    },
    form: {
      marginBottom: spacing.xl
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
    row: {
      flexDirection: 'row',
      gap: spacing.md
    },
    halfInput: {
      flex: 1
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
            {isEditMode ? t('editVehicle') : t('addVehicle')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={ZoomIn.duration(600).springify()}>
            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={showImagePicker}
              activeOpacity={0.7}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.vehicleImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={colors.textSecondary} />
                  <Text style={styles.imagePlaceholderText}>{t('addPhoto')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(800).delay(200).springify()}
            style={styles.form}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('basicInformation')}</Text>
              
              <Input
                label={t('brand')}
                placeholder={t('brandPlaceholder')}
                value={formData.marca}
                onChangeText={(value) => updateField('marca', value)}
                error={errors.marca}
              />

              <Input
                label={t('model')}
                placeholder={t('modelPlaceholder')}
                value={formData.modelo}
                onChangeText={(value) => updateField('modelo', value)}
                error={errors.modelo}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label={t('year')}
                    placeholder={t('yearPlaceholder')}
                    value={formData.ano}
                    onChangeText={(value) => updateField('ano', value)}
                    keyboardType="numeric"
                    error={errors.ano}
                  />
                </View>
                
                <View style={styles.halfInput}>
                  <Input
                    label={t('color')}
                    placeholder={t('colorPlaceholder')}
                    value={formData.color}
                    onChangeText={(value) => updateField('color', value)}
                  />
                </View>
              </View>

              <Input
                label={t('currentMileage')}
                placeholder={t('mileagePlaceholder')}
                value={formData.kilometraje}
                onChangeText={(value) => updateField('kilometraje', value)}
                keyboardType="numeric"
                error={errors.kilometraje}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('additionalInformation')}</Text>
              
              <Input
                label={t('vinOptional')}
                placeholder={t('vinPlaceholder')}
                value={formData.vin}
                onChangeText={(value) => updateField('vin', value)}
                autoCapitalize="characters"
              />

              <Input
                label={t('licensePlateOptional')}
                placeholder={t('licensePlatePlaceholder')}
                value={formData.patente}
                onChangeText={(value) => updateField('patente', value)}
                autoCapitalize="characters"
              />
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isEditMode ? t('updateVehicle') : t('saveVehicle')}
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


export default AddVehicleScreen;