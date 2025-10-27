import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  DataTable, 
  Chip,
  Text,
  Portal,
  Modal,
  TextInput,
  HelperText,
  Surface
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../services/store';
import { FixedExpense, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const FixedExpensesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { 
    fixedExpenses, 
    currentView, 
    isLoading, 
    error,
    setCurrentView,
    loadFixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    currency: 'USD',
    planned: '',
    actual: ''
  });

  useEffect(() => {
    loadFixedExpenses();
  }, []);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'USD',
      planned: '',
      actual: ''
    });
    setModalVisible(true);
  };

  const handleEditExpense = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      date: expense.date,
      currency: expense.currency as string,
      planned: expense.planned.toString(),
      actual: expense.actual.toString()
    });
    setModalVisible(true);
  };

  const handleSaveExpense = async () => {
    if (!formData.title || !formData.date || !formData.planned || !formData.actual) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    const expenseData = {
      title: formData.title,
      date: formData.date,
      currency: formData.currency as Currency,
      planned: parseFloat(formData.planned),
      actual: parseFloat(formData.actual)
    };

    try {
      if (editingExpense) {
        await updateFixedExpense(editingExpense.id, expenseData);
      } else {
        await addFixedExpense(expenseData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save expense');
    }
  };

  const handleDeleteExpense = (expense: FixedExpense) => {
    Alert.alert(
      t('common.delete'),
      `Are you sure you want to delete "${expense.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteFixedExpense(expense.id)
        }
      ]
    );
  };

  const getChartData = () => {
    const colors = [
      theme.primary,
      theme.secondary,
      theme.expense,
      theme.warning,
      theme.income,
      theme.info,
    ];
    
    return fixedExpenses.map((expense, index) => ({
      name: expense.title.length > 10 ? expense.title.substring(0, 10) + '...' : expense.title,
      population: expense.actual,
      color: colors[index % colors.length],
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  if (isLoading && fixedExpenses.length === 0) {
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

        {fixedExpenses.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="home" size={64} color={theme.textTertiary} />
              <Title style={[styles.emptyTitle, { color: theme.text }]}>{t('fixedExpenses.noExpenses')}</Title>
              <Paragraph style={[styles.emptyParagraph, { color: theme.textSecondary }]}>{t('fixedExpenses.addFirstExpense')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddExpense}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                buttonColor={theme.primary}
              >
                {t('fixedExpenses.addExpense')}
              </Button>
            </View>
          </Surface>
        ) : (
          <>
            {currentView === 'table' ? (
              <View style={styles.cardsContainer}>
                {fixedExpenses.map((expense) => (
                  <Surface key={expense.id} style={[styles.expenseCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.expenseCardHeader}>
                      <View style={styles.expenseCardTitleRow}>
                        <MaterialIcons name="home" size={20} color={theme.primary} />
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
                      <View style={[styles.dateBadge, { backgroundColor: theme.surfaceVariant + '20' }]}>
                        <MaterialIcons name="event" size={16} color={theme.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{expense.date}</Text>
                      </View>
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
                            <Text style={[styles.amountValue, { color: theme.primary }]}>
                              {expense.actual.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {expense.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Surface>
                ))}
              </View>
            ) : (
              <Surface style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.chartContent}>
                  <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.text }]}>
                    Fixed Expenses Overview
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
            {editingExpense ? t('fixedExpenses.editExpense') : t('fixedExpenses.addExpense')}
          </Text>
          
          <TextInput
            label={t('fixedExpenses.expenseTitle')}
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
            label={t('fixedExpenses.expenseDate')}
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
            label={t('fixedExpenses.plannedBudget')}
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
            label={t('fixedExpenses.actualSpent')}
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

export default FixedExpensesScreen;
