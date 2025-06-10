import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Modal, Dimensions, RefreshControl } from 'react-native';
import { Text, FAB, Button, TextInput, ActivityIndicator, SegmentedButtons, Divider, Surface } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ReactNavigation from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { Document, DocumentType } from '../types';
import DocumentItem from '../components/DocumentItem';
import { pickDocument, saveDocument, openDocument, deleteDocument, getFileName } from '../utils/fileUtils';
import { getCurrentDate } from '../utils/dateUtils';
import { 
  createTripDirectoryStructure, 
  pickAndUploadDocument, 
  deleteFileFromNextCloud 
} from '../utils/nextCloudUtils';

const DocumentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { getDocuments, addDocument, deleteDocument: deleteDocumentFromDb } = useDatabase();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [documentNotes, setDocumentNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  const [isNextCloudEnabled, setIsNextCloudEnabled] = useState(true);
  const [uploadingToNextCloud, setUploadingToNextCloud] = useState(false);
  
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const tripId = route.params?.tripId;
      
      if (tripId) {
        const docs = await getDocuments(tripId);
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  ReactNavigation.useFocusEffect(
    React.useCallback(() => {
      loadDocuments();
    }, [route.params])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };
  
  const handleAddDocument = async () => {
    try {
      // @ts-ignore
      const tripId = route.params?.tripId;
      
      if (!tripId) {
        Alert.alert('Ошибка', 'Идентификатор рейса не найден');
        return;
      }
      
      if (isNextCloudEnabled) {
        setUploadingToNextCloud(true);
        
        // Создаем структуру директорий на NextCloud
        await createTripDirectoryStructure(tripId);
        
        // Открываем модальное окно для выбора типа документа
        setModalVisible(true);
        setUploadingToNextCloud(false);
      } else {
        // Стандартный выбор документа
        const result = await pickDocument();
        
        if (result && !result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          setSelectedFile({
            uri: file.uri,
            name: file.name || getFileName(file.uri),
          });
          setDocumentName(file.name || getFileName(file.uri));
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать документ');
      setUploadingToNextCloud(false);
    }
  };
  
  const handleSaveDocument = async () => {
    // @ts-ignore
    const tripId = route.params?.tripId;
    
    if (!tripId) {
      Alert.alert('Ошибка', 'Идентификатор рейса не найден');
      return;
    }
    
    if (isNextCloudEnabled) {
      // Загрузка на NextCloud
      setUploadingToNextCloud(true);
      
      try {
        const result = await pickAndUploadDocument(tripId, documentType);
        
        if (result.success && result.fileName && result.remotePath) {
          // Добавляем документ в базу данных
          const newDocument: Document = {
            tripId,
            name: documentName || result.fileName,
            type: documentType,
            uri: result.remotePath,
            uploadDate: getCurrentDate(),
            notes: documentNotes,
          };
          
          const addedDocument = await addDocument(newDocument);
          
          if (addedDocument) {
            setDocuments(prev => [...prev, addedDocument]);
            setModalVisible(false);
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error uploading to NextCloud:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить документ на NextCloud');
      } finally {
        setUploadingToNextCloud(false);
      }
    } else {
      // Стандартное сохранение
      if (!selectedFile) {
        Alert.alert('Ошибка', 'Файл не выбран');
        return;
      }
      
      if (!documentName.trim()) {
        Alert.alert('Ошибка', 'Введите название документа');
        return;
      }
      
      try {
        // Save the file
        const savedUri = await saveDocument(selectedFile.uri, `${tripId}_${documentName}`);
        
        if (savedUri) {
          // Add document to database
          const newDocument: Document = {
            tripId,
            name: documentName,
            type: documentType,
            uri: savedUri,
            uploadDate: getCurrentDate(),
            notes: documentNotes,
          };
          
          const addedDocument = await addDocument(newDocument);
          
          if (addedDocument) {
            setDocuments(prev => [...prev, addedDocument]);
            setModalVisible(false);
            resetForm();
          }
        }
      } catch (error) {
        console.error('Error saving document:', error);
        Alert.alert('Ошибка', 'Не удалось сохранить документ');
      }
    }
  };
  
  const handleDeleteDocument = (document: Document) => {
    if (!document.id) return;
    
    Alert.alert(
      'Удаление документа',
      `Вы уверены, что хотите удалить документ "${document.name || 'Без названия'}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (isNextCloudEnabled && document.uri && document.uri.includes('nextcloud')) {
                // Удаление с NextCloud
                // Извлекаем путь к файлу из URI
                const remotePath = document.uri.split('/files/')[1];
                if (remotePath) {
                  await deleteFileFromNextCloud(remotePath);
                }
              } else if (document.uri) {
                // Стандартное удаление
                await deleteDocument(document.uri);
              }
              
              // Удаление из базы данных
              const success = await deleteDocumentFromDb(document.id!);
              
              if (success) {
                setDocuments(prev => prev.filter(doc => doc.id !== document.id));
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Ошибка', 'Не удалось удалить документ');
            }
          }
        },
      ]
    );
  };
  
  const resetForm = () => {
    setDocumentName('');
    setDocumentType('invoice');
    setDocumentNotes('');
    setSelectedFile(null);
  };
  
  const toggleNextCloudMode = () => {
    setIsNextCloudEnabled(!isNextCloudEnabled);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Загрузка документов...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Text variant="titleMedium" style={styles.headerTitle}>Документы рейса</Text>
        <Button 
          mode="text" 
          onPress={toggleNextCloudMode}
          icon={isNextCloudEnabled ? "cloud" : "folder"}
        >
          {isNextCloudEnabled ? "NextCloud" : "Локально"}
        </Button>
      </Surface>
      
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id || item.uri || Math.random().toString()}
        renderItem={({ item }) => (
          <DocumentItem
            document={item}
            onOpen={openDocument}
            onDelete={handleDeleteDocument}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Нет прикрепленных документов</Text>
            <Button 
              mode="contained" 
              onPress={handleAddDocument}
              style={styles.addButton}
              icon="file-plus"
            >
              Добавить документ
            </Button>
          </View>
        }
        contentContainerStyle={documents.length === 0 ? { flex: 1 } : {}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      <FAB
        style={styles.fab}
        icon="file-plus"
        onPress={handleAddDocument}
        visible={documents.length > 0}
      />
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text variant="headlineMedium" style={styles.modalTitle}>
            {isNextCloudEnabled ? "Загрузка документа на NextCloud" : "Добавление документа"}
          </Text>
          
          {uploadingToNextCloud ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text>Загрузка на NextCloud...</Text>
            </View>
          ) : (
            <>
              <TextInput
                label="Название документа *"
                value={documentName}
                onChangeText={setDocumentName}
                style={styles.input}
                mode="outlined"
                outlineColor="#ccc"
                activeOutlineColor="#2196F3"
              />
              
              <Text style={styles.label}>Тип документа *</Text>
              <SegmentedButtons
                value={documentType}
                onValueChange={(value) => setDocumentType(value as DocumentType)}
                buttons={[
                  { value: 'invoice', label: 'Счет' },
                  { value: 'waybill', label: 'Накладная' },
                  { value: 'contract', label: 'Договор' },
                  { value: 'other', label: 'Другое' },
                ]}
                style={styles.segmentedButtons}
              />
              
              <TextInput
                label="Примечания"
                value={documentNotes}
                onChangeText={setDocumentNotes}
                style={styles.input}
                multiline
                numberOfLines={3}
                mode="outlined"
                outlineColor="#ccc"
                activeOutlineColor="#2196F3"
              />
              
              {isNextCloudEnabled && (
                <View style={styles.nextCloudInfo}>
                  <MaterialCommunityIcons name="cloud-upload" size={24} color="#2196F3" />
                  <Text style={styles.nextCloudText}>
                    Документ будет загружен на NextCloud сервер в соответствующую директорию
                  </Text>
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }} 
                  style={styles.button}
                  buttonColor="#fff"
                  textColor="#2196F3"
                >
                  Отмена
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveDocument} 
                  style={styles.button}
                  buttonColor="#2196F3"
                >
                  {isNextCloudEnabled ? "Выбрать и загрузить" : "Сохранить"}
                </Button>
              </View>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
    marginVertical: 16,
  },
  addButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    borderRadius: 28,
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
    color: '#2196F3',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
    paddingLeft: 4,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  nextCloudInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  nextCloudText: {
    marginLeft: 8,
    flex: 1,
    color: '#0D47A1',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    width: '48%',
    borderRadius: 8,
    paddingVertical: 6,
  },
});

export default DocumentsScreen;