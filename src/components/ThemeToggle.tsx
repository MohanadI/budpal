import React from 'react';
import { IconButton, Menu, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, theme } = useTheme();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    closeMenu();
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'white-balance-sunny';
      case 'dark':
        return 'moon-waning-crescent';
      case 'auto':
        return 'theme-light-dark';
      default:
        return 'theme-light-dark';
    }
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon={getIcon()}
          iconColor={theme.headerText}
          size={24}
          onPress={openMenu}
        />
      }
    >
      <Menu.Item
        onPress={() => handleThemeChange('light')}
        title={t('settings.lightTheme') || 'Light'}
        leadingIcon="white-balance-sunny"
        trailingIcon={themeMode === 'light' ? 'check' : undefined}
      />
      <Menu.Item
        onPress={() => handleThemeChange('dark')}
        title={t('settings.darkTheme') || 'Dark'}
        leadingIcon="moon-waning-crescent"
        trailingIcon={themeMode === 'dark' ? 'check' : undefined}
      />
      <Divider />
      <Menu.Item
        onPress={() => handleThemeChange('auto')}
        title={t('settings.autoTheme') || 'Auto'}
        leadingIcon="theme-light-dark"
        trailingIcon={themeMode === 'auto' ? 'check' : undefined}
      />
    </Menu>
  );
}

