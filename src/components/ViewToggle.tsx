import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ViewType } from '../types';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={currentView}
        onValueChange={onViewChange}
        buttons={[
          {
            value: 'table',
            label: t('common.table'),
            icon: 'table',
          },
          {
            value: 'chart',
            label: t('common.chart'),
            icon: 'chart-line',
          },
        ]}
        style={styles.segmentedButtons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  segmentedButtons: {
    backgroundColor: '#f5f5f5',
  },
});

export default ViewToggle;
