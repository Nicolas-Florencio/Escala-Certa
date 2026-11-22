import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { DIAS_SEMANA, MESES } from "../utils/helpers";

// Data de hoje no formato "AAAA-MM-DD", pra marcar o dia atual no calendário
function isoDeHoje() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Escala({ session, db, calYear, calMonth, setCalYear, setCalMonth, navegar }) {
  const isGestor = session.role === "gestor";
  const hoje = isoDeHoje();

  const first = new Date(calYear, calMonth, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  // Junta plantões e folgas marcadas em cada data.
  // O gestor vê a escala inteira; o colaborador vê só os plantões e folgas dele.
  const plantoesVisiveis = isGestor ? db.plantoes : db.plantoes.filter((p) => p.colaborador_id === session.id);
  const folgasVisiveis = isGestor ? db.folgas : db.folgas.filter((f) => f.colaborador_id === session.id);

  const cellsByDate = {};
  plantoesVisiveis.forEach((p) => {
    const texto = isGestor ? `${p.colaborador_nome} — ${p.turno}` : `Meu plantão (${p.turno})`;
    // colaborador pode clicar no próprio plantão (qualquer dia) para pedir troca
    (cellsByDate[p.data] = cellsByDate[p.data] || []).push({ tipo: "plantao", texto, plantaoId: isGestor ? null : p.id });
  });
  folgasVisiveis
    .filter((f) => f.status !== "RECUSADO")
    .forEach((f) => {
      const texto = isGestor ? `${f.colaborador_nome} — Folga` : "Minha folga";
      (cellsByDate[f.data] = cellsByDate[f.data] || []).push({ tipo: "folga", texto });
    });

  const celulas = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    celulas.push({ muted: true, num: daysInPrevMonth - i, itens: [] });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    celulas.push({ muted: false, num: d, iso, itens: cellsByDate[iso] || [] });
  }
  const totalCells = startWeekday + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    celulas.push({ muted: true, num: i, itens: [] });
  }

  function mesAnterior() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  }
  function proximoMes() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  }

  return (
    <>
      <div className="top-row">
        <div>
          <div className="page-title">{isGestor ? "Gestão de escala" : "Minha escala"}</div>
          <div className="page-sub">
            {isGestor ? "Visualize e acompanhe os plantões do mês." : "Seus plantões e folgas marcados no mês."}
          </div>
        </div>
        {isGestor && (
          <button className="btn btn-primary" onClick={() => navegar("criar-plantao")}>
            <CalendarPlus size={16} />
            Criar plantão
          </button>
        )}
      </div>

      <div className="cal-head">
        <h2>
          {MESES[calMonth]} {calYear}
        </h2>
        <div className="cal-nav">
          <button className="icon-btn" onClick={mesAnterior} aria-label="Mês anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="icon-btn" onClick={proximoMes} aria-label="Próximo mês">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="cal-grid">
        {DIAS_SEMANA.map((d) => (
          <div className="cal-dow" key={d}>
            {d}
          </div>
        ))}
        {celulas.map((c, i) => (
          <div className={`cal-cell${c.muted ? " muted" : ""}`} key={i}>
            <div className={`daynum${c.iso === hoje ? " today" : ""}`}>{c.num}</div>
            {c.itens.map((it, j) => (
              <span
                className={`cal-tag ${it.tipo}`}
                key={j}
                onClick={it.plantaoId ? () => navegar("nova-troca", it.plantaoId) : undefined}
                style={it.plantaoId ? { cursor: "pointer" } : undefined}
                title={it.plantaoId ? "Clique para solicitar troca deste plantão" : undefined}
              >
                {it.texto}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
