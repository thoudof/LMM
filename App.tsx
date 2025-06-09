import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { useBasic } from '@basictech/expo';
import { DatabaseProvider } from './context/DatabaseContext';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';

// Настраиваем тему приложения
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#03A9F4',
    error: '#F44336',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
  },
  roundness: 8,
};

// Компонент для содержимого приложения
const AppContent = () => {
  const { isSignedIn, isLoading } = useBasic();
  
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5' 
      }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16,
          color: '#424242'
        }}>
          Загрузка приложения...
        </Text>
      </View>
    );
  }
  
  return isSignedIn ? <AppNavigator /> : <AuthScreen />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PaperProvider theme={theme}>
        <BasicProvider project_id={schema.project_id} schema={schema}>
          <DatabaseProvider>
            <AppContent />
          </DatabaseProvider>
        </BasicProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
