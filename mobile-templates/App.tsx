/**
 * App Entry Point
 * React Native App cho Thư Viện Ảnh VẢI
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Screens
import HomeScreen from './src/screens/HomeScreen'
import FabricsScreen from './src/screens/FabricsScreen'
// import AlbumsScreen from './src/screens/AlbumsScreen'
// import ProjectsScreen from './src/screens/ProjectsScreen'
// import CollectionsScreen from './src/screens/CollectionsScreen'

import { COLORS } from './src/constants/config'

// Create navigators
const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang Chủ',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Fabrics"
        component={FabricsScreen}
        options={{
          title: 'Vải',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🧵</span>,
          headerTitle: 'Thư Viện Vải',
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.text.primary,
        }}
      />
      {/* Uncomment khi đã tạo các screens khác */}
      {/* <Tab.Screen
        name="Albums"
        component={AlbumsScreen}
        options={{
          title: 'Albums',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📁</span>,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Dự Án',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏗️</span>,
        }}
      /> */}
    </Tab.Navigator>
  )
}

// Main App
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          {/* Add more screens here */}
          {/* <Stack.Screen
            name="FabricDetail"
            component={FabricDetailScreen}
            options={{ title: 'Chi Tiết Vải' }}
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}

