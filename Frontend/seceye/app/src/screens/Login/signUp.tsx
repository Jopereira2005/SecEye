import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { useRouter } from 'expo-router';


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    return (
        
        <LinearGradient
            colors={['#111318', '#111318', '#111318']}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
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
                    style={styles.switchButton}
                    onPress={() => router.push('/src/screens/Login/login')}
                >
                    <Text style={styles.inactiveText}>ENTRAR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.switchButton, styles.activeButton]}
                    onPress={() => router.push('/src/screens/Login/signUp')}
                >
                    <Text style={styles.activeText}>CADASTRAR</Text>
                </TouchableOpacity>
            </View>

        <Text style={styles.label}>NOME DE USUÁRIO</Text>

            <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color="#A5ADAB" style={{ marginRight: 8 }} /> 
                <TextInput
                placeholder="Ex: Seu nome de usuário"
                placeholderTextColor="#A5ADAB"
                style={styles.input}
            /></View>

            <Text style={styles.label}>E-MAIL</Text>

            <View style={styles.inputWrapper}>
                <Ionicons name="person" size={18} color="#A5ADAB" style={{ marginRight: 8 }} /> 
                <TextInput
                placeholder="Ex: usuario@email.com"
                placeholderTextColor="#A5ADAB"
                style={styles.input}
            /></View>


            <Text style={styles.label}>CRIAR SENHA</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#A5ADAB" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#A5ADAB"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                />
            </View>

            <Text style={styles.label}>CONFIRMAR A SENHA</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={18} color="#A5ADAB" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#A5ADAB"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                />
            </View>

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
            </ScrollView>
        </LinearGradient>
        
    );
}