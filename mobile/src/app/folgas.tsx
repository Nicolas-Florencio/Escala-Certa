import { Href, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Folgas() {
  // Controle do menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  // Data informada pelo colaborador
  const [dataFolga, setDataFolga] = useState('10/09/2026');

  // Solicitação temporária
  function solicitarFolga() {
    Alert.alert(
      'Solicitação enviada',
      `Folga solicitada para ${dataFolga}.`
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuAberto(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Solicitar folga</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Informações disponíveis */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informar Folga</Text>

          <Text style={styles.available}>
            Folgas disponíveis: 1
          </Text>

          <Text style={styles.label}>
            Plantão que gerou a folga
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoDate}>
              06/09/2026 — Domingo
            </Text>

            <Text style={styles.infoText}>
              Plantão realizado
            </Text>
          </View>

          <Text style={styles.label}>
            Data desejada para a folga
          </Text>

          {/* Campo temporário até adicionarmos calendário */}
          <TextInput
            style={styles.input}
            value={dataFolga}
            onChangeText={setDataFolga}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
          />

          {/* Botão para solicitar */}
          <Pressable
            style={styles.button}
            onPress={solicitarFolga}
          >
            <Text style={styles.buttonText}>
              Solicitar Folga
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Menu lateral */}
      {menuAberto && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuAberto(false)}
          />

          <View style={styles.sidebar}>
            <View>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>
                  Gestão de Plantões
                </Text>

                <Pressable onPress={() => setMenuAberto(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.menuGroup}>
                <MenuItem texto="Dashboard" rota="/dashboard" />
                {/* <MenuItem texto="Minha escala" rota="/escala" /> */}
                {/*<MenuItem texto="Solicitar troca" rota="/trocas" />*/}
                <MenuItem texto="Solicitar folga" rota="/folgas" />
              </View>
            </View>

            <Pressable onPress={() => router.replace('/')}>
              <Text style={styles.menuItem}>Sair</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function MenuItem({
  texto,
  rota,
}: {
  texto: string;
  rota: Href;
}) {
  return (
    <Pressable onPress={() => router.push(rota)}>
      <Text style={styles.menuItem}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    height: 90,
    paddingTop: 38,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 18,
  },

  menuIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 20,
  },

  available: {
    fontSize: 16,
    marginBottom: 26,
  },

  label: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
    marginTop: 8,
  },

  infoBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },

  infoDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 14,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#18B663',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '78%',
    maxWidth: 310,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 30,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  closeButton: {
    fontSize: 22,
  },

  menuGroup: {
    marginTop: 45,
  },

  menuItem: {
    fontSize: 16,
    marginBottom: 26,
  },
});