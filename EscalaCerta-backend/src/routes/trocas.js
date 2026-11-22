import { Router } from "express";
import { db } from "../db.js";
import { autenticar, exigirPerfil } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { notificar } from "../utils/notificar.js";
import { exigirId, fmtBR, textoOpcional } from "../utils/validators.js";

const router = Router();
router.use(autenticar);

const buscarPlantao = db.prepare("SELECT * FROM plantoes WHERE id = ?");
const buscarColab = db.prepare("SELECT id, nome FROM colaboradores WHERE id = ?");
const jaEscalado = db.prepare(
  "SELECT 1 FROM plantoes WHERE colaborador_id = ? AND data = ? AND turno = ?"
);
const trocaPendente = db.prepare(
  "SELECT 1 FROM trocas WHERE plantao_origem_id = ? AND status = 'PENDENTE'"
);
const inserirTroca = db.prepare(`
  INSERT INTO trocas (plantao_origem_id, colaborador_origem_id, colaborador_destino_id, motivo)
  VALUES (?, ?, ?, ?)`);
const buscarTroca = db.prepare("SELECT * FROM trocas WHERE id = ?");
const reatribuir = db.prepare("UPDATE plantoes SET colaborador_id = ? WHERE id = ?");
const decidir = db.prepare(
  "UPDATE trocas SET status = ?, decidido_em = datetime('now'), decidido_por = ? WHERE id = ?"
);

const conflitoDestino = () =>
  new HttpError(409, "Conflito de escala: o colega já está escalado neste turno nesta data.");

// POST /api/trocas — colaborador pede troca de um plantão SEU com um colega
router.post("/", (req, res) => {
  const b = req.body ?? {};
  const plantaoId = exigirId(b.plantao_origem_id, "plantao_origem_id");
  const destinoId = exigirId(b.colaborador_destino_id, "colaborador_destino_id");
  const motivo = textoOpcional(b.motivo, "motivo", 500);

  const plantao = buscarPlantao.get(plantaoId);
  if (!plantao) throw new HttpError(404, "Plantão não encontrado.");
  if (plantao.colaborador_id !== req.usuario.id) {
    throw new HttpError(403, "Você só pode solicitar a troca de plantões que são seus.");
  }
  if (destinoId === req.usuario.id) {
    throw new HttpError(400, "Escolha um colega diferente de você para a troca.");
  }
  if (!buscarColab.get(destinoId)) throw new HttpError(404, "Colega de destino não encontrado.");
  if (jaEscalado.get(destinoId, plantao.data, plantao.turno)) throw conflitoDestino();
  if (trocaPendente.get(plantaoId)) {
    throw new HttpError(409, "Já existe uma solicitação de troca pendente para este plantão.");
  }

  const criar = db.transaction(() => {
    const { lastInsertRowid } = inserirTroca.run(plantaoId, req.usuario.id, destinoId, motivo);
    notificar(
      destinoId,
      "TROCA_SOLICITADA",
      `${req.usuario.nome} solicitou trocar o plantão de ${fmtBR(plantao.data)} (${plantao.turno}) com você.`,
      Number(lastInsertRowid)
    );
    return Number(lastInsertRowid);
  });

  res.status(201).json(buscarTroca.get(criar()));
});

// PATCH /api/trocas/:id/status  (apenas Gestor) — { "status": "APROVADO" | "RECUSADO" }
router.patch("/:id/status", exigirPerfil("GESTOR"), (req, res) => {
  const id = exigirId(req.params.id, "id");
  const status = String(req.body?.status ?? "").toUpperCase();
  if (!["APROVADO", "RECUSADO"].includes(status)) {
    throw new HttpError(400, `"status" deve ser APROVADO ou RECUSADO.`);
  }

  const troca = buscarTroca.get(id);
  if (!troca) throw new HttpError(404, "Solicitação de troca não encontrada.");
  if (troca.status !== "PENDENTE") {
    throw new HttpError(409, `Esta solicitação já foi decidida (${troca.status}).`);
  }

  const aplicar = db.transaction(() => {
    if (status === "APROVADO") {
      const plantao = buscarPlantao.get(troca.plantao_origem_id);
      if (!plantao || plantao.colaborador_id !== troca.colaborador_origem_id) {
        throw new HttpError(409, "O plantão não pertence mais ao solicitante.");
      }
      if (jaEscalado.get(troca.colaborador_destino_id, plantao.data, plantao.turno)) {
        throw conflitoDestino();
      }
      reatribuir.run(troca.colaborador_destino_id, plantao.id); // reatribui a escala
    }

    decidir.run(status, req.usuario.id, id);

    const plantao = buscarPlantao.get(troca.plantao_origem_id);
    const resultado = status === "APROVADO" ? "aprovada" : "recusada";
    const msg = `A troca do plantão de ${fmtBR(plantao.data)} (${plantao.turno}) foi ${resultado} pelo gestor.`;
    notificar(troca.colaborador_origem_id, "TROCA_" + status, msg, id);
    notificar(troca.colaborador_destino_id, "TROCA_" + status, msg, id);
  });
  aplicar(); // se algo lançar erro dentro da transação, tudo é revertido

  res.json({
    troca: buscarTroca.get(id),
    plantao: buscarPlantao.get(troca.plantao_origem_id),
  });
});

// EXTRA — GET /api/trocas : gestor vê todas; colaborador vê as suas (como origem ou destino).
// Filtro opcional: ?status=PENDENTE
router.get("/", (req, res) => {
  const where = [];
  const params = {};
  if (req.usuario.perfil !== "GESTOR") {
    where.push("(t.colaborador_origem_id = @eu OR t.colaborador_destino_id = @eu)");
    params.eu = req.usuario.id;
  }
  if (req.query.status !== undefined) {
    const s = String(req.query.status).toUpperCase();
    if (!["PENDENTE", "APROVADO", "RECUSADO"].includes(s)) {
      throw new HttpError(400, "Filtro de status inválido.");
    }
    where.push("t.status = @status");
    params.status = s;
  }

  const sql = `
    SELECT t.id, t.status, t.motivo, t.criado_em, t.decidido_em,
           t.plantao_origem_id, p.data AS plantao_data, p.turno AS plantao_turno,
           t.colaborador_origem_id,  co.nome AS colaborador_origem_nome,
           t.colaborador_destino_id, cd.nome AS colaborador_destino_nome
    FROM trocas t
    JOIN plantoes p       ON p.id  = t.plantao_origem_id
    JOIN colaboradores co ON co.id = t.colaborador_origem_id
    JOIN colaboradores cd ON cd.id = t.colaborador_destino_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY t.id DESC`;
  res.json(db.prepare(sql).all(params));
});

export default router;
