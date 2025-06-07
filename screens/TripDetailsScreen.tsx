import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Divider, IconButton, Chip, List } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { Trip, Client, TripHistory, Document } from '../types';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const TripDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { getTrip, getClient, getTripHistory, getDocuments, deleteTrip } = useDatabase();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<TripHistory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // @ts-ignore
        const tripId = route.params?.tripId;
        
        if (tripId) {
          const tripData = await getTrip(tripId);
          
          if (tripData) {
            setTrip(tripData);
            
            // Load client
            if (tripData.clientId) {
              const clientData = await getClient(tripData.clientId);
              setClient(clientData);
            }
            
            // Load history
            const historyData = await getTripHistory(tripId);
            setHistory(historyData);
            
            // Load documents
            const documentsData = await getDocuments(tripId);
            setDocuments(documentsData);
          }
        }
      } catch (error) {
        console.error('Error loading trip details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [route.params]);
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planned':
        return '#FFC107'; // Yellow
      case 'in-progress':
        return '#2196F3'; // Blue
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'planned':
        return 'Запланирован';
      case 'in-progress':
        return 'В пути';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return 'Неизвестно';
    }
  };
  
  const handleEdit = () => {
    if (trip && trip.id) {
      navigation.navigate('TripEdit' as never, { tripId: trip.id } as never);
    }
  };
  
  const handleDelete = () => {
    if (!trip || !trip.id) return;
    
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
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  const handleViewDocuments = () => {
    if (trip && trip.id) {
      navigation.navigate('Documents' as never, { tripId: trip.id } as never);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Рейс не найден</Text>
      </View>
    );
  }
  
  const profit = trip.income - trip.expenses;
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              {trip.startLocation} → {trip.endLocation}
            </Text>
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
          
          <View style={styles.chipRow}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(trip.status) }]}
              textStyle={{ color: 'white' }}
            >
              {getStatusText(trip.status)}
            </Chip>
            <Text variant="bodyLarge">{formatDate(trip.date)}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Клиент:</Text>
              <Text variant="bodyMedium">{client?.name || 'Неизвестно'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Груз:</Text>
              <Text variant="bodyMedium">{trip.cargo}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Водитель:</Text>
              <Text variant="bodyMedium">{trip.driver}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Транспорт:</Text>
              <Text variant="bodyMedium">{trip.vehicle}</Text>
            </View>
            
            {trip.notes && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Примечания:</Text>
                <Text variant="bodyMedium" style={styles.valueText}>{trip.notes}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.financialSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Финансы</Text>
            
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Доход</Text>
                <Text variant="headlineSmall" style={styles.incomeText}>
                  {trip.income.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Расходы</Text>
                <Text variant="headlineSmall" style={styles.expenseText}>
                  {trip.expenses.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Прибыль</Text>
                <Text 
                  variant="headlineSmall" 
                  style={profit >= 0 ? styles.profitText : styles.lossText}
                >
                  {profit.toLocaleString()} ₽
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.documentHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Документы</Text>
            <Button 
              mode="contained" 
              onPress={handleViewDocuments}
              icon="file-document"
            >
              Управление документами
            </Button>
          </View>
          
          {documents.length > 0 ? (
            <List.Section>
              {documents.slice(0, 3).map(doc => (
                <List.Item
                  key={doc.id}
                  title={doc.name}
                  description={doc.type}
                  left={props => <List.Icon {...props} icon="file-document-outline" />}
                />
              ))}
              {documents.length > 3 && (
                <Button 
                  mode="text" 
                  onPress={handleViewDocuments}
                >
                  Показать все ({documents.length})
                </Button>
              )}
            </List.Section>
          ) : (
            <Text style={styles.emptyText}>Нет прикрепленных документов</Text>
          )}
        </Card.Content>
      </Card>
      
      {history.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>История изменений</Text>
            
            {history.map((item, index) => {
              const changedFields = JSON.parse(item.changedFields);
              const previousValues = JSON.parse(item.previousValues);
              const newValues = JSON.parse(item.newValues);
              
              return (
                <View key={item.id || index} style={styles.historyItem}>
                  <Text variant="bodyMedium" style={styles.historyDate}>
                    {formatDateTime(item.changeDate)}
                  </Text>
                  
                  {changedFields.map((field: string) => (
                    <View key={field} style={styles.fieldChange}>
                      <Text variant="bodyMedium" style={styles.fieldName}>
                        {field === 'clientId' ? 'Клиент' :
                         field === 'startLocation' ? 'Пункт отправления' :
                         field === 'endLocation' ? 'Пункт назначения' :
                         field === 'cargo' ? 'Груз' :
                         field === 'driver' ? 'Водитель' :
                         field === 'vehicle' ? 'Транспорт' :
                         field === 'status' ? 'Статус' :
                         field === 'income' ? 'Доход' :
                         field === 'expenses' ? 'Расходы' :
                         field === 'notes' ? 'Примечания' :
                         field === 'date' ? 'Дата' : field}:
                      </Text>
                      <Text variant="bodyMedium" style={styles.oldValue}>
                        {field === 'status' ? getStatusText(previousValues[field]) : 
                         field === 'date' ? formatDate(previousValues[field]) :
                         (typeof previousValues[field] === 'number' ? 
                          previousValues[field].toLocaleString() + ' ₽' : 
                          previousValues[field])}
                      </Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#757575" />
                      <Text variant="bodyMedium" style={styles.newValue}>
                        {field === 'status' ? getStatusText(newValues[field]) : 
                         field === 'date' ? formatDate(newValues[field]) :
                         (typeof newValues[field] === 'number' ? 
                          newValues[field].toLocaleString() + ' ₽' : 
                          newValues[field])}
                      </Text>
                    </View>
                  ))}
                  
                  {index < history.length - 1 && <Divider style={styles.historyDivider} />}
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}
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
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  statusChip: {
    height: 28,
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
    minWidth: 120,
  },
  valueText: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  financialSection: {
    marginBottom: 8,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financialItem: {
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
  documentHeader: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  historyItem: {
    marginBottom: 8,
  },
  historyDate: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fieldChange: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  fieldName: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  oldValue: {
    color: '#F44336',
    marginRight: 8,
  },
  newValue: {
    color: '#4CAF50',
    marginLeft: 8,
  },
  historyDivider: {
    marginVertical: 8,
  },
});

export default TripDetailsScreen;