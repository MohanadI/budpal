import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';
import { useStore } from '../services/store';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { t } = useTranslation();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Surface style={styles.surface}>
          <Text variant="headlineLarge" style={styles.title}>
            {t('login.title') || 'Welcome to BudPal'}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {t('login.subtitle') || 'Manage your finances easily'}
          </Text>

          <TextInput
            label={t('login.email') || 'Email'}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            error={!!error && !email}
          />

          <TextInput
            label={t('login.password') || 'Password'}
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
            error={!!error && !password}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
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
            style={styles.button}
          >
            {t('login.loginButton') || 'Login'}
          </Button>

          <View style={styles.registerContainer}>
            <Text variant="bodyMedium">
              {t('login.noAccount') || "Don't have an account? "}
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              {t('login.registerLink') || 'Register'}
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});

