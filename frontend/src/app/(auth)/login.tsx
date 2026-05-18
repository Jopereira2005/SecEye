/** @jsxImportSource react */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { styles } from './styles';
import { CustomColors } from '@/constants/theme';
import { signIn } from '@/services/auth.service';

export default function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        // Validation
        if (!email.trim() || !password.trim()) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!email.includes('@')) {
            setError('Por favor, insira um e-mail válido');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await signIn(email, password);

            if (signInError) {
                const errorMessage = signInError.message || 'Erro ao fazer login';
                setError(errorMessage);
                Alert.alert('Erro ao Login', errorMessage);
                setLoading(false);
                return;
            }

            if (data?.user && data?.session) {
                // Successful login
                Alert.alert('Sucesso!', 'Login realizado com sucesso');
                router.replace('/profile');
            } else {
                setError('Credenciais inválidas');
                Alert.alert('Erro', 'Credenciais inválidas');
                setLoading(false);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(errorMessage);
            Alert.alert('Erro', errorMessage);
            setLoading(false);
        }
    };
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
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>


            <Text style={styles.label}>SENHA DE ACESSO</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color={CustomColors.grayScale} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="••••••••"
                    placeholderTextColor={CustomColors.grayScale}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                />
                <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    style={styles.eyeButton}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={loading}
                >
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={CustomColors.grayScale} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {error ? (
                <View style={{ marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF3B30' }}>
                    <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '500' }}>
                        {error}
                    </Text>
                </View>
            ) : null}

            <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                    colors={[CustomColors.secondary, CustomColors.tertiary]}
                    style={[styles.loginButton, loading && { opacity: 0.6 }]}
                >
                    {loading ? (
                        <ActivityIndicator color={CustomColors.light} size="small" />
                    ) : (
                        <Text style={styles.loginButtonText}>Entrar →</Text>
                    )}
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