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

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScaleState] = useState('medium'); // 'small' | 'medium' | 'large'

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedTheme, savedFontScale] = await Promise.all([
        AsyncStorage.getItem('isDarkMode'),
        AsyncStorage.getItem('fontScale')
      ]);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
      if (savedFontScale !== null) {
        setFontScaleState(savedFontScale);
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

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        fontScale,
        setFontScale
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};