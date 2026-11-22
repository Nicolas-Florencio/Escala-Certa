import { useState } from "react";
import { CircleAlert } from "lucide-react";
import { fmtBR, diaSemanaExtenso } from "../utils/helpers";

// Data de hoje no formato "AAAA-MM-DD"
function isoDeHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NovaTroca({ session, db, plantaoInicialId, onSolicitar, navegar }) {
  const hoje = isoDeHoje();
  // Plantões que já têm troca pendente não podem ser solicitados de novo (a API devolveria 409)
  const comTrocaPendente = new Set(
    db.trocas.filter((t) => t.status === "PENDENTE").map((t) => t.plantao_origem_id)
  );
  // Qualquer plantão do colaborador (qualquer dia da semana/turno), dos próximos para os passados
  const meusPlantoes = db.plantoes
    .filter((p) => p.colaborador_id === session.id && !comTrocaPendente.has(p.id))
    .sort((a, b) => {
      const fa = a.data >= hoje;
      const fb = b.data >= hoje;
      if (fa !== fb) return fa ? -1 : 1;
      return fa ? a.data.localeCompare(b.data) : b.data.localeCompare(a.data);
    });
  const outros = db.colaboradores.filter((c) => c.id !== session.id);

  const [plantaoId, setPlantaoId] = useState(() => {
    const inicial = meusPlantoes.find((p) => p.id === plantaoInicialId);
    return inicial?.id || meusPlantoes[0]?.id || "";
  });
  const [colabDestinoId, setColabDestinoId] = useState(outros[0]?.id || "");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!meusPlantoes.length) {
    return (
      <>
        <div className="page-title">Solicitação de troca</div>
        <div className="card center-card empty">Você não possui plantões disponíveis para solicitar troca.</div>
      </>
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await onSolicitar(Number(plantaoId), Number(colabDestinoId), motivo.trim());
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-title">Solicitação de troca</div>
      <div className="page-sub">Meu plantão</div>

      <div className="card center-card">
        {erro && (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <div>{erro}</div>
          </div>
        )}
        <form onSubmit={enviar}>
          <label>Dia</label>
          <select value={plantaoId} onChange={(e) => setPlantaoId(e.target.value)}>
            {meusPlantoes.map((p) => (
              <option key={p.id} value={p.id}>
                {fmtBR(p.data)} — {diaSemanaExtenso(p.data)} ({p.turno})
              </option>
            ))}
          </select>

          <label>Trocar para</label>
          <select value={colabDestinoId} onChange={(e) => setColabDestinoId(e.target.value)}>
            {outros.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <label>Motivo</label>
          <textarea
            placeholder="Descreva o motivo da troca…"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navegar("solicitacoes")}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? "Enviando…" : "Solicitar troca"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
