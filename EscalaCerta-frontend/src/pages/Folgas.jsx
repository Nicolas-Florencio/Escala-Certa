import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { fmtBR, pillClasse } from "../utils/helpers";

// Traduz o status da API (PENDENTE/APROVADO/RECUSADO) para o texto exibido na tela
function statusTexto(status) {
  if (status === "APROVADO") return "Aprovada";
  if (status === "RECUSADO") return "Recusada";
  return "Pendente";
}

export default function Folgas({ session, db, onSolicitarFolga, onAprovarFolga }) {
  const isGestor = session.role === "gestor";
  const [dataDesejada, setDataDesejada] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!isGestor) {
    const minhas = db.folgas.filter((f) => f.colaborador_id === session.id);

    async function enviar(e) {
      e.preventDefault();
      if (!dataDesejada) return;
      setErro("");
      setEnviando(true);
      try {
        await onSolicitarFolga(dataDesejada, motivo.trim());
        setDataDesejada("");
        setMotivo("");
      } catch (err) {
        setErro(err.message);
      } finally {
        setEnviando(false);
      }
    }

    return (
      <>
        <div className="page-title">Folgas</div>
        <div className="page-sub">Informar Folga</div>

        <div className="card center-card">
          {erro && (
            <div className="banner banner-error">
              <CircleAlert size={16} />
              <div>{erro}</div>
            </div>
          )}
          <form onSubmit={enviar}>
            <label>Data desejada para a folga</label>
            <input type="date" value={dataDesejada} onChange={(e) => setDataDesejada(e.target.value)} required />

            <label>Motivo</label>
            <textarea
              placeholder="Descreva o motivo da folga…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? "Enviando…" : "Solicitar Folga"}
              </button>
            </div>
          </form>
        </div>

        {minhas.length > 0 && (
          <div className="card">
            <h3>Minhas solicitações</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Motivo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {minhas.map((f) => (
                  <tr key={f.id}>
                    <td>{fmtBR(f.data)}</td>
                    <td>{f.motivo || "-"}</td>
                    <td>
                      <span className={pillClasse(statusTexto(f.status))}>{statusTexto(f.status)}</span>
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

  // visão do gestor: todas as folgas pendentes de aprovação
  const pendentes = db.folgas.filter((f) => f.status === "PENDENTE");

  async function aprovar(id) {
    setErro("");
    try {
      await onAprovarFolga(id);
    } catch (err) {
      setErro(err.message);
    }
  }

  return (
    <>
      <div className="page-title">Folgas</div>
      <div className="page-sub">Solicitações de folga da equipe.</div>
      {erro && (
        <div className="banner banner-error">
          <CircleAlert size={16} />
          <div>{erro}</div>
        </div>
      )}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Data desejada</th>
              <th>Motivo</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {pendentes.length ? (
              pendentes.map((f) => (
                <tr key={f.id}>
                  <td>{f.colaborador_nome}</td>
                  <td>{fmtBR(f.data)}</td>
                  <td>{f.motivo || "-"}</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => aprovar(f.id)}>
                      Aprovar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty">
                  Nenhuma solicitação de folga pendente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
