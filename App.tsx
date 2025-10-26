import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./src/utils/i18n";
import AppNavigator from "./src/navigation/AppNavigator";
import i18n from "./src/utils/i18n";
import { ThemeProvider } from "./src/theme/ThemeContext";

export default function App() {
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
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
