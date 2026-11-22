import { fmtBR, diaSemanaExtenso } from "../utils/helpers";

export default function TrocaResultado({ db, id, navegar }) {
  const t = db.trocas.find((x) => x.id === id);
  const p = t ? db.plantoes.find((pl) => pl.id === t.plantao_origem_id) : null;

  return (
    <>
      <div className="page-title">Solicitações de trocas</div>
      <div className="card center-card">
        <div className="banner banner-ok" style={{ marginBottom: 20 }}>
          ✓ Solicitação aprovada
        </div>
        <p style={{ marginTop: 0 }}>O plantão foi atualizado.</p>
        {p && (
          <>
            <div className="kv">
              <div className="k">Data</div>
              <div className="v">
                {fmtBR(p.data)} — {diaSemanaExtenso(p.data)}
              </div>
            </div>
            <div className="kv">
              <div className="k">Novo responsável</div>
              <div className="v">{p.colaborador_nome}</div>
            </div>
          </>
        )}
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => navegar("escala")}>
            Voltar para Gestão de Escala
          </button>
        </div>
      </div>
    </>
  );
}
