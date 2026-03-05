import axios from "axios";
import { Alert } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// En Expo, accede a las variables de entorno con el prefijo EXPO_PUBLIC_
const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 
                                Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
                                Constants.manifest?.extra?.EXPO_PUBLIC_BACKEND_URL;

if (!EXPO_PUBLIC_BACKEND_URL) {
    console.error("❌ No se encontró la URL del backend");
}

const clienteAxios = axios.create({
    baseURL: `${EXPO_PUBLIC_BACKEND_URL}/api`,
    timeout: 15000, // 15 segundos máximo por request
});

// Interceptor para agregar el token automáticamente
clienteAxios.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error al obtener el token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta para manejar rate limiting
clienteAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Rate limiting: retry con backoff exponencial
        if (error.response?.status === 429) {
            const config = error.config;
            config.__retryCount = config.__retryCount || 0;

            if (config.__retryCount < 3) {
                config.__retryCount += 1;
                const delay = Math.pow(2, config.__retryCount) * 1000; // 2s, 4s, 8s
                await new Promise(resolve => setTimeout(resolve, delay));
                return clienteAxios(config);
            }

            Alert.alert(
                'Demasiadas peticiones',
                'Por favor, intenta nuevamente en unos segundos.'
            );
        }

        return Promise.reject(error);
    }
);

export default clienteAxios;