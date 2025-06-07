import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { useBasic } from '@basictech/expo';
import { DatabaseProvider } from './context/DatabaseContext';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { View, ActivityIndicator, Text } from 'react-native';

// Компонент для содержимого приложения
const AppContent = () => {
  const { isSignedIn, isLoading } = useBasic();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Загрузка приложения...</Text>
      </View>
    );
  }
  
  return isSignedIn ? <AppNavigator /> : <AuthScreen />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <BasicProvider project_id={schema.project_id} schema={schema}>
          <DatabaseProvider>
            <AppContent />
          </DatabaseProvider>
        </BasicProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
