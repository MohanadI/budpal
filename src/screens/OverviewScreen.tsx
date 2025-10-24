import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  DataTable, 
  Text,
  Chip,
  Divider
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../services/store';
import { OverviewItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const OverviewScreen: React.FC = () => {
  const { t } = useTranslation();
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
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fixed': return '#2196F3';
      case 'Daily': return '#4CAF50';
      case 'Debt': return '#FF9800';
      case 'Income': return '#4CAF50';
      case 'Investment': return '#9C27B0';
      default: return '#757575';
    }
  };

  if (isLoading && overviewItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.summaryTitle}>{t('overview.totalPlanned')}</Title>
              <Text style={styles.summaryAmount}>{getTotalPlanned().toFixed(2)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.summaryTitle}>{t('overview.totalActual')}</Title>
              <Text style={styles.summaryAmount}>{getTotalActual().toFixed(2)}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.summaryTitle}>{t('overview.difference')}</Title>
              <Text style={[
                styles.summaryAmount,
                { color: getDifference() >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {getDifference().toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Category Breakdown */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('overview.byCategory')}</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Category</DataTable.Title>
                <DataTable.Title>Planned</DataTable.Title>
                <DataTable.Title>Actual</DataTable.Title>
                <DataTable.Title>Difference</DataTable.Title>
              </DataTable.Header>

              {getCategoryTotals().map((category) => (
                <DataTable.Row key={category.category}>
                  <DataTable.Cell>
                    <Chip 
                      style={{ backgroundColor: getCategoryColor(category.category) }}
                      textStyle={{ color: 'white' }}
                    >
                      {category.category}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>{category.planned.toFixed(2)}</DataTable.Cell>
                  <DataTable.Cell>{category.actual.toFixed(2)}</DataTable.Cell>
                  <DataTable.Cell>
                    <Text style={[
                      styles.differenceText,
                      { color: category.difference >= 0 ? '#4CAF50' : '#F44336' }
                    ]}>
                      {category.difference.toFixed(2)}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Pie Chart */}
        {overviewItems.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Category Distribution</Title>
              <View style={styles.chartContainer}>
                <PieChart
                  data={getPieChartData()}
                  width={Dimensions.get('window').width - 60}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 10]}
                  absolute
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* All Items Table */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('overview.allCategories')}</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Category</DataTable.Title>
                <DataTable.Title>Title</DataTable.Title>
                <DataTable.Title>Planned</DataTable.Title>
                <DataTable.Title>Actual</DataTable.Title>
              </DataTable.Header>

              {overviewItems.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell>
                    <Chip 
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      {item.category}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell>{item.title}</DataTable.Cell>
                  <DataTable.Cell>{item.planned} {item.currency}</DataTable.Cell>
                  <DataTable.Cell>{item.actual} {item.currency}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>
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
  errorCard: {
    backgroundColor: '#ffebee',
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginBottom: 16,
  },
  differenceText: {
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
});

export default OverviewScreen;
