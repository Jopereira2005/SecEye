import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';

export default function TrafficController() {
  const { isAuthenticated, isLoading } = useAuth();

  // Se estiver carregando, não redireciona ainda (o RouteGuard lidará com o visual de loading)
  if (isLoading) return null;

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)/home" as any} />;
  }

  return <Redirect href={"/(auth)/auth" as any} />;
}