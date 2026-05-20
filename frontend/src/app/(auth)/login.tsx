import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet
} from 'react-native';
import { User, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button } from '@/components/Button/button';
import { Input } from '@/components/Input/input';
import { styles } from './login.styles';
import { CustomColors } from '@/constants/theme';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    style={[styles.switchButton, styles.activeButton]}
                    onPress={() => router.push('/login')}
                >
                    <Text style={styles.activeText}>ENTRAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => router.push('/sign-up')}
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
        </LinearGradient>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}