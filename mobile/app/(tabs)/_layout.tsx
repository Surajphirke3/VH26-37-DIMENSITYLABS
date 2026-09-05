import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  focused: boolean;
  color: string;
  size: number;
}

function TabIcon({ name, focused, color, size }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: colors.text,
          letterSpacing: 0.3,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'pulse' : 'pulse-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
