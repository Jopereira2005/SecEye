import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { styles } from './_profile-screen.styles';
import { Input } from '@/components/Input/input';
import { Button } from '@/components/Button/button';
import { useAuth } from '@/contexts/auth.context';
import { updateProfile, uploadAvatar } from '@/services/user.service';
import { CustomColors } from '@/constants/theme';
import Toast from 'react-native-toast-message';

export function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFirstName(profile.first_name || '');
    setLastName(profile.last_name || '');
    setUsername(profile.username || '');
    setEmail(profile.email || '');
    setAvatarUrl(profile.avatar_url || null);
  }, [profile]);

  const handlePickAvatar = async () => {
    try {
      // Pedir permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria para alterar sua foto de perfil.');
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && profile) {
        setUploadingAvatar(true);
        const imageBase64 = result.assets[0].base64;
        const imageUri = result.assets[0].uri;
        const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        
        if (!imageBase64) throw new Error("Base64 indisponível");

        // Fazer upload
        const { data: newAvatarUrl, error: uploadError } = await uploadAvatar(imageBase64, profile.id, ext);
        
        if (uploadError || !newAvatarUrl) {
          throw uploadError || new Error('Erro desconhecido ao fazer upload da imagem');
        }

        // Atualizar perfil
        const { error: updateError } = await updateProfile({
          avatar_url: newAvatarUrl
        });

        if (updateError) {
          throw updateError;
        }

        setAvatarUrl(newAvatarUrl);
        await refreshProfile();
        Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Foto de perfil atualizada!' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Erro', text2: err.message || 'Erro ao alterar a foto.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!username.trim()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'O usuário é obrigatório.' });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await updateProfile({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (error) {
        Toast.show({ type: 'error', text1: 'Erro', text2: error.message || 'Erro ao atualizar perfil.' });
        return;
      }

      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Perfil atualizado com sucesso.' });
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
        await refreshProfile();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        Toast.show({ type: 'error', text1: 'Erro', text2: error.message || 'Erro ao sair.' });
        return;
      }
      // RouteGuard will automatically handle the redirection when session is cleared
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/avatar.png')}
              style={styles.avatar}
              contentFit="cover"
            />
            {uploadingAvatar && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 62.5, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={CustomColors.primary} size="large" />
              </View>
            )}

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.editAvatarButton}
              onPress={handlePickAvatar}
              disabled={uploadingAvatar}
            >
              <Feather name="edit-2" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{username || 'Usuário'}</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <View style={styles.inputsContainer}>

            <Input
              label="Nome"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Seu nome"
            />

            <Input
              label="Sobrenome"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Seu sobrenome"
            />

            <Input
              label="Usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={false}
            />

          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>

            <Button
              variant="danger"
              onPress={handleSignOut}
              loading={loading}
              style={{ width: '100%' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="log-out" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Encerrar Sessão</Text>
              </View>
            </Button>

            <Button
              variant="gradient"
              onPress={handleSave}
              loading={saving}
              style={{ width: '100%' }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar Alterações</Text>
            </Button>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}