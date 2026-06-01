import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { User, Lock, Mail } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button/button";
import { Input } from "@/components/Input/input";
import { Logo } from "@/components/Logo/logo";
import { SocialAuth } from "@/components/SocialAuth/social-auth";
import { AuthSwitch } from "@/components/AuthSwitch/auth-switch";
import { styles } from "./_auth.styles";
import { CustomColors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth.context";
import Toast from 'react-native-toast-message';

// LayoutAnimation is natively supported in the New Architecture, no experimental flag needed.

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "sign-up">("login");
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (newMode: "login" | "sign-up") => {
    if (newMode !== mode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMode(newMode);
    }
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha e-mail/usuário e senha para entrar.' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signIn(loginEmail.trim(), loginPassword);
      if (error) {
        Toast.show({ type: 'error', text1: 'Erro no Login', text2: error.message || 'Falha ao efetuar login.' });
        return;
      }
      if (data?.user) {
        router.replace('/home' as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword || !signupPasswordConfirm) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha todos os campos para cadastrar.' });
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(
        signupEmail.trim(),
        signupPassword,
        signupUsername.trim()
      );

      if (error) {
        Toast.show({ type: 'error', text1: 'Erro no Cadastro', text2: error.message || 'Falha ao cadastrar.' });
        return;
      }

      if (data?.user) {
        if (data.session) {
          router.replace('/home' as any);
        } else {
          Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Cadastro realizado! Verifique seu e-mail para ativar a conta.' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <LinearGradient
          colors={[CustomColors.dark, CustomColors.dark, CustomColors.dark]}
          style={styles.container}
        >
          <LinearGradient
            colors={[
              CustomColors.primary,
              "transparent",
              CustomColors.tertiary,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: 0.05, pointerEvents: "none" },
            ]}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Logo />

            <AuthSwitch activeTab={mode} onTabChange={handleTabChange} />

            {mode === "login" ? (
              <View key="login-form" style={{ width: "100%" }}>
                <Input
                  label="E-MAIL OU USUÁRIO"
                  placeholder="Ex: seu@email.com ou seunome"
                  icon={<User color={CustomColors.grayScale} size={18} />}
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                />
                <Input
                  label="SENHA DE ACESSO"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                
                <Button
                  variant="gradient"
                  containerStyle={[styles.loginButton, { marginTop: 24 }]}
                  loading={loading}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>Entrar →</Text>
                </Button>
              </View>
            ) : (
              <View key="signup-form" style={{ width: "100%" }}>
                <Input
                  label="NOME DE USUÁRIO"
                  placeholder="Ex: Seu nome de usuário"
                  icon={<User color={CustomColors.grayScale} size={18} />}
                  autoCapitalize="none"
                  value={signupUsername}
                  onChangeText={setSignupUsername}
                />
                <Input
                  label="E-MAIL"
                  placeholder="Ex: usuario@email.com"
                  icon={<Mail color={CustomColors.grayScale} size={18} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                />
                <Input
                  label="CRIAR SENHA"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                />
                <Input
                  label="CONFIRMAR A SENHA"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                  value={signupPasswordConfirm}
                  onChangeText={setSignupPasswordConfirm}
                />
                
                <Button
                  variant="gradient"
                  containerStyle={[styles.loginButton, { marginTop: 24 }]}
                  loading={loading}
                  onPress={handleSignUp}
                >
                  <Text style={styles.loginButtonText}>Cadastrar →</Text>
                </Button>
              </View>
            )}

            <SocialAuth />
          </ScrollView>
        </LinearGradient>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
