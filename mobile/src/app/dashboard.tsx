import { router } from 'expo-router';
import { useState } from 'react';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function Dashboard() {
  // Estado responsável por abrir e fechar o menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  // Função para voltar à tela de login
  function login() {
    router.replace('/');
  }

  return (
    // Container principal da dashboard
    <View style={styles.container}>
      {/* Cabeçalho da tela */}
      <View style={styles.header}>
        {/* Botão que abre o menu lateral */}
        <Pressable
          style={styles.menuButton}
          onPress={() => setMenuAberto(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        {/* Título da página */}
        <Text style={styles.pageTitle}>Dashboard</Text>
      </View>

      {/* Área com rolagem da dashboard */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título da seção de resumo */}
        <Text style={styles.sectionTitle}>Resumo</Text>

        {/* Card com quantidade de plantões */}
        <DashboardCard
          title="Plantões"
          value="8"
          description="Plantões cadastrados"
        />

        {/* Card com solicitações de troca */}
        <DashboardCard
          title="Solicitações de troca"
          value="3"
          description="Solicitações pendentes"
        />

        {/* Card com quantidade de folgas */}
        <DashboardCard
          title="Folgas"
          value="2"
          description="Folgas cadastradas"
        />

        {/* Título da seção de próximos plantões */}
        <Text style={styles.sectionTitle}>Próximos plantões</Text>

        {/* Primeiro plantão */}
        <View style={styles.shiftCard}>
          <View>
            <Text style={styles.shiftLabel}>Data</Text>
            <Text style={styles.shiftValue}>20/09/2026</Text>
          </View>

          <View>
            <Text style={styles.shiftLabel}>Colaborador</Text>
            <Text style={styles.shiftValue}>Nicolas Alves</Text>
          </View>
        </View>

        {/* Segundo plantão */}
        <View style={styles.shiftCard}>
          <View>
            <Text style={styles.shiftLabel}>Data</Text>
            <Text style={styles.shiftValue}>27/09/2026</Text>
          </View>

          <View>
            <Text style={styles.shiftLabel}>Colaborador</Text>
            <Text style={styles.shiftValue}>Emanuel Oliveira</Text>
          </View>
        </View>
      </ScrollView>

      {/* Menu lateral exibido somente quando menuAberto for true */}
      {menuAberto && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuAberto(false)}
          />

          {/* Menu lateral */}
          <View style={styles.sidebar}>
            <View>
              {/* Cabeçalho do menu lateral */}
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>
                  Gestão de Plantões
                </Text>

                {/* Botão para fechar o menu */}
                <Pressable onPress={() => setMenuAberto(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              {/* Opções principais do menu */}
              <View style={styles.menuGroup}>
                <Text style={styles.menuItem}>Dashboard</Text>
                <Text style={styles.menuItem}>Gestão de escala</Text>
                <Text style={styles.menuItem}>Criar plantão</Text>
                <Text style={styles.menuItem}>Colaboradores</Text>
                <Text style={styles.menuItem}>Solicitações</Text>
                <Text style={styles.menuItem}>Folgas</Text>
              </View>
            </View>

            {/* Opções inferiores do menu */}
            <View>
              <Text style={styles.menuItem}>Configurações</Text>

              {/* Botão para sair e voltar ao login */}
              <Pressable onPress={login}>
                <Text style={styles.menuItem}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

// Define os dados que cada card deve receber
type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
};

// Componente reutilizável para os cards do resumo
function DashboardCard({
  title,
  value,
  description,
}: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>

        <Text style={styles.cardDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

// Estilização
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
    gap: 16,
  },

  menuButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuIcon: {
    fontSize: 28,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '600',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
    marginTop: 8,
  },

  card: {
    width: '100%',
    minHeight: 110,
    backgroundColor: '#18B663',
    borderRadius: 12,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },

  cardDescription: {
    color: '#FFFFFF',
    fontSize: 13,
  },

  cardValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },

  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    gap: 16,
  },

  shiftLabel: {
    color: '#777777',
    fontSize: 12,
    marginBottom: 3,
  },

  shiftValue: {
    fontSize: 16,
    fontWeight: '500',
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
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
    alignItems: 'center',
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