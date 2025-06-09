import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, IconButton, Chip, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Trip } from '../types';
import { formatDate } from '../utils/dateUtils';

interface TripCardProps {
  trip: Trip;
  clientName: string;
  onPress: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  clientName, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
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
  
  // Ensure income and expenses are numbers
  const income = typeof trip.income === 'number' ? trip.income : 0;
  const expenses = typeof trip.expenses === 'number' ? trip.expenses : 0;
  const profit = income - expenses;
  
  return (
    <TouchableOpacity onPress={() => onPress(trip)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title}>
                {trip.startLocation || 'Не указано'} → {trip.endLocation || 'Не указано'}
              </Text>
              <Text variant="bodySmall" style={styles.date}>{formatDate(trip.date)}</Text>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => onEdit(trip)}
                iconColor="#2196F3"
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(trip)}
                iconColor="#F44336"
              />
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-group" size={16} color="#757575" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {clientName || 'Неизвестный клиент'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="package-variant" size={16} color="#757575" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {trip.cargo || 'Не указано'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={16} color="#757575" />
              <Text variant="bodyMedium" style={styles.infoText}>
                {trip.driver || 'Не указано'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.footer}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: getStatusColor(trip.status) }]}
              textStyle={{ color: 'white', fontSize: isSmallScreen ? 10 : 12 }}
            >
              {getStatusText(trip.status)}
            </Chip>
            
            <View style={styles.financialInfo}>
              <Text variant="bodySmall" style={styles.profitLabel}>Прибыль:</Text>
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.profitValue, 
                  { color: profit >= 0 ? '#4CAF50' : '#F44336' }
                ]}
              >
                {profit.toLocaleString()} ₽
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  date: {
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
  },
  infoContainer: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
    borderRadius: 14,
  },
  financialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitLabel: {
    marginRight: 4,
    color: '#757575',
  },
  profitValue: {
    fontWeight: 'bold',
  },
});

export default TripCard;
