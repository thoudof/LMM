import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Text, IconButton, Avatar } from 'react-native-paper';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onPress, onEdit, onDelete }) => {
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <TouchableOpacity onPress={() => onPress(client)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={40} 
                label={getInitials(client.name)} 
                backgroundColor="#2196F3" 
              />
              <View style={styles.titleContainer}>
                <Text variant="titleMedium" style={styles.title}>{client.name}</Text>
                <Text variant="bodySmall" style={styles.subtitle}>ИНН: {client.inn}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => onEdit(client)}
                iconColor="#2196F3"
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(client)}
                iconColor="#F44336"
              />
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Контактное лицо:</Text>
              <Text variant="bodyMedium" style={styles.value}>{client.contactPerson}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Телефон:</Text>
              <Text variant="bodyMedium" style={styles.value}>{client.phone}</Text>
            </View>
            
            {client.email && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>Email:</Text>
                <Text variant="bodyMedium" style={styles.value}>{client.email}</Text>
              </View>
            )}
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
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 120,
    color: '#424242',
  },
  value: {
    flex: 1,
    color: '#212121',
  },
});

export default ClientCard;
