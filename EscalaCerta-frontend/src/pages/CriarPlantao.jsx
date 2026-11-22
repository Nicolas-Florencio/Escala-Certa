import { useState } from "react";
import { CircleAlert } from "lucide-react";

// Turnos aceitos pela API (ver src/config.js do back-end).
const TURNOS = ["Manhã", "Tarde", "Noturno"];

// Data de hoje no formato "AAAA-MM-DD"
function isoDeHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CriarPlantao({ db, onCriar, navegar }) {
  const [data, setData] = useState(isoDeHoje());
  const [turno, setTurno] = useState(TURNOS[0]);
  const [colaboradorId, setColaboradorId] = useState(db.colaboradores[0]?.id || "");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!data || !colaboradorId) {
      setErro("Selecione a data e o colaborador.");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      await onCriar(data, turno, Number(colaboradorId));
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="page-title">Criar plantão</div>
      <div className="page-sub">Cadastre um novo plantão e defina o colaborador responsável.</div>

      <div className="card center-card">
        {erro && (
          <div className="banner banner-error">
            <CircleAlert size={16} />
            <div>{erro}</div>
          </div>
        )}
        <form onSubmit={enviar}>
          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />

          <label>Turno</label>
          <div className="radio-row">
            {TURNOS.map((t) => (
              <label key={t}>
                <input type="radio" name="turno" checked={turno === t} onChange={() => setTurno(t)} /> {t}
              </label>
            ))}
          </div>

          <label>Colaborador</label>
          <select value={colaboradorId} onChange={(e) => setColaboradorId(e.target.value)}>
            {db.colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button type="button" className="btn" onClick={() => navegar("escala")}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? "Criando…" : "Criar plantão"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
