
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  // Verifica se a URL da API foi configurada
  const baseUrl = API_URL;

  if (!baseUrl) {
    throw new Error(
      'URL da API não configurada. Verifique o arquivo .env.'
    );
  }

  // Busca o token salvo, caso exista
  const token = await SecureStore.getItemAsync('token');

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,

    headers: {
      'Content-Type': 'application/json',

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });

  const data = await response.json();

  // A API retorna erros no formato { erro: "mensagem" }
  if (!response.ok) {
    throw new Error(data.erro || 'Erro ao acessar a API');
  }

  return data;
}
