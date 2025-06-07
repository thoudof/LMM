import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientDetailsScreen from '../screens/ClientDetailsScreen';
import TripsScreen from '../screens/TripsScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import TripEditScreen from '../screens/TripEditScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';

// Stack navigators
const HomeStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const TripsStack = createNativeStackNavigator();
const StatisticsStack = createNativeStackNavigator();

// Tab navigator
const Tab = createBottomTabNavigator();

// Home stack
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: 'Главная' }}
      />
    </HomeStack.Navigator>
  );
};

// Clients stack
const ClientsStackNavigator = () => {
  return (
    <ClientsStack.Navigator>
      <ClientsStack.Screen 
        name="ClientsScreen" 
        component={ClientsScreen} 
        options={{ title: 'Контрагенты' }}
      />
      <ClientsStack.Screen 
        name="ClientDetails" 
        component={ClientDetailsScreen} 
        options={{ title: 'Детали контрагента' }}
      />
    </ClientsStack.Navigator>
  );
};

// Trips stack
const TripsStackNavigator = () => {
  return (
    <TripsStack.Navigator>
      <TripsStack.Screen 
        name="TripsScreen" 
        component={TripsScreen} 
        options={{ title: 'Рейсы' }}
      />
      <TripsStack.Screen 
        name="TripDetails" 
        component={TripDetailsScreen} 
        options={{ title: 'Детали рейса' }}
      />
      <TripsStack.Screen 
        name="TripEdit" 
        component={TripEditScreen} 
        options={{ title: 'Редактирование рейса' }}
      />
      <TripsStack.Screen 
        name="Documents" 
        component={DocumentsScreen} 
        options={{ title: 'Документы' }}
      />
    </TripsStack.Navigator>
  );
};

// Statistics stack
const StatisticsStackNavigator = () => {
  return (
    <StatisticsStack.Navigator>
      <StatisticsStack.Screen 
        name="StatisticsScreen" 
        component={StatisticsScreen} 
        options={{ title: 'Статистика' }}
      />
    </StatisticsStack.Navigator>
  );
};

// Main tab navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStackNavigator} 
          options={{
            tabBarLabel: 'Главная',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Clients" 
          component={ClientsStackNavigator} 
          options={{
            tabBarLabel: 'Контрагенты',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Trips" 
          component={TripsStackNavigator} 
          options={{
            tabBarLabel: 'Рейсы',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="truck" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Statistics" 
          component={StatisticsStackNavigator} 
          options={{
            tabBarLabel: 'Статистика',
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