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
import { Income, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const IncomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    const colors = [
      theme.primary,
      theme.secondary,
      theme.income,
      theme.success,
      theme.warning,
      theme.info,
    ];
    
    return income.map((incomeItem, index) => ({
      name: incomeItem.title.length > 10 ? incomeItem.title.substring(0, 10) + '...' : incomeItem.title,
      population: incomeItem.actual,
      color: colors[index % colors.length],
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  if (isLoading && income.length === 0) {
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

        {income.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="attach-money" size={64} color={theme.textTertiary} />
              <Title style={[styles.emptyTitle, { color: theme.text }]}>{t('income.noIncome')}</Title>
              <Paragraph style={[styles.emptyParagraph, { color: theme.textSecondary }]}>{t('income.addFirstIncome')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddIncome}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                buttonColor={theme.primary}
              >
                {t('income.addIncome')}
              </Button>
            </View>
          </Surface>
        ) : (
          <>
            {currentView === 'table' ? (
              <View style={styles.cardsContainer}>
                {income.map((incomeItem) => (
                  <Surface key={incomeItem.id} style={[styles.incomeCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.incomeCardHeader}>
                      <View style={styles.incomeCardTitleRow}>
                        <MaterialIcons name="attach-money" size={20} color={theme.primary} />
                        <Text style={[styles.incomeCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {incomeItem.title}
                        </Text>
                      </View>
                      <View style={styles.actionIcons}>
                        <Button 
                          mode="text"
                          onPress={() => handleEditIncome(incomeItem)}
                          compact
                          textColor={theme.primary}
                          style={styles.actionIconButton}
                          icon={() => <MaterialIcons name="edit" size={18} color={theme.primary} />}
                        >
                          {''}
                        </Button>
                        <Button 
                          mode="text"
                          onPress={() => handleDeleteIncome(incomeItem)}
                          compact
                          textColor={theme.error}
                          style={styles.actionIconButton}
                          icon={() => <MaterialIcons name="delete" size={18} color={theme.error} />}
                        >
                          {''}
                        </Button>
                      </View>
                    </View>
                    <View style={styles.incomeCardContent}>
                      <View style={styles.amountRow}>
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('income.expectedIncome')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.text }]}>
                              {incomeItem.planned.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {incomeItem.currency}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('income.actualIncome')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.income }]}>
                              {incomeItem.actual.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {incomeItem.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.differenceBadge, { 
                        backgroundColor: theme.income + '15',
                        borderColor: theme.income
                      }]}>
                        <MaterialIcons name="trending-up" size={16} color={theme.income} />
                        <Text style={[styles.differenceText, { color: theme.income }]}>
                          {(incomeItem.actual - incomeItem.planned >= 0 ? '+' : '')}
                          {(incomeItem.actual - incomeItem.planned).toFixed(2)} {incomeItem.currency}
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
                    Income Overview
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

      <AddButton onPress={handleAddIncome} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.text }]}>
            {editingIncome ? t('income.editIncome') : t('income.addIncome')}
          </Text>
          
          <TextInput
            label={t('income.incomeSource')}
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
            label={t('income.expectedIncome')}
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
            label={t('income.actualIncome')}
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
              onPress={handleSaveIncome}
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
    fontWeight: '600',
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
  chartContent: {
    padding: 16,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    minWidth: 60,
  },
  cardsContainer: {
    gap: 12,
  },
  incomeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  incomeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  incomeCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  incomeCardTitle: {
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
  actionIconLabel: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  incomeCardContent: {
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
  differenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  differenceText: {
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
    fontWeight: '600',
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

export default IncomeScreen;
