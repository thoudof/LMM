import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, Dimensions, RefreshControl } from 'react-native';
import { Text, Card, Button, Divider, IconButton, Chip, List, ActivityIndicator } from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const [refreshing, setRefreshing] = useState(false);
  
  const loadData = useCallback(async () => {
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
        } else {
          // Trip not found
          Alert.alert('Ошибка', 'Рейс не найден');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error loading trip details:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные рейса');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [route.params, getTrip, getClient, getTripHistory, getDocuments, navigation]);
  
  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Загрузка данных...</Text>
      </View>
    );
  }
  
  if (!trip) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Рейс не найден</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Вернуться назад
        </Button>
      </View>
    );
  }
  
  // Ensure income and expenses are numbers with default values
  const income = typeof trip.income === 'number' ? trip.income : 0;
  const expenses = typeof trip.expenses === 'number' ? trip.expenses : 0;
  const profit = income - expenses;
  
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant={isSmallScreen ? "titleLarge" : "headlineMedium"} style={styles.title}>
              {trip.startLocation || 'Не указано'} → {trip.endLocation || 'Не указано'}
            </Text>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={24}
                onPress={handleEdit}
                iconColor="#2196F3"
              />
              <IconButton
                icon="delete"
                size={24}
                onPress={handleDelete}
                iconColor="#F44336"
              />
            </View>
          </View>
          
          <View style={styles.chipRow}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(trip.status || 'planned') }]}
              textStyle={{ color: 'white' }}
            >
              {getStatusText(trip.status || 'planned')}
            </Chip>
            <Text variant="bodyLarge" style={styles.dateText}>{formatDate(trip.date)}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Клиент:</Text>
              <Text variant="bodyMedium" style={styles.value}>{client?.name || 'Неизвестно'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Груз:</Text>
              <Text variant="bodyMedium" style={styles.value}>{trip.cargo || 'Не указано'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Водитель:</Text>
              <Text variant="bodyMedium" style={styles.value}>{trip.driver || 'Не указано'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Транспорт:</Text>
              <Text variant="bodyMedium" style={styles.value}>{trip.vehicle || 'Не указано'}</Text>
            </View>
            
            {trip.notes && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Примечания:</Text>
                <Text variant="bodyMedium" style={[styles.value, styles.valueText]}>{trip.notes}</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.financialSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Финансы</Text>
            
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Доход</Text>
                <Text variant={isSmallScreen ? "titleMedium" : "headlineSmall"} style={styles.incomeText}>
                  {income.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Расходы</Text>
                <Text variant={isSmallScreen ? "titleMedium" : "headlineSmall"} style={styles.expenseText}>
                  {expenses.toLocaleString()} ₽
                </Text>
              </View>
              
              <View style={styles.financialItem}>
                <Text variant="bodyMedium">Прибыль</Text>
                <Text 
                  variant={isSmallScreen ? "titleMedium" : "headlineSmall"} 
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
              style={styles.documentButton}
            >
              {isSmallScreen ? "Документы" : "Управление документами"}
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
                  style={styles.documentItem}
                />
              ))}
              {documents.length > 3 && (
                <Button 
                  mode="text" 
                  onPress={handleViewDocuments}
                  style={styles.showMoreButton}
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
              // Safely parse JSON with error handling
              let changedFields = [];
              let previousValues = {};
              let newValues = {};
              
              try {
                changedFields = JSON.parse(item.changedFields || '[]');
                previousValues = JSON.parse(item.previousValues || '{}');
                newValues = JSON.parse(item.newValues || '{}');
              } catch (error) {
                console.error('Error parsing history JSON:', error);
              }
              
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
                        {field === 'status' ? getStatusText(previousValues[field] || 'planned') : 
                         field === 'date' ? formatDate(previousValues[field]) :
                         (typeof previousValues[field] === 'number' ? 
                          previousValues[field].toLocaleString() + ' ₽' : 
                          previousValues[field] || 'Не указано')}
                      </Text>
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#757575" />
                      <Text variant="bodyMedium" style={styles.newValue}>
                        {field === 'status' ? getStatusText(newValues[field] || 'planned') : 
                         field === 'date' ? formatDate(newValues[field]) :
                         (typeof newValues[field] === 'number' ? 
                          newValues[field].toLocaleString() + ' ₽' : 
                          newValues[field] || 'Не указано')}
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
    padding: 20,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    color: '#2196F3',
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
    borderRadius: 14,
  },
  dateText: {
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    minWidth: 120,
    color: '#424242',
  },
  value: {
    flex: 1,
    color: '#212121',
  },
  valueText: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2196F3',
  },
  financialSection: {
    marginBottom: 8,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  financialItem: {
    alignItems: 'center',
    minWidth: '30%',
    marginBottom: 8,
  },
  incomeText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  expenseText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  profitText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  lossText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  documentButton: {
    marginTop: 8,
  },
  documentItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
  },
  showMoreButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
    color: '#757575',
  },
  historyItem: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 8,
  },
  historyDate: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#424242',
  },
  fieldChange: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  fieldName: {
    marginRight: 8,
    fontWeight: 'bold',
    color: '#424242',
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
