import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { t } from '../../utils/i18n';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const privacyData = [
    {
      id: 1,
      title: '📋 Información que Recopilamos',
      content: `**Información Personal:**
• Dirección de email (para autenticación)
• Nombre y apellido (opcional)
• Información del perfil

**Información de Vehículos:**
• Marca, modelo, año y especificaciones
• Fotografías de vehículos (almacenadas localmente)
• Datos de kilometraje y mantenimiento

**Información de Uso:**
• Gastos y categorías de gastos
• Historial de mantenimientos
• Configuraciones de la aplicación

**Información Técnica:**
• Tipo de dispositivo y sistema operativo
• Identificadores únicos del dispositivo
• Logs de errores para mejora de la aplicación`
    },
    {
      id: 2,
      title: '🔒 Cómo Protegemos tu Información',
      content: `**Cifrado y Seguridad:**
• Todas las transmisiones de datos están cifradas con SSL/TLS
• Las contraseñas se almacenan usando hash seguro
• Acceso restringido a servidores y bases de datos

**Almacenamiento Seguro:**
• Datos almacenados en servidores seguros con certificación
• Respaldos automáticos cifrados
• Monitoreo continuo de seguridad

**Acceso Limitado:**
• Solo personal autorizado puede acceder a los datos
• Auditorías regulares de acceso
• Políticas estrictas de confidencialidad para empleados`
    },
    {
      id: 3,
      title: '📊 Cómo Usamos tu Información',
      content: `**Funcionalidad de la App:**
• Proporcionar servicios de seguimiento vehicular
• Generar reportes y análisis personalizados
• Sincronizar datos entre dispositivos

**Mejora del Servicio:**
• Analizar patrones de uso para mejorar funciones
• Identificar y corregir errores técnicos
• Desarrollar nuevas características

**Comunicación:**
• Notificaciones importantes sobre tu cuenta
• Actualizaciones de la aplicación
• Soporte técnico cuando lo solicites

**Nunca usamos tu información para:**
• Vender a terceros
• Publicidad no solicitada
• Perfilado comercial sin consentimiento`
    },
    {
      id: 4,
      title: '🤝 Compartir Información con Terceros',
      content: `**Proveedores de Servicios:**
• Servicios de autenticación (Firebase/Auth0)
• Almacenamiento en la nube (AWS/Google Cloud)
• Servicios de analíticas (solo datos agregados y anónimos)

**Cumplimiento Legal:**
• Solo cuando sea requerido por ley
• Para proteger nuestros derechos legales
• Para prevenir fraude o actividades ilegales

**Fusiones o Adquisiciones:**
• En caso de venta de la empresa
• Los usuarios serán notificados con anticipación
• Se mantendrán los mismos estándares de privacidad

**Nunca compartimos:**
• Información personal identificable para marketing
• Datos específicos de vehículos con aseguradoras
• Información de gastos con instituciones financieras`
    },
    {
      id: 5,
      title: '👤 Tus Derechos y Control',
      content: `**Acceso a tu Información:**
• Ver todos los datos que tenemos sobre ti
• Exportar tu información en formato legible
• Solicitar reportes de actividad de tu cuenta

**Modificación de Datos:**
• Editar tu información personal en cualquier momento
• Actualizar configuraciones de privacidad
• Corregir información incorrecta

**Eliminación de Datos:**
• Eliminar tu cuenta permanentemente
• Borrar datos específicos bajo solicitud
• Derecho al olvido según regulaciones locales

**Control de Comunicaciones:**
• Optar por no recibir emails promocionales
• Configurar tipos de notificaciones
• Pausar temporalmente comunicaciones`
    },
    {
      id: 6,
      title: '🍪 Cookies y Tecnologías de Seguimiento',
      content: `**Cookies Esenciales:**
• Necesarias para el funcionamiento básico
• Autenticación y seguridad de sesión
• No se pueden desactivar

**Cookies de Rendimiento:**
• Medir el rendimiento de la aplicación
• Identificar errores y problemas técnicos
• Mejorar la experiencia del usuario

**Cookies de Personalización:**
• Recordar tus preferencias
• Configuraciones de tema y idioma
• Ajustes personalizados de la interfaz

**Control de Cookies:**
• Puedes configurar cookies desde tu navegador
• Algunas funciones pueden no estar disponibles sin cookies
• Información detallada en configuraciones del dispositivo`
    },
    {
      id: 7,
      title: '🔄 Retención de Datos',
      content: `**Datos de Cuenta Activa:**
• Mantenemos tus datos mientras tu cuenta esté activa
• Los datos se respaldan de forma segura
• Acceso continuo a todo tu historial

**Cuenta Inactiva:**
• Después de 2 años de inactividad se notifica por email
• Opción de reactivar cuenta antes de eliminación
• Eliminación automática después de 3 años sin uso

**Datos de Soporte:**
• Logs de soporte se mantienen por 1 año
• Información de errores por 6 meses
• Comunicaciones de soporte por 2 años

**Eliminación Definitiva:**
• Al eliminar cuenta, datos se borran en 30 días
• Algunos datos pueden mantenerse por obligaciones legales
• Confirmación de eliminación por email`
    },
    {
      id: 8,
      title: '🌍 Transferencias Internacionales',
      content: `**Ubicación de Servidores:**
• Servidores principales en Estados Unidos y Europa
• Cumplimiento con GDPR y otras regulaciones
• Protecciones adecuadas para transferencias internacionales

**Protecciones de Transferencia:**
• Acuerdos de transferencia estándar
• Certificaciones de privacidad aplicables
• Medidas técnicas y organizacionales apropiadas

**Tus Derechos Según Ubicación:**
• GDPR para residentes de la UE
• CCPA para residentes de California
• Leyes locales de protección de datos aplicables`
    },
    {
      id: 9,
      title: '👶 Privacidad de Menores',
      content: `**Restricciones de Edad:**
• CarKeeper está diseñado para usuarios mayores de 16 años
• No recopilamos intencionalmente datos de menores
• Los padres pueden solicitar eliminación de datos de menores

**Verificación de Edad:**
• Solicitamos confirmación de edad al registrarse
• Medidas técnicas para prevenir registros de menores
• Revisión manual cuando se detectan posibles menores

**Si Eres Padre/Tutor:**
• Puedes solicitar información sobre datos de tu hijo
• Derecho a solicitar eliminación de datos
• Contacta directamente a nuestro equipo de soporte`
    },
    {
      id: 10,
      title: '📞 Contacto y Preguntas',
      content: `**Equipo de Privacidad:**
• Email: info@deepyze.dev
• Respuesta dentro de 48 horas hábiles
• Soporte en español e inglés

**Preguntas Frecuentes:**
• ¿Cómo elimino mi cuenta? - Ve a Perfil > Configuración
• ¿Puedo exportar mis datos? - Ve a Perfil > Exportar Datos
• ¿Cómo cambio mi email? - Ve a Perfil > Editar Perfil

**Reportar Problemas de Privacidad:**
• Contacta inmediatamente si sospechas un problema
• Investigaremos y responderemos rápidamente
• Medidas correctivas implementadas de inmediato`
    }
  ];

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
    scrollView: {
      flex: 1
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    introCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginVertical: spacing.lg,
      ...shadows.sm
    },
    introTitle: {
      fontSize: fontSize.xl,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center'
    },
    introText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.md
    },
    lastUpdated: {
      fontSize: fontSize.sm,
      color: colors.textLight,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: 'hidden',
      ...shadows.sm
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
    },
    sectionTitle: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm
    },
    sectionContent: {
      padding: spacing.md,
      backgroundColor: colors.background
    },
    sectionText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      lineHeight: 24
    },
    contactCard: {
      backgroundColor: colors.primary + '10',
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary + '30'
    },
    contactTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: spacing.sm,
      textAlign: 'center'
    },
    contactText: {
      fontSize: fontSize.base,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.md
    },
    contactButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignSelf: 'center'
    },
    contactButtonText: {
      fontSize: fontSize.base,
      fontWeight: '600',
      color: '#ffffff'
    },
    footer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.lg
    },
    footerText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xs
    },
    companyText: {
      fontSize: fontSize.xs,
      color: colors.textLight,
      textAlign: 'center'
    }
  });

  const renderSection = (section, index) => (
    <Animated.View
      key={section.id}
      entering={FadeInDown.duration(600).delay(index * 100).springify()}
      style={styles.sectionCard}
    >
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Ionicons
          name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>
      
      {expandedSection === section.id && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.sectionContent}
        >
          <Text style={styles.sectionText}>{section.content}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacyPolicy')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
          style={styles.introCard}
        >
          <Text style={styles.introTitle}>🔒 {t('yourPrivacyIsImportant')}</Text>
          <Text style={styles.introText}>
            {t('privacyIntroText')}
          </Text>
          <Text style={styles.lastUpdated}>
            {t('lastUpdated')}: {t('august1st2025')}
          </Text>
        </Animated.View>

        {/* Privacy Sections */}
        {privacyData.map((section, index) => renderSection(section, index))}

        {/* Contact Card */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(1000).springify()}
          style={styles.contactCard}
        >
          <Text style={styles.contactTitle}>{t('haveQuestions')}</Text>
          <Text style={styles.contactText}>
            {t('privacyContactText')}
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              Linking.openURL('mailto:info@deepyze.dev?subject=Consulta sobre Política de Privacidad&body=Hola,%0D%0A%0D%0AMi consulta sobre la política de privacidad es:%0D%0A%0D%0A');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>{t('contactPrivacyTeam')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('carKeeperPrivacyRespect')}
          </Text>
          <Text style={styles.companyText}>
            {t('copyright2025Deepyze')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;