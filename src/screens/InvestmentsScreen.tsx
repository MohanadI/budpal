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
import { Investment, Currency } from '../types';
import ViewToggle from '../components/ViewToggle';
import AddButton from '../components/AddButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const InvestmentsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    const colors = [
      theme.secondary,
      theme.income,
      theme.success,
      theme.primary,
      theme.warning,
      theme.info,
    ];
    
    return investments.map((investment, index) => ({
      name: investment.title.length > 10 ? investment.title.substring(0, 10) + '...' : investment.title,
      population: investment.actual,
      color: colors[index % colors.length],
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  if (isLoading && investments.length === 0) {
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

        {investments.length === 0 ? (
          <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
            <View style={styles.emptyContent}>
              <MaterialIcons name="account-balance" size={64} color={theme.textTertiary} />
              <Title style={[styles.emptyTitle, { color: theme.text }]}>{t('investments.noInvestments')}</Title>
              <Paragraph style={[styles.emptyParagraph, { color: theme.textSecondary }]}>{t('investments.addFirstInvestment')}</Paragraph>
              <Button 
                mode="contained" 
                onPress={handleAddInvestment}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                buttonColor={theme.primary}
              >
                {t('investments.addInvestment')}
              </Button>
            </View>
          </Surface>
        ) : (
          <>
            {currentView === 'table' ? (
              <View style={styles.cardsContainer}>
                {investments.map((investment) => (
                  <Surface key={investment.id} style={[styles.investmentCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.investmentCardHeader}>
                      <View style={styles.investmentCardTitleRow}>
                        <MaterialIcons name="account-balance" size={20} color={theme.secondary} />
                        <Text style={[styles.investmentCardTitle, { color: theme.text }]} numberOfLines={1}>
                          {investment.title}
                        </Text>
                      </View>
                      <View style={styles.actionIcons}>
                        <Button mode="text" onPress={() => handleEditInvestment(investment)} compact textColor={theme.primary} style={styles.actionIconButton} icon={() => <MaterialIcons name="edit" size={18} color={theme.primary} />}>{''}</Button>
                        <Button mode="text" onPress={() => handleDeleteInvestment(investment)} compact textColor={theme.error} style={styles.actionIconButton} icon={() => <MaterialIcons name="delete" size={18} color={theme.error} />}>{''}</Button>
                      </View>
                    </View>
                    <View style={styles.investmentCardContent}>
                      <View style={[styles.dateBadge, { backgroundColor: theme.surfaceVariant + '20' }]}>
                        <MaterialIcons name="event" size={16} color={theme.textSecondary} />
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{investment.date}</Text>
                      </View>
                      <View style={styles.amountRow}>
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('investments.plannedAmount')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.text }]}>
                              {investment.planned.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {investment.currency}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.amountGroup}>
                          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
                            {t('investments.currentValue')}
                          </Text>
                          <View style={styles.amountContainer}>
                            <Text style={[styles.amountValue, { color: theme.secondary }]}>
                              {investment.actual.toFixed(2)}
                            </Text>
                            <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                              {investment.currency}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.returnBadge, { 
                        backgroundColor: (investment.actual - investment.planned >= 0 ? theme.income : theme.error) + '15',
                        borderColor: (investment.actual - investment.planned >= 0 ? theme.income : theme.error)
                      }]}>
                        <MaterialIcons name={(investment.actual - investment.planned >= 0) ? 'trending-up' : 'trending-down'} size={16} color={(investment.actual - investment.planned >= 0) ? theme.income : theme.error} />
                        <Text style={[styles.returnText, { color: (investment.actual - investment.planned >= 0) ? theme.income : theme.error }]}>
                          {(investment.actual - investment.planned >= 0 ? '+' : '')}
                          {(investment.actual - investment.planned).toFixed(2)} {investment.currency}
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
                    Investments Overview
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

      <AddButton onPress={handleAddInvestment} />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.surface }]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.text }]}>
            {editingInvestment ? t('investments.editInvestment') : t('investments.addInvestment')}
          </Text>
          
          <TextInput
            label={t('investments.investmentName')}
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
            label={t('investments.investmentDate')}
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
            label={t('investments.plannedAmount')}
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
            label={t('investments.currentValue')}
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
              onPress={handleSaveInvestment}
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
  investmentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  investmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  investmentCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  investmentCardTitle: {
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
  investmentCardContent: {
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
  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  returnText: {
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

export default InvestmentsScreen;
