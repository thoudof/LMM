import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onPress, onEdit, onDelete }) => {
  return (
    <TouchableOpacity onPress={() => onPress(client)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>{client.name}</Text>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => onEdit(client)}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(client)}
              />
            </View>
          </View>
          
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
            <Text variant="bodyMedium">{client.phone}</Text>
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
  infoRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 120,
  },
});

export default ClientCard;