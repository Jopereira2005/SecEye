import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Header } from '@/components/Header/header';
import { Navbar } from '@/components/Navbar/navbar';
import { connectMqtt, disconnectMqtt } from '@/services';

export default function TabLayout() {
  useEffect(() => {
    connectMqtt();
    return () => {
      disconnectMqtt();
    };
  }, []);

  return (
    <Tabs 
      tabBar={(props) => <Navbar {...props} />}
      screenOptions={{
        header: () => <Header />
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Início' }} />
      <Tabs.Screen name="routine" options={{ title: 'Rotina' }} />
      <Tabs.Screen name="devices" options={{ title: 'Dispositivos' }} />
      <Tabs.Screen name="occurrences" options={{ title: 'Ocorrências' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
