import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { styles } from './styles';
import { CustomColors } from '@/constants/theme';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    return (
        <LinearGradient
            colors={[CustomColors.dark, CustomColors.dark, CustomColors.dark]}
            style={styles.container}
        >
            <Image source={require('@/assets/images/Vector.png')} style={styles.logoImage} resizeMode="contain" />

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

            <Text style={styles.label}>E-MAIL OU USUÁRIO</Text>

            <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color={CustomColors.grayScale} style={{ marginRight: 8 }} /> 
                <TextInput
                placeholder="Ex: usuario@email.com"
                placeholderTextColor={CustomColors.grayScale}
                style={styles.input}
            /></View>


            <Text style={styles.label}>SENHA DE ACESSO</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color={CustomColors.grayScale} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={CustomColors.grayScale}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    style={styles.eyeButton}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={CustomColors.grayScale} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <LinearGradient
                    colors={[CustomColors.secondary, CustomColors.tertiary]}
                    style={styles.loginButton}
                >
                    <Text style={styles.loginButtonText}>Entrar →</Text>
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OU AUTENTIQUE VIA</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                    <Image source={require('@/assets/images/GoogleIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                    <Image source={require('@/assets/images/BiometricsIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                    <Text style={styles.socialText}>Biometria</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}