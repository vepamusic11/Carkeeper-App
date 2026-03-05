import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 / standard Android)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Width percentage - scales size based on screen width
 * @param {number} size - base size to scale
 * @returns {number} scaled size
 */
export const wp = (size) => {
  return (size / BASE_WIDTH) * SCREEN_WIDTH;
};

/**
 * Height percentage - scales size based on screen height
 * @param {number} size - base size to scale
 * @returns {number} scaled size
 */
export const hp = (size) => {
  return (size / BASE_HEIGHT) * SCREEN_HEIGHT;
};

/**
 * Moderate scale - scales with a factor to avoid extreme scaling
 * Best for font sizes
 * @param {number} size - base size to scale
 * @param {number} factor - scaling factor (0 = no scale, 1 = full scale)
 * @returns {number} scaled size
 */
export const ms = (size, factor = 0.5) => {
  return size + (wp(size) - size) * factor;
};
