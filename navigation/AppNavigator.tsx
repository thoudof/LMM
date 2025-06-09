import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Dimensions, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ClientsScreen from '../screens/ClientsScreen';
import TripsScreen from '../screens/TripsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ClientDetailsScreen from '../screens/ClientDetailsScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import TripEditScreen from '../screens/TripEditScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ClientsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="ClientsList" 
        component={ClientsScreen} 
        options={{ title: 'Контрагенты' }} 
      />
      <Stack.Screen 
        name="ClientDetails" 
        component={ClientDetailsScreen} 
        options={{ title: 'Детали контрагента' }} 
      />
    </Stack.Navigator>
  );
};

const TripsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="TripsList" 
        component={TripsScreen} 
        options={{ title: 'Рейсы' }} 
      />
      <Stack.Screen 
        name="TripDetails" 
        component={TripDetailsScreen} 
        options={{ title: 'Детали рейса' }} 
      />
      <Stack.Screen 
        name="TripEdit" 
        component={TripEditScreen} 
        options={({ route }) => ({ 
          title: route.params?.tripId ? 'Редактирование рейса' : 'Новый рейс' 
        })} 
      />
      <Stack.Screen 
        name="Documents" 
        component={DocumentsScreen} 
        options={{ title: 'Документы' }} 
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isSmallScreen = windowWidth < 375;
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: isSmallScreen ? 10 : 12,
          },
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Главная',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Clients" 
          component={ClientsStack} 
          options={{
            title: 'Контрагенты',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Trips" 
          component={TripsStack} 
          options={{
            title: 'Рейсы',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="truck" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Statistics" 
          component={StatisticsScreen} 
          options={{
            title: 'Статистика',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
