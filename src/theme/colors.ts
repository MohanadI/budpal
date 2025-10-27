// Theme colors for BudPal app
export const lightTheme = {
  // Primary colors - Modern blue
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  // Secondary colors
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  // Background colors - Clean light theme
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#F1F3F5',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Card colors
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Income/Expense colors
  income: '#10B981',
  expense: '#EF4444',
  
  // Gradient colors
  gradientStart: '#3B82F6',
  gradientEnd: '#60A5FA',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#6B7280',
  
  // Header
  headerBackground: '#FFFFFF',
  headerText: '#1F2937',
};

export const darkTheme = {
  // Primary colors - Modern blue
  primary: '#60A5FA',
  primaryDark: '#3B82F6',
  primaryLight: '#93C5FD',
  
  // Secondary colors
  secondary: '#34D399',
  secondaryDark: '#10B981',
  secondaryLight: '#6EE7B7',
  
  // Background colors - Modern dark theme
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  
  // Status colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Card colors
  card: '#1E293B',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  
  // Border colors
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  
  // Income/Expense colors
  income: '#34D399',
  expense: '#F87171',
  
  // Gradient colors
  gradientStart: '#1E293B',
  gradientEnd: '#334155',
  
  // Tab bar
  tabBarBackground: '#1E293B',
  tabBarActive: '#60A5FA',
  tabBarInactive: '#64748B',
  
  // Header
  headerBackground: '#1E293B',
  headerText: '#F8FAFC',
};

export type Theme = typeof lightTheme;

