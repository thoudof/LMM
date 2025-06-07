import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBasic } from '@basictech/expo';
import { Alert } from 'react-native';
import { AppSchema, Client, Trip, TripHistory, Document, FilterOptions } from '../types';
import { getCurrentDate } from '../utils/dateUtils';

interface DatabaseContextType {
  // Clients
  clients: Client[];
  getClient: (id: string) => Promise<Client | null>;
  addClient: (client: Client) => Promise<Client | null>;
  updateClient: (id: string, client: Client) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  
  // Trips
  trips: Trip[];
  filteredTrips: Trip[];
  getTrip: (id: string) => Promise<Trip | null>;
  addTrip: (trip: Trip) => Promise<Trip | null>;
  updateTrip: (id: string, trip: Trip, oldTrip: Trip) => Promise<Trip | null>;
  deleteTrip: (id: string) => Promise<boolean>;
  filterTrips: (options: FilterOptions) => void;
  clearFilters: () => void;
  
  // Trip History
  getTripHistory: (tripId: string) => Promise<TripHistory[]>;
  
  // Documents
  getDocuments: (tripId: string) => Promise<Document[]>;
  addDocument: (document: Document) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  
  // Loading state
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { db, isLoading: basicLoading } = useBasic<AppSchema>();
  const [clients, setClients] = useState<Client[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load initial data
  const loadData = async () => {
    if (!db) return;
    
    setIsLoading(true);
    try {
      const clientsData = await db.from('clients').getAll();
      const tripsData = await db.from('trips').getAll();
      
      setClients(clientsData || []);
      setTrips(tripsData || []);
      setFilteredTrips(tripsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (db && !basicLoading) {
      loadData();
    }
  }, [db, basicLoading]);
  
  // Client operations
  const getClient = async (id: string): Promise<Client | null> => {
    if (!db) return null;
    
    try {
      return await db.from('clients').get(id);
    } catch (error) {
      console.error('Error getting client:', error);
      return null;
    }
  };
  
  const addClient = async (client: Client): Promise<Client | null> => {
    if (!db) return null;
    
    try {
      const newClient = await db.from('clients').add(client);
      if (newClient) {
        setClients(prev => [...prev, newClient]);
      }
      return newClient;
    } catch (error) {
      console.error('Error adding client:', error);
      Alert.alert('Ошибка', 'Не удалось добавить контрагента');
      return null;
    }
  };
  
  const updateClient = async (id: string, client: Client): Promise<Client | null> => {
    if (!db) return null;
    
    try {
      const updatedClient = await db.from('clients').update(id, client);
      if (updatedClient) {
        setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      }
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      Alert.alert('Ошибка', 'Не удалось обновить контрагента');
      return null;
    }
  };
  
  const deleteClient = async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.from('clients').delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      Alert.alert('Ошибка', 'Не удалось удалить контрагента');
      return false;
    }
  };
  
  // Trip operations
  const getTrip = async (id: string): Promise<Trip | null> => {
    if (!db) return null;
    
    try {
      return await db.from('trips').get(id);
    } catch (error) {
      console.error('Error getting trip:', error);
      return null;
    }
  };
  
  const addTrip = async (trip: Trip): Promise<Trip | null> => {
    if (!db) return null;
    
    try {
      const newTrip = await db.from('trips').add(trip);
      if (newTrip) {
        setTrips(prev => [...prev, newTrip]);
        setFilteredTrips(prev => [...prev, newTrip]);
      }
      return newTrip;
    } catch (error) {
      console.error('Error adding trip:', error);
      Alert.alert('Ошибка', 'Не удалось добавить рейс');
      return null;
    }
  };
  
  const updateTrip = async (id: string, trip: Trip, oldTrip: Trip): Promise<Trip | null> => {
    if (!db) return null;
    
    try {
      // Update the trip
      const updatedTrip = await db.from('trips').update(id, trip);
      
      if (updatedTrip) {
        // Update local state
        setTrips(prev => prev.map(t => t.id === id ? updatedTrip : t));
        setFilteredTrips(prev => prev.map(t => t.id === id ? updatedTrip : t));
        
        // Create history record
        const changedFields: string[] = [];
        const previousValues: Record<string, any> = {};
        const newValues: Record<string, any> = {};
        
        // Compare old and new trip to determine changes
        Object.keys(trip).forEach(key => {
          if (key !== 'id' && oldTrip[key as keyof Trip] !== trip[key as keyof Trip]) {
            changedFields.push(key);
            previousValues[key] = oldTrip[key as keyof Trip];
            newValues[key] = trip[key as keyof Trip];
          }
        });
        
        if (changedFields.length > 0) {
          const historyRecord: TripHistory = {
            tripId: id,
            changeDate: getCurrentDate(),
            changedFields: JSON.stringify(changedFields),
            previousValues: JSON.stringify(previousValues),
            newValues: JSON.stringify(newValues)
          };
          
          await db.from('tripHistory').add(historyRecord);
        }
      }
      
      return updatedTrip;
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Ошибка', 'Не удалось обновить рейс');
      return null;
    }
  };
  
  const deleteTrip = async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      // Delete the trip
      await db.from('trips').delete(id);
      
      // Update local state
      setTrips(prev => prev.filter(t => t.id !== id));
      setFilteredTrips(prev => prev.filter(t => t.id !== id));
      
      // Delete related history records
      const historyRecords = await getTripHistory(id);
      for (const record of historyRecords) {
        if (record.id) {
          await db.from('tripHistory').delete(record.id);
        }
      }
      
      // Delete related documents
      const documents = await getDocuments(id);
      for (const doc of documents) {
        if (doc.id) {
          await db.from('documents').delete(doc.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      Alert.alert('Ошибка', 'Не удалось удалить рейс');
      return false;
    }
  };
  
  // Trip History operations
  const getTripHistory = async (tripId: string): Promise<TripHistory[]> => {
    if (!db) return [];
    
    try {
      const allHistory = await db.from('tripHistory').getAll();
      return allHistory ? allHistory.filter(h => h.tripId === tripId) : [];
    } catch (error) {
      console.error('Error getting trip history:', error);
      return [];
    }
  };
  
  // Document operations
  const getDocuments = async (tripId: string): Promise<Document[]> => {
    if (!db) return [];
    
    try {
      const allDocuments = await db.from('documents').getAll();
      return allDocuments ? allDocuments.filter(d => d.tripId === tripId) : [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  };
  
  const addDocument = async (document: Document): Promise<Document | null> => {
    if (!db) return null;
    
    try {
      return await db.from('documents').add(document);
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Ошибка', 'Не удалось добавить документ');
      return null;
    }
  };
  
  const deleteDocument = async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.from('documents').delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Ошибка', 'Не удалось удалить документ');
      return false;
    }
  };
  
  // Filter operations
  const filterTrips = (options: FilterOptions) => {
    let filtered = [...trips];
    
    if (options.startDate) {
      filtered = filtered.filter(trip => trip.date >= options.startDate!);
    }
    
    if (options.endDate) {
      filtered = filtered.filter(trip => trip.date <= options.endDate!);
    }
    
    if (options.clientId) {
      filtered = filtered.filter(trip => trip.clientId === options.clientId);
    }
    
    if (options.startLocation) {
      filtered = filtered.filter(trip => 
        trip.startLocation.toLowerCase().includes(options.startLocation!.toLowerCase())
      );
    }
    
    if (options.endLocation) {
      filtered = filtered.filter(trip => 
        trip.endLocation.toLowerCase().includes(options.endLocation!.toLowerCase())
      );
    }
    
    if (options.status) {
      filtered = filtered.filter(trip => trip.status === options.status);
    }
    
    setFilteredTrips(filtered);
  };
  
  const clearFilters = () => {
    setFilteredTrips(trips);
  };
  
  const refreshData = async () => {
    await loadData();
  };
  
  const value = {
    clients,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    
    trips,
    filteredTrips,
    getTrip,
    addTrip,
    updateTrip,
    deleteTrip,
    filterTrips,
    clearFilters,
    
    getTripHistory,
    
    getDocuments,
    addDocument,
    deleteDocument,
    
    isLoading,
    refreshData
  };
  
  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};