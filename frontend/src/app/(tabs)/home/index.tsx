import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Shield, TriangleAlert, Clock, Scan } from 'lucide-react-native';
import { Image } from 'expo-image';

import { Button } from '@/components/Button/button';
import { styles } from './_home.styles';
import { CustomColors, Spacing } from '@/constants/theme';

export default function Home() {
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

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
            <TouchableOpacity key={index} style={styles.activityItem} activeOpacity={0.7}>
              <View style={styles.activityIconContainer}>
                <Scan color={CustomColors.tertiary} size={24} />
              </View>
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>Movimento Detectado</Text>
                <Text style={styles.activitySubtitle}>GARAGEM • HÁ 5 MIN</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
