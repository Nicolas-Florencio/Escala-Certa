import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { fmtBR, diaSemanaExtenso } from "../utils/helpers";

export default function AnaliseTroca({ db, id, onAprovar, onRejeitar }) {
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const t = db.trocas.find((x) => x.id === id);
  if (!t) {
    return (
      <>
        <div className="page-title">Análise de troca</div>
        <div className="card empty">Solicitação não encontrada.</div>
      </>
    );
  }

  async function agir(acao) {
    setErro("");
    setEnviando(true);
    try {
      await acao(t.id);
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-title">Análise de trocas</div>
      <div className="card center-card">
        <h3 style={{ marginBottom: 18 }}>Solicitação de Troca</h3>
        {erro && (
          <div className="banner banner-error" style={{ marginBottom: 16 }}>
            <CircleAlert size={16} />
            <div>{erro}</div>
          </div>
        )}
        <div className="kv">
          <div className="k">Colaborador atual</div>
          <div className="v">{t.colaborador_origem_nome}</div>
        </div>
        <div className="kv">
          <div className="k">Plantão</div>
          <div className="v">
            {fmtBR(t.plantao_data)} — {diaSemanaExtenso(t.plantao_data)} ({t.plantao_turno})
          </div>
        </div>
        <div className="kv">
          <div className="k">Solicitado para</div>
          <div className="v">{t.colaborador_destino_nome}</div>
        </div>
        <div className="kv">
          <div className="k">Motivo</div>
          <div className="v" style={{ fontWeight: 400 }}>
            "{t.motivo || "Sem motivo informado."}"
          </div>
        </div>
        <div className="divider" />
        <div className="form-actions">
          <button className="btn btn-danger" disabled={enviando} onClick={() => agir(onRejeitar)}>
            Rejeitar
          </button>
          <button className="btn btn-primary" disabled={enviando} onClick={() => agir(onAprovar)}>
            Aprovar
          </button>
        </div>
      </div>
    </>
  );
}
