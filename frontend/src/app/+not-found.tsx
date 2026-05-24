import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '@/components/Logo/logo';
import { Button } from '@/components/Button/button';
import { CustomColors } from '@/constants/theme';
import { styles } from './_not-found.styles';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <LinearGradient
        colors={[CustomColors.dark, CustomColors.dark, CustomColors.dark]}
        style={styles.container}
    >
        <LinearGradient
            colors={[CustomColors.primary, 'transparent', CustomColors.tertiary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.15, pointerEvents: 'none' }]}
        />

        <Logo />

        <Text style={styles.errorCode}>404</Text>
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.subtitle}>
            A página que você está procurando não existe ou o sistema bloqueou seu acesso.
        </Text>

        <Button 
            variant="gradient"
            onPress={() => router.replace('/' as any)}
            containerStyle={styles.buttonContainer}
        >
            <Text style={{ color: CustomColors.light, fontWeight: 'bold' }}>Voltar para o Início</Text>
        </Button>
    </LinearGradient>
  );
}
