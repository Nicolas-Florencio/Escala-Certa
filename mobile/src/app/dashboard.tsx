import { Href, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

type Usuario = {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  perfil: 'GESTOR' | 'COLABORADOR';
};

type Plantao = {
  id: number;
  data: string;
  turno: 'Manhã' | 'Tarde' | 'Noturno';
};

type Folga = {
  id: number;
  data: string;
  motivo?: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
};

type MinhaEscalaResponse = {
  plantoes: Plantao[];
  folgas: Folga[];
};

type Troca = {
  id: number;
  status: string;
};

import { COLORS } from '@/constants/colors';
import { apiRequest } from '@/services/api';

export default function Dashboard() {
  // Controle do menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  // Dados do usuário autenticado
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Dados recebidos da API
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [folgas, setFolgas] = useState<Folga[]>([]);
  const [trocasPendentes, setTrocasPendentes] = useState<Troca[]>([]);

  // Estados da requisição
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Carrega os dados ao abrir a dashboard
  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro('');

      // Recupera o usuário salvo durante o login
      const usuarioSalvo =
        await SecureStore.getItemAsync('usuario');

      if (usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }

      // Busca escala e trocas pendentes ao mesmo tempo
      const [escala, trocas] = await Promise.all([
        apiRequest('/escalas/me'),
        apiRequest('/trocas?status=PENDENTE'),
      ]);

      const dadosEscala =
        escala as MinhaEscalaResponse;

      setPlantoes(dadosEscala.plantoes ?? []);
      setFolgas(dadosEscala.folgas ?? []);

      setTrocasPendentes(
        Array.isArray(trocas) ? trocas : []
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a dashboard.'
      );
    } finally {
      setCarregando(false);
    }
  }

  // Remove os dados de autenticação e volta ao login
  async function logout() {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('usuario');

    router.replace('/');
  }

    // Folgas ainda aguardando decisão
  const folgasPendentes = folgas.filter(
    (folga) => folga.status === 'PENDENTE'
  );

  // Soma trocas e folgas pendentes
  const solicitacoesPendentes =
    trocasPendentes.length + folgasPendentes.length;

  // Obtém a data atual no formato utilizado pela API
  const hoje = new Date();

  const dataHoje = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0'),
  ].join('-');

  // Seleciona somente os próximos plantões
  const proximosPlantoes = [...plantoes]
    .filter((plantao) => plantao.data >= dataHoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.menuButton}
          onPress={() => setMenuAberto(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <View>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Resumo da sua escala</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeArea}>
          <Text style={styles.welcomeTitle}>Olá, {usuario?.nome?.split(' ')[0] ?? 'colaborador'}!</Text>
          <Text style={styles.welcomeText}>
            Confira seus próximos plantões e solicitações.
          </Text>
          
        </View>

{carregando && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator
      size="small"
      color={COLORS.primary}
    />

    <Text style={styles.loadingText}>
      Carregando informações...
    </Text>
  </View>
)}

{erro !== '' && (
  <View style={styles.errorBox}>
    <Text style={styles.errorTitle}>
      Não foi possível carregar os dados
    </Text>

    <Text style={styles.errorText}>
      {erro}
    </Text>

    <Pressable
      style={styles.retryButton}
      onPress={carregarDashboard}
    >
      <Text style={styles.retryText}>
        Tentar novamente
      </Text>
    </Pressable>
  </View>
)}

        <Text style={styles.sectionTitle}>Resumo</Text>

        <View style={styles.summaryGrid}>
          <DashboardCard
            title="Plantões"
            value={String(plantoes.length)}
            description="Cadastrados"
          />

          <DashboardCard
            title="Solicitações"
            value={String(solicitacoesPendentes)}
            description="Pendentes"
          />

          <DashboardCard
            title="Folgas"
            value={String(folgas.length)}
            description="Solicitadas"
          />
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>

        <View style={styles.quickGrid}>
          <QuickAction label="Minha escala" rota="/escala" />
          <QuickAction label="Solicitar folga" rota="/folgas" />
          <QuickAction label="Solicitar troca" rota="/trocas" />
        </View>

        <Text style={styles.sectionTitle}>Próximos plantões</Text>

          {proximosPlantoes.length > 0 ? (
            proximosPlantoes.map((plantao) => (
              <ShiftCard
                key={plantao.id}
                data={plantao.data}
                turno={plantao.turno}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Nenhum próximo plantão encontrado.
              </Text>
            </View>
          )}
      </ScrollView>

      {menuAberto && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setMenuAberto(false)}
          />

          <View style={styles.sidebar}>
            <View>
              <View style={styles.sidebarHeader}>
                <View>
                  <Text style={styles.sidebarBrand}>
                    Escala<Text style={styles.sidebarBrandBlue}>Certa</Text>
                  </Text>
                  <Text style={styles.sidebarSubtitle}>Gestão de Plantões</Text>
                </View>

                <Pressable onPress={() => setMenuAberto(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.menuGroup}>
                <MenuItem texto="Dashboard" rota="/dashboard" ativo />
                <MenuItem texto="Escala" rota="/escala" />
                <MenuItem texto="Solicitações" rota="/trocas" />
                <MenuItem texto="Folgas" rota="/folgas" />
              </View>
            </View>

            <View>
              <Text style={styles.menuItem}>Configurações</Text>

              <Pressable onPress={logout}>
                <Text style={styles.logout}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function MenuItem({
  texto,
  rota,
  ativo = false,
}: {
  texto: string;
  rota: Href;
  ativo?: boolean;
}) {
  return (
    <Pressable
      style={[styles.menuItemButton, ativo && styles.menuItemActive]}
      onPress={() => router.push(rota)}
    >
      <Text style={[styles.menuItem, ativo && styles.menuItemActiveText]}>
        {texto}
      </Text>
    </Pressable>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

function QuickAction({ label, rota }: { label: string; rota: Href }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
      onPress={() => router.push(rota)}
    >
      <View style={styles.quickIcon}>
        <Text style={styles.quickIconText}>→</Text>
      </View>
      <Text style={styles.quickText}>{label}</Text>
    </Pressable>
  );
}

function ShiftCard({
  data,
  turno,
}: {
  data: string;
  turno: string;
}) {
  // Converte AAAA-MM-DD para os elementos visuais do card
  const [ano, mes, dia] = data.split('-');

  const meses = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ];

  const mesTexto = meses[Number(mes) - 1];

  return (
    <View style={styles.shiftCard}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeDay}>
          {dia}
        </Text>

        <Text style={styles.dateBadgeMonth}>
          {mesTexto}
        </Text>
      </View>

      <View style={styles.shiftInfo}>
        <Text style={styles.shiftName}>
          Plantão
        </Text>

        <Text style={styles.shiftTime}>
          {turno} • {dia}/{mes}/{ano}
        </Text>
      </View>

      <Text style={styles.shiftArrow}>›</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 92,
    paddingTop: 38,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeArea: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  welcomeText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  card: {
    flex: 1,
    minHeight: 115,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  quickGrid: {
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    minHeight: 58,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionPressed: {
    backgroundColor: '#EFF6FF',
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  quickText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  shiftCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    width: 50,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeDay: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 18,
  },
  dateBadgeMonth: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  shiftInfo: {
    flex: 1,
    marginLeft: 14,
  },
  shiftName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  shiftTime: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  shiftArrow: {
    fontSize: 28,
    color: COLORS.textSecondary,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
    zIndex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '80%',
    maxWidth: 310,
    backgroundColor: COLORS.card,
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 28,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sidebarBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  sidebarBrandBlue: {
    color: COLORS.primary,
  },
  sidebarSubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  closeButton: {
    fontSize: 22,
    color: COLORS.textSecondary,
  },
  menuGroup: {
    marginTop: 38,
    gap: 6,
  },
  menuItemButton: {
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuItem: {
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuItemActiveText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  logout: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  loadingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 18,
},

loadingText: {
  color: COLORS.textSecondary,
  fontSize: 13,
},

errorBox: {
  backgroundColor: '#FEF2F2',
  borderWidth: 1,
  borderColor: '#FECACA',
  borderRadius: 12,
  padding: 14,
  marginBottom: 18,
},

errorTitle: {
  color: COLORS.error,
  fontWeight: '700',
  fontSize: 14,
},

errorText: {
  color: '#991B1B',
  fontSize: 12,
  marginTop: 4,
},

retryButton: {
  alignSelf: 'flex-start',
  marginTop: 10,
},

retryText: {
  color: COLORS.primary,
  fontWeight: '700',
  fontSize: 13,
},

emptyCard: {
  backgroundColor: COLORS.card,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 12,
  padding: 18,
},

emptyText: {
  color: COLORS.textSecondary,
  fontSize: 13,
  textAlign: 'center',
},
});
