import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { styles } from './header.styles';
import { CustomColors } from '@/constants/theme';

export function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/auth')} activeOpacity={0.8}>
        <Image
          source={require('@/assets/svgs/logo.svg')} 
          style={styles.logoImage} 
          contentFit="contain" 
        />
        <Text style={styles.logoText}>Sec<Text style={styles.logoHighlight}>Eye</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8} onPress={() => router.push('/auth')}>
        <Bell color={CustomColors.light} size={20} />
      </TouchableOpacity>
    </View>
  );
}
