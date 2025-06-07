import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { List, IconButton, Text } from 'react-native-paper';
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
  
  return (
    <TouchableOpacity onPress={() => onOpen(document)}>
      <List.Item
        title={document.name || 'Без названия'}
        description={
          <View>
            <Text variant="bodySmall">Тип: {typeName}</Text>
            <Text variant="bodySmall">Добавлен: {formatDateTime(document.uploadDate)}</Text>
            {document.notes && <Text variant="bodySmall">Примечание: {document.notes}</Text>}
          </View>
        }
        left={props => <List.Icon {...props} icon={icon} />}
        right={props => (
          <IconButton
            {...props}
            icon="delete"
            onPress={() => onDelete(document)}
          />
        )}
        style={styles.item}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

export default DocumentItem;
