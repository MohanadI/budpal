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
import { Investment, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const InvestmentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { 
    investments, 
    currentView, 
    isLoading, 
    error,
    setCurrentView,
    loadInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    currency: 'USD',
    planned: '',
    actual: ''
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'USD',
      planned: '',
      actual: ''
    });
    setModalVisible(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      title: investment.title,
      date: investment.date,
      currency: investment.currency as string,
      planned: investment.planned.toString(),
      actual: investment.actual.toString()
    });
    setModalVisible(true);
  };

  const handleSaveInvestment = async () => {
    if (!formData.title || !formData.date || !formData.planned || !formData.actual) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    const investmentData = {
      title: formData.title,
      date: formData.date,
      currency: formData.currency as Currency,
      planned: parseFloat(formData.planned),
      actual: parseFloat(formData.actual)
    };

    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, investmentData);
      } else {
        await addInvestment(investmentData);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save investment');
    }
  };

  const handleDeleteInvestment = (investment: Investment) => {
    Alert.alert(
      t('common.delete'),
      `Are you sure you want to delete "${investment.title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => deleteInvestment(investment.id)
        }
      ]
    );
  };

  const getChartData = () => {
    return {
      labels: investments.map(investment => 
        investment.title.length > 8 ? investment.title.substring(0, 8) + '...' : investment.title
      ),
      datasets: [{
        data: investments.map(investment => investment.actual),
        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
      }]
    };
  };

  if (isLoading && investments.length === 0) {
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

        {investments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Title>{t('investments.noInvestments')}</Title>
              <Paragraph>{t('investments.addFirstInvestment')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddInvestment}
                style={styles.addButton}
              >
                {t('investments.addInvestment')}
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
                      <DataTable.Title>{t('investments.plannedAmount')}</DataTable.Title>
                      <DataTable.Title>{t('investments.currentValue')}</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {investments.map((investment) => (
                      <DataTable.Row key={investment.id}>
                        <DataTable.Cell>{investment.title}</DataTable.Cell>
                        <DataTable.Cell>{investment.date}</DataTable.Cell>
                        <DataTable.Cell>
                          {investment.planned} {investment.currency}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={[
                            styles.valueText,
                            { color: investment.actual >= investment.planned ? '#4CAF50' : '#F44336' }
                          ]}>
                            {investment.actual} {investment.currency}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View style={styles.actionButtons}>
                            <Button 
                              mode="text" 
                              onPress={() => handleEditInvestment(investment)}
                              compact
                            >
                              {t('common.edit')}
                            </Button>
                            <Button 
                              mode="text" 
                              onPress={() => handleDeleteInvestment(investment)}
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
                  <Title>Investments Chart</Title>
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
                        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: '6',
                          strokeWidth: '2',
                          stroke: '#9C27B0'
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

      <AddButton onPress={handleAddInvestment} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title>
            {editingInvestment ? t('investments.editInvestment') : t('investments.addInvestment')}
          </Title>
          
          <TextInput
            label={t('investments.investmentName')}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            style={styles.input}
          />

          <TextInput
            label={t('investments.investmentDate')}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            style={styles.input}
            keyboardType="default"
          />

          <TextInput
            label={t('investments.plannedAmount')}
            value={formData.planned}
            onChangeText={(text) => setFormData({ ...formData, planned: text })}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            label={t('investments.currentValue')}
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
              onPress={handleSaveInvestment}
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
  valueText: {
    fontWeight: 'bold',
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

export default InvestmentsScreen;
