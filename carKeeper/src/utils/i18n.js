import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Obtener el idioma del dispositivo
const deviceLanguage = getLocales()[0]?.languageCode || "en";

// Variable para almacenar el idioma actual
let currentLanguage = deviceLanguage === "es" ? "es" : "en";

// Cargar idioma guardado al inicializar
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem("app_language");
    if (savedLanguage && ["es", "en"].includes(savedLanguage)) {
      currentLanguage = savedLanguage;
    }
  } catch (error) {
    console.log("Error loading saved language:", error);
  }
};

// Cargar idioma guardado
loadSavedLanguage();

// Determinar idioma: solo español e inglés, por defecto inglés
export const getCurrentLanguage = () => {
  return currentLanguage;
};

// Cambiar idioma y guardarlo
export const setLanguage = async (newLanguage) => {
  if (["es", "en"].includes(newLanguage)) {
    currentLanguage = newLanguage;
    try {
      await AsyncStorage.setItem("app_language", newLanguage);
      return true;
    } catch (error) {
      console.log("Error saving language:", error);
      return false;
    }
  }
  return false;
};

const translations = {
  es: {
    // General
    loading: "Cargando...",
    loadingPlans: "Cargando planes...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    add: "Agregar",
    ok: "OK",
    yes: "Sí",
    no: "No",
    back: "Volver",
    next: "Siguiente",
    done: "Listo",
    optional: "Opcional",
    required: "Requerido",
    user: "Usuario",
    hello: "Hola",

    // Common words
    vehicle: "vehículo",
    thisMonth: "Este mes",
    spent: "Gastado",
    service: "Servicio",
    documents: "Documentos",
    expensesThisMonth: "Gastos este mes",
    continueWithoutSubscription: "Continuar sin suscripción",
    confirmExit: "¿Salir?",
    exitPaywallMessage:
      "Si continúas sin suscripción, volverás a la pantalla de inicio de sesión. ¿Estás seguro?",
    exit: "Salir",
    subscriptionActivated:
      "¡Suscripción activada! Ahora tienes acceso completo a la app.",
    checkingSubscription: "Verificando suscripción...",

    // Subscription screen / Paywall
    alreadyPro: "¡Ya tienes Pro!",
    enjoyPremiumFeatures: "Disfruta todas las funciones premium",
    continueButton: "Continuar",
    restore: "Restaurar",
    unlockCarKeeperPro: "Desbloquea CarKeeper Pro",
    manageAllVehicles: "Gestiona todos tus vehículos sin límites",
    unlimitedVehicles: "Vehículos ilimitados",
    automaticBackups: "Respaldos automáticos",
    advancedReports: "Reportes avanzados",
    noAds: "Sin anuncios",
    startNow: "Empezar ahora",
    cancelAnytime: "Cancela cuando quieras",
    freeTrial: "{days} días gratis",
    thenPrice: "luego {price}",
    freeTrialThenPrice: "{days} días gratis, luego {price}",
    exitWithoutSubscription: "Salir sin suscripción",
    exitWithoutSubscriptionMessage:
      "Para usar CarKeeper necesitas una suscripción activa. ¿Deseas cerrar sesión?",
    exit: "Salir",

    // Vehicle empty state
    startYourJourney: "¡Comienza tu viaje!",
    addFirstVehicleDescription:
      "Agrega tu primer vehículo y mantén control total sobre gastos, mantenimiento y documentos",
    automaticReminders: "Recordatorios automáticos",
    financialControl: "Control financiero",
    allOrganized: "Todo organizado",
    detailedAnalysis: "Análisis detallado",

    // Alerts and messages
    limitReached: "Límite alcanzado",
    planLimitMessage:
      "Tu plan actual permite hasta {limit} vehículo(s). ¿Deseas actualizar tu suscripción?",
    viewPlans: "Ver planes",
    deleteVehicleConfirm:
      "¿Estás seguro de eliminar {name}? Esta acción no se puede deshacer.",
    upgradeToPremium: "Actualiza a Premium",
    upgradeToPro: "Actualiza a Pro",
    unlimitedVehiclesAndFeatures: "Vehículos ilimitados y funciones avanzadas",
    unlockAllFeatures: "Desbloquea todas las funciones",
    startingCarKeeper: "Iniciando CarKeeper...",

    // Navigation
    vehicles: "Vehículos",
    maintenance: "Mantenimiento",
    expenses: "Gastos",
    profile: "Perfil",

    // Vehicles
    vehiclesList: "Mis Vehículos",
    addVehicle: "Agregar Vehículo",
    editVehicle: "Editar Vehículo",
    vehicleDetail: "Detalle del Vehículo",
    deleteVehicle: "Eliminar Vehículo",
    noVehicles: "Sin vehículos",
    addFirstVehicle: "¡Agrega tu primer vehículo!",
    vehicleNotFound: "Vehículo no encontrado",
    brand: "Marca",
    model: "Modelo",
    year: "Año",
    color: "Color",
    mileage: "Kilometraje",
    licensePlate: "Patente",
    vin: "VIN",
    engine: "Motor",

    // Maintenance
    maintenanceList: "Mantenimientos",
    addMaintenance: "Registrar Mantenimiento",
    editMaintenance: "Editar Mantenimiento",
    scheduleMaintenance: "Programar Mantenimiento",
    maintenanceDetail: "Detalle del Mantenimiento",
    deleteMaintenance: "Eliminar Mantenimiento",
    noMaintenance: "Sin mantenimientos",
    addFirstMaintenance: "¡Registra tu primer mantenimiento!",
    maintenanceNotFound: "Mantenimiento no encontrado",
    upcoming: "Próximos",
    history: "Historial",
    completed: "Completados",
    pending: "Pendientes",
    scheduled: "Programados",

    // Maintenance status and types
    inProgress: "En Progreso",
    cancelled: "Cancelado",
    noHistory: "Sin historial",
    noScheduledMaintenances: "Sin mantenimientos programados",
    noHistoryMessage: "Aún no has registrado ningún mantenimiento",
    noScheduledMaintenancesMessage: "No tienes mantenimientos programados",

    // Maintenance types
    oilChange: "Cambio de aceite",
    filterChange: "Cambio de filtros",
    brakeService: "Servicio de frenos",
    tires: "Neumáticos",
    alignment: "Alineación",
    balancing: "Balanceado",
    battery: "Batería",
    airConditioning: "Aire acondicionado",
    generalInspection: "Revisión general",
    other: "Otro",

    // Time references
    today: "Hoy",
    tomorrow: "Mañana",
    yesterday: "Ayer",
    daysAgo: "Hace {days} días",
    inDays: "En {days} días",

    // Maintenance form
    selectVehicle: "Seleccionar Vehículo",
    vehicleRequired: "Selecciona un vehículo",
    vehicleNotExists: "El vehículo seleccionado no existe",
    selectMaintenanceType: "Selecciona un tipo de mantenimiento",
    titleRequired: "El título es requerido",
    invalidCost: "Costo inválido",
    invalidMileage: "Kilometraje inválido",
    maintenanceType: "Tipo de Mantenimiento",
    basicInformation: "Información Básica",
    title: "Título",
    titlePlaceholder: "Ej: Cambio de aceite y filtro",
    descriptionOptional: "Descripción (Opcional)",
    descriptionPlaceholder: "Describe los trabajos realizados",
    scheduledDate: "Fecha Programada",
    maintenanceDate: "Fecha del Mantenimiento",
    mileage: "Kilometraje",
    cost: "Costo ($)",
    provider: "Proveedor",
    status: "Estado",
    costPlaceholder: "0.00",
    serviceInformation: "Información del Servicio",
    providerOptional: "Taller/Proveedor (Opcional)",
    providerPlaceholder: "Nombre del taller o mecánico",
    locationOptional: "Ubicación (Opcional)",
    locationPlaceholder: "Dirección del taller",
    additionalNotesOptional: "Notas Adicionales (Opcional)",
    additionalNotesPlaceholder: "Observaciones, repuestos utilizados, etc.",
    automaticExpense: "Gasto automático",
    automaticExpenseMessage:
      "Se creará automáticamente un gasto por este mantenimiento",
    scheduleNextMaintenance: "Programar próximo mantenimiento",
    scheduleNextMaintenanceDescription:
      "Configurar recordatorio para el siguiente mantenimiento",
    nextInKm: "Próximo en (km)",
    nextInKmPlaceholder: "60000",
    orInMonths: "O en (meses)",
    orInMonthsPlaceholder: "6",
    nextMaintenance: "Próximo mantenimiento: {date}",
    updateMaintenance: "Actualizar Mantenimiento",
    registerMaintenance: "Registrar Mantenimiento",
    needsVehicleForMaintenance:
      "Necesitas agregar un vehículo antes de registrar mantenimientos",
    change: "Cambiar",

    // Maintenance detail
    detail: "Detalle",
    loading: "Cargando...",
    basicInfo: "Información Básica",
    nextMaintenanceInfo: "Próximo Mantenimiento",
    markAsCompleted: "Marcar como Completado",
    markAsCompletedConfirm:
      "¿Deseas marcar este mantenimiento como completado?",
    complete: "Completar",
    markAsCompletedSuccess: "Mantenimiento marcado como completado",
    deleteMaintenanceConfirm:
      "¿Estás seguro de que deseas eliminar este mantenimiento? Esta acción no se puede deshacer.",
    contactProvider: "Contactar Proveedor",
    callProvider: "¿Deseas llamar a {provider}?",
    call: "Llamar",
    callFunctionality: "Funcionalidad de llamada pendiente de implementar",
    shareMaintenanceTitle: "Detalle de Mantenimiento",

    // Success messages
    maintenanceRegisteredAndScheduled:
      "Mantenimiento registrado correctamente y próximo mantenimiento programado",
    maintenanceRegistered:
      "El mantenimiento se registró correctamente, pero hubo un error al programar el próximo: {error}",
    maintenanceScheduledSuccess: "Mantenimiento programado correctamente",

    // Vehicle actions
    goToVehicles: "Agregar Vehículo",
    addVehicleFirst:
      "Agrega un vehículo para comenzar a gestionar mantenimientos",

    // Additional maintenance messages
    next: "Próximo",
    previous: "anterior",
    maintenanceScheduledBasedOn: "Mantenimiento programado basado en el",
    automaticallyScheduledMaintenance:
      "Mantenimiento programado automáticamente",

    // Expenses
    expensesList: "Mis Gastos",
    addExpense: "Nuevo Gasto",
    editExpense: "Editar Gasto",
    expenseDetail: "Detalle del Gasto",
    deleteExpense: "Eliminar Gasto",
    noExpenses: "Sin gastos",
    addFirstExpense: "¡Registra tu primer gasto!",
    expenseNotFound: "Gasto no encontrado",
    amount: "Monto",
    category: "Categoría",
    description: "Descripción",
    date: "Fecha",
    location: "Ubicación",
    notes: "Notas",

    // Categories
    fuel: "Combustible",
    maintenance: "Mantenimiento",
    insurance: "Seguro",
    parking: "Estacionamiento",
    tolls: "Peajes",
    other: "Otros",
    allCategories: "Todas",

    // Expense Screen specific
    hello: "Hola! 👋",
    yourExpenses: "Tus Gastos",
    categories: "Categorías",
    week: "Semana",
    recentExpenses: "Últimos Gastos",
    records: "{count} registros",
    noExpensesYet: "¡Aún no tienes gastos!",
    noExpensesInCategory: "Sin gastos en {category}",
    startTrackingExpenses:
      "Comienza a registrar tus gastos para llevar un mejor control de tu dinero",
    addFirstExpense: "Agregar Primer Gasto",
    addFirstVehicleToStartExpenses: "¡Agrega tu primer vehículo!",
    needVehicleForExpenses:
      "Para comenzar a registrar gastos, primero necesitas agregar un vehículo",
    addVehicle: "Agregar Vehículo",
    cleanDuplicates: "🗑️ Limpiar Duplicados",
    cleanDuplicatesConfirm:
      "¿Quieres eliminar gastos duplicados? Esta acción no se puede deshacer.",
    clean: "Limpiar",
    ready: "✅ ¡Listo!",
    duplicatesCleanError: "❌ Error",
    duplicatesCleanErrorMsg: "Ocurrió un error al limpiar duplicados",

    // Add/Edit Expense Screen
    newExpense: "Nuevo Gasto",
    editExpense: "Editar Gasto",
    vehicle: "vehículo",
    vehicleSelection: "Vehículo",
    categorySelection: "Categoría",
    details: "Detalles",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Ej: Carga de combustible, Service completo",
    amountLabel: "Monto ($)",
    amountPlaceholder: "0.00",
    litersOptional: "Litros (Opcional)",
    litersPlaceholder: "50.5",
    mileageOptional: "Kilometraje (Opcional)",
    mileagePlaceholder: "15000",
    locationOptional: "Lugar (Opcional)",
    locationPlaceholder: "Estación de servicio, taller, etc.",
    additionalNotesOptional: "Notas adicionales (Opcional)",
    additionalNotesPlaceholder: "Información adicional sobre el gasto",
    updateExpense: "Actualizar Gasto",
    saveExpense: "Guardar Gasto",
    selectVehicleError: "Selecciona un vehículo",
    selectCategoryError: "Selecciona una categoría",
    descriptionRequired: "La descripción es requerida",
    amountRequired: "El monto es requerido",
    invalidAmount: "Monto inválido",
    invalidLiters: "Litros inválidos",
    invalidMileage: "Kilometraje inválido",

    // Expense Detail Screen
    expenseDetail: "Detalle del Gasto",
    expenseNotFound: "Gasto no encontrado",
    expenseNotFoundDesc: "El gasto que buscas no existe o ha sido eliminado",
    expenseInformation: "Información del Gasto",
    liters: "Litros",
    actions: "Acciones",
    editExpenseAction: "Editar Gasto",
    deleteExpenseAction: "Eliminar Gasto",
    deleteExpenseConfirm: "Eliminar gasto",
    deleteExpenseConfirmMsg:
      "¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.",
    couldNotDeleteExpense: "No se pudo eliminar el gasto",

    // Profile
    editProfile: "Editar Perfil",
    settings: "Configuración",
    subscription: "Suscripción",
    helpCenter: "Centro de Ayuda",
    privacyPolicy: "Política de Privacidad",
    contactSupport: "Contactar Soporte",
    exportData: "Exportar Datos",
    analytics: "Analíticas",
    darkMode: "Modo Oscuro",
    notifications: "Notificaciones",
    deleteAccount: "Eliminar Cuenta",
    logout: "Cerrar Sesión",

    // Profile specific
    logoutConfirm: "¿Estás seguro de que quieres cerrar sesión?",
    deleteAccountTitle: "⚠️ Eliminar cuenta",
    deleteAccountWarning:
      "Esta acción eliminará permanentemente:\n\n• Tu cuenta de usuario\n• Todos tus vehículos\n• Todos los gastos registrados\n• Todos los mantenimientos\n• Todos los documentos\n• Todas las configuraciones\n\nEsta acción NO se puede deshacer.",
    understandDeleteAccount: "Entiendo, eliminar cuenta",
    finalConfirmation: "🚨 Confirmación final",
    finalConfirmationMessage:
      "¿Estás completamente seguro? Esta acción es irreversible y perderás todos tus datos.",
    yesDeleteEverything: "Sí, eliminar todo",
    accountDeleted: "Cuenta eliminada",
    accountDeletedMessage:
      "Tu cuenta y todos los datos han sido eliminados exitosamente.",
    couldNotDeleteAccount: "No se pudo eliminar la cuenta",
    notificationsEnabled: "Notificaciones habilitadas correctamente",
    notificationsDisabled: "Notificaciones deshabilitadas",
    allNotificationsCancelled:
      "Se han cancelado todas las notificaciones programadas",
    pro: "PRO",
    premium: "PREMIUM",
    free: "GRATIS",
    fullAccessToAllFeatures: "Acceso completo a todas las funciones",
    basicPlanWithLimitedFeatures: "Plan básico con funciones limitadas",
    updatePersonalInfo: "Actualiza tu información personal",
    scheduledNotifications: "{count} notificaciones programadas",
    darkModeEnabled: "Tema oscuro activado",
    lightModeEnabled: "Tema claro activado",
    exportOrBackupInfo: "Exportar o respaldar tu información",
    viewDetailedStats: "Ver estadísticas detalladas",
    faqAndGuides: "Preguntas frecuentes y guías",
    getTechnicalHelp: "Obtener ayuda técnica",
    viewTermsAndConditions: "Ver términos y condiciones",
    aboutCarKeeper: "Acerca de CarKeeper",
    version100: "Versión 1.0.3",
    carKeeperVersion: "CarKeeper v1.0.3",
    developedWithLove: "Desarrollado con ❤️ por Deepyze",
    permanentlyDeleteAllData: "Eliminar permanentemente todos los datos",
    accountAndSubscription: "Cuenta y suscripción",
    support: "Soporte",
    dangerZone: "Zona de peligro",
    madeWithLove: "Hecho con ❤️ por Deepyze",

    // Privacy Policy
    yourPrivacyIsImportant: "Tu Privacidad es Importante",
    privacyIntroText:
      "En CarKeeper, nos comprometemos a proteger tu información personal y ser transparentes sobre cómo recopilamos, usamos y protegemos tus datos.",
    lastUpdated: "Última actualización",
    august1st2025: "1 de Agosto de 2025",
    haveQuestions: "¿Tienes Preguntas?",
    privacyContactText:
      "Si tienes dudas sobre esta política de privacidad o cómo manejamos tus datos, no dudes en contactarnos.",
    contactPrivacyTeam: "Contactar Equipo de Privacidad",
    carKeeperPrivacyRespect:
      "CarKeeper - Desarrollado con respeto por tu privacidad",
    copyright2025Deepyze: "© 2025 Deepyze. Todos los derechos reservados.",

    // Language settings
    language: "Idioma",
    changeLanguage: "Cambiar idioma",
    selectLanguage: "Seleccionar idioma",
    languageChanged: "Idioma cambiado exitosamente",
    spanish: "Español",
    english: "Inglés",
    currentLanguage: "Idioma actual",
    couldNotChangeLanguage: "No se pudo cambiar el idioma",

    // Auth
    login: "Iniciar Sesión",
    register: "Registrarse",
    welcomeBack: "¡Bienvenido de vuelta!",
    createAccount: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    email: "Email",
    password: "Contraseña",
    name: "Nombre",
    lastName: "Apellido",

    // Messages
    vehicleAdded: "Vehículo agregado correctamente",
    vehicleUpdated: "Vehículo actualizado correctamente",
    vehicleDeleted: "Vehículo eliminado correctamente",
    maintenanceAdded: "Mantenimiento registrado correctamente",
    maintenanceUpdated: "Mantenimiento actualizado correctamente",
    maintenanceDeleted: "Mantenimiento eliminado correctamente",
    expenseAdded: "Gasto registrado correctamente",
    expenseUpdated: "Gasto actualizado correctamente",
    expenseDeleted: "Gasto eliminado correctamente",

    // Validations
    fieldRequired: "Este campo es requerido",
    invalidEmail: "Email inválido",
    invalidYear: "Año inválido",
    invalidNumber: "Número inválido",
    invalidAmount: "Monto inválido",

    // Common actions
    addPhoto: "Agregar foto",
    takePhoto: "Cámara",
    selectFromGallery: "Galería",

    // Time
    today: "Hoy",
    yesterday: "Ayer",
    week: "Semana",
    month: "Mes",
    year: "Año",

    // Units
    km: "km",
    liters: "L",
    currency: "$",

    // Additional vehicle screen translations
    permissions: "Permisos",
    needGalleryPermissions: "Necesitamos permisos para acceder a tu galería",
    needCameraPermissions: "Necesitamos permisos para acceder a tu cámara",
    selectImageSource: "Selecciona de dónde quieres obtener la imagen",
    brandRequired: "La marca es requerida",
    modelRequired: "El modelo es requerido",
    yearRequired: "El año es requerido",
    mileageRequired: "El kilometraje es requerido",
    mustBeNumber: "Debe ser un número",
    brandPlaceholder: "Toyota, Ford, etc.",
    modelPlaceholder: "Corolla, Focus, etc.",
    yearPlaceholder: "2024",
    colorPlaceholder: "Blanco, Negro, etc.",
    currentMileage: "Kilometraje actual",
    mileagePlaceholder: "50000",
    additionalInformation: "Información adicional",
    vinOptional: "VIN (Opcional)",
    vinPlaceholder: "Número de identificación del vehículo",
    licensePlateOptional: "Patente (Opcional)",
    licensePlatePlaceholder: "ABC123",
    updateVehicle: "Actualizar Vehículo",
    saveVehicle: "Guardar Vehículo",
    vehicleInformation: "Información del Vehículo",
    chassisNumber: "Número de Chasis",
    recentMaintenance: "Mantenimientos Recientes",
    seeAll: "Ver todos",
    noMaintenanceRecords: "Sin mantenimientos registrados",
    recentExpenses: "Gastos Recientes",
    noExpenseRecords: "Sin gastos registrados",
    deleteVehicleDetailConfirm:
      "¿Estás seguro de eliminar {brand} {model}? Esta acción eliminará también todos los mantenimientos, gastos y documentos asociados.",

    // NEW TRANSLATIONS FROM INTERNATIONALIZATION
    // Auth screens
    smartVehicleManagement: "Gestiona tus vehículos de forma inteligente",
    emailPlaceholder: "tu@email.com",
    passwordPlaceholder: "******",
    forgotPassword: "¿Olvidaste tu contraseña?",
    orContinueWith: "O continúa con",
    continueWithApple: "Continuar con Apple",
    noAccount: "¿No tienes cuenta?",
    register: "Regístrate",
    welcome: "¡Bienvenido!",
    accountCreatedWithGoogle:
      "Tu cuenta ha sido creada exitosamente con Google",
    welcomeBack: "¡Bienvenido de nuevo!",
    loginSubtitle: "Ingresa tus credenciales para continuar",
    loggedInSuccessfully: "Has iniciado sesión exitosamente",
    googleLoginError: "No se pudo iniciar sesión con Google",
    unexpectedError: "Ocurrió un error inesperado",
    createAccount: "Crear Cuenta",
    registerSubtitle: "Completa los campos para crear tu cuenta",
    joinCarKeeperAndStart:
      "Únete a CarKeeper y comienza a gestionar tus vehículos",
    fullNamePlaceholder: "Juan Pérez",
    passwordPlaceholderRegister: "Mínimo 6 caracteres",
    confirmPasswordLabel: "Confirmar contraseña",
    repeatPasswordPlaceholder: "Repite tu contraseña",
    byRegistering: "Al registrarte, aceptas nuestros",
    termsOfService: "Términos de Servicio",
    and: "y",
    privacyPolicy: "Política de Privacidad",
    orRegisterWith: "O regístrate con",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    passwordMinLength: "La contraseña debe tener al menos 6 caracteres",
    confirmPassword: "Confirma tu contraseña",
    passwordsDontMatch: "Las contraseñas no coinciden",
    accountCreated: "¡Cuenta creada!",
    alreadyHadAccount: "Ya tenías una cuenta, has iniciado sesión",
    googleRegisterError: "No se pudo registrar con Google",
    accountCreatedWithApple: "Tu cuenta ha sido creada exitosamente con Apple",
    appleRegisterError: "No se pudo registrar con Apple",
    fullName: "Nombre completo",
    fullNameExample: "Ej: Juan Pérez",
    nameWillAppearOnProfile: "Este nombre aparecerá en tu perfil",
    phoneOptional: "Teléfono (opcional)",
    phoneExample: "Ej: +54 11 1234-5678",
    forEmergencyContact: "Para contactarte en caso de emergencia",
    locationOptional: "Ubicación (opcional)",
    locationExample: "Ej: Buenos Aires, Argentina",
    helpsNearbyServices: "Ayuda a encontrar servicios cercanos",
    aboutYouOptional: "Sobre ti (opcional)",
    tellUsAboutYou: "Cuéntanos algo sobre ti...",
    briefPersonalDescription: "Una breve descripción personal",
    emailNotEditable: "Email (no editable)",
    notAvailable: "No disponible",
    changeEmailContactSupport: "Para cambiar tu email, contacta a soporte",
    contactSupport: "Contactar soporte",
    comingSoonAvailable: "Próximamente disponible",
    yourAccount: "Tu cuenta 📊",
    recently: "Recientemente",
    memberSince: "Miembro desde",
    vehicles: "Vehículos",
    expensesRecorded: "Gastos registrados",
    maintenance: "Mantenimientos",
    saving: "Guardando...",
    saveChanges: "Guardar cambios",
    invalidPhoneFormat: "Formato de teléfono inválido",
    perfect: "¡Perfecto! 🎉",
    profileUpdatedSuccessfully: "Tu perfil ha sido actualizado correctamente",
    couldNotUpdateProfile: "No se pudo actualizar el perfil",
    changePhotoFeatureSoon:
      "La función de cambiar foto estará disponible pronto",

    // Settings screen
    nameCannotBeEmpty: "El nombre no puede estar vacío",
    profileUpdated: "Tu perfil ha sido actualizado",
    notificationsEnabledWithIcon: "¡Notificaciones activadas! 🔔",
    notificationsDisabledWithIcon: "Notificaciones desactivadas 🔕",
    autoBackupEnabledWithIcon: "¡Respaldo automático activado! ☁️",
    autoBackupDisabled: "Respaldo automático desactivado",
    comingSoonMoon: "¡Próximamente disponible! 🌙",
    lightThemeEnabled: "Tema claro activado",
    comingSoonFinger: "¡Próximamente disponible! 👆",
    biometricsDisabled: "Biometría desactivada",
    analyticsEnabledWithIcon: "Analíticas activadas 📊",
    analyticsDisabled: "Analíticas desactivadas",
    crashReportingEnabledWithIcon: "Reportes de errores activados 🐛",
    crashReportingDisabled: "Reportes de errores desactivados",
    settingsUpdated: "Configuración actualizada",
    couldNotUpdateSettings: "No se pudo actualizar la configuración",
    errorUpdatingSettings: "Ocurrió un error al actualizar la configuración",
    personalProfileIcon: "Perfil personal 👤",
    username: "Nombre de usuario",
    enterYourName: "Ingresa tu nombre",
    save: "Guardar",
    preferencesIcon: "Preferencias ⚙️",
    pushNotifications: "Notificaciones push",
    receiveMaintenanceReminders: "Recibe recordatorios de mantenimiento",
    automaticBackup: "Respaldo automático",
    syncDataToCloud: "Sincroniza tus datos en la nube",
    darkTheme: "Tema oscuro",
    comingSoonAvailable: "Próximamente disponible",
    biometricAuthentication: "Autenticación biométrica",
    usageAnalytics: "Analíticas de uso",
    helpImproveApp: "Ayúdanos a mejorar la app",
    errorReports: "Reportes de errores",
    sendAutomaticCrashReports: "Envía informes automáticos de fallos",
    dataAndPrivacyIcon: "Datos y privacidad 🔒",
    exportData: "Exportar datos",
    downloadAllInformation: "Descarga toda tu información",
    importData: "Importar datos",
    restoreFromBackup: "Restaurar desde respaldo",
    comingSoon: "Próximamente",
    featureAvailableSoon: "Esta función estará disponible pronto",
    clearCache: "Limpiar caché",
    freeStorageSpace: "Libera espacio de almacenamiento",
    clearCacheConfirm: "¿Estás seguro? Esto eliminará archivos temporales.",
    cancel: "Cancelar",
    clear: "Limpiar",
    doneWithBroom: "¡Listo! 🧹",
    cacheClearedSuccessfully: "Caché limpiado correctamente",
    deleteAccount: "Eliminar cuenta",
    permanentlyDeleteAllData: "Eliminar permanentemente todos los datos",
    deleteAccountTitle: "⚠️ Eliminar cuenta",
    deleteAccountWarningShort:
      "Esta acción NO se puede deshacer. Se eliminarán todos tus datos permanentemente.",
    delete: "Eliminar",
    featureNotAvailable: "Función no disponible",
    contactSupportToDelete: "Contacta soporte para eliminar tu cuenta",
    carKeeperVersion: "CarKeeper v",
    digitalCompanionForVehicles:
      "Tu compañero digital para el cuidado de vehículos",
    developedWithLoveByDeepyze:
      "Desarrollado con ❤️ por el equipo de Deepyze para hacer tu vida más fácil",

    // Subscription screen
    oneVehicle: "1 vehículo",
    basicMaintenance: "Mantenimientos básicos",
    expenseTracking: "Registro de gastos",
    basicAlerts: "Alertas básicas",
    forCarEnthusiasts: "Para entusiastas del auto",
    unlimitedVehicles: "Vehículos ilimitados",
    cloudBackups: "Respaldos en la nube",
    advancedInsights: "Insights avanzados",
    noAds: "Sin anuncios",
    forShopsAndFleets: "Para talleres y flotas",
    everythingFromPremium: "Todo de Premium",
    multipleUsers: "Múltiples usuarios",
    prioritySupport: "Soporte prioritario",
    apiIntegration: "API integración",
    advancedReports: "Reportes avanzados",
    planNotAvailable: "Plan no disponible",
    subscriptionActivatedSuccessfully:
      "Tu suscripción se ha activado correctamente",
    purchaseCanceled: "Compra cancelada",
    success: "Éxito",
    purchasesRestoredSuccessfully: "Compras restauradas correctamente",
    activePlan: "Plan Activo",
    accessToAllFeatures: "Tienes acceso a todas las funciones {plan}",
    free: "Gratis",
    forBasicUse: "Para uso básico",
    forever: "/siempre",
    perMonth: "/mes",
    perYear: "/año",
    savingsPercentage: "Ahorra {percentage}%",
    currentPlan: "Plan actual",
    mostPopular: "Más popular",
    subscriptions: "Suscripciones",
    restore: "Restaurar",
    whyUpgrade: "¿Por qué actualizar?",
    manageFleetNoRestrictions: "Gestiona toda tu flota sin restricciones",
    dataAlwaysSafeInCloud: "Tus datos siempre seguros en la nube",
    detailedExpenseAnalysis: "Análisis detallados de gastos y rendimiento",
    startPlan: "Comenzar {plan}",
    cancelAnytimeFromStore: "Cancela en cualquier momento desde la App Store",

    // Help Center screen
    helpCenter: "Centro de Ayuda",
    helloWave: "👋 ¡Hola!",
    helpCenterWelcomeText:
      "Estamos aquí para ayudarte. Encuentra respuestas a las preguntas más frecuentes o contáctanos directamente si necesitas asistencia personalizada.",
    frequentlyAskedQuestions: "Preguntas Frecuentes",
    needMoreHelp: "¿Necesitas más ayuda?",
    carKeeperTrustedCompanion:
      "CarKeeper - Tu compañero de confianza para el cuidado vehicular",
    version100: "Versión 1.0.3",
    sendEmail: "Enviar Email",
    reportError: "Reportar Error",
    tellUsAboutProblem: "Cuéntanos sobre algún problema",
    suggestImprovement: "Sugerir Mejora",
    shareYourIdeas: "Comparte tus ideas con nosotros",
    rateApp: "Calificar App",
    helpWithReview: "Ayúdanos con tu reseña",
    rateCarKeeperTitle: "⭐ Calificar CarKeeper",
    rateCarKeeperMessage:
      "¿Te gusta usar CarKeeper? Tu calificación nos ayuda mucho a mejorar y llegar a más usuarios.",
    notNow: "Ahora no",
    rate: "Calificar",
    thanks: "¡Gracias!",
    redirectToAppStore: "Te redirigiríamos a la tienda de apps para calificar.",

    // Documents screen
    documentNoFileAttached: "Este documento no tiene archivo adjunto",
    downloadComplete: "Descarga completa",
    documentDownloadedSuccessfully:
      "El documento se ha descargado correctamente",
    ok: "OK",
    open: "Abrir",
    deleteDocument: "Eliminar documento",
    deletedVehicle: "Vehículo eliminado",
    noDate: "Sin fecha",
    documentsOverview: "Resumen de documentos",
    total: "Total",
    expiringSoon: "Por vencer",
    expired: "Vencidos",
    all: "Todos",
    expiring: "Por vencer",
    noDocuments: "No hay documentos",
    addImportantDocuments: "Agrega documentos importantes de tus vehículos",
    documents: "Documentos",
    addVehicleToManageDocuments:
      "Agrega un vehículo para comenzar a gestionar documentos",
    goToVehicles: "Ir a Vehículos",

    // Add Document screen
    selectionCanceled: "Selección cancelada",
    selectVehicle: "Selecciona un vehículo",
    selectDocumentType: "Selecciona un tipo de documento",
    fieldRequired: "El campo es requerido",
    documentAddedSuccessfully: "Documento agregado correctamente",
    vehicle: "Vehículo",
    newDocument: "Nuevo Documento",
    documentType: "Tipo de documento",
    insurance: "Seguro",
    registration: "Registro",
    inspectionVTV: "Inspección/VTV",
    license: "Licencia",
    manual: "Manual",
    receiptInvoice: "Recibo/Factura",
    warranty: "Garantía",
    others: "Otros",
    documentInformation: "Información del documento",
    documentName: "Nombre del documento",
    documentNamePlaceholder: "Ej: Póliza de seguro 2024",
    descriptionOptional: "Descripción (Opcional)",
    additionalDocumentDescription: "Descripción adicional del documento",
    issuerOptional: "Emisor (Opcional)",
    insuranceCompanyEtc: "Compañía de seguros, etc.",
    numberOptional: "Número (Opcional)",
    policyNumberEtc: "Número de póliza, etc.",
    expirationDateOptional: "Fecha de vencimiento (Opcional)",
    noExpirationDate: "Sin fecha de vencimiento",
    fileSelected: "Archivo seleccionado",
    attachFile: "Adjuntar archivo",
    pdfImageOrTextDocument: "PDF, imagen o documento de texto",
    additionalNotesOptional: "Notas adicionales (Opcional)",
    additionalInfoObservations: "Información adicional, observaciones, etc.",
    saveDocument: "Guardar Documento",

    // Analytics screen
    allVehicles: "Todos los vehículos",
    analytics: "Analíticas",
    week: "Semana",
    month: "Mes",
    year: "Año",
    keyMetrics: "Métricas clave",
    totalExpense: "Gasto total",
    thisMonth: "Este mes",
    thisWeek: "Esta semana",
    thisYear: "Este año",
    monthlyAverage: "Promedio mensual",
    lastSixMonths: "Últimos 6 meses",
    averageConsumption: "Consumo promedio",
    fuelEfficiency: "Eficiencia de combustible",
    costPerKm: "Costo por km",
    includesAllExpenses: "Incluye todos los gastos",
    trendCharts: "Gráficos de tendencias",
    insightsIcon: "💡 Insights",
    topExpenseCategoryIs: "Tu categoría de mayor gasto es",
    with: "con",
    atCurrentPaceProjectedYearly:
      "Con el ritmo actual, tu gasto anual proyectado es de",
    youHave: "Tienes",
    upcomingMaintenances:
      "{count, plural, =1 {mantenimiento próximo} other {mantenimientos próximos}}",

    // Export screen
    selectAtLeastOneDataType:
      "Selecciona al menos un tipo de dato para exportar",
    exportOf: "Exportación de {type} - CarKeeper",
    dataExportedAndSharedSuccessfully:
      "Datos exportados y compartidos correctamente",
    couldNotExportData: "No se pudieron exportar los datos",
    errorExportingData: "Error al exportar los datos",
    completeCarKeeperBackup: "Respaldo completo CarKeeper",
    completeBackup: "Respaldo completo",
    completeBackupCreatedJSON:
      "Se ha creado un respaldo completo de todos tus datos en formato JSON",
    errorCreatingBackup: "Error al crear el respaldo",
    exportedFiles: "Archivos exportados",
    filesCreatedWhatToDo: "Se han creado {count} archivos. ¿Qué deseas hacer?",
    shareByEmail: "Compartir por email",
    shareFirstFile: "Compartir primer archivo",
    carKeeperDataExportEmail: "Exportación de datos CarKeeper - {date}",
    emailBodyText:
      "Adjunto encontrarás la exportación de tus datos de CarKeeper:\n\n{types}\n\nPeríodo: {startDate} - {endDate}\n\nGenerado por CarKeeper",
    selectDataToExport: "Selecciona los datos a exportar",
    basicVehicleInformation: "Información básica de todos tus vehículos",
    completeExpenseRecord: "Registro completo de gastos por período",
    maintenanceHistory: "Historial de mantenimientos realizados",
    documentsInfoNoAttachments:
      "Información de documentos (sin archivos adjuntos)",
    dateRange: "Rango de fechas",
    onlyAppliesTo: "Solo aplica a gastos, mantenimientos y documentos",
    from: "Desde",
    to: "Hasta",
    exportSelection: "Exportar Selección",
    completeBackupJSON: "Respaldo Completo (JSON)",
    informationIcon: "ℹ️ Información",
    csvFilesCanBeOpened:
      "• Los archivos CSV pueden abrirse en Excel, Google Sheets u otras aplicaciones de hoja de cálculo",
    jsonBackupIncludesAll:
      "• El respaldo JSON incluye todos los datos y puede usarse para restaurar información",
    documentAttachmentsNotIncluded:
      "• Los archivos adjuntos de documentos no se incluyen en la exportación",
    exportRespectsDateRange:
      "• La exportación respeta el rango de fechas seleccionado",
    vehicleSharing: "Compartir Vehículo",

    // Onboarding
    onboardingWelcomeTitle: "¡Bienvenido a CarKeep!",
    onboardingWelcomeSubtitle:
      "La app definitiva para el cuidado de tu vehículo",
    onboardingWelcomeDescription:
      "Gestiona el mantenimiento, gastos y documentos de todos tus vehículos en un solo lugar.",

    onboardingMaintenanceTitle: "Mantenimiento Inteligente",
    onboardingMaintenanceSubtitle: "Nunca olvides un servicio",
    onboardingMaintenanceDescription:
      "Recibe recordatorios automáticos basados en fechas y kilometraje. Mantén tu vehículo en perfectas condiciones.",

    onboardingExpensesTitle: "Control de Gastos",
    onboardingExpensesSubtitle: "Conoce cuánto inviertes",
    onboardingExpensesDescription:
      "Registra combustible, reparaciones y gastos. Obtén análisis detallados de tus inversiones.",

    onboardingDocumentsTitle: "Documentos Organizados",
    onboardingDocumentsSubtitle: "Todo en orden",
    onboardingDocumentsDescription:
      "Guarda fotos de documentos importantes: seguro, registro, facturas y más. Accede a todo desde tu móvil.",

    onboardingFinalTitle: "¡Empecemos!",
    onboardingFinalSubtitle: "Elige tu plan ideal",
    onboardingFinalDescription:
      "Selecciona la suscripción que mejor se adapte a tus necesidades y comienza a cuidar tu vehículo como nunca antes.",

    onboardingStart: "¡Empezar!",
    skip: "Omitir",

    // Welcome Screen
    welcomeTagline: "Tu compañero perfecto para el cuidado vehicular",
    welcomeBenefitsTitle: "¿Por qué elegir CarKeeper?",
    welcomeBenefit1: "Gestión completa de mantenimiento y gastos",
    welcomeBenefit2: "Recordatorios inteligentes personalizados",
    welcomeBenefit3: "Documentos y facturas organizados",
    continueWithApple: "Continuar con Apple",
    continueWithEmail: "Continuar con Email",
    welcomeSecurityText: "Tus datos están seguros y protegidos",

    // Apple Auth
    appleSignInNotAvailable: "Apple Sign-In No Disponible",
    appleSignInNotSupported:
      "Iniciar sesión con Apple no es compatible con este dispositivo.",
    appleSignInFailed: "Apple Sign-In falló. Por favor, intenta de nuevo.",
    authError: "Error en la autenticación",
    ok: "OK",

    // Onboarding Paywall
    onboardingPaywallTitle: "Elige tu plan ideal",
    onboardingPaywallSubtitle: "Comienza tu viaje con CarKeep",
    onboardingPaywallFree: "Gratuito",
    onboardingPaywallFreeSubtitle: "Para empezar",
    onboardingPaywallMonthly: "Mensual",
    onboardingPaywallMonthlySubtitle: "Pago mensual",
    onboardingPaywallAnnual: "Anual",
    onboardingPaywallAnnualSubtitle: "Ahorra 25%",
    onboardingPaywallPremium: "Premium",
    onboardingPaywallPremiumSubtitle: "Para entusiastas",
    onboardingPaywallPro: "Pro",
    onboardingPaywallProSubtitle: "Para talleres y flotas",
    onboardingPaywallMostPopular: "MÁS POPULAR",
    onboardingPaywallContinueFree: "Continuar Gratis",
    onboardingPaywallStartNow: "Empezar Ahora",
    onboardingPaywallRestorePurchases: "Restaurar compras",
    weeklyPlan: "Semanal",
    lifetimePlan: "Lifetime",
    lifetimeSubtitle: "Acceso de por vida",
    permanentAccess: "Acceso permanente sin renovaciones",
    onboardingPaywallWelcomeTitle: "🎉 ¡Bienvenido!",
    onboardingPaywallWelcomeMessage:
      "Tu suscripción se ha activado correctamente. ¡Disfruta de todas las funciones premium!",
    onboardingPaywallContinue: "Continuar",
    onboardingPaywallWhyChoose: "¿Por qué elegir CarKeep?",
    onboardingPaywallSecurityGuaranteed: "Seguridad garantizada",
    onboardingPaywallAutoSync: "Sincronización automática",
    onboardingPaywallSupport247: "Soporte 24/7",
    onboardingPaywallContinuousImprovement: "Mejora continua",

    // Free plan features
    onboardingFreeFeature1: "1 vehículo",
    onboardingFreeFeature2: "Mantenimiento básico",
    onboardingFreeFeature3: "Control de gastos",
    onboardingFreeFeature4: "Alertas básicas",
    onboardingFreeFeature5: "Reportes simples",

    // Premium plan features
    onboardingPremiumFeature1: "Vehículos ilimitados",
    onboardingPremiumFeature2: "Compartir vehículos",
    onboardingPremiumFeature3: "Respaldos en la nube",
    onboardingPremiumFeature4: "Exportar datos",
    onboardingPremiumFeature5: "Análisis avanzados",
    onboardingPremiumFeature6: "Sin anuncios",
    onboardingPremiumFeature7: "50 recordatorios",

    // Pro plan features
    onboardingProFeature1: "Todo de Premium",
    onboardingProFeature2: "Invitar usuarios",
    onboardingProFeature3: "Múltiples usuarios",
    onboardingProFeature4: "Soporte prioritario",
    onboardingProFeature5: "Integración API",
    onboardingProFeature6: "Reportes avanzados",
    onboardingProFeature7: "Recordatorios ilimitados",

    // Vehicle sharing
    pleaseCompleteAllRequiredFields:
      "Por favor completa todos los campos obligatorios",
    rejectInvitation: "❌ Rechazar invitación",
    reject: "Rechazar",
    inviteUser: "Invitar Usuario",
    emailPlaceholderExample: "ejemplo@email.com",
    writeCustomMessageForInvitation:
      "Escribe un mensaje personalizado para la invitación...",
    sending: "Enviando...",
    send: "Enviar",
    vehicleToShare: "Vehículo a compartir",
    cancelText: "Cancelar",
    invitationSentSuccess: "🎉 ¡Invitación enviada!",
    invitationSentTo:
      "Se ha enviado una invitación a {email} para compartir tu {brand} {model}",
    errorSendingInvitation: "Error al enviar la invitación",
    detailedError: "Error detallado",
    invitationAcceptedSuccess: "✅ ¡Invitación aceptada!",
    nowYouCanManage: "Ahora puedes gestionar el {brand} {model}",
    couldNotAcceptInvitation: "No se pudo aceptar la invitación",
    areYouSureReject:
      "¿Estás seguro de que quieres rechazar la invitación para {brand} {model}?",
    cancel: "Cancelar",
    invitationRejected: "Invitación rechazada",
    couldNotRejectInvitation: "No se pudo rechazar la invitación",
    shareManagementOfVehicles:
      "Invita usuarios y comparte la gestión de tus vehículos",
    upgradeToPremiumOrPro:
      "Actualiza a Premium para compartir vehículos, o a Pro para invitar usuarios",
    vehiclesSharedWithMe: "Vehículos compartidos conmigo",
    sharedBy: "Compartido por {name}",
    role: "Rol: {role}",
    invitationsReceived: "Invitaciones recibidas",
    from: "De: {name}",
    userEmail: "Email del usuario",
    userRole: "Rol del usuario",
    viewOnly: "Solo ver",
    editExpensesAndMaintenance: "Editar gastos y mantenimiento",
    totalControl: "Control total",
    canViewButNotEdit: "Puede ver información pero no editarla",
    canAddAndEditExpensesMaintenance:
      "Puede agregar y editar gastos y mantenimientos",
    canEditAllVehicleInfo: "Puede editar toda la información del vehículo",
    specificPermissions: "Permisos específicos",
    editExpenses: "Editar gastos",
    editMaintenance: "Editar mantenimientos",
    uploadDocuments: "Subir documentos",
    editVehicleInfo: "Editar información del vehículo",
    messageOptional: "Mensaje (opcional)",

    // Vehicle stats
    unlimited: "Ilimitados",
    vehicle: "Vehículo",
    vehicles: "Vehículos",

    // Notifications
    notificationsDisabled: "Notificaciones deshabilitadas",
    allScheduledNotificationsCancelled:
      "Se han cancelado todas las notificaciones programadas",

    // Charts
    expensesByCategory: "Gastos por categoría",
    fuelConsumption: "Consumo de combustible (L/100km)",

    // Subscription
    oneTimePayment: "Pago único",
    savePercent: "Ahorra {percent}%",
    planNotAvailable: "Plan no disponible",
    perfect: "🎉 ¡Perfecto!",
    subscriptionActiveEnjoy:
      "Tu suscripción está activa. ¡Disfruta CarKeeper Pro!",
    purchaseCancelled: "Compra cancelada",

    // Profile Messages
    couldNotActivatePro: "No se pudo activar la cuenta PRO. Intenta de nuevo.",
    errorActivatingPro: "Ocurrió un error al activar la cuenta PRO: {error}",
    onlyMoreTaps: "Solo {count} toques más...",
    almostThere: "¡Casi ahí! Un toque más...",
    accountDeleted: "Cuenta eliminada",
    accountDeletedSuccess:
      "Tu cuenta y todos los datos han sido eliminados exitosamente.",
    couldNotDeleteAccount: "No se pudo eliminar la cuenta",
    success: "Éxito",
    notificationsEnabledSuccess: "Notificaciones habilitadas correctamente",

    // Onboarding
    weeklyAccess: "Acceso semanal",
    perWeek: "por semana",

    // Restore
    restored: "✅ Restaurado",
    purchasesRestored: "Tus compras han sido restauradas.",

    // Sprint 2 - Font Scale
    fontSizeTitle: "Tamaño de fuente",
    fontSizePreview: "Vista previa del texto",
    darkModeEnabled: "Tema oscuro activado",
    lightModeEnabled: "Tema claro activado",

    // Sprint 2 - Analytics Tabs
    summary: "Resumen",
    maintenanceCostByMonth: "Costo de mantenimiento por mes",
    maintenanceByType: "Mantenimientos por tipo",
    totalCost: "Costo total",
    noDataAvailable: "No hay datos disponibles",

    // Sprint 2 - Recurring Expenses
    recurringExpense: "Gasto recurrente",
    recurringExpenses: "Gastos recurrentes",
    noRecurringExpenses: "Sin gastos recurrentes",
    noRecurringExpensesDescription: "Agrega gastos que se repiten periódicamente para llevar un mejor control.",
    deleteRecurringExpense: "Eliminar gasto recurrente",
    deleteRecurringExpenseConfirm: "¿Estás seguro de eliminar el gasto recurrente '{name}'?",
    weekly: "Semanal",
    monthly: "Mensual",
    bimonthly: "Bimestral",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    annual: "Anual",
    frequency: "Frecuencia",

    // Sprint 2 - Maintenance Tips
    recommendation: "Recomendación",
    maintenanceOverdue: "Mantenimiento vencido",
    maintenanceUpcoming: "Mantenimiento próximo",
    maintenanceOnTrack: "Al día",

    // Sprint 2 - Feedback
    feedback: "Feedback",
    sendSuggestionsOrReportBugs: "Enviar sugerencias o reportar errores",
    feedbackType: "Tipo de feedback",
    suggestion: "Sugerencia",
    bug: "Error",
    feature: "Función",
    other: "Otro",
    yourMessage: "Tu mensaje",
    feedbackPlaceholder: "Cuéntanos tu experiencia, sugerencia o problema...",
    rateExperience: "Califica tu experiencia (opcional)",
    sendFeedback: "Enviar feedback",
    sending: "Enviando...",
    feedbackMessageRequired: "Por favor escribe un mensaje",
    thankYou: "¡Gracias!",
    feedbackSent: "Tu feedback ha sido enviado exitosamente.",
    feedbackSendError: "No se pudo enviar el feedback. Intenta nuevamente.",
    previousFeedbacks: "Feedbacks anteriores",
    noPreviousFeedbacks: "No has enviado feedbacks aún",
    reviewed: "Revisado",
  },

  en: {
    // General
    loading: "Loading...",
    loadingPlans: "Loading plans...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    ok: "OK",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    done: "Done",
    optional: "Optional",
    required: "Required",
    user: "User",
    hello: "Hello",

    // Common words
    vehicle: "vehicle",
    thisMonth: "This month",
    spent: "Spent",
    service: "Service",
    documents: "Documents",
    expensesThisMonth: "Expenses this month",
    continueWithoutSubscription: "Continue without subscription",
    confirmExit: "Exit?",
    exitPaywallMessage:
      "If you continue without subscription, you'll return to the login screen. Are you sure?",
    exit: "Exit",
    subscriptionActivated:
      "Subscription activated! You now have full access to the app.",
    checkingSubscription: "Checking subscription...",

    // Subscription screen / Paywall
    alreadyPro: "You already have Pro!",
    enjoyPremiumFeatures: "Enjoy all premium features",
    continueButton: "Continue",
    restore: "Restore",
    unlockCarKeeperPro: "Unlock CarKeeper Pro",
    manageAllVehicles: "Manage all your vehicles without limits",
    unlimitedVehicles: "Unlimited vehicles",
    automaticBackups: "Automatic backups",
    advancedReports: "Advanced reports",
    noAds: "No ads",
    startNow: "Start now",
    cancelAnytime: "Cancel anytime",
    freeTrial: "{days} days free",
    thenPrice: "then {price}",
    freeTrialThenPrice: "{days} days free, then {price}",
    exitWithoutSubscription: "Exit without subscription",
    exitWithoutSubscriptionMessage:
      "You need an active subscription to use CarKeeper. Do you want to sign out?",
    exit: "Exit",

    // Vehicle empty state
    startYourJourney: "Start your journey!",
    addFirstVehicleDescription:
      "Add your first vehicle and keep total control over expenses, maintenance and documents",
    automaticReminders: "Automatic reminders",
    financialControl: "Financial control",
    allOrganized: "All organized",
    detailedAnalysis: "Detailed analysis",

    // Alerts and messages
    limitReached: "Limit reached",
    planLimitMessage:
      "Your current plan allows up to {limit} vehicle(s). Do you want to upgrade your subscription?",
    viewPlans: "View plans",
    deleteVehicleConfirm:
      "Are you sure you want to delete {name}? This action cannot be undone.",
    upgradeToPremium: "Upgrade to Premium",
    upgradeToPro: "Upgrade to Pro",
    unlimitedVehiclesAndFeatures: "Unlimited vehicles and advanced features",
    unlockAllFeatures: "Unlock all features",
    startingCarKeeper: "Starting CarKeeper...",

    // Navigation
    vehicles: "Vehicles",
    maintenance: "Maintenance",
    expenses: "Expenses",
    profile: "Profile",

    // Vehicles
    vehiclesList: "My Vehicles",
    addVehicle: "Add Vehicle",
    editVehicle: "Edit Vehicle",
    vehicleDetail: "Vehicle Detail",
    deleteVehicle: "Delete Vehicle",
    noVehicles: "No vehicles",
    addFirstVehicle: "Add your first vehicle!",
    vehicleNotFound: "Vehicle not found",
    brand: "Brand",
    model: "Model",
    year: "Year",
    color: "Color",
    mileage: "Mileage",
    licensePlate: "License Plate",
    vin: "VIN",
    engine: "Engine",

    // Maintenance
    maintenanceList: "Maintenance",
    addMaintenance: "Add Maintenance",
    editMaintenance: "Edit Maintenance",
    scheduleMaintenance: "Schedule Maintenance",
    maintenanceDetail: "Maintenance Detail",
    deleteMaintenance: "Delete Maintenance",
    noMaintenance: "No maintenance",
    addFirstMaintenance: "Add your first maintenance!",
    maintenanceNotFound: "Maintenance not found",
    upcoming: "Upcoming",
    history: "History",
    completed: "Completed",
    pending: "Pending",
    scheduled: "Scheduled",

    // Maintenance status and types
    inProgress: "In Progress",
    cancelled: "Cancelled",
    noHistory: "No history",
    noScheduledMaintenances: "No scheduled maintenances",
    noHistoryMessage: "You haven't registered any maintenance yet",
    noScheduledMaintenancesMessage: "You don't have any scheduled maintenances",

    // Maintenance types
    oilChange: "Oil change",
    filterChange: "Filter change",
    brakeService: "Brake service",
    tires: "Tires",
    alignment: "Alignment",
    balancing: "Balancing",
    battery: "Battery",
    airConditioning: "Air conditioning",
    generalInspection: "General inspection",
    other: "Other",

    // Time references
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    daysAgo: "{days} days ago",
    inDays: "In {days} days",

    // Maintenance form
    selectVehicle: "Select Vehicle",
    vehicleRequired: "Select a vehicle",
    vehicleNotExists: "Selected vehicle does not exist",
    selectMaintenanceType: "Select a maintenance type",
    titleRequired: "Title is required",
    invalidCost: "Invalid cost",
    invalidMileage: "Invalid mileage",
    maintenanceType: "Maintenance Type",
    basicInformation: "Basic Information",
    title: "Title",
    titlePlaceholder: "E.g: Oil and filter change",
    descriptionOptional: "Description (Optional)",
    descriptionPlaceholder: "Describe the work performed",
    scheduledDate: "Scheduled Date",
    maintenanceDate: "Maintenance Date",
    mileage: "Mileage",
    cost: "Cost ($)",
    provider: "Provider",
    status: "Status",
    costPlaceholder: "0.00",
    serviceInformation: "Service Information",
    providerOptional: "Shop/Provider (Optional)",
    providerPlaceholder: "Shop or mechanic name",
    locationOptional: "Location (Optional)",
    locationPlaceholder: "Shop address",
    additionalNotesOptional: "Additional Notes (Optional)",
    additionalNotesPlaceholder: "Observations, parts used, etc.",
    automaticExpense: "Automatic expense",
    automaticExpenseMessage:
      "An expense will be automatically created for this maintenance",
    scheduleNextMaintenance: "Schedule next maintenance",
    scheduleNextMaintenanceDescription: "Set reminder for the next maintenance",
    nextInKm: "Next in (km)",
    nextInKmPlaceholder: "60000",
    orInMonths: "Or in (months)",
    orInMonthsPlaceholder: "6",
    nextMaintenance: "Next maintenance: {date}",
    updateMaintenance: "Update Maintenance",
    registerMaintenance: "Register Maintenance",
    needsVehicleForMaintenance:
      "You need to add a vehicle before registering maintenances",
    change: "Change",

    // Maintenance detail
    detail: "Detail",
    loading: "Loading...",
    basicInfo: "Basic Information",
    nextMaintenanceInfo: "Next Maintenance",
    markAsCompleted: "Mark as Completed",
    markAsCompletedConfirm:
      "Do you want to mark this maintenance as completed?",
    complete: "Complete",
    markAsCompletedSuccess: "Maintenance marked as completed",
    deleteMaintenanceConfirm:
      "Are you sure you want to delete this maintenance? This action cannot be undone.",
    contactProvider: "Contact Provider",
    callProvider: "Do you want to call {provider}?",
    call: "Call",
    callFunctionality: "Call functionality pending implementation",
    shareMaintenanceTitle: "Maintenance Detail",

    // Success messages
    maintenanceRegisteredAndScheduled:
      "Maintenance registered successfully and next maintenance scheduled",
    maintenanceRegistered:
      "Maintenance was registered successfully, but there was an error scheduling the next one: {error}",
    maintenanceScheduledSuccess: "Maintenance scheduled successfully",

    // Vehicle actions
    goToVehicles: "Add Vehicle",
    addVehicleFirst: "Add a vehicle to start managing maintenances",

    // Additional maintenance messages
    next: "Next",
    previous: "previous",
    maintenanceScheduledBasedOn: "Maintenance scheduled based on the",
    automaticallyScheduledMaintenance: "Automatically scheduled maintenance",

    // Expenses
    expensesList: "My Expenses",
    addExpense: "New Expense",
    editExpense: "Edit Expense",
    expenseDetail: "Expense Detail",
    deleteExpense: "Delete Expense",
    noExpenses: "No expenses",
    addFirstExpense: "Add your first expense!",
    expenseNotFound: "Expense not found",
    amount: "Amount",
    category: "Category",
    description: "Description",
    date: "Date",
    location: "Location",
    notes: "Notes",

    // Categories
    fuel: "Fuel",
    maintenance: "Maintenance",
    insurance: "Insurance",
    parking: "Parking",
    tolls: "Tolls",
    other: "Other",
    allCategories: "All",

    // Expense Screen specific
    hello: "Hello! 👋",
    yourExpenses: "Your Expenses",
    categories: "Categories",
    week: "Week",
    recentExpenses: "Recent Expenses",
    records: "{count} records",
    noExpensesYet: "No expenses yet!",
    noExpensesInCategory: "No expenses in {category}",
    startTrackingExpenses:
      "Start tracking your expenses to better control your money",
    addFirstExpense: "Add First Expense",
    addFirstVehicleToStartExpenses: "Add your first vehicle!",
    needVehicleForExpenses:
      "To start tracking expenses, first you need to add a vehicle",
    addVehicle: "Add Vehicle",
    cleanDuplicates: "🗑️ Clean Duplicates",
    cleanDuplicatesConfirm:
      "Do you want to remove duplicate expenses? This action cannot be undone.",
    clean: "Clean",
    ready: "✅ Ready!",
    duplicatesCleanError: "❌ Error",
    duplicatesCleanErrorMsg: "An error occurred while cleaning duplicates",

    // Add/Edit Expense Screen
    newExpense: "New Expense",
    editExpense: "Edit Expense",
    vehicle: "vehicle",
    vehicleSelection: "Vehicle",
    categorySelection: "Category",
    details: "Details",
    descriptionLabel: "Description",
    descriptionPlaceholder: "E.g: Fuel fill-up, Full service",
    amountLabel: "Amount ($)",
    amountPlaceholder: "0.00",
    litersOptional: "Liters (Optional)",
    litersPlaceholder: "50.5",
    mileageOptional: "Mileage (Optional)",
    mileagePlaceholder: "15000",
    locationOptional: "Location (Optional)",
    locationPlaceholder: "Gas station, shop, etc.",
    additionalNotesOptional: "Additional notes (Optional)",
    additionalNotesPlaceholder: "Additional information about the expense",
    updateExpense: "Update Expense",
    saveExpense: "Save Expense",
    selectVehicleError: "Select a vehicle",
    selectCategoryError: "Select a category",
    descriptionRequired: "Description is required",
    amountRequired: "Amount is required",
    invalidAmount: "Invalid amount",
    invalidLiters: "Invalid liters",
    invalidMileage: "Invalid mileage",

    // Expense Detail Screen
    expenseDetail: "Expense Detail",
    expenseNotFound: "Expense not found",
    expenseNotFoundDesc:
      "The expense you are looking for does not exist or has been deleted",
    expenseInformation: "Expense Information",
    liters: "Liters",
    actions: "Actions",
    editExpenseAction: "Edit Expense",
    deleteExpenseAction: "Delete Expense",
    deleteExpenseConfirm: "Delete expense",
    deleteExpenseConfirmMsg:
      "Are you sure you want to delete this expense? This action cannot be undone.",
    couldNotDeleteExpense: "Could not delete expense",

    // Profile
    editProfile: "Edit Profile",
    settings: "Settings",
    subscription: "Subscription",
    helpCenter: "Help Center",
    privacyPolicy: "Privacy Policy",
    contactSupport: "Contact Support",
    exportData: "Export Data",
    analytics: "Analytics",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    deleteAccount: "Delete Account",
    logout: "Logout",

    // Profile specific
    logoutConfirm: "Are you sure you want to logout?",
    deleteAccountTitle: "⚠️ Delete account",
    deleteAccountWarning:
      "This action will permanently delete:\n\n• Your user account\n• All your vehicles\n• All registered expenses\n• All maintenance records\n• All documents\n• All settings\n\nThis action CANNOT be undone.",
    understandDeleteAccount: "I understand, delete account",
    finalConfirmation: "🚨 Final confirmation",
    finalConfirmationMessage:
      "Are you completely sure? This action is irreversible and you will lose all your data.",
    yesDeleteEverything: "Yes, delete everything",
    accountDeleted: "Account deleted",
    accountDeletedMessage:
      "Your account and all data have been successfully deleted.",
    couldNotDeleteAccount: "Could not delete account",
    notificationsEnabled: "Notifications enabled successfully",
    notificationsDisabled: "Notifications disabled",
    allNotificationsCancelled:
      "All scheduled notifications have been cancelled",
    pro: "PRO",
    premium: "PREMIUM",
    free: "FREE",
    fullAccessToAllFeatures: "Full access to all features",
    basicPlanWithLimitedFeatures: "Basic plan with limited features",
    updatePersonalInfo: "Update your personal information",
    scheduledNotifications: "{count} scheduled notifications",
    darkModeEnabled: "Dark theme enabled",
    lightModeEnabled: "Light theme enabled",
    exportOrBackupInfo: "Export or backup your information",
    viewDetailedStats: "View detailed statistics",
    faqAndGuides: "Frequently asked questions and guides",
    getTechnicalHelp: "Get technical help",
    viewTermsAndConditions: "View terms and conditions",
    aboutCarKeeper: "About CarKeeper",
    version100: "Version 1.0.3",
    carKeeperVersion: "CarKeeper v1.0.3",
    developedWithLove: "Developed with ❤️ by Deepyze",
    permanentlyDeleteAllData: "Permanently delete all data",
    accountAndSubscription: "Account and subscription",
    support: "Support",
    dangerZone: "Danger zone",
    madeWithLove: "Made with ❤️ by Deepyze",

    // Privacy Policy
    yourPrivacyIsImportant: "Your Privacy is Important",
    privacyIntroText:
      "At CarKeeper, we are committed to protecting your personal information and being transparent about how we collect, use and protect your data.",
    lastUpdated: "Last updated",
    august1st2025: "August 1st, 2025",
    haveQuestions: "Have Questions?",
    privacyContactText:
      "If you have questions about this privacy policy or how we handle your data, please don't hesitate to contact us.",
    contactPrivacyTeam: "Contact Privacy Team",
    carKeeperPrivacyRespect: "CarKeeper - Built with respect for your privacy",
    copyright2025Deepyze: "© 2025 Deepyze. All rights reserved.",

    // Language settings
    language: "Language",
    changeLanguage: "Change language",
    selectLanguage: "Select language",
    languageChanged: "Language changed successfully",
    spanish: "Spanish",
    english: "English",
    currentLanguage: "Current language",
    couldNotChangeLanguage: "Could not change language",

    // Auth
    login: "Login",
    register: "Register",
    welcomeBack: "Welcome back!",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    email: "Email",
    password: "Password",
    name: "Name",
    lastName: "Last Name",

    // Messages
    vehicleAdded: "Vehicle added successfully",
    vehicleUpdated: "Vehicle updated successfully",
    vehicleDeleted: "Vehicle deleted successfully",
    maintenanceAdded: "Maintenance added successfully",
    maintenanceUpdated: "Maintenance updated successfully",
    maintenanceDeleted: "Maintenance deleted successfully",
    expenseAdded: "Expense added successfully",
    expenseUpdated: "Expense updated successfully",
    expenseDeleted: "Expense deleted successfully",

    // Validations
    fieldRequired: "This field is required",
    invalidEmail: "Invalid email",
    invalidYear: "Invalid year",
    invalidNumber: "Invalid number",
    invalidAmount: "Invalid amount",

    // Common actions
    addPhoto: "Add photo",
    takePhoto: "Camera",
    selectFromGallery: "Gallery",

    // Time
    today: "Today",
    yesterday: "Yesterday",
    week: "Week",
    month: "Month",
    year: "Year",

    // Units
    km: "mi",
    liters: "gal",
    currency: "$",

    // Additional vehicle screen translations
    permissions: "Permissions",
    needGalleryPermissions: "We need permissions to access your gallery",
    needCameraPermissions: "We need permissions to access your camera",
    selectImageSource: "Select where you want to get the image from",
    brandRequired: "Brand is required",
    modelRequired: "Model is required",
    yearRequired: "Year is required",
    mileageRequired: "Mileage is required",
    mustBeNumber: "Must be a number",
    brandPlaceholder: "Toyota, Ford, etc.",
    modelPlaceholder: "Corolla, Focus, etc.",
    yearPlaceholder: "2024",
    colorPlaceholder: "White, Black, etc.",
    currentMileage: "Current mileage",
    mileagePlaceholder: "50000",
    additionalInformation: "Additional information",
    vinOptional: "VIN (Optional)",
    vinPlaceholder: "Vehicle identification number",
    licensePlateOptional: "License Plate (Optional)",
    licensePlatePlaceholder: "ABC123",
    updateVehicle: "Update Vehicle",
    saveVehicle: "Save Vehicle",
    vehicleInformation: "Vehicle Information",
    chassisNumber: "Chassis Number",
    recentMaintenance: "Recent Maintenance",
    seeAll: "See all",
    noMaintenanceRecords: "No maintenance records",
    recentExpenses: "Recent Expenses",
    noExpenseRecords: "No expense records",
    deleteVehicleDetailConfirm:
      "Are you sure you want to delete {brand} {model}? This action will also delete all associated maintenance records, expenses and documents.",

    // NEW TRANSLATIONS FROM INTERNATIONALIZATION
    // Auth screens
    smartVehicleManagement: "Manage your vehicles intelligently",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "******",
    forgotPassword: "Forgot your password?",
    orContinueWith: "Or continue with",
    continueWithApple: "Continue with Apple",
    noAccount: "Don't have an account?",
    register: "Sign up",
    welcome: "Welcome!",
    accountCreatedWithGoogle:
      "Your account has been successfully created with Google",
    welcomeBack: "Welcome back!",
    loginSubtitle: "Enter your credentials to continue",
    loggedInSuccessfully: "You have successfully logged in",
    googleLoginError: "Could not log in with Google",
    unexpectedError: "An unexpected error occurred",
    createAccount: "Create Account",
    registerSubtitle: "Complete the fields to create your account",
    joinCarKeeperAndStart: "Join CarKeeper and start managing your vehicles",
    fullNamePlaceholder: "John Doe",
    passwordPlaceholderRegister: "Minimum 6 characters",
    confirmPasswordLabel: "Confirm password",
    repeatPasswordPlaceholder: "Repeat your password",
    byRegistering: "By registering, you accept our",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    orRegisterWith: "Or sign up with",
    alreadyHaveAccount: "Already have an account?",
    passwordMinLength: "Password must be at least 6 characters",
    confirmPassword: "Confirm your password",
    passwordsDontMatch: "Passwords don't match",
    accountCreated: "Account created!",
    alreadyHadAccount: "You already had an account, you have logged in",
    googleRegisterError: "Could not register with Google",
    accountCreatedWithApple:
      "Your account has been successfully created with Apple",
    appleRegisterError: "Could not register with Apple",
    fullName: "Full name",
    fullNameExample: "E.g: John Doe",
    nameWillAppearOnProfile: "This name will appear on your profile",
    phoneOptional: "Phone (optional)",
    phoneExample: "E.g: +1 555 123-4567",
    forEmergencyContact: "For emergency contact",
    locationOptional: "Location (optional)",
    locationExample: "E.g: New York, USA",
    helpsNearbyServices: "Helps find nearby services",
    aboutYouOptional: "About you (optional)",
    tellUsAboutYou: "Tell us something about you...",
    briefPersonalDescription: "Brief personal description",
    emailNotEditable: "Email (not editable)",
    notAvailable: "Not available",
    changeEmailContactSupport: "To change your email, contact support",
    contactSupport: "Contact Support",
    comingSoonAvailable: "Coming soon available",
    yourAccount: "Your account 📊",
    recently: "Recently",
    memberSince: "Member since",
    vehicles: "Vehicles",
    expensesRecorded: "Expenses recorded",
    maintenance: "Maintenance",
    saving: "Saving...",
    saveChanges: "Save changes",
    invalidPhoneFormat: "Invalid phone format",
    perfect: "Perfect! 🎉",
    profileUpdatedSuccessfully: "Your profile has been updated successfully",
    couldNotUpdateProfile: "Could not update profile",
    changePhotoFeatureSoon: "The change photo feature will be available soon",

    // Settings screen
    nameCannotBeEmpty: "Name cannot be empty",
    profileUpdated: "Your profile has been updated",
    notificationsEnabledWithIcon: "Notifications enabled! 🔔",
    notificationsDisabledWithIcon: "Notifications disabled 🔕",
    autoBackupEnabledWithIcon: "Auto backup enabled! ☁️",
    autoBackupDisabled: "Auto backup disabled",
    comingSoonMoon: "Coming soon! 🌙",
    lightThemeEnabled: "Light theme enabled",
    comingSoonFinger: "Coming soon! 👆",
    biometricsDisabled: "Biometrics disabled",
    analyticsEnabledWithIcon: "Analytics enabled 📊",
    analyticsDisabled: "Analytics disabled",
    crashReportingEnabledWithIcon: "Crash reporting enabled 🐛",
    crashReportingDisabled: "Crash reporting disabled",
    settingsUpdated: "Settings updated",
    couldNotUpdateSettings: "Could not update settings",
    errorUpdatingSettings: "Error updating settings",
    personalProfileIcon: "Personal profile 👤",
    username: "Username",
    enterYourName: "Enter your name",
    save: "Save",
    preferencesIcon: "Preferences ⚙️",
    pushNotifications: "Push notifications",
    receiveMaintenanceReminders: "Receive maintenance reminders",
    automaticBackup: "Automatic backup",
    syncDataToCloud: "Sync your data to the cloud",
    darkTheme: "Dark theme",
    comingSoonAvailable: "Coming soon available",
    biometricAuthentication: "Biometric authentication",
    usageAnalytics: "Usage analytics",
    helpImproveApp: "Help us improve the app",
    errorReports: "Error reports",
    sendAutomaticCrashReports: "Send automatic crash reports",
    dataAndPrivacyIcon: "Data and privacy 🔒",
    exportData: "Export data",
    downloadAllInformation: "Download all your information",
    importData: "Import data",
    restoreFromBackup: "Restore from backup",
    comingSoon: "Coming soon",
    featureAvailableSoon: "This feature will be available soon",
    clearCache: "Clear cache",
    freeStorageSpace: "Free storage space",
    clearCacheConfirm: "Are you sure? This will delete temporary files.",
    cancel: "Cancel",
    clear: "Clear",
    doneWithBroom: "Done! 🧹",
    cacheClearedSuccessfully: "Cache cleared successfully",
    deleteAccount: "Delete account",
    permanentlyDeleteAllData: "Permanently delete all data",
    deleteAccountTitle: "⚠️ Delete account",
    deleteAccountWarningShort:
      "This action CANNOT be undone. All your data will be permanently deleted.",
    delete: "Delete",
    featureNotAvailable: "Feature not available",
    contactSupportToDelete: "Contact support to delete your account",
    carKeeperVersion: "CarKeeper v1.0.3",
    digitalCompanionForVehicles: "Your digital companion for vehicle care",
    developedWithLoveByDeepyze:
      "Developed with ❤️ by the Deepyze team to make your life easier",

    // Subscription screen
    oneVehicle: "1 vehicle",
    basicMaintenance: "Basic maintenance",
    expenseTracking: "Expense tracking",
    basicAlerts: "Basic alerts",
    forCarEnthusiasts: "For car enthusiasts",
    unlimitedVehicles: "Unlimited vehicles",
    cloudBackups: "Cloud backups",
    advancedInsights: "Advanced insights",
    noAds: "No ads",
    forShopsAndFleets: "For shops and fleets",
    everythingFromPremium: "Everything from Premium",
    multipleUsers: "Multiple users",
    prioritySupport: "Priority support",
    apiIntegration: "API integration",
    advancedReports: "Advanced reports",
    planNotAvailable: "Plan not available",
    subscriptionActivatedSuccessfully:
      "Your subscription has been activated successfully",
    purchaseCanceled: "Purchase canceled",
    success: "Success",
    purchasesRestoredSuccessfully: "Purchases restored successfully",
    activePlan: "Active Plan",
    accessToAllFeatures: "You have access to all {plan} features",
    free: "Free",
    forBasicUse: "For basic use",
    forever: "/forever",
    perMonth: "/month",
    perYear: "/year",
    savingsPercentage: "Save {percentage}%",
    currentPlan: "Current plan",
    mostPopular: "Most popular",
    subscriptions: "Subscriptions",
    restore: "Restore",
    whyUpgrade: "Why upgrade?",
    manageFleetNoRestrictions: "Manage your entire fleet without restrictions",
    dataAlwaysSafeInCloud: "Your data always safe in the cloud",
    detailedExpenseAnalysis: "Detailed expense and performance analysis",
    startPlan: "Start {plan}",
    cancelAnytimeFromStore: "Cancel anytime from the App Store",

    // Help Center screen
    helpCenter: "Help Center",
    helloWave: "👋 Hello!",
    helpCenterWelcomeText:
      "We are here to help you. Find answers to frequently asked questions or contact us directly if you need personalized assistance.",
    frequentlyAskedQuestions: "Frequently Asked Questions",
    needMoreHelp: "Need more help?",
    carKeeperTrustedCompanion:
      "CarKeeper - Your trusted companion for vehicle care",
    version100: "Version 1.0.3",
    sendEmail: "Send Email",
    reportError: "Report Error",
    tellUsAboutProblem: "Tell us about a problem",
    suggestImprovement: "Suggest Improvement",
    shareYourIdeas: "Share your ideas with us",
    rateApp: "Rate App",
    helpWithReview: "Help us with your review",
    rateCarKeeperTitle: "⭐ Rate CarKeeper",
    rateCarKeeperMessage:
      "Do you like using CarKeeper? Your rating helps us improve and reach more users.",
    notNow: "Not now",
    rate: "Rate",
    thanks: "Thanks!",
    redirectToAppStore: "We would redirect you to the app store to rate.",

    // Documents screen
    documentNoFileAttached: "This document has no attached file",
    downloadComplete: "Download complete",
    documentDownloadedSuccessfully:
      "The document has been downloaded successfully",
    ok: "OK",
    open: "Open",
    deleteDocument: "Delete document",
    deletedVehicle: "Deleted vehicle",
    noDate: "No date",
    documentsOverview: "Documents overview",
    total: "Total",
    expiringSoon: "Expiring soon",
    expired: "Expired",
    all: "All",
    expiring: "Expiring",
    noDocuments: "No documents",
    addImportantDocuments: "Add important documents for your vehicles",
    documents: "Documents",
    addVehicleToManageDocuments: "Add a vehicle to start managing documents",
    goToVehicles: "Go to Vehicles",

    // Add Document screen
    selectionCanceled: "Selection canceled",
    selectVehicle: "Select a vehicle",
    selectDocumentType: "Select a document type",
    fieldRequired: "This field is required",
    documentAddedSuccessfully: "Document added successfully",
    vehicle: "Vehicle",
    newDocument: "New Document",
    documentType: "Document type",
    insurance: "Insurance",
    registration: "Registration",
    inspectionVTV: "Inspection/VTV",
    license: "License",
    manual: "Manual",
    receiptInvoice: "Receipt/Invoice",
    warranty: "Warranty",
    others: "Others",
    documentInformation: "Document information",
    documentName: "Document name",
    documentNamePlaceholder: "E.g: Insurance policy 2024",
    descriptionOptional: "Description (Optional)",
    additionalDocumentDescription: "Additional document description",
    issuerOptional: "Issuer (Optional)",
    insuranceCompanyEtc: "Insurance company, etc.",
    numberOptional: "Number (Optional)",
    policyNumberEtc: "Policy number, etc.",
    expirationDateOptional: "Expiration date (Optional)",
    noExpirationDate: "No expiration date",
    fileSelected: "File selected",
    attachFile: "Attach file",
    pdfImageOrTextDocument: "PDF, image or text document",
    additionalNotesOptional: "Additional notes (Optional)",
    additionalInfoObservations: "Additional information, observations, etc.",
    saveDocument: "Save Document",

    // Analytics screen
    allVehicles: "All vehicles",
    analytics: "Analytics",
    week: "Week",
    month: "Month",
    year: "Year",
    keyMetrics: "Key metrics",
    totalExpense: "Total expense",
    thisMonth: "This month",
    thisWeek: "This week",
    thisYear: "This year",
    monthlyAverage: "Monthly average",
    lastSixMonths: "Last 6 months",
    averageConsumption: "Average consumption",
    fuelEfficiency: "Fuel efficiency",
    costPerKm: "Cost per km",
    includesAllExpenses: "Includes all expenses",
    trendCharts: "Trend charts",
    insightsIcon: "💡 Insights",
    topExpenseCategoryIs: "Your top expense category is",
    with: "with",
    atCurrentPaceProjectedYearly:
      "At the current pace, your projected yearly expense is",
    youHave: "You have",
    upcomingMaintenances:
      "{count, plural, =1 {upcoming maintenance} other {upcoming maintenances}}",

    // Export screen
    selectAtLeastOneDataType: "Select at least one data type to export",
    exportOf: "Export of {type} - CarKeeper",
    dataExportedAndSharedSuccessfully: "Data exported and shared successfully",
    couldNotExportData: "Could not export data",
    errorExportingData: "Error exporting data",
    completeCarKeeperBackup: "Complete CarKeeper backup",
    completeBackup: "Complete backup",
    completeBackupCreatedJSON:
      "A complete backup of all your data has been created in JSON format",
    errorCreatingBackup: "Error creating backup",
    exportedFiles: "Exported files",
    filesCreatedWhatToDo:
      "{count} files have been created. What would you like to do?",
    shareByEmail: "Share by email",
    shareFirstFile: "Share first file",
    carKeeperDataExportEmail: "CarKeeper data export - {date}",
    emailBodyText:
      "Attached you will find the export of your CarKeeper data:\n\n{types}\n\nPeriod: {startDate} - {endDate}\n\nGenerated by CarKeeper",
    selectDataToExport: "Select data to export",
    basicVehicleInformation: "Basic information of all your vehicles",
    completeExpenseRecord: "Complete expense record by period",
    maintenanceHistory: "History of performed maintenance",
    documentsInfoNoAttachments: "Document information (without attachments)",
    dateRange: "Date range",
    onlyAppliesTo: "Only applies to expenses, maintenance and documents",
    from: "From",
    to: "To",
    exportSelection: "Export Selection",
    completeBackupJSON: "Complete Backup (JSON)",
    informationIcon: "ℹ️ Information",
    csvFilesCanBeOpened:
      "• CSV files can be opened in Excel, Google Sheets or other spreadsheet applications",
    jsonBackupIncludesAll:
      "• JSON backup includes all data and can be used to restore information",
    documentAttachmentsNotIncluded:
      "• Document attachments are not included in the export",
    exportRespectsDateRange: "• The export respects the selected date range",
    vehicleSharing: "Vehicle Sharing",

    // Onboarding
    onboardingWelcomeTitle: "Welcome to CarKeep!",
    onboardingWelcomeSubtitle: "The ultimate app for vehicle care",
    onboardingWelcomeDescription:
      "Manage maintenance, expenses and documents for all your vehicles in one place.",

    onboardingMaintenanceTitle: "Smart Maintenance",
    onboardingMaintenanceSubtitle: "Never forget a service",
    onboardingMaintenanceDescription:
      "Get automatic reminders based on dates and mileage. Keep your vehicle in perfect condition.",

    onboardingExpensesTitle: "Expense Control",
    onboardingExpensesSubtitle: "Know how much you invest",
    onboardingExpensesDescription:
      "Track fuel, repairs and expenses. Get detailed analysis of your investments.",

    onboardingDocumentsTitle: "Organized Documents",
    onboardingDocumentsSubtitle: "Everything in order",
    onboardingDocumentsDescription:
      "Save photos of important documents: insurance, registration, invoices and more. Access everything from your mobile.",

    onboardingFinalTitle: "Let's get started!",
    onboardingFinalSubtitle: "Choose your ideal plan",
    onboardingFinalDescription:
      "Select the subscription that best fits your needs and start taking care of your vehicle like never before.",

    onboardingStart: "Get Started!",
    skip: "Skip",

    // Welcome Screen
    welcomeTagline: "Your perfect companion for vehicle care",
    welcomeBenefitsTitle: "Why choose CarKeeper?",
    welcomeBenefit1: "Complete maintenance and expense management",
    welcomeBenefit2: "Personalized smart reminders",
    welcomeBenefit3: "Organized documents and invoices",
    continueWithApple: "Continue with Apple",
    continueWithEmail: "Continue with Email",
    welcomeSecurityText: "Your data is safe and protected",

    // Apple Auth
    appleSignInNotAvailable: "Apple Sign-In Not Available",
    appleSignInNotSupported: "Apple Sign-In is not supported on this device.",
    appleSignInFailed: "Apple Sign-In failed. Please try again.",
    authError: "Authentication Error",
    ok: "OK",

    // Onboarding Paywall
    onboardingPaywallTitle: "Choose your ideal plan",
    onboardingPaywallSubtitle: "Start your journey with CarKeep",
    onboardingPaywallFree: "Free",
    onboardingPaywallFreeSubtitle: "To get started",
    onboardingPaywallMonthly: "Monthly",
    onboardingPaywallMonthlySubtitle: "Monthly payment",
    onboardingPaywallAnnual: "Annual",
    onboardingPaywallAnnualSubtitle: "Save 25%",
    onboardingPaywallPremium: "Premium",
    onboardingPaywallPremiumSubtitle: "For enthusiasts",
    onboardingPaywallPro: "Pro",
    onboardingPaywallProSubtitle: "For shops and fleets",
    onboardingPaywallMostPopular: "MOST POPULAR",
    onboardingPaywallContinueFree: "Continue Free",
    onboardingPaywallStartNow: "Start Now",
    onboardingPaywallRestorePurchases: "Restore purchases",
    weeklyPlan: "Weekly",
    lifetimePlan: "Lifetime",
    lifetimeSubtitle: "Lifetime access",
    permanentAccess: "Permanent access without renewals",
    onboardingPaywallWelcomeTitle: "🎉 Welcome!",
    onboardingPaywallWelcomeMessage:
      "Your subscription has been activated successfully. Enjoy all premium features!",
    onboardingPaywallContinue: "Continue",
    onboardingPaywallWhyChoose: "Why choose CarKeep?",
    onboardingPaywallSecurityGuaranteed: "Security guaranteed",
    onboardingPaywallAutoSync: "Automatic synchronization",
    onboardingPaywallSupport247: "24/7 support",
    onboardingPaywallContinuousImprovement: "Continuous improvement",

    // Free plan features
    onboardingFreeFeature1: "1 vehicle",
    onboardingFreeFeature2: "Basic maintenance",
    onboardingFreeFeature3: "Expense control",
    onboardingFreeFeature4: "Basic alerts",
    onboardingFreeFeature5: "Simple reports",

    // Premium plan features
    onboardingPremiumFeature1: "Unlimited vehicles",
    onboardingPremiumFeature2: "Share vehicles",
    onboardingPremiumFeature3: "Cloud backups",
    onboardingPremiumFeature4: "Export data",
    onboardingPremiumFeature5: "Advanced analytics",
    onboardingPremiumFeature6: "No ads",
    onboardingPremiumFeature7: "50 reminders",

    // Pro plan features
    onboardingProFeature1: "Everything from Premium",
    onboardingProFeature2: "Invite users",
    onboardingProFeature3: "Multiple users",
    onboardingProFeature4: "Priority support",
    onboardingProFeature5: "API integration",
    onboardingProFeature6: "Advanced reports",
    onboardingProFeature7: "Unlimited reminders",

    // Vehicle sharing
    pleaseCompleteAllRequiredFields: "Please complete all required fields",
    rejectInvitation: "❌ Reject invitation",
    reject: "Reject",
    inviteUser: "Invite User",
    emailPlaceholderExample: "example@email.com",
    writeCustomMessageForInvitation:
      "Write a custom message for the invitation...",
    sending: "Sending...",
    send: "Send",
    vehicleToShare: "Vehicle to share",
    cancelText: "Cancel",
    invitationSentSuccess: "🎉 Invitation sent!",
    invitationSentTo:
      "An invitation has been sent to {email} to share your {brand} {model}",
    errorSendingInvitation: "Error sending invitation",
    detailedError: "Detailed error",
    invitationAcceptedSuccess: "✅ Invitation accepted!",
    nowYouCanManage: "Now you can manage the {brand} {model}",
    couldNotAcceptInvitation: "Could not accept invitation",
    areYouSureReject:
      "Are you sure you want to reject the invitation for {brand} {model}?",
    cancel: "Cancel",
    invitationRejected: "Invitation rejected",
    couldNotRejectInvitation: "Could not reject invitation",
    shareManagementOfVehicles: "Invite users and share vehicle management",
    upgradeToPremiumOrPro:
      "Upgrade to Premium to share vehicles, or to Pro to invite users",
    vehiclesSharedWithMe: "Vehicles shared with me",
    sharedBy: "Shared by {name}",
    role: "Role: {role}",
    invitationsReceived: "Invitations received",
    from: "From: {name}",
    userEmail: "User email",
    userRole: "User role",
    viewOnly: "View only",
    editExpensesAndMaintenance: "Edit expenses and maintenance",
    totalControl: "Total control",
    canViewButNotEdit: "Can view information but not edit it",
    canAddAndEditExpensesMaintenance:
      "Can add and edit expenses and maintenance",
    canEditAllVehicleInfo: "Can edit all vehicle information",
    specificPermissions: "Specific permissions",
    editExpenses: "Edit expenses",
    editMaintenance: "Edit maintenance",
    uploadDocuments: "Upload documents",
    editVehicleInfo: "Edit vehicle information",
    messageOptional: "Message (optional)",

    // Vehicle stats
    unlimited: "Unlimited",
    vehicle: "Vehicle",
    vehicles: "Vehicles",

    // Notifications
    notificationsDisabled: "Notifications disabled",
    allScheduledNotificationsCancelled:
      "All scheduled notifications have been cancelled",

    // Charts
    expensesByCategory: "Expenses by category",
    fuelConsumption: "Fuel consumption (L/100km)",

    // Subscription
    oneTimePayment: "One-time payment",
    savePercent: "Save {percent}%",
    planNotAvailable: "Plan not available",
    perfect: "🎉 Perfect!",
    subscriptionActiveEnjoy:
      "Your subscription is active. Enjoy CarKeeper Pro!",
    purchaseCancelled: "Purchase cancelled",

    // Profile Messages
    couldNotActivatePro: "Could not activate PRO account. Please try again.",
    errorActivatingPro:
      "An error occurred while activating PRO account: {error}",
    onlyMoreTaps: "Only {count} more taps...",
    almostThere: "Almost there! One more tap...",
    accountDeleted: "Account deleted",
    accountDeletedSuccess:
      "Your account and all data have been successfully deleted.",
    couldNotDeleteAccount: "Could not delete account",
    success: "Success",
    notificationsEnabledSuccess: "Notifications enabled successfully",

    // Onboarding
    weeklyAccess: "Weekly access",
    perWeek: "per week",

    // Restore
    restored: "✅ Restored",
    purchasesRestored: "Your purchases have been restored.",

    // Sprint 2 - Font Scale
    fontSizeTitle: "Font size",
    fontSizePreview: "Text preview",
    darkModeEnabled: "Dark mode enabled",
    lightModeEnabled: "Light mode enabled",

    // Sprint 2 - Analytics Tabs
    summary: "Summary",
    maintenanceCostByMonth: "Maintenance cost by month",
    maintenanceByType: "Maintenance by type",
    totalCost: "Total cost",
    noDataAvailable: "No data available",

    // Sprint 2 - Recurring Expenses
    recurringExpense: "Recurring expense",
    recurringExpenses: "Recurring expenses",
    noRecurringExpenses: "No recurring expenses",
    noRecurringExpensesDescription: "Add expenses that repeat periodically for better tracking.",
    deleteRecurringExpense: "Delete recurring expense",
    deleteRecurringExpenseConfirm: "Are you sure you want to delete the recurring expense '{name}'?",
    weekly: "Weekly",
    monthly: "Monthly",
    bimonthly: "Bimonthly",
    quarterly: "Quarterly",
    semiannual: "Semiannual",
    annual: "Annual",
    frequency: "Frequency",

    // Sprint 2 - Maintenance Tips
    recommendation: "Recommendation",
    maintenanceOverdue: "Maintenance overdue",
    maintenanceUpcoming: "Maintenance upcoming",
    maintenanceOnTrack: "On track",

    // Sprint 2 - Feedback
    feedback: "Feedback",
    sendSuggestionsOrReportBugs: "Send suggestions or report bugs",
    feedbackType: "Feedback type",
    suggestion: "Suggestion",
    bug: "Bug",
    feature: "Feature",
    other: "Other",
    yourMessage: "Your message",
    feedbackPlaceholder: "Tell us about your experience, suggestion or issue...",
    rateExperience: "Rate your experience (optional)",
    sendFeedback: "Send feedback",
    sending: "Sending...",
    feedbackMessageRequired: "Please write a message",
    thankYou: "Thank you!",
    feedbackSent: "Your feedback has been sent successfully.",
    feedbackSendError: "Could not send feedback. Please try again.",
    previousFeedbacks: "Previous feedbacks",
    noPreviousFeedbacks: "You haven't sent any feedback yet",
    reviewed: "Reviewed",
  },
};

// Función para obtener traducción
export const t = (key, options = {}) => {
  const keys = key.split(".");
  // Obtener el idioma actual dinámicamente
  const currentLang = getCurrentLanguage();
  let value = translations[currentLang];

  for (const k of keys) {
    value = value?.[k];
  }

  if (!value) return key;

  // Reemplazar placeholders como {limit}, {name}, etc.
  if (typeof value === "string" && Object.keys(options).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
      return options[placeholder] !== undefined ? options[placeholder] : match;
    });
  }

  return value;
};

// Función para obtener el idioma actual
export const getLanguage = () => currentLanguage;

// Función para verificar si es español
export const isSpanish = () => currentLanguage === "es";

// Función para verificar si es inglés
export const isEnglish = () => currentLanguage === "en";

export default { t, getLanguage, isSpanish, isEnglish };
