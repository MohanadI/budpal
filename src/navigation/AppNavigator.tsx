import React, { useEffect } from 'react';
import { View, StyleSheet, I18nManager, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../services/store';
import { authService } from '../services/auth';
import { useTheme } from '../theme/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import LanguageToggle from '../components/LanguageToggle';
import LogoutButton from '../components/LogoutButton';
import ThemeToggle from '../components/ThemeToggle';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FixedExpensesScreen from '../screens/FixedExpensesScreen';
import DailyExpensesScreen from '../screens/DailyExpensesScreen';
import DebtsScreen from '../screens/DebtsScreen';
import IncomeScreen from '../screens/IncomeScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import OverviewScreen from '../screens/OverviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { t, i18n } = useTranslation();
  const { language } = useAppStore();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar';

  // Update RTL layout when language changes
  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Note: In Expo, RTL changes take effect immediately
    }
  }, [isRTL]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'FixedExpenses':
              iconName = 'home';
              break;
            case 'DailyExpenses':
              iconName = 'shopping-cart';
              break;
            case 'Debts':
              iconName = 'credit-card';
              break;
            case 'Income':
              iconName = 'trending-up';
              break;
            case 'Investments':
              iconName = 'account-balance';
              break;
            case 'Overview':
              iconName = 'dashboard';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        headerStyle: {
          backgroundColor: theme.headerBackground,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTintColor: theme.headerText,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: theme.headerText,
        },
        headerRight: () => (
          <View style={[styles.headerRight, isRTL && styles.headerRightRTL]}>
            <ThemeToggle />
            <LanguageToggle iconOnly />
            <LogoutButton />
          </View>
        ),
        tabBarStyle: {
          direction: isRTL ? 'rtl' : 'ltr',
          backgroundColor: theme.tabBarBackground,
          borderTopWidth: isDark ? 0 : 1,
          borderTopColor: theme.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          textAlign: isRTL ? 'right' : 'left',
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        sceneContainerStyle: {
          backgroundColor: theme.background,
        },
      })}
    >
      <Tab.Screen 
        name="FixedExpenses" 
        component={FixedExpensesScreen}
        options={{ title: t('navigation.fixedExpenses') }}
      />
      <Tab.Screen 
        name="DailyExpenses" 
        component={DailyExpensesScreen}
        options={{ title: t('navigation.dailyExpenses') }}
      />
      <Tab.Screen 
        name="Debts" 
        component={DebtsScreen}
        options={{ title: t('navigation.debts') }}
      />
      <Tab.Screen 
        name="Income" 
        component={IncomeScreen}
        options={{ title: t('navigation.income') }}
      />
      <Tab.Screen 
        name="Investments" 
        component={InvestmentsScreen}
        options={{ title: t('navigation.investments') }}
      />
      <Tab.Screen 
        name="Overview" 
        component={OverviewScreen}
        options={{ title: t('navigation.overview') }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  const { theme, isDark } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? theme.surface : theme.primary,
          elevation: isDark ? 0 : 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.1,
          shadowRadius: 4,
          borderBottomWidth: isDark ? 1 : 0,
          borderBottomColor: theme.border,
        },
        headerTintColor: isDark ? theme.text : '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, setUser, clearUser } = useAppStore();
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        setUser(authService.toAuthUser(user));
      } else {
        clearUser();
      }
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  if (initializing) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  headerRightRTL: {
    flexDirection: 'row-reverse',
    marginRight: 0,
    marginLeft: 8,
  },
});

export default AppNavigator;
