import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  DataTable, 
  Text,
  Portal,
  Modal,
  TextInput,
  Surface
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../services/store';
import { Debt, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const DebtsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { 
    debts, 
    currentView, 
    isLoading, 
    error,
    setCurrentView,
    loadDebts,
    addDebt,
    updateDebt,
    deleteDebt
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    currency: 'USD',
    planned: '',
    actual: ''
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const handleAddDebt = () => {
    setEditingDebt(null);
    setFormData({
      title: '',
      date: '',
      currency: 'USD',
      planned: '',
      actual: ''
    });
    setModalVisible(true);
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      title: debt.title,
      date: debt.date,
      currency: debt.currency as string,
      planned: debt.planned.toString(),
      actual: debt.actual.toString()
    });
    setModalVisible(true);
  };

  const handleSaveDebt = async () => {
    if (!formData.title || !formData.date || !formData.planned || !formData.actual) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    const debtData = {
      title: formData.title,
      date: formData.date,
      currency: formData.currency as Currency,
      planned: parseFloat(formData.planned),
      actual: parseFloat(formData.actual)
    };

    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, debtData);
      } else {
        await addDebt(debtData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save debt');
    }
  };

  const handleDeleteDebt = (debt: Debt) => {
    Alert.alert(
      t('common.delete'),
      `Are you sure you want to delete "${debt.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteDebt(debt.id)
        }
      ]
    );
  };

  const getChartData = () => {
    const colors = [
      theme.warning,
      theme.expense,
      theme.error,
      theme.primary,
      theme.secondary,
      theme.info,
    ];
    
    return debts.map((debt, index) => ({
      name: debt.title.length > 10 ? debt.title.substring(0, 10) + '...' : debt.title,
      population: debt.actual,
      color: colors[index % colors.length],
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  if (isLoading && debts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <ViewToggle 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {error && (
          <Card style={[styles.errorCard, { backgroundColor: theme.surface, borderColor: theme.error, borderWidth: 1 }]}>
            <Card.Content>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {debts.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="credit-card" size={64} color={theme.textTertiary} />
              <Title style={[styles.emptyTitle, { color: theme.text }]}>{t('debts.noDebts')}</Title>
              <Paragraph style={[styles.emptyParagraph, { color: theme.textSecondary }]}>{t('debts.addFirstDebt')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddDebt}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                buttonColor={theme.primary}
              >
                {t('debts.addDebt')}
              </Button>
            </View>
          </Surface>
        ) : (
          <>
            {currentView === 'table' ? (
              <View style={styles.cardsContainer}>
                {debts.map((debt) => (
                  <Surface key={debt.id} style={[styles.debtCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.debtCardHeader}>
                      <View style={styles.debtCardTitleRow}>
                        <MaterialIcons name="credit-card" size={20} color={theme.warning} />
                        <Text style={[styles.debtCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {debt.title}
                        </Text>
                      </View>
                      <View style={styles.actionIcons}>
                        <Button mode="text" onPress={() => handleEditDebt(debt)} compact textColor={theme.primary} style={styles.actionIconButton} icon={() => <MaterialIcons name="edit" size={18} color={theme.primary} />}>{''}</Button>
                        <Button mode="text" onPress={() => handleDeleteDebt(debt)} compact textColor={theme.error} style={styles.actionIconButton} icon={() => <MaterialIcons name="delete" size={18} color={theme.error} />}>{''}</Button>
                      </View>
                    </View>
                    <View style={styles.debtCardContent}>
                      <View style={[styles.dateBadge, { backgroundColor: theme.surfaceVariant + '20' }]}>
                        <MaterialIcons name="event" size={16} color={theme.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{debt.date}</Text>
                      </View>
                      <View style={styles.amountRow}>
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('debts.totalDebt')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.text }]}>
                              {debt.planned.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {debt.currency}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('debts.paidSoFar')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.warning }]}>
                              {debt.actual.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {debt.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.remainingBadge, { 
                        backgroundColor: theme.warning + '15',
                        borderColor: theme.warning
                      }]}>
                        <MaterialIcons name="account-balance" size={16} color={theme.warning} />
                        <Text style={[styles.remainingText, { color: theme.warning }]}>
                          {(debt.planned - debt.actual).toFixed(2)} {debt.currency} {t('debts.remaining')}
                        </Text>
                      </View>
                    </View>
                  </Surface>
                ))}
              </View>
            ) : (
              <Surface style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.chartContent}>
                  <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.text }]}>
                    Debts Overview
                  </Text>
                  <View style={styles.chartContainer}>
                    <PieChart
                      data={getChartData()}
                      width={Dimensions.get('window').width - 60}
                      height={220}
                      chartConfig={{
                        color: (opacity = 1) => theme.textSecondary,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 10]}
                      absolute
                    />
                  </View>
                </View>
              </Surface>
            )}
          </>
        )}
      </ScrollView>

      <AddButton onPress={handleAddDebt} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.text }]}>
            {editingDebt ? t('debts.editDebt') : t('debts.addDebt')}
          </Text>
          
          <TextInput
            label={t('debts.debtTitle')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: theme.primary } }}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            textColor={theme.text}
          />

          <TextInput
            label={t('debts.dueDate')}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            style={styles.input}
            mode="outlined"
            theme={{ colors: { primary: theme.primary } }}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            textColor={theme.text}
          />

          <TextInput
            label={t('debts.totalDebt')}
            value={formData.planned}
            onChangeText={(text) => setFormData({ ...formData, planned: text })}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
            theme={{ colors: { primary: theme.primary } }}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            textColor={theme.text}
          />

          <TextInput
            label={t('debts.paidSoFar')}
            value={formData.actual}
            onChangeText={(text) => setFormData({ ...formData, actual: text })}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
            theme={{ colors: { primary: theme.primary } }}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            textColor={theme.text}
          />

          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
              buttonColor={theme.border}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveDebt}
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              buttonColor={theme.primary}
            >
              {t('common.save')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600' as const,
  },
  emptyParagraph: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  addButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 4,
  },
  errorCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
  },
  tableContent: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  chartContent: {
    padding: 16,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: '600' as const,
  },
  chartContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  debtCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  debtCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debtCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  debtCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionIconButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    margin: 0,
    padding: 0,
  },
  debtCardContent: {
    gap: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  amountGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  modalContent: {
    padding: 24,
    margin: 20,
    borderRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: '600' as const,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
});

export default DebtsScreen;
