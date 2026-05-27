import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';

import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { styles } from './_profile.styles';
import { Input } from '@/components/Input/input';
import { Button } from '@/components/Button/button';
import { getProfile } from '@/services/user.service';
import { updateProfile } from '@/services/user.service';
import { signOut } from '@/services/auth.service';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await getProfile();
      if (error) {
        setFeedback({ type: 'error', message: error.message || 'Erro ao carregar perfil.' });
        return;
      }
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
        setEmail(data.email || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    Keyboard.dismiss();
    setFeedback(null);

    if (!username.trim()) {
      setFeedback({ type: 'error', message: 'O usuário é obrigatório.' });
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
        setFeedback({ type: 'error', message: error.message || 'Erro ao atualizar perfil.' });
        return;
      }

      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso.' });
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
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
        setFeedback({ type: 'error', message: error.message || 'Erro ao sair.' });
        return;
      }
      router.replace('/auth' as any);
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
              source={require('@/assets/images/avatar.png')}
              style={styles.avatar}
              contentFit="cover"
            />

            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={['#0052CC', '#48D7F9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.editAvatarButton}
              >
                <Feather name="edit-2" size={18} color="#fff" />
              </LinearGradient>
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
              variant="outline"
              containerStyle={styles.dangerButton}
              onPress={handleSignOut}
              loading={loading}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="log-out" size={18} color="#FF5252" />
                <Text style={styles.dangerButtonText}>Encerrar Sessão</Text>
              </View>
            </Button>

            <Button
              variant="gradient"
              containerStyle={styles.saveButton}
              onPress={handleSave}
              loading={saving}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </Button>

          </View>
          {feedback ? (
            <Text
              style={{
                color: feedback.type === 'success' ? '#00c853' : '#ff5252',
                textAlign: 'center',
                marginTop: 12,
                fontFamily: 'Inter',
              }}
            >
              {feedback.message}
            </Text>
          ) : null}
        </View>

      </ScrollView>
    </View>
  );
}