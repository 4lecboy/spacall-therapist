import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  background: '#FAFAF9', // Warm Cream
  primary: '#C5A059',    // Metallic Gold
  secondary: '#2B2A29',  // Deep Charcoal
  muted: '#5C5B57',      // Warm Grey
  white: '#FFFFFF',
  border: '#E5E5E0',
  success: '#2E7D32',
  danger: '#C62828',
  goldLight: '#F3EAD3',
};

export const SIZES = {
  base: 8,
  padding: 24,
  radius: 12,
  h1: 32,
  h2: 24,
  h3: 18,
  body: 15,
  small: 13,
  width,
  height,
};

export const FONTS = {
  heading: 'PlayfairDisplay_700Bold',
  body: 'Lato_400Regular',
  bodyBold: 'Lato_700Bold',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
};