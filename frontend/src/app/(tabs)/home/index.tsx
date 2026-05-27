import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Shield, TriangleAlert, Clock, Scan } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button/button';
import { OccurrenceCard } from '@/components/OccurrenceCard/occurrence-card';
import { styles } from './_home.styles';
import { CustomColors, Spacing } from '@/constants/theme';

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
              O sistema está operando em modo de espera.
            </Text>
          </View>
        </View>

        <Button 
          variant="gradient"
          size="large"
          containerStyle={{ marginBottom: Spacing.lg }}
        >
          <View style={styles.shieldIconContainer}>
            <Shield color={CustomColors.light} size={32} fill={CustomColors.light} />
          </View>
          <Text style={styles.mainCardTitle}>INICIAR SISTEMA</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRONTO PARA ARMAR</Text>
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

          <View style={[styles.statCard]}>
            <View style={styles.statHeader}>
              <Clock color={CustomColors.primary} size={24} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statRoutine}>Noite Segura</Text>
              <Text style={styles.statSubtitle}>ROTINA ATUAL</Text>
            </View>
          </View>
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
                  params: { openId: occ.id }
                } as any);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
