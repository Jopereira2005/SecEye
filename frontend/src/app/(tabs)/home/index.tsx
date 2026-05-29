import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Shield, TriangleAlert, Clock, Scan } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button/button';
import { OccurrenceCard } from '@/components/OccurrenceCard/occurrence-card';
import { styles } from './_home.styles';
import { CustomColors, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MOCK_OCCURRENCES: any[] = [
  {
    id: 'occ-1000',
    timestamp: new Date().toISOString(),
    event_image: null,
    camera: { name: 'Garagem Principal', severity: 'high' }
  },
  {
    id: 'occ-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    event_image: null,
    camera: { name: 'Jardim Fundos', severity: 'medium' }
  },
  {
    id: 'occ-1002',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    event_image: null,
    camera: { name: 'Portão Frontal', severity: 'low' }
  }
];

export default function Home() {
  const router = useRouter();
  const { isSystemActive, activeRoutines } = useRoutines();

  const routineScale = useSharedValue(1);
  const routineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: routineScale.value }]
  }));

  const routineText = activeRoutines.length === 0 
    ? 'Nenhuma' 
    : activeRoutines.map(r => r.description).filter(Boolean).join(', ');
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image 
            source={require('@/assets/images/avatar.png')}
            style={styles.avatar} 
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.greetingText}>
              Olá, <Text style={styles.nameText}>MR PAXE</Text>
            </Text>
            <Text style={styles.statusText}>
              {isSystemActive 
                ? 'O sistema está monitorando ativamente.' 
                : 'O sistema está operando em modo de espera.'}
            </Text>
          </View>
        </View>

        <Button 
          variant={isSystemActive ? "gradient" : "secondary"}
          size="large"
          containerStyle={{ marginBottom: Spacing.lg }}
          disabled={false} // Mantém sem efeito de opacidade de disabled
          // Sem onPress, serve apenas como display visual, mas mantém o estilo original de botão
        >
          <View style={styles.shieldIconContainer}>
            <Shield color={CustomColors.light} size={32} fill={CustomColors.light} />
          </View>
          <Text style={styles.mainCardTitle}>{isSystemActive ? 'SISTEMA ATIVO' : 'SISTEMA INATIVO'}</Text>
          <View style={[styles.badge, { backgroundColor: isSystemActive ? CustomColors.applyOpacity(CustomColors.light, 0.2) : CustomColors.applyOpacity(CustomColors.grayScale, 0.2) }]}>
            <Text style={styles.badgeText}>{isSystemActive ? 'MONITORANDO' : 'EM ESPERA'}</Text>
          </View>
        </Button>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard]}>
            <View style={styles.statHeader}>
              <TriangleAlert color={CustomColors.primary} size={24} />
              <Text style={styles.statLabelSmall}>HOJE</Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statCount}>02</Text>
              <Text style={styles.statSubtitle}>OCORRÊNCIAS</Text>
            </View>

          </View>

          <AnimatedPressable 
            style={[styles.statCard, routineAnimatedStyle]}
            onPressIn={() => routineScale.value = withTiming(0.95, { duration: 100 })}
            onPressOut={() => routineScale.value = withTiming(1, { duration: 150 })}
            onPress={() => router.navigate('/(tabs)/routine')}
          >
            <View style={styles.statHeader}>
              <Clock color={CustomColors.primary} size={24} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statRoutine} numberOfLines={2}>{routineText}</Text>
              <Text style={styles.statSubtitle}>ROTINA ATUAL</Text>
            </View>
          </AnimatedPressable>
        </View>

        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>

          {MOCK_OCCURRENCES.map((item) => (
            <OccurrenceCard 
              key={item.id} 
              occurrence={item} 
              size="recent" 
              onPress={(occ) => {
                router.navigate({
                  pathname: '/(tabs)/occurrences',
                  params: { openId: occ.id, _t: Date.now() }
                } as any);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
