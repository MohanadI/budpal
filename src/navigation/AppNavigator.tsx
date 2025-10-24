import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../services/store';

// Import screens
import FixedExpensesScreen from '../screens/FixedExpensesScreen';
import DailyExpensesScreen from '../screens/DailyExpensesScreen';
import DebtsScreen from '../screens/DebtsScreen';
import IncomeScreen from '../screens/IncomeScreen';
import InvestmentsScreen from '../screens/InvestmentsScreen';
import OverviewScreen from '../screens/OverviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  const { language } = useAppStore();

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
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          direction: language === 'ar' ? 'rtl' : 'ltr',
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

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
