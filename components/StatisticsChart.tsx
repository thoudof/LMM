import React from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Trip } from '../types';
import { formatDate } from '../utils/dateUtils';

interface StatisticsChartProps {
  trips: Trip[];
  period: 'week' | 'month' | 'year';
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ trips, period }) => {
  const screenWidth = Dimensions.get('window').width - 32;
  
  // Calculate total income, expenses, and profit
  const totalIncome = trips.reduce((sum, trip) => sum + trip.income, 0);
  const totalExpenses = trips.reduce((sum, trip) => sum + trip.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  
  // Group trips by status
  const tripsByStatus = trips.reduce((acc, trip) => {
    acc[trip.status] = (acc[trip.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Prepare data for status chart
  const statusLabels = Object.keys(tripsByStatus).map(status => {
    switch (status) {
      case 'planned': return 'План';
      case 'in-progress': return 'В пути';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  });
  
  const statusData = Object.values(tripsByStatus);
  
  // Sort trips by date
  const sortedTrips = [...trips].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Group financial data by date
  const financialByDate: Record<string, { income: number; expenses: number; profit: number }> = {};
  
  sortedTrips.forEach(trip => {
    const date = formatDate(trip.date);
    if (!financialByDate[date]) {
      financialByDate[date] = { income: 0, expenses: 0, profit: 0 };
    }
    financialByDate[date].income += trip.income;
    financialByDate[date].expenses += trip.expenses;
    financialByDate[date].profit += (trip.income - trip.expenses);
  });
  
  // Prepare data for financial chart
  const financialDates = Object.keys(financialByDate).slice(-7); // Last 7 dates
  const incomeData = financialDates.map(date => financialByDate[date].income);
  const expensesData = financialDates.map(date => financialByDate[date].expenses);
  const profitData = financialDates.map(date => financialByDate[date].profit);
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Общая статистика</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {trips.length}
              </Text>
              <Text variant="bodySmall">Всего рейсов</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text variant="bodyLarge" style={[styles.summaryValue, styles.incomeText]}>
                {totalIncome.toLocaleString()} ₽
              </Text>
              <Text variant="bodySmall">Доход</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text variant="bodyLarge" style={[styles.summaryValue, styles.expenseText]}>
                {totalExpenses.toLocaleString()} ₽
              </Text>
              <Text variant="bodySmall">Расходы</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text 
                variant="bodyLarge" 
                style={[
                  styles.summaryValue, 
                  totalProfit >= 0 ? styles.profitText : styles.lossText
                ]}
              >
                {totalProfit.toLocaleString()} ₽
              </Text>
              <Text variant="bodySmall">Прибыль</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {statusLabels.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Рейсы по статусам</Text>
            <BarChart
              data={{
                labels: statusLabels,
                datasets: [
                  {
                    data: statusData,
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </Card.Content>
        </Card>
      )}
      
      {financialDates.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Финансовые показатели</Text>
            <LineChart
              data={{
                labels: financialDates,
                datasets: [
                  {
                    data: incomeData,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2,
                  },
                  {
                    data: expensesData,
                    color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                    strokeWidth: 2,
                  },
                  {
                    data: profitData,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
                legend: ['Доход', 'Расходы', 'Прибыль'],
              }}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                },
              }}
              style={styles.chart}
              bezier
            />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  chartCard: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 8,
  },
  summaryValue: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  incomeText: {
    color: '#2196F3',
  },
  expenseText: {
    color: '#F44336',
  },
  profitText: {
    color: '#4CAF50',
  },
  lossText: {
    color: '#F44336',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatisticsChart;