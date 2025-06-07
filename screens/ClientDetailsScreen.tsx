import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Linking, Alert } from 'react-native';
import { Text, Card, Button, Divider, IconButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { Client, Trip } from '../types';
import TripCard from '../components/TripCard';

const ClientDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { getClient, trips, deleteClient } = useDatabase();
  
  const [client, setClient] = useState<Client | null>(null);
  const [clientTrips, setClientTrips] = useState<Trip[]>([]);
  
  useEffect(() => {
    const loadClient = async () => {
      // @ts-ignore
      const routeClient = route.params?.client as Client;
      
      if (routeClient && routeClient.id) {
        const freshClient = await getClient(routeClient.id);
        if (freshClient) {
          setClient(freshClient);
        } else {
          setClient(routeClient);
        }
      }
    };
    
    loadClient();
  }, [route.params]);
  
  useEffect(() => {
    if (client && client.id) {
      // Filter trips for this client
      const filteredTrips = trips.filter(trip => trip.clientId === client.id);
      setClientTrips(filteredTrips);
    }
  }, [client, trips]);
  
  const handleCall = () => {
    if (client && client.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };
  
  const handleEmail = () => {
    if (client && client.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };
  
  const handleEdit = () => {
    // Navigate to edit screen or show edit modal
    navigation.navigate('ClientsScreen' as never);
    // @ts-ignore
    navigation.getParent().setParams({ editClient: client });
  };
  
  const handleDelete = () => {
    if (!client || !client.id) return;
    
    Alert.alert(
      'Удаление контрагента',
      `Вы уверены, что хотите удалить контрагента "${client.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            await deleteClient(client.id!);
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  const handleTripPress = (trip: Trip) => {
    navigation.navigate('TripDetails' as never, { tripId: trip.id } as never);
  };
  
  const handleTripEdit = (trip: Trip) => {
    navigation.navigate('TripEdit' as never, { tripId: trip.id } as never);
  };
  
  const handleTripDelete = (trip: Trip) => {
    // This will be handled in the TripCard component
  };
  
  if (!client) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>{client.name}</Text>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={24}
                onPress={handleEdit}
              />
              <IconButton
                icon="delete"
                size={24}
                onPress={handleDelete}
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>ИНН:</Text>
              <Text variant="bodyMedium">{client.inn}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Контактное лицо:</Text>
              <Text variant="bodyMedium">{client.contactPerson}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Телефон:</Text>
              <View style={styles.contactValue}>
                <Text variant="bodyMedium">{client.phone}</Text>
                <IconButton
                  icon="phone"
                  size={20}
                  onPress={handleCall}
                  style={styles.contactButton}
                />
              </View>
            </View>
            
            {client.email && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Email:</Text>
                <View style={styles.contactValue}>
                  <Text variant="bodyMedium">{client.email}</Text>
                  <IconButton
                    icon="email"
                    size={20}
                    onPress={handleEmail}
                    style={styles.contactButton}
                  />
                </View>
              </View>
            )}
            
            {client.address && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Адрес:</Text>
                <Text variant="bodyMedium" style={styles.valueText}>{client.address}</Text>
              </View>
            )}
            
            {client.notes && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Примечания:</Text>
                <Text variant="bodyMedium" style={styles.valueText}>{client.notes}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Рейсы контрагента</Text>
          
          {clientTrips.length > 0 ? (
            clientTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                client={client}
                onPress={handleTripPress}
                onEdit={handleTripEdit}
                onDelete={handleTripDelete}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Нет рейсов для этого контрагента</Text>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    minWidth: 140,
  },
  contactValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    margin: -8,
  },
  valueText: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
});

export default ClientDetailsScreen;