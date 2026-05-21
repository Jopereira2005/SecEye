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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "sign-up">("login");

  const handleTabChange = (newMode: "login" | "sign-up") => {
    if (newMode !== mode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMode(newMode);
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
                  placeholder="Ex: usuario@email.com"
                  icon={<User color={CustomColors.grayScale} size={18} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="SENHA DE ACESSO"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                />
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                </TouchableOpacity>
                <Button variant="gradient" containerStyle={styles.loginButton}>
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
                />
                <Input
                  label="E-MAIL"
                  placeholder="Ex: usuario@email.com"
                  icon={<Mail color={CustomColors.grayScale} size={18} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="CRIAR SENHA"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                />
                <Input
                  label="CONFIRMAR A SENHA"
                  placeholder="••••••••"
                  icon={<Lock color={CustomColors.grayScale} size={18} />}
                  isPassword
                />
                <Button variant="gradient" containerStyle={styles.loginButton}>
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
