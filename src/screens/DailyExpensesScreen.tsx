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
import { DailyExpense, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const DailyExpensesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { 
    dailyExpenses, 
    currentView, 
    isLoading, 
    error,
    setCurrentView,
    loadDailyExpenses,
    addDailyExpense,
    updateDailyExpense,
    deleteDailyExpense
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    currency: 'USD',
    planned: '',
    actual: ''
  });

  useEffect(() => {
    loadDailyExpenses();
  }, []);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      currency: 'USD',
      planned: '',
      actual: ''
    });
    setModalVisible(true);
  };

  const handleEditExpense = (expense: DailyExpense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      currency: expense.currency as string,
      planned: expense.planned.toString(),
      actual: expense.actual.toString()
    });
    setModalVisible(true);
  };

  const handleSaveExpense = async () => {
    if (!formData.title || !formData.planned || !formData.actual) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    const expenseData = {
      title: formData.title,
      currency: formData.currency as Currency,
      planned: parseFloat(formData.planned),
      actual: parseFloat(formData.actual)
    };

    try {
      if (editingExpense) {
        await updateDailyExpense(editingExpense.id, expenseData);
      } else {
        await addDailyExpense(expenseData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save expense');
    }
  };

  const handleDeleteExpense = (expense: DailyExpense) => {
    Alert.alert(
      t('common.delete'),
      `Are you sure you want to delete "${expense.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteDailyExpense(expense.id)
        }
      ]
    );
  };

  const getChartData = () => {
    const colors = [
      theme.expense,
      theme.error,
      theme.warning,
      theme.primary,
      theme.secondary,
      theme.info,
    ];
    
    return dailyExpenses.map((expense, index) => ({
      name: expense.title.length > 10 ? expense.title.substring(0, 10) + '...' : expense.title,
      population: expense.actual,
      color: colors[index % colors.length],
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  if (isLoading && dailyExpenses.length === 0) {
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

        {dailyExpenses.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="shopping-cart" size={64} color={theme.textTertiary} />
              <Title style={[styles.emptyTitle, { color: theme.text }]}>{t('dailyExpenses.noExpenses')}</Title>
              <Paragraph style={[styles.emptyParagraph, { color: theme.textSecondary }]}>{t('dailyExpenses.addFirstExpense')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddExpense}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                buttonColor={theme.primary}
              >
                {t('dailyExpenses.addExpense')}
              </Button>
            </View>
          </Surface>
        ) : (
          <>
            {currentView === 'table' ? (
              <View style={styles.cardsContainer}>
                {dailyExpenses.map((expense) => (
                  <Surface key={expense.id} style={[styles.expenseCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.expenseCardHeader}>
                      <View style={styles.expenseCardTitleRow}>
                        <MaterialIcons name="shopping-cart" size={20} color={theme.expense} />
                        <Text style={[styles.expenseCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {expense.title}
                        </Text>
                      </View>
                      <View style={styles.actionIcons}>
                        <Button mode="text" onPress={() => handleEditExpense(expense)} compact textColor={theme.primary} style={styles.actionIconButton} icon={() => <MaterialIcons name="edit" size={18} color={theme.primary} />}>{''}</Button>
                        <Button mode="text" onPress={() => handleDeleteExpense(expense)} compact textColor={theme.error} style={styles.actionIconButton} icon={() => <MaterialIcons name="delete" size={18} color={theme.error} />}>{''}</Button>
                      </View>
                    </View>
                    <View style={styles.expenseCardContent}>
                      <View style={styles.amountRow}>
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('common.planned')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.text }]}>
                              {expense.planned.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {expense.currency}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('common.actual')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.expense }]}>
                              {expense.actual.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {expense.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.remainingBadge, { 
                        backgroundColor: expense.remaining >= 0 ? theme.income + '15' : theme.error + '15',
                        borderColor: expense.remaining >= 0 ? theme.income : theme.error
                      }]}>
                        <MaterialIcons name={expense.remaining >= 0 ? 'check-circle' : 'warning'} size={16} color={expense.remaining >= 0 ? theme.income : theme.error} />
                        <Text style={[styles.remainingText, { 
                          color: expense.remaining >= 0 ? theme.income : theme.error 
                        }]}>
                          {expense.remaining.toFixed(2)} {expense.currency} {t('common.remaining')}
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
                    Daily Expenses Overview
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

      <AddButton onPress={handleAddExpense} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.text }]}>
            {editingExpense ? t('dailyExpenses.editExpense') : t('dailyExpenses.addExpense')}
          </Text>
          
          <TextInput
            label={t('dailyExpenses.expenseTitle')}
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
            label={t('dailyExpenses.plannedAmount')}
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
            label={t('dailyExpenses.actualAmount')}
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
              onPress={handleSaveExpense}
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
  remainingText: {
    fontSize: 14,
    fontWeight: '700' as const,
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
  expenseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  expenseCardTitle: {
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
  expenseCardContent: {
    gap: 12,
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

export default DailyExpensesScreen;
