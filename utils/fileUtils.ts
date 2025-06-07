import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const pickDocument = async (): Promise<DocumentPicker.DocumentPickerResult | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*',
    });
    
    if (result.canceled) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error picking document:', error);
    Alert.alert('Ошибка', 'Не удалось выбрать документ');
    return null;
  }
};

export const saveDocument = async (uri: string, newFileName: string): Promise<string | null> => {
  try {
    const documentDirectory = FileSystem.documentDirectory;
    const destinationUri = `${documentDirectory}documents/${newFileName}`;
    
    // Ensure the documents directory exists
    const documentsDir = `${documentDirectory}documents`;
    const dirInfo = await FileSystem.getInfoAsync(documentsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
    }
    
    // Copy the file to the documents directory
    await FileSystem.copyAsync({
      from: uri,
      to: destinationUri,
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error saving document:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить документ');
    return null;
  }
};

export const openDocument = async (uri: string): Promise<void> => {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Ошибка', 'Функция открытия документов недоступна на этом устройстве');
    }
  } catch (error) {
    console.error('Error opening document:', error);
    Alert.alert('Ошибка', 'Не удалось открыть документ');
  }
};

export const deleteDocument = async (uri: string): Promise<boolean> => {
  try {
    await FileSystem.deleteAsync(uri);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    Alert.alert('Ошибка', 'Не удалось удалить документ');
    return false;
  }
};

export const getFileInfo = async (uri: string): Promise<FileSystem.FileInfo | null> => {
  try {
    return await FileSystem.getInfoAsync(uri);
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const getFileName = (uri?: string): string => {
  if (!uri) return 'unknown_file';
  return uri.split('/').pop() || 'unknown_file';
};
