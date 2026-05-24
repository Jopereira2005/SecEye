import React from 'react';
import { Tabs } from 'expo-router';
import { Header } from '@/components/Header/header';
import { Navbar } from '@/components/Navbar/navbar';

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={(props) => <Navbar {...props} />}
      screenOptions={{
        header: () => <Header />
      }}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Início' }} />
      <Tabs.Screen name="routine/index" options={{ title: 'Rotina' }} />
      <Tabs.Screen name="devices/index" options={{ title: 'Dispositivos' }} />
      <Tabs.Screen name="occurrences/index" options={{ title: 'Ocorrências' }} />
      <Tabs.Screen name="profile/index" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
