import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/auth';
import { useStore } from '../services/store';
import { useTheme } from '../theme/ThemeContext';
import LanguageToggle from '../components/LanguageToggle';
import ThemeToggle from '../components/ThemeToggle';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    setError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await authService.register(email, password);
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
    <View style={[styles.fullContainer, { backgroundColor: theme.background }]}>
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
              <MaterialIcons name="person-add" size={64} color={theme.primary} />
            </View>
          </View>

          <Surface style={[styles.surface, { backgroundColor: theme.surface }]}>
            <Text variant="headlineLarge" style={[styles.title, { color: theme.text }]}>
              {t('register.title') || 'إنشاء حساب جديد'}
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('register.subtitle') || 'ابدأ بإدارة أموالك اليوم'}
            </Text>

            <TextInput
              label={t('register.email') || 'البريد الإلكتروني'}
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
              label={t('register.password') || 'كلمة المرور'}
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

            <TextInput
              label={t('register.confirmPassword') || 'تأكيد كلمة المرور'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              error={!!error && !confirmPassword}
              theme={{ colors: { primary: theme.primary } }}
              outlineColor={theme.border}
              activeOutlineColor={theme.primary}
              textColor={theme.text}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.primary }]}
              buttonColor={theme.primary}
              textColor="#FFFFFF"
            >
              {t('register.registerButton') || 'إنشاء حساب'}
            </Button>

            <View style={styles.loginContainer}>
              <Text variant="bodyMedium" style={{ color: theme.textSecondary }}>
                {t('register.haveAccount') || 'لديك حساب بالفعل؟ '}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
                textColor={theme.primary}
              >
                {t('register.loginLink') || 'تسجيل الدخول'}
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    writingDirection: 'auto',
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    writingDirection: 'auto',
    fontSize: 15,
  },
  input: {
    marginBottom: 12,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
});

