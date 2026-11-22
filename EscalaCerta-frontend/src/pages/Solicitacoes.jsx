import { fmtBR, pillClasse } from "../utils/helpers";

// Traduz o status da API (PENDENTE/APROVADO/RECUSADO) para o texto exibido na tela
function statusTexto(status) {
  if (status === "APROVADO") return "Aprovada";
  if (status === "RECUSADO") return "Rejeitada";
  return "Pendente";
}

export default function Solicitacoes({ session, db, navegar }) {
  const isGestor = session.role === "gestor";

  if (!isGestor) {
    const minhas = db.trocas.filter((t) => t.colaborador_origem_id === session.id);
    return (
      <>
        <div className="top-row">
          <div>
            <div className="page-title">Solicitações de troca</div>
            <div className="page-sub">Acompanhe suas solicitações ou peça uma nova troca de plantão.</div>
          </div>
          <button className="btn btn-primary" onClick={() => navegar("nova-troca")}>
            Solicitar troca
          </button>
        </div>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Data do plantão</th>
                <th>Novo colaborador</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {minhas.length ? (
                minhas.map((t) => (
                  <tr key={t.id}>
                    <td>{fmtBR(t.plantao_data)}</td>
                    <td>{t.colaborador_destino_nome}</td>
                    <td>
                      <span className={pillClasse(statusTexto(t.status))}>{statusTexto(t.status)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty">
                    Você ainda não solicitou nenhuma troca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const pendentes = db.trocas.filter((t) => t.status === "PENDENTE");
  const resolvidas = db.trocas.filter((t) => t.status !== "PENDENTE");

  return (
    <>
      <div className="page-title">Solicitações de troca</div>
      <div className="page-sub">Analise e aprove ou rejeite pedidos de troca de plantão da equipe.</div>

      <div className="card">
        <h3>Pendentes</h3>
        <table>
          <thead>
            <tr>
              <th>Data do plantão</th>
              <th>Colaborador</th>
              <th>Novo colaborador</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {pendentes.length ? (
              pendentes.map((t) => (
                <tr key={t.id}>
                  <td>{fmtBR(t.plantao_data)}</td>
                  <td>{t.colaborador_origem_nome}</td>
                  <td>{t.colaborador_destino_nome}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => navegar("analise-troca", t.id)}>
                      Analisar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty">
                  Nenhuma solicitação pendente no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {resolvidas.length > 0 && (
        <div className="card">
          <h3>Histórico</h3>
          <table>
            <thead>
              <tr>
                <th>Data do plantão</th>
                <th>Colaborador</th>
                <th>Novo colaborador</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resolvidas.map((t) => (
                <tr key={t.id}>
                  <td>{fmtBR(t.plantao_data)}</td>
                  <td>{t.colaborador_origem_nome}</td>
                  <td>{t.colaborador_destino_nome}</td>
                  <td>
                    <span className={pillClasse(statusTexto(t.status))}>{statusTexto(t.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
