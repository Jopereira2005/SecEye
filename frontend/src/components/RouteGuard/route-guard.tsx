import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/auth.context';
import { CustomColors } from '@/constants/theme';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Verificar se o usuário está no grupo de autenticação
    // O tipo de segments é rigoroso, basta checar o primeiro elemento.
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Se não está logado e tenta acessar uma área restrita, manda para o auth
      router.replace('/(auth)/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // Se está logado e tenta acessar auth ou index, manda para a home
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    // Enquanto carrega a sessão, mantemos a tela vazia (a splash screen nativa cobre isso)
    // Se a splash já tiver saído, mostramos um loader elegante.
    return (
      <View style={{ flex: 1, backgroundColor: CustomColors.dark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={CustomColors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
