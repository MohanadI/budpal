import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, Button, Text, Surface, HelperText, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { useStore } from '../services/store';
import { useTheme } from '../theme/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await authService.login(email, password);
      const authUser = authService.toAuthUser(userCredential.user);
      setUser(authUser);
      // Navigation will be handled by the auth state listener
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.topBar}>
            <ThemeToggle />
            <LanguageToggle />
          </View>
          
          <View style={styles.iconContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="account-balance-wallet" size={64} color={theme.primary} />
            </View>
          </View>

          <Surface style={[styles.surface, { backgroundColor: theme.surface }]}>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.text }]}>
              {t('login.title') || 'مرحباً في BudPal'}
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('login.subtitle') || 'إدارة أموالك بسهولة'}
            </Text>

            <TextInput
              label={t('login.email') || 'البريد الإلكتروني'}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              error={!!error && !email}
              theme={{ colors: { primary: theme.primary } }}
              outlineColor={theme.border}
              activeOutlineColor={theme.primary}
              textColor={theme.text}
            />

            <TextInput
              label={t('login.password') || 'كلمة المرور'}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              error={!!error && !password}
              theme={{ colors: { primary: theme.primary } }}
              outlineColor={theme.border}
              activeOutlineColor={theme.primary}
              textColor={theme.text}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color={theme.textSecondary}
                />
              }
            />

            {error ? (
              <HelperText type="error" visible={!!error} style={styles.error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.primary }]}
              buttonColor={theme.primary}
              textColor="#FFFFFF"
            >
              {t('login.loginButton') || 'تسجيل الدخول'}
            </Button>

            <View style={styles.registerContainer}>
              <Text variant="bodyMedium" style={{ color: theme.textSecondary }}>
                {t('login.noAccount') || "ليس لديك حساب؟ "}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
                textColor={theme.primary}
              >
                {t('login.registerLink') || 'إنشاء حساب'}
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  surface: {
    padding: 28,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    writingDirection: 'auto',
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    writingDirection: 'auto',
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    writingDirection: 'auto',
    backgroundColor: 'transparent',
  },
  error: {
    marginBottom: 8,
    writingDirection: 'auto',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
});

