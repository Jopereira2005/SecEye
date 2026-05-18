import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { useRouter } from 'expo-router';
import { CustomColors } from '@/constants/theme';
import { signUp } from '@/services/auth.service';

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Preencha todos os campos');
            return;
        }

        if (!email.includes('@')) {
            setError('Insira um e-mail válido');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data, error: signUpError } = await signUp(email, password, username, '', username);

            if (signUpError) {
                const errorMessage = signUpError.message || 'Erro ao cadastrar';
                setError(errorMessage);
                Alert.alert('Erro no cadastro', errorMessage);
                setLoading(false);
                return;
            }

            if (data?.user) {
                Alert.alert('Cadastro realizado', 'Sua conta foi criada com sucesso');
                router.replace('/profile');
            } else {
                setError('Não foi possível criar a conta');
                Alert.alert('Erro', 'Não foi possível criar a conta');
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
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                <Image source={require('@/assets/images/Vector.png')} style={styles.logoImage} resizeMode="contain" />

                <Text style={styles.title}>
                    <Text>Sec</Text>
                    <Text style={styles.titleBlue}>Eye</Text>
                </Text>
                <Text style={styles.subtitle}>Proteção inteligente sob medida.</Text>

                <View style={styles.switchContainer}>
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => router.push('/login')}
                        disabled={loading}
                    >
                        <Text style={styles.inactiveText}>ENTRAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.switchButton, styles.activeButton]}
                        onPress={() => router.push('/sign-up')}
                        disabled={loading}
                    >
                        <Text style={styles.activeText}>CADASTRAR</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>NOME DE USUÁRIO</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person" size={18} color={CustomColors.grayScale} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Ex: Seu nome de usuário"
                        placeholderTextColor={CustomColors.grayScale}
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        editable={!loading}
                        autoCapitalize="none"
                    />
                </View>

                <Text style={styles.label}>E-MAIL</Text>
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

                <Text style={styles.label}>CRIAR SENHA</Text>
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

                <Text style={styles.label}>CONFIRMAR A SENHA</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={18} color={CustomColors.grayScale} style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="••••••••"
                        placeholderTextColor={CustomColors.grayScale}
                        secureTextEntry={!showPassword}
                        style={[styles.input, styles.passwordInput]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!loading}
                    />
                </View>

                {error ? (
                    <View style={{ marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF3B30' }}>
                        <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '500' }}>{error}</Text>
                    </View>
                ) : null}

                <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                    <LinearGradient
                        colors={[CustomColors.secondary, CustomColors.tertiary]}
                        style={[styles.loginButton, loading && { opacity: 0.6 }]}
                    >
                        {loading ? (
                            <ActivityIndicator color={CustomColors.light} size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Cadastrar →</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>OU AUTENTIQUE VIA</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialButton} disabled={loading}>
                        <Image source={require('@/assets/images/GoogleIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton} disabled={loading}>
                        <Image source={require('@/assets/images/BiometricsIcon.png')} style={{ width: 18.05, height: 20, marginRight: 8 }} />
                        <Text style={styles.socialText}>Biometria</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}