// Configuración para autenticación social
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales

export const GOOGLE_CONFIG = {
  // Web Client ID desde Google Cloud Console
  webClientId: '187419926365-00pcj93mplqo1j3i59ib42ujkbaag3b1.apps.googleusercontent.com',
  
  // iOS Client ID (opcional, desde Google Cloud Console)
  iosClientId: '187419926365-00pcj93mplqo1j3i59ib42ujkbaag3b1.apps.googleusercontent.com',
  
  // Android Client ID (se obtiene automáticamente del SHA-1)
  // androidClientId: 'TU_ANDROID_CLIENT_ID.googleusercontent.com',
  
  // Configuraciones adicionales
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
};

export const APPLE_CONFIG = {
  // Configuraciones de Apple Sign-In
  // Los valores se configuran automáticamente basándose en tu Bundle ID
  // No necesitas cambiar nada aquí a menos que tengas configuraciones específicas
  
  requestedScopes: [
    'email',
    'fullName'
  ]
};

// INSTRUCCIONES PARA CONFIGURAR:

/*
## GOOGLE SIGN-IN SETUP:

1. Ve a Google Cloud Console (https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Sign-In API
4. Ve a "Credenciales" y crea:
   - OAuth 2.0 Client ID para Web application
   - OAuth 2.0 Client ID para iOS (si usas iOS)
   - OAuth 2.0 Client ID para Android (si usas Android)

5. Para Android, necesitarás el SHA-1 fingerprint:
   - Desarrollo: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   - Producción: keytool -list -v -keystore tu-keystore.jks -alias tu-alias

6. Reemplaza 'TU_WEB_CLIENT_ID' con tu Web Client ID real

## APPLE SIGN-IN SETUP:

1. Ve a Apple Developer Portal (https://developer.apple.com/)
2. Configura Sign in with Apple capability en tu App ID
3. En Xcode, agrega "Sign in with Apple" capability
4. El Bundle ID debe coincidir con el configurado en Apple Developer

## EXPO SETUP:

Si usas Expo, agrega a tu app.json:

{
  "expo": {
    "plugins": [
      "@react-native-google-signin/google-signin",
      "expo-apple-authentication"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "usesAppleSignIn": true
    }
  }
}

Y descarga:
- google-services.json (para Android) desde Firebase Console
- GoogleService-Info.plist (para iOS) desde Firebase Console
*/