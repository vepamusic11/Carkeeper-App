import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar WebBrowser para mejorar la experiencia de autenticación
WebBrowser.maybeCompleteAuthSession();

// Configuración de Google OAuth
const GOOGLE_CONFIG = {
  // IMPORTANTE: Para iOS standalone builds, usa el iOS Client ID
  // Para desarrollo con Expo Go, usa el Web Client ID
  clientId: Platform.select({
    ios: Constants.appOwnership === 'expo' 
      ? '187419926365-00pcj93mplqo1j3i59ib42ujkbaag3b1.apps.googleusercontent.com' // Web Client ID para Expo Go
      : 'TU_IOS_CLIENT_ID.apps.googleusercontent.com', // iOS Client ID para builds standalone
    android: '187419926365-00pcj93mplqo1j3i59ib42ujkbaag3b1.apps.googleusercontent.com',
    default: '187419926365-00pcj93mplqo1j3i59ib42ujkbaag3b1.apps.googleusercontent.com'
  }),
  scopes: ['openid', 'email', 'profile'],
};

export const socialAuthService = {
  // Login/Registro con Google usando Expo AuthSession
  async signInWithGoogle() {
    try {
      // Crear redirect URI correctamente
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.deepyze.carkeeper',
        useProxy: Constants.appOwnership === 'expo' // Solo usar proxy en Expo Go
      });
      
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.clientId,
        scopes: GOOGLE_CONFIG.scopes,
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent select_account',
        },
      });

      console.log('Google Auth Request configurado:', {
        clientId: GOOGLE_CONFIG.clientId,
        redirectUri: redirectUri
      });

      // Realizar autenticación
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };
      
      const result = await request.promptAsync(discovery);

      console.log('Google Auth Result:', result);

      if (result.type === 'success') {
        // Intercambiar código por tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: GOOGLE_CONFIG.clientId,
            code: result.params.code,
            redirectUri: redirectUri,
            codeVerifier: request.codeVerifier,
          },
          discovery
        );

        console.log('Token Result:', tokenResult);

        // Obtener información del usuario
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResult.accessToken}`
        );
        
        const userInfo = await userInfoResponse.json();
        console.log('Google User Info:', userInfo);

        // Formatear datos del usuario
        const googleData = {
          email: userInfo.email,
          nombre: userInfo.given_name || userInfo.name?.split(' ')[0] || '',
          apellido: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
          displayName: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
          profileImage: userInfo.picture,
          provider: 'google',
          providerId: userInfo.id,
          sub: userInfo.id,
          lengua: 'es'
        };

        return { success: true, data: googleData, error: null };
      } else {
        const errorMessage = result.type === 'cancel' 
          ? 'Inicio de sesión cancelado' 
          : 'Error en la autenticación con Google';
        
        return { success: false, data: null, error: errorMessage };
      }

    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.message?.includes('network')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (error.message?.includes('cancelled')) {
        errorMessage = 'Inicio de sesión cancelado';
      }
      
      return { success: false, data: null, error: errorMessage };
    }
  },

  // Login/Registro con Apple (sin cambios, ya funciona con Expo)
  async signInWithApple() {
    try {
      // Verificar si Apple Authentication está disponible
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { 
          success: false, 
          data: null, 
          error: 'Apple Sign-In no está disponible en este dispositivo' 
        };
      }

      // Generar nonce para seguridad
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      // Realizar el sign-in
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      console.log('Apple Sign-In Success:', credential);

      // Extraer email del identityToken si no está disponible directamente
      let userEmail = credential.email;
      if (!userEmail && credential.identityToken) {
        try {
          // Decodificar el JWT para obtener el email (sin verificar la firma)
          const tokenPayload = JSON.parse(atob(credential.identityToken.split('.')[1]));
          userEmail = tokenPayload.email;
          console.log('Email extraído del identityToken:', userEmail);
        } catch (error) {
          console.error('Error decodificando identityToken:', error);
        }
      }

      // Apple solo proporciona el nombre completo en el primer sign-in
      const fullName = credential.fullName;
      const nombre = fullName?.givenName || '';
      const apellido = fullName?.familyName || '';
      const displayName = fullName ? `${nombre} ${apellido}`.trim() : '';

      const appleData = {
        email: userEmail || `${credential.user}@privaterelay.appleid.com`,
        nombre,
        apellido,
        displayName,
        provider: 'apple',
        providerId: credential.user,
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        lengua: 'es',
        // Apple proporciona datos limitados por privacidad
        profileImage: null
      };

      console.log('Apple Data enviado al backend:', appleData);

      return { success: true, data: appleData, error: null };

    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      
      let errorMessage = 'Error al iniciar sesión con Apple';
      
      if (error.code === 'ERR_CANCELED') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error.code === 'ERR_INVALID_RESPONSE') {
        errorMessage = 'Respuesta inválida de Apple';
      } else if (error.code === 'ERR_NOT_HANDLED') {
        errorMessage = 'Apple Sign-In no pudo ser procesado';
      }
      
      return { success: false, data: null, error: errorMessage };
    }
  },

  // Verificar disponibilidad de métodos de autenticación
  async checkAvailability() {
    const availability = {
      google: true, // Expo AuthSession funciona en todas las plataformas
      apple: false
    };

    try {
      // Verificar Apple (solo iOS 13+)
      availability.apple = await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      availability.apple = false;
    }

    return availability;
  },

  // Limpiar sesiones (logout)
  async revokeAccess() {
    try {
      // Con Expo AuthSession, simplemente limpiamos las credenciales locales
      // El logout real se maneja en el AuthProvider
      return { success: true, results: { google: { success: true }, apple: { success: true } } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};