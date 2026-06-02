import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Shield, TriangleAlert, Clock, Scan } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button/button';
import { OccurrenceCard } from '@/components/OccurrenceCard/occurrence-card';
import { styles } from './home-screen.styles';
import { CustomColors, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useOccurrences } from '@/hooks/use-occurrences';
import { useAuth } from '@/contexts/auth.context';
import { useDevices } from '@/hooks/use-devices';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type StatFilter = 'today' | 'week' | 'month' | 'all';

export function HomeScreen() {
  const router = useRouter();
  const { isSystemActive, activeRoutines } = useRoutines();
  const { occurrences } = useOccurrences();
  const { devices } = useDevices();
  const { profile } = useAuth();

  const hasActiveCamera = devices.some(d => d.is_active);
  const showSystemActive = isSystemActive && hasActiveCamera;

  const [statFilter, setStatFilter] = React.useState<StatFilter>('today');

  const routineScale = useSharedValue(1);
  const routineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: routineScale.value }]
  }));

  const statScale = useSharedValue(1);
  const statAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statScale.value }]
  }));

  const routineText = activeRoutines.length === 0 
    ? 'Nenhuma' 
    : activeRoutines.map(r => r.description).filter(Boolean).join(', ');

  const cycleStatFilter = () => {
    if (statFilter === 'today') setStatFilter('week');
    else if (statFilter === 'week') setStatFilter('month');
    else if (statFilter === 'month') setStatFilter('all');
    else setStatFilter('today');
  };

  const filteredOccurrencesCount = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return occurrences.filter(o => {
      const occDate = new Date(o.timestamp);
      occDate.setHours(0, 0, 0, 0);

      if (statFilter === 'today') {
        return occDate.getTime() === now.getTime();
      } else if (statFilter === 'week') {
        const lastWeek = new Date(now);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return occDate.getTime() >= lastWeek.getTime();
      } else if (statFilter === 'month') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return occDate.getTime() >= lastMonth.getTime();
      }
      return true; // para 'all'
    }).length;
  }, [occurrences, statFilter]);

  const statLabels = {
    today: 'HOJE',
    week: 'SEMANA',
    month: 'MÊS',
    all: 'TODAS'
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image 
            source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@/assets/images/avatar.png')}
            style={styles.avatar} 
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.greetingText}>
              Olá, <Text style={styles.nameText}>{profile?.first_name ? profile.first_name.toUpperCase() : 'USUÁRIO'}</Text>
            </Text>
            <Text style={styles.statusText}>
              {showSystemActive 
                ? 'O sistema está monitorando ativamente.' 
                : 'O sistema está operando em modo de espera.'}
            </Text>
          </View>
        </View>

        <Button 
          variant={showSystemActive ? "gradient" : "secondary"}
          size="large"
          containerStyle={{ marginBottom: Spacing.lg }}
          disabled={false} // Mantém sem efeito de opacidade de disabled
          // Sem onPress, serve apenas como display visual, mas mantém o estilo original de botão
        >
          <View style={styles.shieldIconContainer}>
            <Shield color={CustomColors.light} size={32} fill={CustomColors.light} />
          </View>
          <Text style={styles.mainCardTitle}>{showSystemActive ? 'SISTEMA ATIVO' : 'SISTEMA INATIVO'}</Text>
          <View style={[styles.badge, { backgroundColor: showSystemActive ? CustomColors.applyOpacity(CustomColors.light, 0.2) : CustomColors.applyOpacity(CustomColors.grayScale, 0.2) }]}>
            <Text style={styles.badgeText}>{showSystemActive ? 'MONITORANDO' : 'EM ESPERA'}</Text>
          </View>
        </Button>

        <View style={styles.statsContainer}>
          <AnimatedPressable 
            style={[styles.statCard, statAnimatedStyle]}
            onPressIn={() => statScale.value = withTiming(0.95, { duration: 100 })}
            onPressOut={() => statScale.value = withTiming(1, { duration: 150 })}
            onPress={cycleStatFilter}
          >
            <View style={styles.statHeader}>
              <TriangleAlert color={CustomColors.primary} size={24} />
              <Text style={[styles.statLabelSmall, { color: CustomColors.primary }]}>
                {statLabels[statFilter]} ▼
              </Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statCount}>
                {filteredOccurrencesCount.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.statSubtitle}>OCORRÊNCIAS</Text>
            </View>
          </AnimatedPressable>

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

          {occurrences.length === 0 ? (
            <Text style={{ color: CustomColors.grayScale, marginTop: Spacing.sm }}>Nenhuma atividade registrada.</Text>
          ) : (
            <View>
              {occurrences.slice(0, 5).map((item) => (
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
              
              <Button 
                variant="outline" 
                containerStyle={{ marginTop: Spacing.md, borderColor: 'rgba(255,255,255,0.1)' }}
                onPress={() => router.navigate('/(tabs)/occurrences')}
              >
                <Text style={{ color: CustomColors.primary, fontWeight: 'bold' }}>Ver todas as ocorrências</Text>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
