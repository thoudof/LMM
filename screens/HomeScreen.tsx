import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { Trip, Client } from '../types';
import { formatDate } from '../utils/dateUtils';
import { useBasic } from '@basictech/expo';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { trips, clients, isLoading, refreshData } = useDatabase();
  const { signout } = useBasic();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get recent trips (last 5)
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Calculate statistics
  const totalTrips = trips.length;
  const completedTrips = trips.filter(trip => trip.status === 'completed').length;
  const inProgressTrips = trips.filter(trip => trip.status === 'in-progress').length;
  const plannedTrips = trips.filter(trip => trip.status === 'planned').length;
  
  const totalIncome = trips.reduce((sum, trip) => sum + trip.income, 0);
  const totalExpenses = trips.reduce((sum, trip) => sum + trip.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;
  
  // Get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Неизвестно';
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };
  
  const handleSignOut = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Add sign out button at the top */}
      <View style={styles.signOutContainer}>
        <Button 
          mode="text" 
          icon="logout" 
          onPress={handleSignOut}
        >
          Выйти
        </Button>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Статистика рейсов</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="truck" size={24} color="#2196F3" />
              <Text variant="headlineSmall">{totalTrips}</Text>
              <Text variant="bodySmall">Всего</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text variant="headlineSmall">{completedTrips}</Text>
              <Text variant="bodySmall">Завершено</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="truck-fast" size={24} color="#FFC107" />
              <Text variant="headlineSmall">{inProgressTrips}</Text>
              <Text variant="bodySmall">В пути</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#9E9E9E" />
              <Text variant="headlineSmall">{plannedTrips}</Text>
              <Text variant="bodySmall">Запланировано</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Финансы</Text>
          
          <View style={styles.financeRow}>
            <View style={styles.financeItem}>
              <Text variant="bodyMedium">Доход</Text>
              <Text variant="headlineSmall" style={styles.incomeText}>
                {totalIncome.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.financeItem}>
              <Text variant="bodyMedium">Расходы</Text>
              <Text variant="headlineSmall" style={styles.expenseText}>
                {totalExpenses.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.financeItem}>
              <Text variant="bodyMedium">Прибыль</Text>
              <Text 
                variant="headlineSmall" 
                style={totalProfit >= 0 ? styles.profitText : styles.lossText}
              >
                {totalProfit.toLocaleString()} ₽
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.cardTitle}>Последние рейсы</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Trips' as never)}
            >
              Все рейсы
            </Button>
          </View>
          
          {recentTrips.length > 0 ? (
            recentTrips.map((trip) => (
              <Card key={trip.id} style={styles.tripCard}>
                <Card.Content>
                  <View style={styles.tripHeader}>
                    <Text variant="titleMedium">{trip.startLocation} → {trip.endLocation}</Text>
                    <Text variant="bodyMedium">{formatDate(trip.date)}</Text>
                  </View>
                  
                  <View style={styles.tripDetails}>
                    <Text variant="bodyMedium">Клиент: {getClientName(trip.clientId)}</Text>
                    <Text variant="bodyMedium">Груз: {trip.cargo}</Text>
                    <Text variant="bodyMedium">Статус: {
                      trip.status === 'planned' ? 'Запланирован' :
                      trip.status === 'in-progress' ? 'В пути' :
                      trip.status === 'completed' ? 'Завершен' : 'Отменен'
                    }</Text>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.emptyText}>Нет данных о рейсах</Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.cardTitle}>Контрагенты</Text>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Clients' as never)}
            >
              Все контрагенты
            </Button>
          </View>
          
          <Text variant="headlineSmall" style={styles.clientCount}>
            {clients.length}
          </Text>
          <Text variant="bodyMedium" style={styles.clientCountLabel}>
            {clients.length === 1 ? 'контрагент' : 
             clients.length >= 2 && clients.length <= 4 ? 'контрагента' : 'контрагентов'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '22%',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeItem: {
    alignItems: 'center',
    minWidth: '30%',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripCard: {
    marginVertical: 8,
    elevation: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tripDetails: {
    gap: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  clientCount: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  clientCountLabel: {
    textAlign: 'center',
  },
  signOutContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

export default HomeScreen;
