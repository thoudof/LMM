import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { getFileExtension, getFileName } from './fileUtils';

// Базовый URL NextCloud сервера
const NEXTCLOUD_BASE_URL = 'https://your-nextcloud-server.com'; // Замените на ваш URL
const NEXTCLOUD_USERNAME = 'your-username'; // Замените на ваше имя пользователя
const NEXTCLOUD_PASSWORD = 'your-password'; // Замените на ваш пароль

// Базовая директория для хранения документов
const BASE_DIRECTORY = 'logistics-app';

/**
 * Создает директорию на NextCloud сервере
 * @param path Путь к директории
 */
export const createNextCloudDirectory = async (path: string): Promise<boolean> => {
  try {
    const url = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${NEXTCLOUD_USERNAME}/${path}`;
    
    const response = await fetch(url, {
      method: 'MKCOL',
      headers: {
        'Authorization': 'Basic ' + btoa(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`),
      },
    });
    
    return response.status === 201 || response.status === 405; // 201 - Created, 405 - Already exists
  } catch (error) {
    console.error('Error creating NextCloud directory:', error);
    return false;
  }
};

/**
 * Загружает файл на NextCloud сервер
 * @param localUri Локальный URI файла
 * @param remotePath Путь на сервере
 */
export const uploadFileToNextCloud = async (localUri: string, remotePath: string): Promise<string | null> => {
  try {
    // Получаем содержимое файла
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    
    // Читаем файл как base64
    const fileContent = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Декодируем base64 в бинарные данные
    const binaryData = atob(fileContent);
    
    // Формируем URL для загрузки
    const url = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${NEXTCLOUD_USERNAME}/${remotePath}`;
    
    // Загружаем файл
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`),
        'Content-Type': 'application/octet-stream',
      },
      body: binaryData,
    });
    
    if (response.ok) {
      return `${NEXTCLOUD_BASE_URL}/index.php/apps/files/?dir=/${remotePath.split('/').slice(0, -1).join('/')}`;
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading file to NextCloud:', error);
    return null;
  }
};

/**
 * Скачивает файл с NextCloud сервера
 * @param remotePath Путь к файлу на сервере
 * @param localPath Локальный путь для сохранения
 */
export const downloadFileFromNextCloud = async (remotePath: string, localPath: string): Promise<string | null> => {
  try {
    const url = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${NEXTCLOUD_USERNAME}/${remotePath}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = reader.result?.toString().split(',')[1];
          if (!base64data) {
            reject(new Error('Failed to convert file to base64'));
            return;
          }
          
          await FileSystem.writeAsStringAsync(localPath, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          resolve(localPath);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error downloading file from NextCloud:', error);
    return null;
  }
};

/**
 * Удаляет файл с NextCloud сервера
 * @param remotePath Путь к файлу на сервере
 */
export const deleteFileFromNextCloud = async (remotePath: string): Promise<boolean> => {
  try {
    const url = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${NEXTCLOUD_USERNAME}/${remotePath}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`),
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting file from NextCloud:', error);
    return false;
  }
};

/**
 * Создает структуру директорий для рейса
 * @param tripId ID рейса
 */
export const createTripDirectoryStructure = async (tripId: string): Promise<boolean> => {
  try {
    // Создаем базовую директорию, если она не существует
    await createNextCloudDirectory(BASE_DIRECTORY);
    
    // Создаем директорию для рейса
    const tripDirectory = `${BASE_DIRECTORY}/trip-${tripId}`;
    await createNextCloudDirectory(tripDirectory);
    
    // Создаем поддиректории для разных типов документов
    await createNextCloudDirectory(`${tripDirectory}/invoices`);
    await createNextCloudDirectory(`${tripDirectory}/waybills`);
    await createNextCloudDirectory(`${tripDirectory}/contracts`);
    await createNextCloudDirectory(`${tripDirectory}/other`);
    
    return true;
  } catch (error) {
    console.error('Error creating trip directory structure:', error);
    return false;
  }
};

/**
 * Загружает документ на NextCloud сервер
 * @param tripId ID рейса
 * @param documentType Тип документа
 * @param localUri Локальный URI файла
 * @param fileName Имя файла
 */
export const uploadTripDocument = async (
  tripId: string,
  documentType: string,
  localUri: string,
  fileName: string
): Promise<string | null> => {
  try {
    // Создаем структуру директорий, если она не существует
    await createTripDirectoryStructure(tripId);
    
    // Определяем поддиректорию в зависимости от типа документа
    let subDirectory = 'other';
    switch (documentType) {
      case 'invoice':
        subDirectory = 'invoices';
        break;
      case 'waybill':
        subDirectory = 'waybills';
        break;
      case 'contract':
        subDirectory = 'contracts';
        break;
    }
    
    // Формируем путь для загрузки
    const remotePath = `${BASE_DIRECTORY}/trip-${tripId}/${subDirectory}/${fileName}`;
    
    // Загружаем файл
    return await uploadFileToNextCloud(localUri, remotePath);
  } catch (error) {
    console.error('Error uploading trip document:', error);
    return null;
  }
};

/**
 * Выбирает и загружает документ на NextCloud
 * @param tripId ID рейса
 * @param documentType Тип документа
 */
export const pickAndUploadDocument = async (
  tripId: string,
  documentType: string
): Promise<{ success: boolean; fileName?: string; remotePath?: string }> => {
  try {
    // Выбираем документ
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*',
    });
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { success: false };
    }
    
    const file = result.assets[0];
    const fileName = file.name || getFileName(file.uri);
    
    // Загружаем документ
    const remotePath = await uploadTripDocument(tripId, documentType, file.uri, fileName);
    
    if (remotePath) {
      return {
        success: true,
        fileName,
        remotePath,
      };
    } else {
      Alert.alert('Ошибка', 'Не удалось загрузить документ на сервер');
      return { success: false };
    }
  } catch (error) {
    console.error('Error picking and uploading document:', error);
    Alert.alert('Ошибка', 'Произошла ошибка при выборе или загрузке документа');
    return { success: false };
  }
};