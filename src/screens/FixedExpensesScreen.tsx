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
  HelperText
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../services/store';
import { FixedExpense, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const FixedExpensesScreen: React.FC = () => {
  const { t } = useTranslation();
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
    const screenWidth = Dimensions.get('window').width;
    return {
      labels: fixedExpenses.map(expense => 
        expense.title.length > 8 ? expense.title.substring(0, 8) + '...' : expense.title
      ),
      datasets: [{
        data: fixedExpenses.map(expense => expense.actual),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      }]
    };
  };

  if (isLoading && fixedExpenses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ViewToggle 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {fixedExpenses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>{t('fixedExpenses.noExpenses')}</Title>
              <Paragraph>{t('fixedExpenses.addFirstExpense')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddExpense}
                style={styles.addButton}
              >
                {t('fixedExpenses.addExpense')}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {currentView === 'table' ? (
              <Card>
                <Card.Content>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>{t('common.title')}</DataTable.Title>
                      <DataTable.Title>{t('common.date')}</DataTable.Title>
                      <DataTable.Title>{t('common.planned')}</DataTable.Title>
                      <DataTable.Title>{t('common.actual')}</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {fixedExpenses.map((expense) => (
                      <DataTable.Row key={expense.id}>
                        <DataTable.Cell>{expense.title}</DataTable.Cell>
                        <DataTable.Cell>{expense.date}</DataTable.Cell>
                        <DataTable.Cell>
                          {expense.planned} {expense.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          {expense.actual} {expense.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View style={styles.actionButtons}>
                            <Button 
                              mode="text" 
                              onPress={() => handleEditExpense(expense)}
                              compact
                            >
                              {t('common.edit')}
                            </Button>
                            <Button 
                              mode="text" 
                              onPress={() => handleDeleteExpense(expense)}
                              compact
                              textColor="red"
                            >
                              {t('common.delete')}
                            </Button>
                          </View>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </Card.Content>
              </Card>
            ) : (
              <Card>
                <Card.Content>
                  <Title>Expenses Chart</Title>
                  <View style={styles.chartContainer}>
                    <BarChart
                      data={getChartData()}
                      width={Dimensions.get('window').width - 60}
                      height={220}
                      yAxisLabel=""
                      yAxisSuffix=""
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: '6',
                          strokeWidth: '2',
                          stroke: '#2196F3'
                        }
                      }}
                      style={{
                        marginVertical: 8,
                        borderRadius: 16
                      }}
                    />
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <AddButton onPress={handleAddExpense} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>
            {editingExpense ? t('fixedExpenses.editExpense') : t('fixedExpenses.addExpense')}
          </Title>
          
          <TextInput
            label={t('fixedExpenses.expenseTitle')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
          />

          <TextInput
            label={t('fixedExpenses.expenseDate')}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            style={styles.input}
            keyboardType="default"
          />

          <TextInput
            label={t('fixedExpenses.plannedBudget')}
            value={formData.planned}
            onChangeText={(text) => setFormData({ ...formData, planned: text })}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label={t('fixedExpenses.actualSpent')}
            value={formData.actual}
            onChangeText={(text) => setFormData({ ...formData, actual: text })}
            style={styles.input}
            keyboardType="numeric"
          />

          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveExpense}
              style={styles.modalButton}
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  addButton: {
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  chartContainer: {
    marginTop: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default FixedExpensesScreen;
