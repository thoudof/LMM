import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDatabase } from '../context/DatabaseContext';
import { Trip } from '../types';
import TripForm from '../components/TripForm';

const TripEditScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { getTrip, addTrip, updateTrip } = useDatabase();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewTrip, setIsNewTrip] = useState(true);
  
  useEffect(() => {
    const loadTrip = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const tripId = route.params?.tripId;
        
        if (tripId) {
          const tripData = await getTrip(tripId);
          if (tripData) {
            setTrip(tripData);
            setIsNewTrip(false);
          }
        } else {
          setIsNewTrip(true);
          setTrip(null);
        }
      } catch (error) {
        console.error('Error loading trip:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTrip();
  }, [route.params]);
  
  const handleSubmit = async (updatedTrip: Trip) => {
    try {
      // Ensure income and expenses are numbers
      const tripToSave = {
        ...updatedTrip,
        income: typeof updatedTrip.income === 'number' ? updatedTrip.income : 0,
        expenses: typeof updatedTrip.expenses === 'number' ? updatedTrip.expenses : 0
      };
      
      if (isNewTrip) {
        const newTrip = await addTrip(tripToSave);
        if (newTrip && newTrip.id) {
          navigation.navigate('TripDetails' as never, { tripId: newTrip.id } as never);
        } else {
          navigation.goBack();
        }
      } else if (trip && trip.id) {
        const result = await updateTrip(trip.id, tripToSave, trip);
        if (result) {
          navigation.navigate('TripDetails' as never, { tripId: trip.id } as never);
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить рейс');
    }
  };
  
  const handleCancel = () => {
    navigation.goBack();
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {isNewTrip ? 'Новый рейс' : 'Редактирование рейса'}
      </Text>
      <TripForm
        initialValues={trip || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default TripEditScreen;
