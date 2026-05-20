import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Keyboard,
    StyleSheet
} from 'react-native';
import { User, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button/button';
import { Input } from '@/components/Input/input';
import { Logo } from '@/components/Logo/logo';
import { SocialAuth } from '@/components/SocialAuth';
import { styles } from './_auth.styles';
import { CustomColors } from '@/constants/theme';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <LinearGradient
            colors={[CustomColors.dark, CustomColors.dark, CustomColors.dark]}
            style={styles.container}
        >
            <LinearGradient
                colors={[CustomColors.primary, 'transparent', CustomColors.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.05, pointerEvents: 'none' }]}
            />

            <Logo />

            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={[styles.switchButton, styles.activeButton]}
                    onPress={() => router.push('/login' as any)}
                >
                    <Text style={styles.activeText}>ENTRAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => router.push('/sign-up' as any)}
                >
                    <Text style={styles.inactiveText}>CADASTRAR</Text>
                </TouchableOpacity>
            </View>

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

            <Button 
                variant="gradient" 
                containerStyle={styles.loginButton}
            >
                <Text style={styles.loginButtonText}>Entrar →</Text>
            </Button>

            <SocialAuth />
        </LinearGradient>
        </Pressable>
        </KeyboardAvoidingView>
    );
}