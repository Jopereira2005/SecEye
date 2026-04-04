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

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    return (
        <LinearGradient
            colors={['#111318', '#111318', '#111318']}
            style={styles.container}
        >
            <Image source={require('../../../../assets/images/Vector.png')} style={styles.logoImage} />

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
                    onPress={() => router.push('/src/screens/Login/login')}
                >
                    <Text style={styles.activeText}>ENTRAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => router.push('/src/screens/Login/signUp')}
                >
                    <Text style={styles.inactiveText}>CADASTRAR</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>E-MAIL OU USUÁRIO</Text>

            <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color="#A5ADAB" style={{ marginRight: 8 }} /> 
                <TextInput
                placeholder="Ex: usuario@email.com"
                placeholderTextColor="#A5ADAB"
                style={styles.input}
            /></View>


            <Text style={styles.label}>SENHA DE ACESSO</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#A5ADAB" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#A5ADAB"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    style={styles.eyeButton}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#A5ADAB" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <LinearGradient
                    colors={['#0052CC', '#48D7F9']}
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
                    <Image source={require('../../../../assets/images/GoogleIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                    <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                    <Image source={require('../../../../assets/images/BiometricsIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                    <Text style={styles.socialText}>Biometria</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}