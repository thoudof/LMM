import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
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
  
  // Auth and Loading state
  isLoading: boolean;
  isSignedIn: boolean;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { db, isLoading: basicLoading, isSignedIn, signout } = useBasic<AppSchema>();
  const [clients, setClients] = useState<Client[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load initial data with useCallback for better performance
  const loadData = useCallback(async () => {
    if (!db || !isSignedIn) return;
    
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
  }, [db, isSignedIn]);
  
  useEffect(() => {
    if (db && isSignedIn && !basicLoading) {
      loadData();
    } else if (!isSignedIn) {
      // Reset data when signed out
      setClients([]);
      setTrips([]);
      setFilteredTrips([]);
      setIsLoading(false);
    }
  }, [db, isSignedIn, basicLoading, loadData]);
  
  // Client operations with useCallback
  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    if (!db || !isSignedIn) return null;
    
    try {
      return await db.from('clients').get(id);
    } catch (error) {
      console.error('Error getting client:', error);
      return null;
    }
  }, [db, isSignedIn]);
  
  const addClient = useCallback(async (client: Client): Promise<Client | null> => {
    if (!db || !isSignedIn) return null;
    
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
  }, [db, isSignedIn]);
  
  const updateClient = useCallback(async (id: string, client: Client): Promise<Client | null> => {
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
  }, [db]);
  
  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
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
  }, [db]);
  
  // Trip operations
  const getTrip = useCallback(async (id: string): Promise<Trip | null> => {
    if (!db) return null;
    
    try {
      return await db.from('trips').get(id);
    } catch (error) {
      console.error('Error getting trip:', error);
      return null;
    }
  }, [db]);
  
  const addTrip = useCallback(async (trip: Trip): Promise<Trip | null> => {
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
  }, [db]);
  
  const updateTrip = useCallback(async (id: string, trip: Trip, oldTrip: Trip): Promise<Trip | null> => {
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
  }, [db]);
  
  const deleteTrip = useCallback(async (id: string): Promise<boolean> => {
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
  }, [db, getTripHistory, getDocuments]);
  
  // Trip History operations
  const getTripHistory = useCallback((tripId: string): Promise<TripHistory[]> => {
    if (!db) return [];
    
    try {
      const allHistory = await db.from('tripHistory').getAll();
      return allHistory ? allHistory.filter(h => h.tripId === tripId) : [];
    } catch (error) {
      console.error('Error getting trip history:', error);
      return [];
    }
  }, [db]);
  
  // Document operations
  const getDocuments = useCallback((tripId: string): Promise<Document[]> => {
    if (!db) return [];
    
    try {
      const allDocuments = await db.from('documents').getAll();
      return allDocuments ? allDocuments.filter(d => d.tripId === tripId) : [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }, [db]);
  
  const addDocument = useCallback(async (document: Document): Promise<Document | null> => {
    if (!db) return null;
    
    try {
      return await db.from('documents').add(document);
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Ошибка', 'Не удалось добавить документ');
      return null;
    }
  }, [db]);
  
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.from('documents').delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      Alert.alert('Ошибка', 'Не удалось удалить документ');
      return false;
    }
  }, [db]);
  
  // Filter operations with useCallback
  const filterTrips = useCallback((options: FilterOptions) => {
    setFilteredTrips(trips.filter(trip => {
      let match = true;
      
      if (options.startDate && trip.date < options.startDate) {
        match = false;
      }
      
      if (options.endDate && trip.date > options.endDate) {
        match = false;
      }
      
      if (options.clientId && trip.clientId !== options.clientId) {
        match = false;
      }
      
      if (options.startLocation && !trip.startLocation.toLowerCase().includes(options.startLocation.toLowerCase())) {
        match = false;
      }
      
      if (options.endLocation && !trip.endLocation.toLowerCase().includes(options.endLocation.toLowerCase())) {
        match = false;
      }
      
      if (options.status && trip.status !== options.status) {
        match = false;
      }
      
      return match;
    }));
  }, [trips]);
  
  const clearFilters = useCallback(() => {
    setFilteredTrips(trips);
  }, [trips]);
  
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);
  
  const signOut = useCallback(async () => {
    try {
      await signout();
      // Data will be reset in the useEffect when isSignedIn changes
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из системы');
    }
  }, [signout]);
  
  // Use useMemo for the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
    isSignedIn,
    refreshData,
    signOut
  }), [
    clients, getClient, addClient, updateClient, deleteClient,
    trips, filteredTrips, getTrip, addTrip, updateTrip, deleteTrip, filterTrips, clearFilters,
    getTripHistory, getDocuments, addDocument, deleteDocument,
    isLoading, isSignedIn, refreshData, signOut
  ]);
  
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
