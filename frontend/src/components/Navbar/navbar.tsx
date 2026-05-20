import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Video, Clock, Home, User, TriangleAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomColors } from '@/constants/theme';
import { styles } from './navbar.styles';

export function Navbar() {
  const insets = useSafeAreaInsets();
  const activeTab = 'home'; // hardcoded for this screen

  const tabs = [
    { id: 'devices', label: 'DISPOSITIVOS', Icon: Video },
    { id: 'routine', label: 'ROTINA', Icon: Clock },
    { id: 'home', label: 'INÍCIO', Icon: Home },
    { id: 'profile', label: 'PERFIL', Icon: User },
    { id: 'occurrences', label: 'OCORRÊNCIAS', Icon: TriangleAlert },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const color = isActive ? CustomColors.primary : CustomColors.grayScale;

        return (
          <TouchableOpacity key={tab.id} style={styles.tab} activeOpacity={0.7}>
            <tab.Icon color={color} size={24} style={styles.icon} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
