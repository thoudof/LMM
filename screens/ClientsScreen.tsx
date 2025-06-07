import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Alert } from 'react-native';
import { FAB, Searchbar, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDatabase } from '../context/DatabaseContext';
import { Client } from '../types';
import ClientCard from '../components/ClientCard';
import ClientForm from '../components/ClientForm';
import { Modal } from 'react-native';

const ClientsScreen = () => {
  const navigation = useNavigation();
  const { clients, addClient, updateClient, deleteClient, isLoading, refreshData } = useDatabase();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(
        client => 
          client.name.toLowerCase().includes(query) ||
          client.inn.toLowerCase().includes(query) ||
          client.contactPerson.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);
  
  const handleAddClient = () => {
    setEditingClient(null);
    setModalVisible(true);
  };
  
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setModalVisible(true);
  };
  
  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Удаление контрагента',
      `Вы уверены, что хотите удалить контрагента "${client.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            if (client.id) {
              await deleteClient(client.id);
            }
          }
        },
      ]
    );
  };
  
  const handleSubmitClient = async (client: Client) => {
    if (editingClient && editingClient.id) {
      await updateClient(editingClient.id, client);
    } else {
      await addClient(client);
    }
    setModalVisible(false);
  };
  
  const handleViewClient = (client: Client) => {
    navigation.navigate('ClientDetails' as never, { client } as never);
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
      <Searchbar
        placeholder="Поиск контрагентов"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id || item.inn}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={handleViewClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'Контрагенты не найдены' : 'Нет контрагентов'}
          </Text>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddClient}
      />
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text variant="headlineMedium" style={styles.modalTitle}>
            {editingClient ? 'Редактирование контрагента' : 'Новый контрагент'}
          </Text>
          <ClientForm
            initialValues={editingClient || undefined}
            onSubmit={handleSubmitClient}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </Modal>
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#757575',
  },
});

export default ClientsScreen;