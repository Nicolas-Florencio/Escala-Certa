import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Tela de login */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Dashboard do colaborador */}
      <Stack.Screen
        name="dashboard"
        options={{ headerShown: false }}
      />

      {/* Escala do colaborador */}
      <Stack.Screen
        name="escala"
        options={{ headerShown: false }}
      />

      {/* Solicitação de folga */}
      <Stack.Screen
        name="folgas"
        options={{ headerShown: false }}
      />

      {/* Solicitação de troca */}
      <Stack.Screen
        name="trocas"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}