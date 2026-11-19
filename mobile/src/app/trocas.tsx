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

import { COLORS } from '@/constants/colors';
import { apiRequest } from '@/services/api';


// Tipagem dos plantões
type Plantao = {
  id: number;
  data: string;
  turno: 'Manhã' | 'Tarde' | 'Noturno';
};


// Retorno da escala do colaborador
type MinhaEscalaResponse = {
  plantoes: Plantao[];
  folgas: unknown[];
};


// Tipagem dos colaboradores
type Colaborador = {
  id: number;
  nome: string;
  funcao: string;
  perfil: 'GESTOR' | 'COLABORADOR';
  email?: string;
};


// Usuário autenticado
type Usuario = {
  id: number;
  nome: string;
  email: string;
  funcao: string;
  perfil: 'GESTOR' | 'COLABORADOR';
};


export default function Trocas() {

  // Controle do menu lateral
  const [menuAberto, setMenuAberto] = useState(false);

  // Dados recebidos da API
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [colaboradores, setColaboradores] =
    useState<Colaborador[]>([]);

  // Seleções do usuário
  const [plantaoSelecionado, setPlantaoSelecionado] =
    useState<number | null>(null);

  const [
    colaboradorSelecionado,
    setColaboradorSelecionado,
  ] = useState<number | null>(null);

  const [motivo, setMotivo] = useState('');

  // Estados de carregamento
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');


  // Carrega os dados ao abrir a tela
  useEffect(() => {
    carregarDados();
  }, []);


  // Busca plantões e colaboradores
  async function carregarDados() {
    try {

      setCarregando(true);
      setErro('');

      // Recupera o usuário autenticado
      const usuarioSalvo =
        await SecureStore.getItemAsync('usuario');

      if (!usuarioSalvo) {
        throw new Error(
          'Não foi possível identificar o usuário autenticado.'
        );
      }

      const usuario: Usuario =
        JSON.parse(usuarioSalvo);

      // Busca escala e colaboradores ao mesmo tempo
      const [escala, equipe] = await Promise.all([
        apiRequest('/escalas/me'),
        apiRequest('/colaboradores'),
      ]);

      const dadosEscala =
        escala as MinhaEscalaResponse;

      // Aceita tanto um array direto quanto
      // um objeto com propriedade colaboradores
      const listaColaboradores: Colaborador[] =
        Array.isArray(equipe)
          ? equipe
          : equipe?.colaboradores ?? [];

      // Obtém a data atual no formato AAAA-MM-DD
      const hoje = new Date();

      const dataHoje = [
        hoje.getFullYear(),
        String(
          hoje.getMonth() + 1
        ).padStart(2, '0'),
        String(
          hoje.getDate()
        ).padStart(2, '0'),
      ].join('-');


      // Mantém somente plantões atuais ou futuros
      const proximosPlantoes =
        (dadosEscala.plantoes ?? [])
          .filter(
            (plantao) =>
              plantao.data >= dataHoje
          )
          .sort(
            (a, b) =>
              a.data.localeCompare(b.data)
          );

      setPlantoes(proximosPlantoes);


      // Remove o próprio usuário da lista
      // e mantém somente colaboradores
      const outrosColaboradores =
        listaColaboradores.filter(
          (colaborador) =>
            colaborador.id !== usuario.id &&
            colaborador.perfil === 'COLABORADOR'
        );

      setColaboradores(
        outrosColaboradores
      );

    } catch (error) {

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados.'
      );

    } finally {

      setCarregando(false);

    }
  }


  // Envia a solicitação de troca
  async function solicitarTroca() {

    if (plantaoSelecionado === null) {

      Alert.alert(
        'Selecione um plantão',
        'Escolha o plantão que deseja trocar.'
      );

      return;
    }


    if (colaboradorSelecionado === null) {

      Alert.alert(
        'Selecione um colaborador',
        'Escolha o colega com quem deseja solicitar a troca.'
      );

      return;
    }


    try {

      setEnviando(true);

      await apiRequest('/trocas', {
        method: 'POST',

        body: JSON.stringify({
          plantao_origem_id:
            plantaoSelecionado,

          colaborador_destino_id:
            colaboradorSelecionado,

          // Motivo é opcional
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
        'A solicitação de troca foi enviada com sucesso.'
      );


      // Limpa o formulário
      setPlantaoSelecionado(null);
      setColaboradorSelecionado(null);
      setMotivo('');

    } catch (error) {

      Alert.alert(
        'Não foi possível solicitar a troca',
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado.'
      );

    } finally {

      setEnviando(false);

    }
  }


  // Remove a autenticação e retorna ao login
  async function logout() {

    await SecureStore.deleteItemAsync(
      'token'
    );

    await SecureStore.deleteItemAsync(
      'usuario'
    );

    router.replace('/');
  }


  // Converte AAAA-MM-DD para DD/MM/AAAA
  function formatarData(data: string) {

    const [ano, mes, dia] =
      data.split('-');

    return `${dia}/${mes}/${ano}`;
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
            Solicitação de troca
          </Text>

          <Text style={styles.subtitle}>
            Envie uma solicitação ao gestor
          </Text>
        </View>

      </View>


      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Carregamento */}
        {carregando && (
          <View style={styles.loadingContainer}>

            <ActivityIndicator
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Carregando informações...
            </Text>

          </View>
        )}


        {/* Erro */}
        {erro !== '' && (
          <View style={styles.errorBox}>

            <Text style={styles.errorTitle}>
              Não foi possível carregar os dados
            </Text>

            <Text style={styles.errorText}>
              {erro}
            </Text>

            <Pressable
              onPress={carregarDados}
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>

          </View>
        )}


        <View style={styles.card}>

          <Text style={styles.cardTitle}>
            Dados da troca
          </Text>


          {/* PLANTÃO */}
          <Text style={styles.sectionLabel}>
            Meu plantão
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

                {plantoes.map((plantao) => {

                  const selecionado =
                    plantaoSelecionado ===
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
                        setPlantaoSelecionado(
                          plantao.id
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
                          {formatarData(
                            plantao.data
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


                      {/* Indicador de seleção */}
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
                })}

              </View>
            )
          )}


          {/* COLABORADOR */}
          <Text style={styles.sectionLabel}>
            Trocar para
          </Text>


          {!carregando && (
            colaboradores.length === 0 ? (

              <View style={styles.emptyBox}>

                <Text style={styles.emptyText}>
                  Nenhum colaborador disponível.
                </Text>

              </View>

            ) : (

              <View style={styles.selectionList}>

                {colaboradores.map(
                  (colaborador) => {

                    const selecionado =
                      colaboradorSelecionado ===
                      colaborador.id;

                    return (

                      <Pressable
                        key={colaborador.id}

                        style={[
                          styles.selectionCard,

                          selecionado &&
                          styles.selectionCardActive,
                        ]}

                        onPress={() =>
                          setColaboradorSelecionado(
                            colaborador.id
                          )
                        }
                      >

                        <View
                          style={
                            styles.selectionInfo
                          }
                        >

                          <Text
                            style={[
                              styles.selectionTitle,

                              selecionado &&
                              styles.selectionTitleActive,
                            ]}
                          >
                            {colaborador.nome}
                          </Text>

                          <Text
                            style={
                              styles.selectionSubtitle
                            }
                          >
                            {colaborador.funcao}
                          </Text>

                        </View>


                        {/* Indicador de seleção */}
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


          {/* MOTIVO */}
          <Text style={styles.sectionLabel}>
            Motivo
          </Text>

          <TextInput
            style={styles.textArea}
            value={motivo}
            onChangeText={setMotivo}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Informe o motivo da troca (opcional)"
            placeholderTextColor={
              COLORS.textSecondary
            }
          />


          {/* BOTÕES */}
          <View style={styles.buttonRow}>

            <Pressable
              style={styles.cancelButton}
              onPress={() =>
                router.back()
              }
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>


            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,

                pressed &&
                styles.confirmButtonPressed,

                enviando &&
                styles.confirmButtonDisabled,
              ]}

              onPress={solicitarTroca}

              disabled={enviando}
            >

              {enviando ? (

                <ActivityIndicator
                  color="#FFFFFF"
                />

              ) : (

                <Text style={styles.confirmText}>
                  Solicitar troca
                </Text>

              )}

            </Pressable>

          </View>

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
                  ativo
                />

                <MenuItem
                  texto="Solicitar folga"
                  rota="/folgas"
                />

              </View>

            </View>


            {/* Logout */}
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


// Item do menu lateral
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
        ativo &&
        styles.menuItemActive,
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


// Estilos
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    borderBottomColor:
      COLORS.border,
  },


  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor:
      COLORS.muted,
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
    color:
      COLORS.textSecondary,
  },


  content: {
    padding: 20,
    paddingBottom: 36,
  },


  card: {
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 14,
    padding: 20,
  },


  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 22,
  },


  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
  },


  selectionList: {
    gap: 8,
    marginBottom: 12,
  },


  selectionCard: {
    minHeight: 68,
    backgroundColor:
      COLORS.card,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },


  selectionCardActive: {
    borderColor:
      COLORS.primary,
    backgroundColor:
      '#EFF6FF',
  },


  selectionInfo: {
    flex: 1,
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
    color:
      COLORS.textSecondary,
  },


  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },


  radioActive: {
    borderColor:
      COLORS.primary,
  },


  radioCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor:
      COLORS.primary,
  },


  emptyBox: {
    backgroundColor:
      COLORS.muted,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },


  emptyText: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
  },


  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor:
      '#FFFFFF',
  },


  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },


  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor:
      COLORS.card,
  },


  confirmButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor:
      COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },


  confirmButtonPressed: {
    backgroundColor:
      COLORS.primaryDark,
  },


  confirmButtonDisabled: {
    opacity: 0.6,
  },


  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color:
      COLORS.textSecondary,
  },


  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },


  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },


  loadingText: {
    color:
      COLORS.textSecondary,
    fontSize: 13,
  },


  errorBox: {
    backgroundColor:
      '#FEF2F2',
    borderWidth: 1,
    borderColor:
      '#FECACA',
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
    backgroundColor:
      COLORS.card,
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 28,
    justifyContent:
      'space-between',
    zIndex: 2,
  },


  sidebarHeader: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
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
    color:
      COLORS.textSecondary,
    fontSize: 12,
  },


  closeButton: {
    fontSize: 22,
    color:
      COLORS.textSecondary,
  },


  menuGroup: {
    marginTop: 38,
    gap: 6,
  },


  menuItemButton: {
    borderRadius: 10,
  },


  menuItemActive: {
    backgroundColor:
      '#EFF6FF',
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