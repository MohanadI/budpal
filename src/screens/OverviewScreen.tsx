import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  DataTable, 
  Text,
  Chip,
  Divider,
  Surface
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../services/store';
import { OverviewItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const OverviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { 
    overviewItems, 
    isLoading, 
    error,
    loadOverviewData
  } = useAppStore();

  useEffect(() => {
    loadOverviewData();
  }, []);

  const getTotalPlanned = () => {
    return overviewItems.reduce((sum, item) => sum + item.planned, 0);
  };

  const getTotalActual = () => {
    return overviewItems.reduce((sum, item) => sum + item.actual, 0);
  };

  const getDifference = () => {
    return getTotalActual() - getTotalPlanned();
  };

  const getCategoryTotals = () => {
    const categories = ['Fixed', 'Daily', 'Debt', 'Income', 'Investment'] as const;
    return categories.map(category => {
      const items = overviewItems.filter(item => item.category === category);
      const planned = items.reduce((sum, item) => sum + item.planned, 0);
      const actual = items.reduce((sum, item) => sum + item.actual, 0);
      return {
        category,
        planned,
        actual,
        difference: actual - planned,
        count: items.length
      };
    });
  };

  const getPieChartData = () => {
    const categoryTotals = getCategoryTotals();
    return categoryTotals.map(cat => ({
      name: cat.category,
      population: cat.actual,
      color: getCategoryColor(cat.category),
      legendFontColor: theme.textSecondary,
      legendFontSize: 12,
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fixed': return theme.primary;
      case 'Daily': return theme.expense;
      case 'Debt': return theme.warning;
      case 'Income': return theme.income;
      case 'Investment': return theme.secondary;
      default: return theme.textSecondary;
    }
  };

  if (isLoading && overviewItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        {error && (
          <Card style={[styles.errorCard, { backgroundColor: theme.surface, borderColor: theme.error, borderWidth: 1 }]}>
            <Card.Content>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Surface style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>{t('overview.totalPlanned')}</Text>
              <Text style={[styles.summaryAmount, { color: theme.text }]}>{getTotalPlanned().toFixed(2)}</Text>
            </View>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>{t('overview.totalActual')}</Text>
              <Text style={[styles.summaryAmount, { color: theme.text }]}>{getTotalActual().toFixed(2)}</Text>
            </View>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryTitle, { color: theme.textSecondary }]}>{t('overview.difference')}</Text>
              <Text style={[
                styles.summaryAmount,
                { color: getDifference() >= 0 ? theme.income : theme.error }
              ]}>
                {getDifference().toFixed(2)}
              </Text>
            </View>
          </Surface>
        </View>

        {/* Category Breakdown */}
        <Surface style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.text }]}>
              {t('overview.byCategory')}
            </Text>
            <View style={styles.tableContent}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Category
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Planned
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Actual
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Difference
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                {getCategoryTotals().map((category, index) => (
                  <DataTable.Row 
                    key={category.category}
                    style={[
                      index % 2 === 0 && { backgroundColor: theme.surfaceVariant + '20' }
                    ]}
                  >
                    <DataTable.Cell>
                      <Chip 
                        style={{ backgroundColor: getCategoryColor(category.category) }}
                        textStyle={{ color: 'white', fontSize: 11, fontWeight: '600' }}
                      >
                        {category.category}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[styles.cellText, { color: theme.text }]}>
                        {category.planned.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[styles.cellText, { color: theme.text }]}>
                        {category.actual.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[
                        styles.differenceText,
                        { color: category.difference >= 0 ? theme.income : theme.error }
                      ]}>
                        {category.difference.toFixed(2)}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </View>
          </View>
        </Surface>

        {/* Pie Chart */}
        {overviewItems.length > 0 && (
          <Surface style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardContent}>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.text }]}>
                Category Distribution
              </Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={getPieChartData()}
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

        {/* All Items Table */}
        <Surface style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.cardContent}>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.text }]}>
              {t('overview.allCategories')}
            </Text>
            <View style={styles.tableContent}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Category
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 2 }}>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Title
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Planned
                    </Text>
                  </DataTable.Title>
                  <DataTable.Title numeric>
                    <Text style={[styles.tableHeaderText, { color: theme.textSecondary }]}>
                      Actual
                    </Text>
                  </DataTable.Title>
                </DataTable.Header>

                {overviewItems.map((item, index) => (
                  <DataTable.Row 
                    key={item.id}
                    style={[
                      index % 2 === 0 && { backgroundColor: theme.surfaceVariant + '20' }
                    ]}
                  >
                    <DataTable.Cell>
                      <Chip 
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                        textStyle={{ color: 'white', fontSize: 10, fontWeight: '600' }}
                      >
                        {item.category}
                      </Chip>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <Text style={[styles.cellText, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.amountContainer}>
                        <Text style={[styles.amountText, { color: theme.text }]}>
                          {item.planned.toFixed(2)}
                        </Text>
                        <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                          {item.currency}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.amountContainer}>
                        <Text style={[styles.amountText, { color: theme.text }]}>
                          {item.actual.toFixed(2)}
                        </Text>
                        <Text style={[styles.currencyText, { color: theme.textSecondary }]}>
                          {item.currency}
                        </Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </View>
          </View>
        </Surface>
      </ScrollView>
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
  errorCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600' as const,
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
  differenceText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
});

export default OverviewScreen;
