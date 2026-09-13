import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Login() {
  // Estados dos campos de e-mail e senha
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estado responsável por exibir a mensagem de erro
  const [erro, setErro] = useState(false);

  // Função responsável por validar o login
  function entrar() {
    // Login temporário para teste
    if (email === 'admin@email.com' && senha === '1234') {
      // Remove mensagem de erro caso esteja aparecendo
      setErro(false);

      // Função para redirecionamento à dashboard
      router.replace('/dashboard');

      return;
    }

    // Exibe mensagem caso as credenciais estejam incorretas
    setErro(true);
  }

  return (
    // Container principal da tela
    <View style={styles.container}>
      {/* Área central do formulário de login */}
      <View style={styles.loginBox}>
        {/* Título da tela */}
        <Text style={styles.title}>Gestão de Plantões</Text>

        {/* Texto explicativo */}
        <Text style={styles.subtitle}>
          Entre com suas credenciais para acessar o sistema.
        </Text>

        {/* Campo de e-mail */}
        <TextInput
          style={styles.input}
          placeholder="E-mail (admin@email.com)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Campo de senha */}
        <TextInput
          style={styles.input}
          placeholder="Senha (1234)"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {/* Botão para realizar o login */}
        <Pressable style={styles.button} onPress={entrar}>
          <Text style={styles.buttonText}>Entrar</Text>
        </Pressable>

        {/* Mensagem exibida caso haja erro */}
        {erro && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Credenciais inválidas</Text>

            <Text style={styles.errorText}>
              E-mail ou senha incorretos. Verifique e tente novamente.
            </Text>
          </View>
        )}

        {/* Botão de recuperação de senha */}
        <Pressable>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Estilos da tela de login
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  loginBox: {
    width: '100%',
    maxWidth: 420,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },

  input: {
    height: 52,
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
  },

  button: {
    height: 52,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '500',
  },

  errorContainer: {
    marginTop: 16,
  },

  errorTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },

  errorText: {
    fontSize: 13,
  },

  forgotPassword: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});