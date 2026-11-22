import { useState } from "react";
import "./index.css";

import Login from "./components/Login";
import RecuperarSenha from "./components/RecuperarSenha";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Escala from "./pages/Escala";
import CriarPlantao from "./pages/CriarPlantao";
import Colaboradores from "./pages/Colaboradores";
import Solicitacoes from "./pages/Solicitacoes";
import NovaTroca from "./pages/NovaTroca";
import AnaliseTroca from "./pages/AnaliseTroca";
import TrocaResultado from "./pages/TrocaResultado";
import Folgas from "./pages/Folgas";

import { api } from "./services/api";

const dbVazio = { colaboradores: [], plantoes: [], trocas: [], folgas: [] };

export default function App() {
  // token JWT e usuário autenticado (vêm da API, não existem sem login)
  const [token, setToken] = useState(null);
  const [session, setSession] = useState(null);

  // dados carregados da API depois do login
  const [db, setDb] = useState(dbVazio);
  const [carregando, setCarregando] = useState(false);

  // controla qual página está sendo exibida (navegação sem react-router)
  const [rota, setRota] = useState("dashboard");
  const [rotaId, setRotaId] = useState(null);

  const [loginState, setLoginState] = useState({});

  // qual tela mostrar antes de logar: "login" ou "recuperar-senha"
  const [authView, setAuthView] = useState("login");

  // mês/ano exibido no calendário da Gestão de escala
  // Começa sempre no mês/ano atuais (0 = janeiro)
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  function navegar(r, id = null) {
    setRota(r);
    setRotaId(id);
  }

  // Recarrega os dados usados pelas telas (equipe, escala, trocas, folgas).
  // Chamado depois do login e sempre que uma ação muda algo no servidor.
  async function recarregar(tok) {
    setCarregando(true);
    try {
      const [colaboradores, plantoes, trocas, folgas] = await Promise.all([
        api.colaboradores.listar(tok),
        api.escalas.listar(tok),
        api.trocas.listar(tok),
        api.folgas.listar(tok),
      ]);
      setDb({ colaboradores, plantoes, trocas, folgas });
    } finally {
      setCarregando(false);
    }
  }

  /* ----------------- Login / logout ----------------- */
  async function fazerLogin(email, senha) {
    try {
      const { token: tok, usuario } = await api.auth.login(email, senha);
      setLoginState({ success: true, email });
      setTimeout(async () => {
        setToken(tok);
        setSession({
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          funcao: usuario.funcao,
          role: usuario.perfil === "GESTOR" ? "gestor" : "colaborador",
        });
        setLoginState({});
        // volta o calendário para o mês atual a cada login
        setCalYear(new Date().getFullYear());
        setCalMonth(new Date().getMonth());
        navegar("dashboard");
        await recarregar(tok);
      }, 700);
    } catch (err) {
      setLoginState({ error: true, email, mensagem: err.message });
    }
  }

  function sair() {
    setToken(null);
    setSession(null);
    setDb(dbVazio);
    setLoginState({});
    setAuthView("login");
    navegar("dashboard");
  }

  function redefinirSenha() {
    setLoginState({
      error: true,
      mensagem: "Redefinição de senha ainda não está disponível. Peça ao gestor para recadastrar sua senha.",
    });
    setAuthView("login");
    return false;
  }

  /* ----------------- Plantões ----------------- */
  async function criarPlantao(data, turno, colaboradorId) {
    await api.escalas.criar({ colaborador_id: colaboradorId, data, turno }, token);
    await recarregar(token);
    navegar("escala");
  }

  /* ----------------- Colaboradores ----------------- */
  async function adicionarColaborador(dados) {
    await api.colaboradores.criar(dados, token);
    await recarregar(token);
  }

  /* ----------------- Trocas de plantão ----------------- */
  async function solicitarTroca(plantaoOrigemId, colaboradorDestinoId, motivo) {
    await api.trocas.solicitar(
      { plantao_origem_id: plantaoOrigemId, colaborador_destino_id: colaboradorDestinoId, motivo },
      token
    );
    await recarregar(token);
    navegar("solicitacoes");
  }

  async function aprovarTroca(id) {
    await api.trocas.decidir(id, "APROVADO", token);
    await recarregar(token);
    navegar("troca-resultado", id);
  }

  async function rejeitarTroca(id) {
    await api.trocas.decidir(id, "RECUSADO", token);
    await recarregar(token);
    navegar("solicitacoes");
  }

  /* ----------------- Folgas ----------------- */
  async function solicitarFolga(data, motivo) {
    await api.folgas.solicitar({ data, motivo }, token);
    await recarregar(token);
  }

  async function aprovarFolga(id) {
    await api.folgas.decidir(id, "APROVADO", token);
    await recarregar(token);
  }

  // Sem sessão -> mostra a tela de login ou a de redefinir senha
  if (!session) {
    return (
      <div className="ec-app">
        {authView === "recuperar-senha" ? (
          <RecuperarSenha onRedefinir={redefinirSenha} onVoltar={() => setAuthView("login")} />
        ) : (
          <Login loginState={loginState} onLogin={fazerLogin} onEsqueciSenha={() => setAuthView("recuperar-senha")} />
        )}
      </div>
    );
  }

  // Decide qual página mostrar de acordo com a rota atual
  let conteudo;
  switch (rota) {
    case "escala":
      conteudo = (
        <Escala
          session={session}
          db={db}
          calYear={calYear}
          calMonth={calMonth}
          setCalYear={setCalYear}
          setCalMonth={setCalMonth}
          navegar={navegar}
        />
      );
      break;
    case "criar-plantao":
      conteudo = <CriarPlantao db={db} onCriar={criarPlantao} navegar={navegar} />;
      break;
    case "colaboradores":
      conteudo = <Colaboradores db={db} onAdicionar={adicionarColaborador} />;
      break;
    case "solicitacoes":
      conteudo = <Solicitacoes session={session} db={db} navegar={navegar} />;
      break;
    case "nova-troca":
      conteudo = <NovaTroca session={session} db={db} plantaoInicialId={rotaId} onSolicitar={solicitarTroca} navegar={navegar} />;
      break;
    case "analise-troca":
      conteudo = <AnaliseTroca db={db} id={rotaId} onAprovar={aprovarTroca} onRejeitar={rejeitarTroca} />;
      break;
    case "troca-resultado":
      conteudo = <TrocaResultado db={db} id={rotaId} navegar={navegar} />;
      break;
    case "folgas":
      conteudo = <Folgas session={session} db={db} onSolicitarFolga={solicitarFolga} onAprovarFolga={aprovarFolga} />;
      break;
    case "dashboard":
    default:
      conteudo = <Dashboard session={session} db={db} />;
  }

  return (
    <div className="ec-app">
      <div className="shell">
        <Sidebar session={session} rota={rota} navegar={navegar} sair={sair} />
        <div className="main">
          {carregando && <div className="page-sub">Atualizando dados…</div>}
          {conteudo}
        </div>
      </div>
    </div>
  );
}
