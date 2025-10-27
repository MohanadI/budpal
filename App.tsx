import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { I18nManager, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./src/utils/i18n";
import AppNavigator from "./src/navigation/AppNavigator";
import i18n from "./src/utils/i18n";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

function AppContent() {
  const { isDark, theme } = useTheme();
  
  useEffect(() => {
    // Enable RTL for Arabic
    const isRTL = i18n.language === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    // Listen for language changes
    const handleLanguageChange = (lang: string) => {
      const shouldBeRTL = lang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
      }
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.background} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
