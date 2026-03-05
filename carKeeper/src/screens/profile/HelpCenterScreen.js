import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, SlideInRight } from "react-native-reanimated";
import { useTheme } from "../../hooks/useTheme";
import { t } from "../../utils/i18n";

const HelpCenterScreen = ({ navigation }) => {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      category: "🚗 Vehículos",
      questions: [
        {
          id: "v1",
          question: "¿Cómo agrego mi primer vehículo?",
          answer:
            'Ve a la pestaña "Vehículos" y toca el botón "+". Completa la información básica como marca, modelo, año y kilometraje. También puedes agregar una foto desde tu galería o cámara.',
        },
        {
          id: "v2",
          question: "¿Puedo tener múltiples vehículos?",
          answer:
            "Sí, puedes agregar múltiples vehículos dependiendo de tu plan de suscripción. El plan gratuito permite 1 vehículo, Premium permite hasta 5, y Pro permite vehículos ilimitados.",
        },
        {
          id: "v3",
          question: "¿Cómo edito la información de mi vehículo?",
          answer:
            'Toca tu vehículo en la lista, luego presiona "Editar Vehículo" o el ícono de lápiz en la parte superior derecha. Podrás modificar todos los datos y la imagen.',
        },
      ],
    },
    {
      id: 2,
      category: "💰 Gastos",
      questions: [
        {
          id: "g1",
          question: "¿Qué tipos de gastos puedo registrar?",
          answer:
            "Puedes registrar gastos de combustible, mantenimiento, seguro, estacionamiento, peajes y otros. Cada categoría tiene su ícono y color distintivo.",
        },
        {
          id: "g2",
          question: "¿Cómo registro el combustible cargado?",
          answer:
            "Al agregar un gasto de combustible, puedes incluir los litros cargados y el kilometraje actual. Esto te ayuda a calcular el consumo de tu vehículo.",
        },
        {
          id: "g3",
          question: "¿Puedo editar o eliminar gastos?",
          answer:
            "Sí, toca cualquier gasto en la lista para ver sus detalles. Desde ahí podrás editarlo o eliminarlo. Ten cuidado, ya que eliminar un gasto no se puede deshacer.",
        },
      ],
    },
    {
      id: 3,
      category: "🔧 Mantenimientos",
      questions: [
        {
          id: "m1",
          question: "¿Cómo programo mantenimientos futuros?",
          answer:
            'En la pestaña Mantenimientos, ve a "Programados" y toca el ícono de calendario. Puedes programar mantenimientos por fecha o kilometraje.',
        },
        {
          id: "m2",
          question: "¿Qué tipos de mantenimiento puedo registrar?",
          answer:
            "Cambio de aceite, filtros, frenos, neumáticos, alineación, batería, aire acondicionado, revisión general y otros. Cada tipo tiene intervalos predeterminados.",
        },
        {
          id: "m3",
          question: "¿Cómo marco un mantenimiento como completado?",
          answer:
            'Toca el mantenimiento programado y selecciona "Marcar como completado". Podrás agregar el costo, taller y notas adicionales.',
        },
      ],
    },
    {
      id: 4,
      category: "📊 Modo Oscuro y Configuración",
      questions: [
        {
          id: "c1",
          question: "¿Cómo activo el modo oscuro?",
          answer:
            'Ve a Perfil > toca el interruptor "Modo Oscuro". La app cambiará inmediatamente y recordará tu preferencia.',
        },
        {
          id: "c2",
          question: "¿Cómo exporto mis datos?",
          answer:
            "Ve a Perfil > Exportar Datos. Puedes exportar vehículos, gastos, mantenimientos en formato CSV o crear un respaldo completo en JSON.",
        },
        {
          id: "c3",
          question: "¿Cómo elimino mi cuenta?",
          answer:
            'Ve a Perfil, baja hasta "Zona de Peligro" y toca "Eliminar Cuenta". Se te pedirá confirmación doble ya que esta acción elimina todos tus datos permanentemente.',
        },
      ],
    },
    {
      id: 5,
      category: "💎 Suscripciones",
      questions: [
        {
          id: "s1",
          question: "¿Qué incluye cada plan?",
          answer:
            "Gratuito: 1 vehículo, funciones básicas.\nPremium: Hasta 5 vehículos, exportar datos, analíticas.\nPro: Vehículos ilimitados, todas las funciones, soporte prioritario.",
        },
        {
          id: "s2",
          question: "¿Cómo actualizo mi suscripción?",
          answer:
            "Ve a Perfil > Suscripción y selecciona el plan que deseas. Los pagos se procesan de forma segura a través de las tiendas de aplicaciones.",
        },
        {
          id: "s3",
          question: "¿Puedo cancelar mi suscripción?",
          answer:
            "Sí, puedes cancelar desde la configuración de tu cuenta en App Store o Google Play. Seguirás teniendo acceso hasta que termine el período pagado.",
        },
      ],
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: t("sendEmail"),
      subtitle: "info@deepyze.dev",
      icon: "mail",
      action: () => {
        Linking.openURL(
          "mailto:info@deepyze.dev?subject=Consulta CarKeeper App"
        );
      },
    },
    {
      id: 2,
      title: t("reportError"),
      subtitle: t("tellUsAboutProblem"),
      icon: "bug",
      action: () => {
        Alert.alert(
          t("reportError"),
          "Por favor envía un email a info@deepyze.dev describiendo el problema, incluyendo:\n\n• Qué estabas haciendo cuando ocurrió\n• Modelo de dispositivo\n• Versión de la app\n• Capturas de pantalla si es posible",
          [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("sendEmail"),
              onPress: () => {
                Linking.openURL(
                  "mailto:info@deepyze.dev?subject=Reporte de Error - CarKeeper&body=Describe el problema aquí...\n\nInformación del dispositivo:\n- Modelo: \n- Sistema operativo: \n- Versión de CarKeeper: 1.0.3"
                );
              },
            },
          ]
        );
      },
    },
    {
      id: 3,
      title: t("suggestImprovement"),
      subtitle: t("shareYourIdeas"),
      icon: "bulb",
      action: () => {
        Linking.openURL(
          "mailto:info@deepyze.dev?subject=Sugerencia de Mejora - CarKeeper&body=Mi sugerencia es..."
        );
      },
    },
    {
      id: 4,
      title: t("rateApp"),
      subtitle: t("helpWithReview"),
      icon: "star",
      action: () => {
        Alert.alert(t("rateCarKeeperTitle"), t("rateCarKeeperMessage"), [
          { text: t("notNow"), style: "cancel" },
          {
            text: t("rate"),
            onPress: () => {
              // En producción, aquí iría el link a la tienda correspondiente
              Alert.alert(t("thanks"), t("redirectToAppStore"));
            },
          },
        ]);
      },
    },
  ];

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: fontSize.xl,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing.md,
    },
    backButton: {
      padding: spacing.sm,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    welcomeCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginVertical: spacing.lg,
      ...shadows.sm,
    },
    welcomeTitle: {
      fontSize: fontSize.xl,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    welcomeText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: colors.text,
      marginBottom: spacing.md,
    },
    categoryCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      overflow: "hidden",
      ...shadows.sm,
    },
    categoryHeader: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryTitle: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: colors.text,
    },
    faqItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    faqItemLast: {
      borderBottomWidth: 0,
    },
    faqQuestion: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
    },
    faqQuestionText: {
      fontSize: fontSize.base,
      fontWeight: "500",
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    faqAnswer: {
      padding: spacing.md,
      paddingTop: 0,
      backgroundColor: colors.background,
    },
    faqAnswerText: {
      fontSize: fontSize.base,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    contactCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    contactIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    contactContent: {
      flex: 1,
    },
    contactTitle: {
      fontSize: fontSize.base,
      fontWeight: "600",
      color: colors.text,
      marginBottom: spacing.xs,
    },
    contactSubtitle: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    contactArrow: {
      padding: spacing.sm,
    },
    footer: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: spacing.lg,
    },
    footerText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    versionText: {
      fontSize: fontSize.xs,
      color: colors.textLight,
      textAlign: "center",
    },
  });

  const renderFAQCategory = (category, index) => (
    <Animated.View
      key={category.id}
      entering={FadeInDown.duration(600)
        .delay(index * 100)
        .springify()}
      style={styles.categoryCard}
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category.category}</Text>
      </View>

      {category.questions.map((faq, faqIndex) => (
        <View
          key={faq.id}
          style={[
            styles.faqItem,
            faqIndex === category.questions.length - 1 && styles.faqItemLast,
          ]}
        >
          <TouchableOpacity
            style={styles.faqQuestion}
            onPress={() => toggleFAQ(faq.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.faqQuestionText}>{faq.question}</Text>
            <Ionicons
              name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {expandedFAQ === faq.id && (
            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.faqAnswer}
            >
              <Text style={styles.faqAnswerText}>{faq.answer}</Text>
            </Animated.View>
          )}
        </View>
      ))}
    </Animated.View>
  );

  const renderContactOption = (option, index) => (
    <Animated.View
      key={option.id}
      entering={SlideInRight.duration(600)
        .delay(index * 100)
        .springify()}
    >
      <TouchableOpacity
        style={styles.contactCard}
        onPress={option.action}
        activeOpacity={0.7}
      >
        <View style={styles.contactItem}>
          <View style={styles.contactIcon}>
            <Ionicons name={option.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>{option.title}</Text>
            <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
          </View>
          <View style={styles.contactArrow}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t("helpCenter")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <Animated.View
          entering={FadeInDown.duration(800).springify()}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>{t("helloWave")}</Text>
          <Text style={styles.welcomeText}>{t("helpCenterWelcomeText")}</Text>
        </Animated.View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("frequentlyAskedQuestions")}
          </Text>
          {faqData.map((category, index) => renderFAQCategory(category, index))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("needMoreHelp")}</Text>
          {contactOptions.map((option, index) =>
            renderContactOption(option, index)
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("carKeeperTrustedCompanion")}
          </Text>
          <Text style={styles.versionText}>{t("version100")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenterScreen;
