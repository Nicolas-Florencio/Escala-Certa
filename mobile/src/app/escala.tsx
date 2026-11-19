import { Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';
import { apiRequest } from '@/services/api';

type Plantao = {
  id: number;
  data: string;
  turno: 'Manhã' | 'Tarde';
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

type EventoCalendario = {
  texto: string;
  tipo: 'plantao' | 'folga' | 'pendente';
};

type DiaCalendario = {
  dia: number;
  data: string;
  foraDoMes: boolean;
  eventos: EventoCalendario[];
};

const semana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Escala() {
  const [menuAberto, setMenuAberto] = useState(false);

  // Dados recebidos da API
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [folgas, setFolgas] = useState<Folga[]>([]);

  // Estados da requisição
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Mês exibido no calendário
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    hoje.getMonth()
  );

  const [anoAtual, setAnoAtual] = useState(
    hoje.getFullYear()
  );

  // Recarrega a escala sempre que o mês for alterado
  useEffect(() => {
    carregarEscala();
  }, [mesAtual, anoAtual]);

  async function carregarEscala() {
    try {
      setCarregando(true);
      setErro('');

      const primeiroDia =
        `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-01`;

      const ultimoDiaMes = new Date(
        anoAtual,
        mesAtual + 1,
        0
      ).getDate();

      const ultimoDia =
        `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(
          ultimoDiaMes
        ).padStart(2, '0')}`;

      const data = await apiRequest(
        `/escalas/me?de=${primeiroDia}&ate=${ultimoDia}`
      );

      const escala = data as MinhaEscalaResponse;

      setPlantoes(escala.plantoes ?? []);
      setFolgas(escala.folgas ?? []);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a escala.'
      );
    } finally {
      setCarregando(false);
    }
  }

  // Navegação entre os meses
  function mesAnterior() {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual((ano) => ano - 1);
      return;
    }

    setMesAtual((mes) => mes - 1);
  }

  function proximoMes() {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual((ano) => ano + 1);
      return;
    }

    setMesAtual((mes) => mes + 1);
  }

  const nomesMeses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Gera todas as células necessárias para o calendário
  const diasCalendario = useMemo(() => {
    const resultado: DiaCalendario[] = [];

    const primeiroDiaSemana = new Date(
      anoAtual,
      mesAtual,
      1
    ).getDay();

    const quantidadeDias = new Date(
      anoAtual,
      mesAtual + 1,
      0
    ).getDate();

    function criarDia(
      ano: number,
      mes: number,
      dia: number,
      foraDoMes: boolean
    ): DiaCalendario {
      const data =
        `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      const eventos: EventoCalendario[] = [];

      // Plantão correspondente à data
      const plantoesDoDia = plantoes.filter(
        (plantao) => plantao.data === data
      );

      plantoesDoDia.forEach((plantao) => {
        eventos.push({
          texto: plantao.turno,
          tipo: 'plantao',
        });
      });

      // Folgas correspondentes à data
      const folgasDoDia = folgas.filter(
        (folga) => folga.data === data
      );

      folgasDoDia.forEach((folga) => {
        // Solicitação recusada não precisa aparecer
        if (folga.status === 'RECUSADO') {
          return;
        }

        eventos.push({
          texto:
            folga.status === 'PENDENTE'
              ? 'Folga pend.'
              : 'Folga',
          tipo:
            folga.status === 'PENDENTE'
              ? 'pendente'
              : 'folga',
        });
      });

      return {
        dia,
        data,
        foraDoMes,
        eventos,
      };
    }

    // Dias do mês anterior
    for (let i = primeiroDiaSemana; i > 0; i--) {
      const data = new Date(
        anoAtual,
        mesAtual,
        1 - i
      );

      resultado.push(
        criarDia(
          data.getFullYear(),
          data.getMonth(),
          data.getDate(),
          true
        )
      );
    }

    // Dias do mês atual
    for (let dia = 1; dia <= quantidadeDias; dia++) {
      resultado.push(
        criarDia(
          anoAtual,
          mesAtual,
          dia,
          false
        )
      );
    }

    // Completa o calendário até 42 células
    let proximoDia = 1;

    while (resultado.length < 42) {
      const data = new Date(
        anoAtual,
        mesAtual + 1,
        proximoDia
      );

      resultado.push(
        criarDia(
          data.getFullYear(),
          data.getMonth(),
          data.getDate(),
          true
        )
      );

      proximoDia++;
    }

    return resultado;
  }, [anoAtual, mesAtual, plantoes, folgas]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={() => setMenuAberto(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Minha escala</Text>
          <Text style={styles.subtitle}>Acompanhe seus plantões e folgas</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
          <Pressable
            style={styles.monthButton}
            onPress={mesAnterior}
          >
            <Text style={styles.monthButtonText}>‹</Text>
          </Pressable>

          <View style={styles.monthInfo}>
            <Text style={styles.month}>
              {nomesMeses[mesAtual]} {anoAtual}
            </Text>

            <Text style={styles.monthSubtitle}>
              {plantoes.length}{' '}
              {plantoes.length === 1
                ? 'plantão'
                : 'plantões'}
            </Text>
          </View>

          <Pressable
            style={styles.monthButton}
            onPress={proximoMes}
          >
            <Text style={styles.monthButtonText}>›</Text>
          </Pressable>
        </View>

        {carregando && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Carregando escala...
            </Text>
          </View>
        )}

        {erro !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar a escala
            </Text>

            <Text style={styles.errorText}>
              {erro}
            </Text>

            <Pressable onPress={carregarEscala}>
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {semana.map((dia, index) => (
              <View style={styles.weekCell} key={index}>
                <Text style={styles.weekText}>{dia}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendar}>
            {diasCalendario.map((item, index) => (
              <View
                key={`${item.data}-${index}`}
                style={[
                  styles.dayCell,
                  item.foraDoMes && styles.outsideDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    item.foraDoMes && styles.outsideText,
                  ]}
                >
                  {item.dia}
                </Text>

                {!item.foraDoMes &&
                  item.eventos.slice(0, 2).map((evento, eventoIndex) => (
                    <View
                      key={eventoIndex}
                      style={[
                        styles.event,

                        evento.tipo === 'plantao' &&
                        styles.plantao,

                        evento.tipo === 'folga' &&
                        styles.folga,

                        evento.tipo === 'pendente' &&
                        styles.pendente,
                      ]}
                    >
                      <Text style={styles.eventText}>
                        {evento.texto}
                      </Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.plantao]} />
            <Text style={styles.legendText}>Plantão</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.folga]} />
            <Text style={styles.legendText}>Folga</Text>
          </View>
          <View style={styles.legendItem}>

            <View
              style={[styles.legendColor, styles.pendente]} />
            <Text style={styles.legendText}>Pendente</Text>
          </View>
        </View>
      </ScrollView>

      {menuAberto && (
        <>
          <Pressable style={styles.overlay} onPress={() => setMenuAberto(false)} />

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
                <MenuItem texto="Dashboard" rota="/dashboard" />
                <MenuItem texto="Minha escala" rota="/escala" ativo />
                <MenuItem texto="Solicitar troca" rota="/trocas" />
                <MenuItem texto="Solicitar folga" rota="/folgas" />
              </View>
            </View>

            <Pressable onPress={() => router.replace('/')}>
              <Text style={styles.logout}>Sair</Text>
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
      <Text style={[styles.menuItem, ativo && styles.menuItemActiveText]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    minHeight: 92, paddingTop: 38, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    gap: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  menuButton: {
    width: 42, height: 42, borderRadius: 10, backgroundColor: COLORS.muted,
    justifyContent: 'center', alignItems: 'center',
  },
  menuIcon: { fontSize: 24, color: COLORS.text },
  title: { fontSize: 21, fontWeight: '700', color: COLORS.text },
  subtitle: { marginTop: 2, fontSize: 12, color: COLORS.textSecondary },
  content: { padding: 16, paddingBottom: 36 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  monthInfo: {
    flex: 1,
    alignItems: 'center',
  },

  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthButtonText: {
    fontSize: 28,
    color: COLORS.primary,
    lineHeight: 30,
  },
  month: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  monthSubtitle: { marginTop: 3, fontSize: 12, color: COLORS.textSecondary },
  statusBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  calendarCard: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14,
    overflow: 'hidden', backgroundColor: COLORS.card,
  },
  weekRow: { flexDirection: 'row', backgroundColor: COLORS.primaryDark },
  weekCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 10 },
  weekText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%', minHeight: 72, borderWidth: 0.5,
    borderColor: COLORS.border, padding: 5, backgroundColor: COLORS.card,
  },
  outsideDay: { backgroundColor: COLORS.muted },
  dayNumber: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  outsideText: { color: '#94A3B8' },
  event: {
    marginTop: 7, paddingVertical: 4, paddingHorizontal: 2,
    borderRadius: 5,
  },
  plantao: { backgroundColor: COLORS.primary },
  folga: { backgroundColor: COLORS.success },
  eventText: { fontSize: 8, color: '#FFFFFF', textAlign: 'center', fontWeight: '700' },
  legend: {
    flexDirection: 'row', gap: 20, marginTop: 16,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 14,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendColor: { width: 12, height: 12, borderRadius: 4 },
  legendText: { color: COLORS.textSecondary, fontSize: 13 },
  overlay: {
    ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.40)', zIndex: 1,
  },
  sidebar: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', maxWidth: 310,
    backgroundColor: COLORS.card, paddingTop: 54, paddingHorizontal: 22,
    paddingBottom: 28, justifyContent: 'space-between', zIndex: 2,
  },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sidebarBrand: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  sidebarBrandBlue: { color: COLORS.primary },
  sidebarSubtitle: { marginTop: 3, color: COLORS.textSecondary, fontSize: 12 },
  closeButton: { fontSize: 22, color: COLORS.textSecondary },
  menuGroup: { marginTop: 38, gap: 6 },
  menuItemButton: { borderRadius: 10 },
  menuItemActive: { backgroundColor: '#EFF6FF' },
  menuItem: { fontSize: 15, color: COLORS.text, paddingVertical: 12, paddingHorizontal: 12 },
  menuItemActiveText: { color: COLORS.primary, fontWeight: '700' },
  logout: { fontSize: 15, fontWeight: '700', color: COLORS.error, paddingVertical: 12, paddingHorizontal: 12 },
  pendente: {
    backgroundColor: COLORS.warning,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    marginBottom: 16,
  },

  errorTitle: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },

  errorText: {
    color: '#991B1B',
    fontSize: 12,
    marginTop: 4,
  },

  retryText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 10,
  },
});
