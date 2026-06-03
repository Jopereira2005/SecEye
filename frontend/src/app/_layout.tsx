import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { DaysOne_400Regular } from '@expo-google-fonts/days-one';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { AuthProvider } from '@/contexts/auth.context';
import { RouteGuard } from '@/components/RouteGuard/route-guard';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/Toast/toast-config';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

// Interceptador Global para capturar erros de conta deletada ou token inválido em qualquer lugar do app
const handleGlobalAuthError = async (error: any) => {
  const errCode = error?.code || '';
  const errMsg = error?.message || '';
  
  // 23503 = Foreign Key Violation (Usuário deletado)
  if (errCode === '23503' || errMsg.includes('User not found') || errMsg.includes('JWT') || errMsg.includes('Auth session missing')) {
    await supabase.auth.signOut();
  }
};

// Instância global do React Query
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleGlobalAuthError,
  }),
  mutationCache: new MutationCache({
    onError: handleGlobalAuthError,
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
    },
  },
});

// Silencia o warning de Strict Mode falso-positivo do Reanimated 3+
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    'Days One': DaysOne_400Regular,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <AuthProvider>
          <RouteGuard>
            <Slot />
          </RouteGuard>
        </AuthProvider>
        <Toast config={toastConfig} topOffset={60} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
