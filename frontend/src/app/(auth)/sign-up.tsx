import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';
import { User, Lock, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './login.styles';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button } from '@/components/Button/button';
import { Input } from '@/components/Input/input';
import { CustomColors } from '@/constants/theme';


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
        <LinearGradient
            colors={[CustomColors.dark, CustomColors.dark, CustomColors.dark]}
            style={styles.container}
        >
            <LinearGradient
                colors={[CustomColors.primary, 'transparent', CustomColors.tertiary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.05 }]}
                pointerEvents="none"
            />
            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
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

            <View style={styles.switchContainer}>
                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.inactiveText}>ENTRAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.switchButton, styles.activeButton]}
                    onPress={() => router.push('/sign-up')}
                >
                    <Text style={styles.activeText}>CADASTRAR</Text>
                </TouchableOpacity>
            </View>

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

            <Button 
                variant="gradient" 
                containerStyle={styles.loginButton}
            >
                <Text style={styles.loginButtonText}>Cadastrar →</Text>
            </Button>

            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OU AUTENTIQUE VIA</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                    <Image source={require('@/assets/svgs/google-icon.svg')} style={styles.socialIcon} />
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                    <Image source={require('@/assets/svgs/biometrics-icon.svg')} style={styles.socialIcon} />
                    <Text style={styles.socialText}>Biometria</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </LinearGradient>
        </KeyboardAvoidingView>
    );
}