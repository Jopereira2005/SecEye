import React from 'react';
import { Redirect } from 'expo-router';

export default function TrafficController() {
  // TODO: Substituir por hook de autenticação real no futuro
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href={"/home" as any} />;
  }

  return <Redirect href={"/auth" as any} />;
}