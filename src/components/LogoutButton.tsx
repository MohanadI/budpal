import React from 'react';
import { Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';
import { useStore } from '../services/store';

export default function LogoutButton() {
  const { t } = useTranslation();
  const clearUser = useStore((state) => state.clearUser);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logoutTitle') || 'Logout',
      t('settings.logoutMessage') || 'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('settings.logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.logout();
              clearUser();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <IconButton
      icon="logout"
      iconColor="#fff"
      size={24}
      onPress={handleLogout}
      disabled={loading}
    />
  );
}

