import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Chip } from 'react-native-paper';
import { Trip, Client } from '../types';
import { formatDate } from '../utils/dateUtils';

interface TripCardProps {
  trip: Trip;
  client?: Client;
  onPress: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

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

const TripCard: React.FC<TripCardProps> = ({ trip, client, onPress, onEdit, onDelete }) => {
  const statusColor = getStatusColor(trip.status);
  const statusText = getStatusText(trip.status);
  const profit = trip.income - trip.expenses;
  
  return (
    <TouchableOpacity onPress={() => onPress(trip)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              {trip.startLocation} → {trip.endLocation}
            </Text>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => onEdit(trip)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(trip)}
              />
            </View>
          </View>
          
          <View style={styles.chipRow}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={{ color: 'white' }}
            >
              {statusText}
            </Chip>
            <Text variant="bodyMedium">{formatDate(trip.date)}</Text>
          </View>
          
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
          
          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Text variant="bodySmall">Доход</Text>
              <Text variant="bodyLarge" style={styles.income}>
                {trip.income.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.financialItem}>
              <Text variant="bodySmall">Расход</Text>
              <Text variant="bodyLarge" style={styles.expense}>
                {trip.expenses.toLocaleString()} ₽
              </Text>
            </View>
            
            <View style={styles.financialItem}>
              <Text variant="bodySmall">Прибыль</Text>
              <Text 
                variant="bodyLarge" 
                style={[styles.profit, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  statusChip: {
    height: 28,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 100,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  financialItem: {
    alignItems: 'center',
  },
  income: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  expense: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  profit: {
    fontWeight: 'bold',
  },
});

export default TripCard;