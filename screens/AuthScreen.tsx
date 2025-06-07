import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';

const AuthScreen = () => {
  const { login, isLoading } = useBasic();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="truck-delivery" size={100} color="#2196F3" />
        
        <Text variant="headlineLarge" style={styles.title}>
          Логистика
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          Управление грузоперевозками
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="account-group" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Управление контрагентами</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="truck-fast" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Учет рейсов</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Статистика и аналитика</Text>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="file-document" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Управление документами</Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            "Войти в систему"
          )}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2196F3',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#757575',
  },
  features: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  loginButtonContent: {
    height: 40,
    justifyContent: 'center',
  },
});

export default AuthScreen;