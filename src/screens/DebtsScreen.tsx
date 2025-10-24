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
import { Debt, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const DebtsScreen: React.FC = () => {
  const { t } = useTranslation();
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
    return {
      labels: debts.map(debt => 
        debt.title.length > 8 ? debt.title.substring(0, 8) + '...' : debt.title
      ),
      datasets: [{
        data: debts.map(debt => debt.actual),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
      }]
    };
  };

  if (isLoading && debts.length === 0) {
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

        {debts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>{t('debts.noDebts')}</Title>
              <Paragraph>{t('debts.addFirstDebt')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddDebt}
                style={styles.addButton}
              >
                {t('debts.addDebt')}
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
                      <DataTable.Title>{t('debts.totalDebt')}</DataTable.Title>
                      <DataTable.Title>{t('debts.paidSoFar')}</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {debts.map((debt) => (
                      <DataTable.Row key={debt.id}>
                        <DataTable.Cell>{debt.title}</DataTable.Cell>
                        <DataTable.Cell>{debt.date}</DataTable.Cell>
                        <DataTable.Cell>
                          {debt.planned} {debt.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          {debt.actual} {debt.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View style={styles.actionButtons}>
                            <Button 
                              mode="text" 
                              onPress={() => handleEditDebt(debt)}
                              compact
                            >
                              {t('common.edit')}
                            </Button>
                            <Button 
                              mode="text" 
                              onPress={() => handleDeleteDebt(debt)}
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
                  <Title>Debts Chart</Title>
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
                        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: '6',
                          strokeWidth: '2',
                          stroke: '#FF9800'
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

      <AddButton onPress={handleAddDebt} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>
            {editingDebt ? t('debts.editDebt') : t('debts.addDebt')}
          </Title>
          
          <TextInput
            label={t('debts.debtTitle')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
          />

          <TextInput
            label={t('debts.dueDate')}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            style={styles.input}
            keyboardType="default"
          />

          <TextInput
            label={t('debts.totalDebt')}
            value={formData.planned}
            onChangeText={(text) => setFormData({ ...formData, planned: text })}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label={t('debts.paidSoFar')}
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
              onPress={handleSaveDebt}
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

export default DebtsScreen;
