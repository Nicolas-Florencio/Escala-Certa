import { Href, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

import { COLORS } from '@/constants/colors';
import { apiRequest } from '@/services/api';


type Plantao = {
  id: number;
  data: string;
  turno: 'Manhã' | 'Tarde' | 'Noturno';
};

type MinhaEscalaResponse = {
  plantoes: Plantao[];
  folgas: unknown[];
};


export default function Folgas() {
  const [menuAberto, setMenuAberto] = useState(false);

  // Plantões disponíveis
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [plantaoSelecionado, setPlantaoSelecionado] =
    useState<Plantao | null>(null);

  // Solicitação
  const [dataFolga, setDataFolga] =
    useState<Date | null>(null);

  const [motivo, setMotivo] = useState('');

  // Estados da tela
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');


  useEffect(() => {
    carregarPlantoes();
  }, []);


  // Busca os plantões do colaborador
  async function carregarPlantoes() {
    try {
      setCarregando(true);
      setErro('');

      const data =
        await apiRequest('/escalas/me');

      const escala =
        data as MinhaEscalaResponse;

      const hoje = new Date();

      const dataHoje = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0'),
      ].join('-');

      // Apenas plantões atuais ou futuros
      const proximosPlantoes =
        (escala.plantoes ?? [])
          .filter(
            (plantao) =>
              plantao.data >= dataHoje
          )
          .sort(
            (a, b) =>
              a.data.localeCompare(b.data)
          );

      setPlantoes(proximosPlantoes);

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os plantões.'
      );

    } finally {
      setCarregando(false);
    }
  }


  // Converte AAAA-MM-DD em Date local
  function converterDataApiParaDate(
    data: string
  ) {
    const [ano, mes, dia] =
      data.split('-').map(Number);

    return new Date(
      ano,
      mes - 1,
      dia
    );
  }


  // DD/MM/AAAA
  function formatarDataExibicao(
    data: Date
  ) {
    const dia =
      String(data.getDate())
        .padStart(2, '0');

    const mes =
      String(data.getMonth() + 1)
        .padStart(2, '0');

    const ano =
      data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }


  // AAAA-MM-DD
  function formatarDataApi(
    data: Date
  ) {
    const dia =
      String(data.getDate())
        .padStart(2, '0');

    const mes =
      String(data.getMonth() + 1)
        .padStart(2, '0');

    const ano =
      data.getFullYear();

    return `${ano}-${mes}-${dia}`;
  }


  // Primeiro dia permitido para a folga
  function obterDataMinima() {
    if (!plantaoSelecionado) {
      return new Date();
    }

    const dataPlantao =
      converterDataApiParaDate(
        plantaoSelecionado.data
      );

    // Folga precisa ser posterior ao plantão
    const dataMinima =
      new Date(dataPlantao);

    dataMinima.setDate(
      dataMinima.getDate() + 1
    );

    return dataMinima;
  }


  // Seleciona um plantão
  function selecionarPlantao(
    plantao: Plantao
  ) {
    setPlantaoSelecionado(plantao);

    // Limpa a data de folga anterior,
    // pois o limite mínimo mudou
    setDataFolga(null);
  }


  // Abre o calendário nativo do Android
  function abrirCalendario() {
    if (!plantaoSelecionado) {
      Alert.alert(
        'Selecione um plantão',
        'Primeiro escolha o plantão relacionado à folga.'
      );

      return;
    }

    const dataMinima =
      obterDataMinima();

    DateTimePickerAndroid.open({
      value:
        dataFolga ?? dataMinima,

      mode: 'date',

      display: 'calendar',

      // Impede datas anteriores ou iguais
      // ao plantão selecionado
      minimumDate: dataMinima,

      onChange: (_event, dataSelecionada) => {
        if (dataSelecionada) {
          setDataFolga(dataSelecionada);
        }
      },
    });
  }


  // Envia solicitação para a API
  async function solicitarFolga() {
    if (!plantaoSelecionado) {
      Alert.alert(
        'Selecione um plantão',
        'Escolha primeiro o plantão relacionado à folga.'
      );

      return;
    }

    if (!dataFolga) {
      Alert.alert(
        'Selecione uma data',
        'Escolha a data desejada para a folga.'
      );

      return;
    }

    try {
      setEnviando(true);

      await apiRequest('/folgas', {
        method: 'POST',

        body: JSON.stringify({
          data:
            formatarDataApi(
              dataFolga
            ),

          ...(motivo.trim() !== ''
            ? {
              motivo:
                motivo.trim(),
            }
            : {}),
        }),
      });


      Alert.alert(
        'Solicitação enviada',
        'Sua solicitação de folga foi enviada para análise.'
      );


      // Limpa formulário
      setPlantaoSelecionado(null);
      setDataFolga(null);
      setMotivo('');

    } catch (error) {
      Alert.alert(
        'Não foi possível solicitar a folga',
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado.'
      );

    } finally {
      setEnviando(false);
    }
  }


  async function logout() {
    await SecureStore.deleteItemAsync(
      'token'
    );

    await SecureStore.deleteItemAsync(
      'usuario'
    );

    router.replace('/');
  }


  return (
    <View style={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>

        <Pressable
          style={styles.menuButton}
          onPress={() =>
            setMenuAberto(true)
          }
        >
          <Text style={styles.menuIcon}>
            ☰
          </Text>
        </Pressable>

        <View>
          <Text style={styles.title}>
            Solicitar folga
          </Text>

          <Text style={styles.subtitle}>
            Escolha o plantão e a data desejada
          </Text>
        </View>

      </View>


      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >

        {/* Loading */}
        {carregando && (
          <View style={styles.loadingContainer}>

            <ActivityIndicator
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Carregando plantões...
            </Text>

          </View>
        )}


        {/* Erro */}
        {erro !== '' && (
          <View style={styles.errorBox}>

            <Text style={styles.errorTitle}>
              Não foi possível carregar os plantões
            </Text>

            <Text style={styles.errorText}>
              {erro}
            </Text>

            <Pressable
              onPress={carregarPlantoes}
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>

          </View>
        )}


        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Nova solicitação
          </Text>

          <Text style={styles.cardDescription}>
            Selecione o plantão e depois escolha uma data posterior para a folga.
          </Text>


          {/* PLANTÃO */}
          <Text style={styles.label}>
            Plantão
          </Text>


          {!carregando && (
            plantoes.length === 0 ? (

              <View style={styles.emptyBox}>

                <Text style={styles.emptyText}>
                  Nenhum plantão futuro disponível.
                </Text>

              </View>

            ) : (

              <View style={styles.selectionList}>

                {plantoes.map(
                  (plantao) => {

                    const selecionado =
                      plantaoSelecionado?.id ===
                      plantao.id;

                    return (

                      <Pressable
                        key={plantao.id}

                        style={[
                          styles.selectionCard,

                          selecionado &&
                          styles.selectionCardActive,
                        ]}

                        onPress={() =>
                          selecionarPlantao(
                            plantao
                          )
                        }
                      >

                        <View>

                          <Text
                            style={[
                              styles.selectionTitle,

                              selecionado &&
                              styles.selectionTitleActive,
                            ]}
                          >
                            {formatarDataExibicao(
                              converterDataApiParaDate(
                                plantao.data
                              )
                            )}
                          </Text>

                          <Text
                            style={
                              styles.selectionSubtitle
                            }
                          >
                            Turno: {plantao.turno}
                          </Text>

                        </View>


                        <View
                          style={[
                            styles.radio,

                            selecionado &&
                            styles.radioActive,
                          ]}
                        >
                          {selecionado && (
                            <View
                              style={
                                styles.radioCenter
                              }
                            />
                          )}
                        </View>

                      </Pressable>
                    );
                  }
                )}

              </View>
            )
          )}


          {/* DATA DA FOLGA */}
          <Text style={styles.label}>
            Data desejada para a folga
          </Text>


          <Pressable
            style={[
              styles.dateInput,

              !plantaoSelecionado &&
              styles.dateInputDisabled,
            ]}
            onPress={abrirCalendario}
            disabled={!plantaoSelecionado}
          >

            <Text
              style={[
                styles.dateInputText,

                !dataFolga &&
                styles.datePlaceholder,
              ]}
            >
              {dataFolga
                ? formatarDataExibicao(
                  dataFolga
                )
                : 'Selecionar data'}
            </Text>

            <Text style={styles.calendarIcon}>
              📅
            </Text>

          </Pressable>


          {plantaoSelecionado && (
            <Text style={styles.helperText}>
              Disponível a partir de{' '}
              {formatarDataExibicao(
                obterDataMinima()
              )}
            </Text>
          )}


          {/* MOTIVO */}
          <Text style={styles.label}>
            Motivo
          </Text>

          <TextInput
            style={styles.textArea}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Informe o motivo (opcional)"
            placeholderTextColor={
              COLORS.textSecondary
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />


          {/* BOTÃO */}
          <Pressable
            style={({ pressed }) => [
              styles.button,

              pressed &&
              styles.buttonPressed,

              enviando &&
              styles.buttonDisabled,
            ]}
            onPress={solicitarFolga}
            disabled={enviando}
          >

            {enviando ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <Text style={styles.buttonText}>
                Solicitar folga
              </Text>

            )}

          </Pressable>

        </View>

      </ScrollView>


      {/* MENU LATERAL */}
      {menuAberto && (
        <>

          <Pressable
            style={styles.overlay}
            onPress={() =>
              setMenuAberto(false)
            }
          />


          <View style={styles.sidebar}>

            <View>

              <View style={styles.sidebarHeader}>

                <View>
                  <Text style={styles.sidebarBrand}>
                    Escala
                    <Text
                      style={
                        styles.sidebarBrandBlue
                      }
                    >
                      Certa
                    </Text>
                  </Text>

                  <Text
                    style={
                      styles.sidebarSubtitle
                    }
                  >
                    Gestão de Plantões
                  </Text>
                </View>


                <Pressable
                  onPress={() =>
                    setMenuAberto(false)
                  }
                >
                  <Text style={styles.closeButton}>
                    ✕
                  </Text>
                </Pressable>

              </View>


              <View style={styles.menuGroup}>

                <MenuItem
                  texto="Dashboard"
                  rota="/dashboard"
                />

                <MenuItem
                  texto="Minha escala"
                  rota="/escala"
                />

                <MenuItem
                  texto="Solicitar troca"
                  rota="/trocas"
                />

                <MenuItem
                  texto="Solicitar folga"
                  rota="/folgas"
                  ativo
                />

              </View>

            </View>


            <Pressable onPress={logout}>
              <Text style={styles.logout}>
                Sair
              </Text>
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
      style={[
        styles.menuItemButton,
        ativo && styles.menuItemActive,
      ]}
      onPress={() =>
        router.push(rota)
      }
    >
      <Text
        style={[
          styles.menuItem,
          ativo &&
          styles.menuItemActiveText,
        ]}
      >
        {texto}
      </Text>
    </Pressable>
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

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  content: {
    padding: 20,
    paddingBottom: 36,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginTop: 5,
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },

  selectionList: {
    gap: 8,
    marginBottom: 8,
  },

  selectionCard: {
    minHeight: 68,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },

  selectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  selectionTitleActive: {
    color: COLORS.primary,
  },

  selectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: COLORS.primary,
  },

  radioCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  dateInput: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateInputDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.7,
  },

  dateInputText: {
    fontSize: 15,
    color: COLORS.text,
  },

  datePlaceholder: {
    color: COLORS.textSecondary,
  },

  calendarIcon: {
    fontSize: 18,
  },

  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FFFFFF',
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },

  buttonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  emptyBox: {
    backgroundColor: COLORS.muted,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
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

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor:
      'rgba(15, 23, 42, 0.40)',
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

});