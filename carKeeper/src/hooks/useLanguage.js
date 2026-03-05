import { useState, useEffect } from 'react';
import { getCurrentLanguage, setLanguage } from '../utils/i18n';

const useLanguage = () => {
  const [currentLanguage, setCurrentLanguageState] = useState(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);

  // Función para cambiar el idioma
  const changeLanguage = async (newLanguage) => {
    if (newLanguage === currentLanguage) return;
    
    setIsLoading(true);
    try {
      const success = await setLanguage(newLanguage);
      if (success) {
        setCurrentLanguageState(newLanguage);
        return { success: true };
      } else {
        return { success: false, error: 'No se pudo cambiar el idioma' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener el nombre del idioma actual
  const getCurrentLanguageName = () => {
    return currentLanguage === 'es' ? 'Español' : 'English';
  };

  // función para obtener los idiomas disponibles
  const getAvailableLanguages = () => {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  };

  return {
    currentLanguage,
    currentLanguageName: getCurrentLanguageName(),
    availableLanguages: getAvailableLanguages(),
    changeLanguage,
    isLoading
  };
};

export default useLanguage;