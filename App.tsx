import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { BasicProvider } from '@basictech/expo';
import { schema } from './basic.config';
import { DatabaseProvider } from './context/DatabaseContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <BasicProvider project_id={schema.project_id} schema={schema}>
          <DatabaseProvider>
            <AppNavigator />
          </DatabaseProvider>
        </BasicProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}