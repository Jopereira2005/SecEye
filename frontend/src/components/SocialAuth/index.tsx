import React, { use } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { styles } from './_social-auth.styles';
import { useRouter } from 'expo-router';

export function SocialAuth() {
  const router = useRouter();

  return (
    <View>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>OU AUTENTIQUE VIA</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/home' as any)}>
          <Image source={require('@/assets/svgs/google-icon.svg')} style={styles.socialIcon} />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/home' as any)}>
          <Image source={require('@/assets/svgs/biometrics-icon.svg')} style={styles.socialIcon} />
          <Text style={styles.socialText}>Biometria</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
