// spacall-client/constants/theme.ts AND spacall-therapist/constants/theme.ts
import { Platform } from 'react-native';

export const COLORS = {
  background: '#FAFAF9', // Warm Cream
  primary: '#C5A059',    // Metallic Gold (Buttons/Accents)
  textMain: '#2B2A29',   // Deep Charcoal (Headings)
  textMuted: '#5C5B57',  // Warm Grey (Body text)
  white: '#FFFFFF',      // Pure white for cards on cream bg
  success: '#28a745',    // Keep green for success states
  danger: '#dc3545',     // Keep red for errors/logout
};

export const SIZES = {
  radius: 8, // rounded-lg (0.5rem roughly equals 8px in RN)
  padding: 20,
};

export const FONTS = {
  // Simple way to get Serif vs Sans without installing custom fonts yet
  heading: {
    fontWeight: 'bold' as 'bold',
    fontSize: 24,
    color: COLORS.textMain,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  body: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
};

// Common shadow style for cards
export const SHADOW = {
  elevation: 5,
  shadowColor: COLORS.textMain,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
};