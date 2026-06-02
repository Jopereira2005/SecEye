import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { styles } from './logo.styles';

export function Logo() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/svgs/logo.svg')} 
        style={styles.logoImage} 
        contentFit="contain" 
      />
      <Text style={styles.title}>
        <Text>Sec</Text>
        <Text style={styles.titleBlue}>Eye</Text>
      </Text>
      <Text style={styles.subtitle}>
        Proteção inteligente sob medida.
      </Text>
    </View>
  );
}
