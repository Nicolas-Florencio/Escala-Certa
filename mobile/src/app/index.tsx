import { apiRequest } from '@/services/api';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  async function entrar() {
    try {
      setErro(false);

      console.log(
        'Email enviado:',
        JSON.stringify(email)
      );

      console.log(
        'Senha enviada:',
        JSON.stringify(senha)
      );

      const data = await apiRequest('/auth/login', {
        method: 'POST',

        body: JSON.stringify({
          email: email.trim(),
          senha,
        }),
      });

      await SecureStore.setItemAsync(
        'token',
        data.token
      );

      await SecureStore.setItemAsync(
        'usuario',
        JSON.stringify(data.usuario)
      );

      console.log(
        'Usuário autenticado:',
        data.usuario
      );

      router.replace('/dashboard');

    } catch (error) {
      console.log(
        'Erro no login:',
        error instanceof Error
          ? error.message
          : error
      );

      setErro(true);
    }
  }

  /*
   async function entrar() {
  try {
    // Remove um possível erro anterior
    setErro(false);

    // Envia as credenciais para a API
    const data = await apiRequest('/auth/login', {
      method: 'POST',

      body: JSON.stringify({
        email,
        senha,
      }),
    });

    // Salva o JWT de forma segura
    await SecureStore.setItemAsync(
      'token',
      data.token
    );

    // Salva temporariamente os dados do usuário
    await SecureStore.setItemAsync(
      'usuario',
      JSON.stringify(data.usuario)
    );

    console.log('Usuário autenticado:', data.usuario);

    // Redireciona para a dashboard
    router.replace('/dashboard');

  } catch (error) {
    console.log(
      'Erro no login:',
      error instanceof Error
        ? error.message
        : error
    );

    setErro(true);
  }
}
*/
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <View style={styles.brandArea}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>EC</Text>
          </View>

          <Text style={styles.brandName}>
            Escala<Text style={styles.brandHighlight}>Certa</Text>
          </Text>

          <Text style={styles.subtitle}>
            Organização de plantões de forma simples e eficiente.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Acesse sua conta</Text>
          <Text style={styles.formSubtitle}>
            Entre com suas credenciais para acessar o sistema.
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, erro && styles.inputError]}
            placeholder="admin@email.com"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (erro) setErro(false);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erro && styles.inputError]}
            placeholder="Digite sua senha"
            placeholderTextColor={COLORS.textSecondary}
            value={senha}
            onChangeText={(value) => {
              setSenha(value);
              if (erro) setErro(false);
            }}
            secureTextEntry
          />

          {erro && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Credenciais inválidas</Text>
              <Text style={styles.errorText}>
                E-mail ou senha incorretos. Verifique e tente novamente.
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={entrar}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>

          <Pressable>
            <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  loginBox: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  brandHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 5,
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 7,
  },
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    color: COLORS.text,
    fontSize: 15,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorTitle: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    marginTop: 3,
  },
  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  forgotPassword: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
  },
});
