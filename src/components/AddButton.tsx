import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface AddButtonProps {
  onPress: () => void;
  testID?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onPress, testID }) => {
  const { t } = useTranslation();

  return (
    <FAB
      style={styles.fab}
      icon="plus"
      label={t('common.add')}
      onPress={onPress}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default AddButton;
