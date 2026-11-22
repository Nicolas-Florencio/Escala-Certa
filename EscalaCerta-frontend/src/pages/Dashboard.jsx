import { CalendarDays, ArrowLeftRight, Coffee } from "lucide-react";
import { fmtBR, diaSemanaExtenso } from "../utils/helpers";

// Data de hoje no formato "AAAA-MM-DD"
function isoDeHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Dashboard({ session, db }) {
  const isGestor = session.role === "gestor";
  const hoje = isoDeHoje();

  const plantoesVisiveis = isGestor
    ? db.plantoes
    : db.plantoes.filter((p) => p.colaborador_id === session.id);
  const trocasVisiveis = isGestor
    ? db.trocas
    : db.trocas.filter((t) => t.colaborador_origem_id === session.id);
  // A API não modela um "saldo de folgas"; aqui mostramos as solicitações pendentes.
  const folgasVisiveis = isGestor ? db.folgas : db.folgas.filter((f) => f.colaborador_id === session.id);
  const folgasPendentes = folgasVisiveis.filter((f) => f.status === "PENDENTE").length;

  const totalPlantoes = plantoesVisiveis.length;
  const trocasPendentes = trocasVisiveis.filter((t) => t.status === "PENDENTE").length;

  const proximos = plantoesVisiveis
    .filter((p) => p.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);

  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">
        {isGestor ? "Visão geral da escala e das solicitações da equipe." : `Bem-vindo(a), ${session.nome}.`}
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-icon blue">
            <CalendarDays size={18} />
          </div>
          <div>
            <div className="num">{totalPlantoes}</div>
            <div className="lbl">Plantões cadastrados</div>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon amber">
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <div className="num">{trocasPendentes}</div>
            <div className="lbl">Solicitações de troca pendentes</div>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon green">
            <Coffee size={18} />
          </div>
          <div>
            <div className="num">{folgasPendentes}</div>
            <div className="lbl">Folgas pendentes{isGestor ? " (equipe)" : ""}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Próximos plantões</h3>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Colaborador</th>
            </tr>
          </thead>
          <tbody>
            {proximos.length ? (
              proximos.map((p) => (
                <tr key={p.id}>
                  <td>
                    {fmtBR(p.data)} — {diaSemanaExtenso(p.data)}
                  </td>
                  <td>{p.colaborador_nome}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="empty">
                  Nenhum plantão cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
