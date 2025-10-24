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
  TextInput
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../services/store';
import { Income, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const IncomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { 
    income, 
    currentView, 
    isLoading, 
    error,
    setCurrentView,
    loadIncome,
    addIncome,
    updateIncome,
    deleteIncome
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    currency: 'USD',
    planned: '',
    actual: ''
  });

  useEffect(() => {
    loadIncome();
  }, []);

  const handleAddIncome = () => {
    setEditingIncome(null);
    setFormData({
      title: '',
      currency: 'USD',
      planned: '',
      actual: ''
    });
    setModalVisible(true);
  };

  const handleEditIncome = (incomeItem: Income) => {
    setEditingIncome(incomeItem);
    setFormData({
      title: incomeItem.title,
      currency: incomeItem.currency as string,
      planned: incomeItem.planned.toString(),
      actual: incomeItem.actual.toString()
    });
    setModalVisible(true);
  };

  const handleSaveIncome = async () => {
    if (!formData.title || !formData.planned || !formData.actual) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    const incomeData = {
      title: formData.title,
      currency: formData.currency as Currency,
      planned: parseFloat(formData.planned),
      actual: parseFloat(formData.actual)
    };

    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, incomeData);
      } else {
        await addIncome(incomeData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save income');
    }
  };

  const handleDeleteIncome = (incomeItem: Income) => {
    Alert.alert(
      t('common.delete'),
      `Are you sure you want to delete "${incomeItem.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteIncome(incomeItem.id)
        }
      ]
    );
  };

  const getChartData = () => {
    return {
      labels: income.map(incomeItem => 
        incomeItem.title.length > 8 ? incomeItem.title.substring(0, 8) + '...' : incomeItem.title
      ),
      datasets: [{
        data: income.map(incomeItem => incomeItem.actual),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      }]
    };
  };

  if (isLoading && income.length === 0) {
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

        {income.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>{t('income.noIncome')}</Title>
              <Paragraph>{t('income.addFirstIncome')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddIncome}
                style={styles.addButton}
              >
                {t('income.addIncome')}
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
                      <DataTable.Title>{t('income.expectedIncome')}</DataTable.Title>
                      <DataTable.Title>{t('income.actualIncome')}</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {income.map((incomeItem) => (
                      <DataTable.Row key={incomeItem.id}>
                        <DataTable.Cell>{incomeItem.title}</DataTable.Cell>
                        <DataTable.Cell>
                          {incomeItem.planned} {incomeItem.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          {incomeItem.actual} {incomeItem.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View style={styles.actionButtons}>
                            <Button 
                              mode="text" 
                              onPress={() => handleEditIncome(incomeItem)}
                              compact
                            >
                              {t('common.edit')}
                            </Button>
                            <Button 
                              mode="text" 
                              onPress={() => handleDeleteIncome(incomeItem)}
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
                  <Title>Income Chart</Title>
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
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: '6',
                          strokeWidth: '2',
                          stroke: '#4CAF50'
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

      <AddButton onPress={handleAddIncome} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>
            {editingIncome ? t('income.editIncome') : t('income.addIncome')}
          </Title>
          
          <TextInput
            label={t('income.incomeSource')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
          />

          <TextInput
            label={t('income.expectedIncome')}
            value={formData.planned}
            onChangeText={(text) => setFormData({ ...formData, planned: text })}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label={t('income.actualIncome')}
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
              onPress={handleSaveIncome}
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

export default IncomeScreen;
