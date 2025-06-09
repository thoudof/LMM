import React from 'react';
import { StyleSheet, View, Image, Dimensions, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import { StatusBar } from 'expo-status-bar';

const AuthScreen = () => {
  const { login, isLoading } = useBasic();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.topSection}>
        <MaterialCommunityIcons 
          name="truck-delivery" 
          size={isSmallScreen ? 80 : 100} 
          color="#FFFFFF" 
        />
        
        <Text 
          variant={isSmallScreen ? "headlineMedium" : "headlineLarge"} 
          style={styles.title}
        >
          Логистика
        </Text>
        
        <Text 
          variant={isSmallScreen ? "bodyLarge" : "titleLarge"} 
          style={styles.subtitle}
        >
          Управление грузоперевозками
        </Text>
      </View>
      
      <Surface style={styles.content}>
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
          
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="cloud-sync" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Интеграция с NextCloud</Text>
          </View>
        </View>
        
        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
          contentStyle={styles.loginButtonContent}
          buttonColor="#2196F3"
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            "Войти в систему"
          )}
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  features: {
    width: '100%',
    marginBottom: 30,
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#424242',
    flex: 1,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonContent: {
    height: 48,
    justifyContent: 'center',
  },
});

export default AuthScreen;
