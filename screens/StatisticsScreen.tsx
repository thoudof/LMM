import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useDatabase } from '../context/DatabaseContext';
import StatisticsChart from '../components/StatisticsChart';

type Period = 'week' | 'month' | 'year';

const StatisticsScreen = () => {
  const { trips, isLoading, refreshData } = useDatabase();
  const [period, setPeriod] = useState<Period>('month');
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };
  
  // Filter trips based on selected period
  const getFilteredTrips = () => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (period) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return trips.filter(trip => new Date(trip.date) >= cutoffDate);
  };
  
  const filteredTrips = getFilteredTrips();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.periodSelector}>
        <Text variant="bodyMedium" style={styles.periodLabel}>Период:</Text>
        <SegmentedButtons
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
          buttons={[
            { value: 'week', label: 'Неделя' },
            { value: 'month', label: 'Месяц' },
            { value: 'year', label: 'Год' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      
      {trips.length > 0 ? (
        <StatisticsChart 
          trips={filteredTrips} 
          period={period} 
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет данных для отображения статистики</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodLabel: {
    marginRight: 16,
  },
  segmentedButtons: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
  },
});

export default StatisticsScreen;