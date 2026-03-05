import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LogBox, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import { useTheme } from './src/hooks/useTheme';
import { t } from './src/utils/i18n';

// Providers
import { AuthProvider } from './src/context/AuthProvider';
import { VehiculosProvider } from './src/context/VehiculosProvider';
import { MantenimientosProvider } from './src/context/MantenimientosProvider';
import { GastosProvider } from './src/context/GastosProvider';
import { SubscriptionProvider } from './src/context/SubscriptionProvider';
import { DocumentsProvider } from './src/context/DocumentsProvider';
import { NotificationsProvider } from './src/context/NotificationsProvider';
import { ThemeProvider } from './src/context/ThemeProvider';
import { GastosRecurrentesProvider } from './src/context/GastosRecurrentesProvider';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Vehicle Screens
import VehicleListScreen from './src/screens/vehicles/VehicleListScreen';
import AddVehicleScreen from './src/screens/vehicles/AddVehicleScreen';
import VehicleDetailScreen from './src/screens/vehicles/VehicleDetailScreen';

// Maintenance Screens
import MaintenanceListScreen from './src/screens/maintenance/MaintenanceListScreen';
import AddMaintenanceScreen from './src/screens/maintenance/AddMaintenanceScreen';
import MaintenanceDetailScreen from './src/screens/maintenance/MaintenanceDetailScreen';

// Expense Screens
import ExpensesScreen from './src/screens/expenses/ExpensesScreen';
import AddExpenseScreen from './src/screens/expenses/AddExpenseScreen';
import ExpenseDetailScreen from './src/screens/expenses/ExpenseDetailScreen';
import RecurringExpensesScreen from './src/screens/expenses/RecurringExpensesScreen';

// Document Screens
import DocumentsScreen from './src/screens/documents/DocumentsScreen';
import AddDocumentScreen from './src/screens/documents/AddDocumentScreen';

// Analytics & Export Screens
import AnalyticsScreen from './src/screens/analytics/AnalyticsScreen';
import ExportScreen from './src/screens/export/ExportScreen';

// Profile & Subscription Screens
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import HelpCenterScreen from './src/screens/profile/HelpCenterScreen';
import PrivacyPolicyScreen from './src/screens/profile/PrivacyPolicyScreen';
import FeedbackScreen from './src/screens/profile/FeedbackScreen';
import SubscriptionScreen from './src/screens/subscription/SubscriptionScreen';
import VehicleSharingScreen from './src/screens/sharing/VehicleSharingScreen';

// Onboarding Screens
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import OnboardingPaywallScreen from './src/screens/onboarding/OnboardingPaywallScreen';
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';

// Utils
import useAuth from './src/hooks/useAuth';
import LoadingScreen from './src/components/LoadingScreen';
import ErrorBoundary from './src/components/ErrorBoundary';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted',
  'Reanimated 2',
  'Constants.deviceYearClass',
  'Possible Unhandled Promise Rejection',
  'Setting a timer',
  'source.uri should not be an empty string'
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createStackNavigator();
const OnboardingStack = createStackNavigator();

function OnboardingNavigator() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  const initialRouteName = hasSeenOnboarding === true ? 'Welcome' : 'Onboarding';

  if (hasSeenOnboarding === null) {
    return <LoadingScreen message={t('loading')} />;
  }

  return (
    <OnboardingStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <OnboardingStack.Screen name="Onboarding" component={OnboardingScreen} />
      <OnboardingStack.Screen name="OnboardingPaywall" component={OnboardingPaywallScreen} />
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Login" component={LoginScreen} />
      <OnboardingStack.Screen name="Register" component={RegisterScreen} />
      <OnboardingStack.Screen name="Auth" component={AuthNavigator} />
    </OnboardingStack.Navigator>
  );
}

function AuthNavigator() {
  const { colors } = useTheme();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Vehicles') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Maintenance') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Vehicles" 
        component={VehicleStackNavigator}
        options={{ tabBarLabel: t('vehicles') }}
      />
      <Tab.Screen 
        name="Maintenance" 
        component={MaintenanceStackNavigator}
        options={{ tabBarLabel: t('maintenance') }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpenseStackNavigator}
        options={{ tabBarLabel: t('expenses') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ tabBarLabel: t('profile') }}
      />
    </Tab.Navigator>
  );
}

function VehicleStackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="VehicleList" component={VehicleListScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}

function MaintenanceStackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="MaintenanceList" component={MaintenanceListScreen} />
      <Stack.Screen name="AddMaintenance" component={AddMaintenanceScreen} />
      <Stack.Screen name="MaintenanceDetail" component={MaintenanceDetailScreen} />
    </Stack.Navigator>
  );
}

function ExpenseStackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="ExpensesList" component={ExpensesScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
      <Stack.Screen name="RecurringExpenses" component={RecurringExpensesScreen} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="VehicleSharing" component={VehicleSharingScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Export" component={ExportScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}

// Temporary placeholder screen
function PlaceholderScreen() {
  return null;
}

function RootNavigator() {
  const {
    isAuthenticated,
    loading,
    user,
    subscriptionChecked,
    needsPaywall
  } = useAuth();
  const { isDarkMode, colors } = useTheme();

  const navigationTheme = isDarkMode ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.primary },
  };

  // Mostrar loading mientras se autentica o se verifica suscripción
  if (loading || (isAuthenticated && !subscriptionChecked)) {
    const message = isAuthenticated ? t('checkingSubscription') : t('startingCarKeeper');
    return <LoadingScreen message={message} />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Usuario no autenticado → Mostrar onboarding/login
          <Stack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
        ) : needsPaywall ? (
          // Usuario autenticado pero SIN suscripción → Paywall obligatorio
          <Stack.Screen
            name="MandatoryPaywall"
            component={SubscriptionScreen}
            options={{
              gestureEnabled: false, // No puede deslizar para cerrar
              headerShown: false,
            }}
          />
        ) : (
          // Usuario autenticado CON suscripción → App principal
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}

        {/* Subscription screen como modal (para upgrades desde dentro de la app) */}
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: true
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <NotificationsProvider>
                  <VehiculosProvider>
                    <MantenimientosProvider>
                      <GastosProvider>
                        <GastosRecurrentesProvider>
                          <DocumentsProvider>
                            <RootNavigator />
                          </DocumentsProvider>
                        </GastosRecurrentesProvider>
                      </GastosProvider>
                    </MantenimientosProvider>
                  </VehiculosProvider>
                </NotificationsProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
