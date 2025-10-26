import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

interface LanguageToggleProps {
  iconOnly?: boolean;
}

export default function LanguageToggle({ iconOnly = false }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    closeMenu();
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'ar' ? 'العربية' : 'English';
  };

  if (iconOnly) {
    return (
      <View style={styles.container}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            <Button onPress={openMenu} mode="text">
              <MaterialIcons name="language" size={24} color="#fff" />
            </Button>
          }
        >
          <Menu.Item
            onPress={() => changeLanguage('en')}
            title="English"
            leadingIcon={i18n.language === 'en' ? 'check' : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => changeLanguage('ar')}
            title="العربية"
            leadingIcon={i18n.language === 'ar' ? 'check' : undefined}
          />
        </Menu>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            onPress={openMenu}
            mode="outlined"
            icon="translate"
            style={styles.button}
          >
            {getCurrentLanguageLabel()}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => changeLanguage('en')}
          title="English"
          leadingIcon={i18n.language === 'en' ? 'check' : undefined}
        />
        <Divider />
        <Menu.Item
          onPress={() => changeLanguage('ar')}
          title="العربية"
          leadingIcon={i18n.language === 'ar' ? 'check' : undefined}
        />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
  },
  button: {
    borderColor: '#2196F3',
  },
});

