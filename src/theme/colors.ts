// Theme colors for BudPal app
export const lightTheme = {
  // Primary colors
  primary: '#6C5CE7',
  primaryDark: '#5F3DC4',
  primaryLight: '#A29BFE',
  
  // Secondary colors
  secondary: '#00B894',
  secondaryDark: '#00997A',
  secondaryLight: '#55EFC4',
  
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F5',
  
  // Text colors
  text: '#2D3436',
  textSecondary: '#636E72',
  textTertiary: '#B2BEC3',
  
  // Status colors
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',
  
  // Card colors
  card: '#FFFFFF',
  cardShadow: 'rgba(45, 52, 54, 0.1)',
  
  // Border colors
  border: '#DFE6E9',
  borderLight: '#F1F3F5',
  
  // Income/Expense colors
  income: '#00B894',
  expense: '#FF7675',
  
  // Gradient colors
  gradientStart: '#6C5CE7',
  gradientEnd: '#A29BFE',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#6C5CE7',
  tabBarInactive: '#B2BEC3',
  
  // Header
  headerBackground: '#6C5CE7',
  headerText: '#FFFFFF',
};

export const darkTheme = {
  // Primary colors
  primary: '#A29BFE',
  primaryDark: '#6C5CE7',
  primaryLight: '#D1CCFF',
  
  // Secondary colors
  secondary: '#55EFC4',
  secondaryDark: '#00B894',
  secondaryLight: '#81ECDB',
  
  // Background colors
  background: '#0F1419',
  surface: '#1A1F2E',
  surfaceVariant: '#252B3B',
  
  // Text colors
  text: '#E8EAED',
  textSecondary: '#B2BAC2',
  textTertiary: '#6C7589',
  
  // Status colors
  success: '#55EFC4',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',
  
  // Card colors
  card: '#1A1F2E',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  
  // Border colors
  border: '#2C3446',
  borderLight: '#252B3B',
  
  // Income/Expense colors
  income: '#55EFC4',
  expense: '#FF7675',
  
  // Gradient colors
  gradientStart: '#6C5CE7',
  gradientEnd: '#A29BFE',
  
  // Tab bar
  tabBarBackground: '#1A1F2E',
  tabBarActive: '#A29BFE',
  tabBarInactive: '#6C7589',
  
  // Header
  headerBackground: '#1A1F2E',
  headerText: '#E8EAED',
};

export type Theme = typeof lightTheme;

