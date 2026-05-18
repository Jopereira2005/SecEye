import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Login from '@/app/(auth)/login';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111318' }}>
      <Login />
    </SafeAreaView>
  );
}