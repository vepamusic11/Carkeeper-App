import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import Button from '../../components/Button';
import { useTheme } from '../../hooks/useTheme';
import useSubscription from '../../hooks/useSubscription';
import useVehiculos from '../../hooks/useVehiculos';
import { vehicleSharingService } from '../../services/vehicleSharingApi';
import { t } from '../../utils/i18n';

const VehicleSharingScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { canInviteUsers, canShareVehicles, isPro } = useSubscription();
  const { vehiculos } = useVehiculos();
  
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [permissions, setPermissions] = useState({
    canEditExpenses: true,
    canEditMaintenance: true,
    canUploadDocuments: false,
    canEditVehicle: false
  });
  const [loading, setLoading] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sharedVehicles, setSharedVehicles] = useState([]);

  useEffect(() => {
    if (canShareVehicles) {
      loadSharingData();
    }
  }, [canShareVehicles]);

  const loadSharingData = async () => {
    try {
      setLoading(true);
      
      // Cargar invitaciones enviadas
      const sentData = await vehicleSharingService.getSentInvitations();
      if (sentData.data) {
        setSentInvitations(sentData.data);
      }
      
      // Cargar invitaciones recibidas
      const receivedData = await vehicleSharingService.getReceivedInvitations();
      if (receivedData.data) {
        setReceivedInvitations(receivedData.data);
      }
      
      // Cargar vehículos compartidos conmigo
      const sharedData = await vehicleSharingService.getSharedVehicles();
      if (sharedData.data) {
        setSharedVehicles(sharedData.data);  
      }
      
    } catch (error) {
      console.error('Error loading sharing data:', error);
    } finally {
      setLoading(false);
    }
    // loadSentInvitations();
    // loadReceivedInvitations();
    // loadSharedVehicles();
  };

  const handleInviteUser = async () => {
    if (!selectedVehicle || !inviteEmail.trim()) {
      Alert.alert(t('error'), t('pleaseCompleteAllRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      const result = await vehicleSharingService.inviteUser({
        vehicleId: selectedVehicle._id,
        email: inviteEmail,
        role: selectedRole,
        message: inviteMessage,
        permissions
      });

      if (result.error) {
        Alert.alert(t('error'), result.error);
        return;
      }

      Alert.alert(
        t('invitationSentSuccess'),
        t('invitationSentTo', {
          email: inviteEmail,
          brand: selectedVehicle.marca,
          model: selectedVehicle.modelo
        }),
        [{ text: t('ok'), onPress: () => {
          setInviteModalVisible(false);
          resetInviteForm();
          loadSharingData();
        }}]
      );
    } catch (error) {
      console.log('Full error object:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          t('errorSendingInvitation');

      Alert.alert(t('detailedError'), errorMessage);
    }
    setLoading(false);
  };

  const resetInviteForm = () => {
    setSelectedVehicle(null);
    setInviteEmail('');
    setInviteMessage('');
    setSelectedRole('viewer');
    setPermissions({
      canEditExpenses: true,
      canEditMaintenance: true,
      canUploadDocuments: false,
      canEditVehicle: false
    });
  };

  const handleAcceptInvitation = async (invitationToken, vehicleInfo) => {
    try {
      const result = await vehicleSharingService.respondToInvitation(invitationToken, 'accept');
      
      if (result.error) {
        Alert.alert(t('error'), result.error);
        return;
      }

      Alert.alert(
        t('invitationAcceptedSuccess'),
        t('nowYouCanManage', {
          brand: vehicleInfo.marca,
          model: vehicleInfo.modelo
        }),
        [{ text: t('ok'), onPress: loadSharingData }]
      );
    } catch (error) {
      Alert.alert(t('error'), t('couldNotAcceptInvitation'));
    }
  };

  const handleDeclineInvitation = async (invitationToken, vehicleInfo) => {
    Alert.alert(
      t('rejectInvitation'),
      t('areYouSureReject', {
        brand: vehicleInfo.marca,
        model: vehicleInfo.modelo
      }),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('reject'), 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await vehicleSharingService.respondToInvitation(invitationToken, 'decline');
              
              if (result.error) {
                Alert.alert(t('error'), result.error);
                return;
              }

              Alert.alert(t('invitationRejected'), '', [{ text: t('ok'), onPress: loadSharingData }]);
            } catch (error) {
              Alert.alert(t('error'), t('couldNotRejectInvitation'));
            }
          }
        }
      ]
    );
  };

  const renderUpgradePrompt = () => (
    <Animated.View 
      entering={FadeInDown.duration(600).springify()}
      style={[styles.upgradeCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
    >
      <Ionicons name="star-outline" size={48} color={colors.primary} style={styles.upgradeIcon} />
      <Text style={[styles.upgradeTitle, { color: colors.text }]}>
        {t('vehicleSharing')}
      </Text>
      <Text style={[styles.upgradeDescription, { color: colors.textSecondary }]}>
        {isPro
          ? t('shareManagementOfVehicles')
          : t('upgradeToPremiumOrPro')
        }
      </Text>
      
      <Button
        title={isPro ? t('startSharing') : t('upgrade')}
        onPress={() => navigation.navigate('Subscription')}
        style={styles.upgradeButton}
      />
    </Animated.View>
  );

  const renderInviteModal = () => (
    <Modal
      visible={inviteModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {t('inviteUser')}
          </Text>
          <TouchableOpacity onPress={handleInviteUser} disabled={loading}>
            <Text style={[styles.sendButton, { color: colors.primary }]}>
              {loading ? t('sending') : t('send')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Selección de vehículo */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('vehicleToShare')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vehiculos.filter(v => v.isOwner).map((vehicle) => (
                <TouchableOpacity
                  key={vehicle._id}
                  style={[
                    styles.vehicleCard,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: selectedVehicle?._id === vehicle._id ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
                  <Text style={[styles.vehicleText, { color: colors.text }]}>
                    {vehicle.marca} {vehicle.modelo}
                  </Text>
                  <Text style={[styles.vehicleSubtext, { color: colors.textSecondary }]}>
                    {vehicle.ano} • {vehicle.patente}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Email del usuario */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('userEmail')}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder={t('emailPlaceholderExample')}
              placeholderTextColor={colors.textSecondary}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Rol */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('userRole')}
            </Text>
            {['viewer', 'editor', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleOption, { backgroundColor: colors.surface }]}
                onPress={() => setSelectedRole(role)}
              >
                <Ionicons 
                  name={selectedRole === role ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={colors.primary} 
                />
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleTitle, { color: colors.text }]}>
                    {role === 'viewer' && t('viewOnly')}
                    {role === 'editor' && t('editExpensesAndMaintenance')}
                    {role === 'admin' && t('totalControl')}
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                    {role === 'viewer' && t('canViewButNotEdit')}
                    {role === 'editor' && t('canAddAndEditExpensesMaintenance')}
                    {role === 'admin' && t('canEditAllVehicleInfo')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Permisos específicos */}
          {selectedRole !== 'viewer' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('specificPermissions')}
              </Text>
              
              {Object.entries({
                canEditExpenses: t('editExpenses'),
                canEditMaintenance: t('editMaintenance'),
                canUploadDocuments: t('uploadDocuments'),
                canEditVehicle: t('editVehicleInfo')
              }).map(([key, label]) => (
                <View key={key} style={[styles.permissionRow, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.permissionLabel, { color: colors.text }]}>
                    {label}
                  </Text>
                  <Switch
                    value={permissions[key]}
                    onValueChange={(value) => setPermissions(prev => ({ ...prev, [key]: value }))}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={permissions[key] ? colors.primary : colors.textSecondary}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Mensaje personalizado */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('messageOptional')}
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder={t('writeCustomMessageForInvitation')}
              placeholderTextColor={colors.textSecondary}
              value={inviteMessage}
              onChangeText={setInviteMessage}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderSharingContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Botón para invitar (solo Pro) */}
      {canInviteUsers && (
        <Animated.View entering={SlideInRight.duration(600).springify()}>
          <TouchableOpacity
            style={[styles.inviteButton, { backgroundColor: colors.primary }]}
            onPress={() => setInviteModalVisible(true)}
          >
            <Ionicons name="person-add" size={24} color="#ffffff" />
            <Text style={styles.inviteButtonText}>
              {t('inviteUser')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Vehículos compartidos conmigo */}
      {sharedVehicles.length > 0 && (
        <Animated.View entering={FadeInDown.duration(600).delay(100).springify()}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            {t('vehiclesSharedWithMe')}
          </Text>
          {sharedVehicles.map((vehicle, index) => (
            <View key={vehicle._id} style={[styles.sharedVehicleCard, { backgroundColor: colors.surface }]}>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleName, { color: colors.text }]}>
                  {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                </Text>
                <Text style={[styles.sharedBy, { color: colors.textSecondary }]}>
                  {t('sharedBy', { name: `${vehicle.sharedBy.nombre} ${vehicle.sharedBy.apellido}` })}
                </Text>
                <Text style={[styles.role, { color: colors.primary }]}>
                  {t('role', { role: vehicle.myRole })}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.viewButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle._id })}
              >
                <Ionicons name="eye" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Invitaciones recibidas */}
      {receivedInvitations.length > 0 && (
        <Animated.View entering={FadeInDown.duration(600).delay(200).springify()}>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            {t('invitationsReceived')}
          </Text>
          {receivedInvitations.map((invitation, index) => (
            <View key={invitation._id} style={[styles.invitationCard, { backgroundColor: colors.surface }]}>
              <View style={styles.invitationInfo}>
                <Text style={[styles.invitationTitle, { color: colors.text }]}>
                  {invitation.vehicleId.marca} {invitation.vehicleId.modelo}
                </Text>
                <Text style={[styles.invitationFrom, { color: colors.textSecondary }]}>
                  {t('from', { name: `${invitation.invitedBy.nombre} ${invitation.invitedBy.apellido}` })}
                </Text>
                {invitation.message && (
                  <Text style={[styles.invitationMessage, { color: colors.textSecondary }]}>
                    "{invitation.message}"
                  </Text>
                )}
              </View>
              <View style={styles.invitationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
                  onPress={() => handleRespondToInvitation(invitation._id, 'accept')}
                >
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
                  onPress={() => handleRespondToInvitation(invitation._id, 'decline')}
                >
                  <Ionicons name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );

  const handleRespondToInvitation = async (invitationId, action) => {
    // TODO: Implement invitation response
    console.log('Responding to invitation:', invitationId, action);
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
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg
    },
    upgradeCard: {
      alignItems: 'center',
      padding: spacing.xl,
      marginVertical: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      ...shadows.md
    },
    upgradeIcon: {
      marginBottom: spacing.md
    },
    upgradeTitle: {
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      marginBottom: spacing.sm,
      textAlign: 'center'
    },
    upgradeDescription: {
      fontSize: fontSize.base,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 24
    },
    upgradeButton: {
      width: '100%'
    },
    inviteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginVertical: spacing.lg
    },
    inviteButtonText: {
      color: '#ffffff',
      fontSize: fontSize.base,
      fontWeight: '600',
      marginLeft: spacing.sm
    },
    sectionHeader: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      marginVertical: spacing.md
    },
    modalContainer: {
      flex: 1
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1
    },
    modalTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600'
    },
    sendButton: {
      fontSize: fontSize.base,
      fontWeight: '600'
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: spacing.lg
    },
    section: {
      marginVertical: spacing.md
    },
    sectionTitle: {
      fontSize: fontSize.base,
      fontWeight: '600',
      marginBottom: spacing.sm
    },
    vehicleCard: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      marginRight: spacing.sm,
      minWidth: 150
    },
    vehicleText: {
      fontSize: fontSize.base,
      fontWeight: '600'
    },
    vehicleSubtext: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs
    },
    input: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      fontSize: fontSize.base
    },
    textArea: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      fontSize: fontSize.base,
      minHeight: 100,
      textAlignVertical: 'top'
    },
    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm
    },
    roleInfo: {
      marginLeft: spacing.md,
      flex: 1
    },
    roleTitle: {
      fontSize: fontSize.base,
      fontWeight: '600'
    },
    roleDescription: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs
    },
    permissionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm
    },
    permissionLabel: {
      fontSize: fontSize.base,
      flex: 1
    },
    sharedVehicleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      ...shadows.sm
    },
    vehicleInfo: {
      flex: 1
    },
    vehicleName: {
      fontSize: fontSize.base,
      fontWeight: '600'
    },
    sharedBy: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs
    },
    role: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
      fontWeight: '600'
    },
    viewButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm
    },
    invitationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      ...shadows.sm
    },
    invitationInfo: {
      flex: 1
    },
    invitationTitle: {
      fontSize: fontSize.base,
      fontWeight: '600'
    },
    invitationFrom: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs
    },
    invitationMessage: {
      fontSize: fontSize.sm,
      marginTop: spacing.xs,
      fontStyle: 'italic'
    },
    invitationActions: {
      flexDirection: 'row'
    },
    actionButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginLeft: spacing.xs
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('vehicleSharing')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {!canShareVehicles ? renderUpgradePrompt() : renderSharingContent()}
      {renderInviteModal()}
    </SafeAreaView>
  );
};

export default VehicleSharingScreen;