import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Modal } from 'react-native';
import { Text, FAB, Button, TextInput, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDatabase } from '../context/DatabaseContext';
import { Document, DocumentType } from '../types';
import DocumentItem from '../components/DocumentItem';
import { pickDocument, saveDocument, openDocument, deleteDocument, getFileName } from '../utils/fileUtils';
import { getCurrentDate } from '../utils/dateUtils';

const DocumentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { getDocuments, addDocument, deleteDocument: deleteDocumentFromDb } = useDatabase();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [documentNotes, setDocumentNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string } | null>(null);
  
  useEffect(() => {
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
      }
    };
    
    loadDocuments();
  }, [route.params]);
  
  const handleAddDocument = async () => {
    try {
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
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать документ');
    }
  };
  
  const handleSaveDocument = async () => {
    if (!selectedFile) {
      Alert.alert('Ошибка', 'Файл не выбран');
      return;
    }
    
    if (!documentName.trim()) {
      Alert.alert('Ошибка', 'Введите название документа');
      return;
    }
    
    try {
      // @ts-ignore
      const tripId = route.params?.tripId;
      
      if (!tripId) {
        Alert.alert('Ошибка', 'Идентификатор рейса не найден');
        return;
      }
      
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
  };
  
  const handleOpenDocument = async (document: Document) => {
    try {
      await openDocument(document.uri);
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Ошибка', 'Не удалось открыть документ');
    }
  };
  
  const handleDeleteDocument = (document: Document) => {
    if (!document.id) return;
    
    Alert.alert(
      'Удаление документа',
      `Вы уверены, что хотите удалить документ "${document.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              await deleteDocument(document.uri);
              
              // Delete from database
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
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id || item.uri}
        renderItem={({ item }) => (
          <DocumentItem
            document={item}
            onOpen={handleOpenDocument}
            onDelete={handleDeleteDocument}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
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
            Добавление документа
          </Text>
          
          <TextInput
            label="Название документа *"
            value={documentName}
            onChangeText={setDocumentName}
            style={styles.input}
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
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }} 
              style={styles.button}
            >
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveDocument} 
              style={styles.button}
            >
              Сохранить
            </Button>
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
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
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    width: '48%',
  },
});

export default DocumentsScreen;