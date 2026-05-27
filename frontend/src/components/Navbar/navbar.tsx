import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Video, Clock, Home, User, TriangleAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { CustomColors } from '@/constants/theme';
import { styles } from './navbar.styles';

export function Navbar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tabs = [
    { id: 'devices', route: 'devices/index', label: 'DISPOSITIVOS', Icon: Video },
    { id: 'routine', route: 'routine/index', label: 'ROTINA', Icon: Clock },
    { id: 'home', route: 'home/index', label: 'INÍCIO', Icon: Home },
    { id: 'profile', route: 'profile/index', label: 'PERFIL', Icon: User },
    { id: 'occurrences', route: 'occurrences/index', label: 'OCORRÊNCIAS', Icon: TriangleAlert },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {tabs.map((tab, index) => {
        // Find if this tab matches the current active route name
        const currentRouteName = state.routes[state.index].name;
        const isActive = currentRouteName === tab.route || currentRouteName === tab.id;
        const color = isActive ? CustomColors.primary : CustomColors.grayScale;

        const onPress = () => {
          const targetRoute = state.routes.find((r) => r.name === tab.route || r.name === tab.id);
          
          const event = navigation.emit({
            type: 'tabPress',
            target: targetRoute?.key || '',
            canPreventDefault: true,
          });

          if (!isActive && !event.defaultPrevented) {
            // Volta a usar o Expo Router, mas com .navigate() em vez de .push()
            router.navigate(`/(tabs)/${tab.id}` as any);
          }
        };

        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tab} 
            activeOpacity={0.7}
            onPress={onPress}
          >
            <tab.Icon color={color} size={24} style={styles.icon} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
