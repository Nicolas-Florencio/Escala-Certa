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

export default function Trocas() {
  // Controle do menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  // Motivo informado pelo colaborador
  const [motivo, setMotivo] = useState(
    'Conforme conversado com o Nicolas, trocaremos o plantão desta semana.'
  );

  // Solicitação temporária de troca
  function solicitarTroca() {
    Alert.alert(
      'Solicitação enviada',
      'A solicitação de troca foi registrada.'
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuAberto(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Solicitação de troca</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Solicitação de Troca
          </Text>

          {/* Plantão atual */}
          <Text style={styles.sectionLabel}>Meu plantão</Text>

          <View style={styles.infoBox}>
            <Text style={styles.smallLabel}>Dia</Text>

            <Text style={styles.infoValue}>
              13/09/2026 — Domingo
            </Text>
          </View>

          {/* Colaborador selecionado */}
          <Text style={styles.sectionLabel}>Trocar para</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>
              Nicolas Alves
            </Text>
          </View>

          {/* Motivo */}
          <Text style={styles.sectionLabel}>Motivo</Text>

          <TextInput
            style={styles.textArea}
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Informe o motivo da troca"
          />

          {/* Botões */}
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={styles.confirmButton}
              onPress={solicitarTroca}
            >
              <Text style={styles.confirmText}>
                Solicitar troca
              </Text>
            </Pressable>
          </View>
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
                <MenuItem texto="Escala" rota="/escala" />
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
  rota: Href
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
    fontSize: 21,
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
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 28,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },

  infoBox: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },

  smallLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
  },

  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 25,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#BBBBBB',
    borderRadius: 8,
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#18B663',
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 15,
  },

  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 1,
  },

  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
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