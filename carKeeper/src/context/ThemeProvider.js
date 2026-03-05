import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

export const CURRENCIES = [
  { code: 'ARS', symbol: '$', flag: '\u{1F1E6}\u{1F1F7}', name: 'Peso Argentino' },
  { code: 'USD', symbol: '$', flag: '\u{1F1FA}\u{1F1F8}', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20AC', flag: '\u{1F1EA}\u{1F1FA}', name: 'Euro' },
  { code: 'MXN', symbol: '$', flag: '\u{1F1F2}\u{1F1FD}', name: 'Peso Mexicano' },
  { code: 'BRL', symbol: 'R$', flag: '\u{1F1E7}\u{1F1F7}', name: 'Real Brasileiro' },
  { code: 'CLP', symbol: '$', flag: '\u{1F1E8}\u{1F1F1}', name: 'Peso Chileno' },
  { code: 'COP', symbol: '$', flag: '\u{1F1E8}\u{1F1F4}', name: 'Peso Colombiano' },
  { code: 'PEN', symbol: 'S/', flag: '\u{1F1F5}\u{1F1EA}', name: 'Sol Peruano' },
  { code: 'UYU', symbol: '$U', flag: '\u{1F1FA}\u{1F1FE}', name: 'Peso Uruguayo' },
  { code: 'GBP', symbol: '\u00A3', flag: '\u{1F1EC}\u{1F1E7}', name: 'British Pound' },
  { code: 'PYG', symbol: '\u20B2', flag: '\u{1F1F5}\u{1F1FE}', name: 'Guaran\u00ED' },
  { code: 'BOB', symbol: 'Bs', flag: '\u{1F1E7}\u{1F1F4}', name: 'Boliviano' },
];

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScaleState] = useState('medium'); // 'small' | 'medium' | 'large'
  const [currency, setCurrencyState] = useState('ARS');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedTheme, savedFontScale, savedCurrency] = await Promise.all([
        AsyncStorage.getItem('isDarkMode'),
        AsyncStorage.getItem('fontScale'),
        AsyncStorage.getItem('currency')
      ]);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
      if (savedFontScale !== null) {
        setFontScaleState(savedFontScale);
      }
      if (savedCurrency !== null) {
        setCurrencyState(savedCurrency);
      }
    } catch (error) {
      // silently fail
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (error) {
      // silently fail
    }
  };

  const setFontScale = async (scale) => {
    try {
      setFontScaleState(scale);
      await AsyncStorage.setItem('fontScale', scale);
    } catch (error) {
      // silently fail
    }
  };

  const setCurrency = async (code) => {
    try {
      setCurrencyState(code);
      await AsyncStorage.setItem('currency', code);
    } catch (error) {
      // silently fail
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        fontScale,
        setFontScale,
        currency,
        setCurrency
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};