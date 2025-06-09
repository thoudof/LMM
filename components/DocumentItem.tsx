import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { List, IconButton, Text, Surface } from 'react-native-paper';
import { Document } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface DocumentItemProps {
  document: Document;
  onOpen: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const getDocumentIcon = (type?: string): string => {
  switch (type) {
    case 'invoice':
      return 'file-document-outline';
    case 'waybill':
      return 'clipboard-text-outline';
    case 'contract':
      return 'file-sign';
    default:
      return 'file-outline';
  }
};

const getDocumentTypeName = (type?: string): string => {
  switch (type) {
    case 'invoice':
      return 'Счет';
    case 'waybill':
      return 'Накладная';
    case 'contract':
      return 'Договор';
    default:
      return 'Другое';
  }
};

const DocumentItem: React.FC<DocumentItemProps> = ({ document, onOpen, onDelete }) => {
  const icon = getDocumentIcon(document.type);
  const typeName = getDocumentTypeName(document.type);
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  return (
    <Surface style={styles.surface}>
      <TouchableOpacity onPress={() => onOpen(document)}>
        <List.Item
          title={document.name || 'Без названия'}
          titleStyle={styles.title}
          description={
            <View style={styles.descriptionContainer}>
              <Text variant="bodySmall" style={styles.typeText}>Тип: {typeName}</Text>
              <Text variant="bodySmall" style={styles.dateText}>Добавлен: {formatDateTime(document.uploadDate)}</Text>
              {document.notes && <Text variant="bodySmall" style={styles.notesText}>Примечание: {document.notes}</Text>}
            </View>
          }
          left={props => <List.Icon {...props} icon={icon} color="#2196F3" />}
          right={props => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => onDelete(document)}
              iconColor="#F44336"
              style={styles.deleteButton}
            />
          )}
          style={styles.item}
        />
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    elevation: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  item: {
    padding: 0,
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  descriptionContainer: {
    marginTop: 4,
  },
  typeText: {
    color: '#2196F3',
  },
  dateText: {
    color: '#757575',
  },
  notesText: {
    color: '#616161',
    fontStyle: 'italic',
  },
  deleteButton: {
    margin: 0,
  },
});

export default DocumentItem;
