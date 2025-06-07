import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '../context/DatabaseContext';
import { Trip, Client, FilterOptions } from '../types';
import TripCard from '../components/TripCard';
import FilterBar from '../components/FilterBar';

const TripsScreen = () => {
  const navigation = useNavigation();
  const { filteredTrips, clients, deleteTrip, filterTrips, clearFilters, isLoading, refreshData } = useDatabase();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const getClientById = (clientId: string): Client | undefined => {
    return clients.find(client => client.id === clientId);
  };
  
  const handleAddTrip = () => {
    navigation.navigate('TripEdit' as never, { tripId: null } as never);
  };
  
  const handleViewTrip = (trip: Trip) => {
    navigation.navigate('TripDetails' as never, { tripId: trip.id } as never);
  };
  
  const handleEditTrip = (trip: Trip) => {
    navigation.navigate('TripEdit' as never, { tripId: trip.id } as never);
  };
  
  const handleDeleteTrip = (trip: Trip) => {
    if (!trip.id) return;
    
    Alert.alert(
      'Удаление рейса',
      `Вы уверены, что хотите удалить рейс "${trip.startLocation} → ${trip.endLocation}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(trip.id!);
          }
        },
      ]
    );
  };
  
  const handleFilter = (options: FilterOptions) => {
    filterTrips(options);
  };
  
  const handleClearFilters = () => {
    clearFilters();
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
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
    <View style={styles.container}>
      <FilterBar 
        onFilter={handleFilter}
        onClear={handleClearFilters}
      />
      
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id || `${item.date}-${item.startLocation}-${item.endLocation}`}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            client={getClientById(item.clientId)}
            onPress={handleViewTrip}
            onEdit={handleEditTrip}
            onDelete={handleDeleteTrip}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Рейсы не найдены
          </Text>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddTrip}
      />
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#757575',
  },
});

export default TripsScreen;