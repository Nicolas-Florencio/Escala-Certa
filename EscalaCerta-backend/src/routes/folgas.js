import { Router } from "express";
import { db } from "../db.js";
import { autenticar, exigirPerfil } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { notificar } from "../utils/notificar.js";
import { exigirData, exigirId, fmtBR, textoOpcional } from "../utils/validators.js";

const router = Router();
router.use(autenticar);

const duplicada = db.prepare(
  "SELECT 1 FROM folgas WHERE colaborador_id = ? AND data = ? AND status IN ('PENDENTE', 'APROVADO')"
);
const inserir = db.prepare("INSERT INTO folgas (colaborador_id, data, motivo) VALUES (?, ?, ?)");
const buscar = db.prepare("SELECT * FROM folgas WHERE id = ?");

// POST /api/folgas — solicita folga (fica PENDENTE no painel do gestor)
router.post("/", (req, res) => {
  const b = req.body ?? {};
  const data = exigirData(b.data);
  const motivo = textoOpcional(b.motivo, "motivo", 255);

  if (duplicada.get(req.usuario.id, data)) {
    throw new HttpError(409, "Você já possui uma folga pendente ou aprovada para esta data.");
  }
  const { lastInsertRowid } = inserir.run(req.usuario.id, data, motivo);
  res.status(201).json(buscar.get(lastInsertRowid));
});

// EXTRA — GET /api/folgas : painel do gestor (todas) ou minhas folgas. Filtro: ?status=PENDENTE
router.get("/", (req, res) => {
  const where = [];
  const params = {};
  if (req.usuario.perfil !== "GESTOR") {
    where.push("f.colaborador_id = @eu");
    params.eu = req.usuario.id;
  }
  if (req.query.status !== undefined) {
    const s = String(req.query.status).toUpperCase();
    if (!["PENDENTE", "APROVADO", "RECUSADO"].includes(s)) {
      throw new HttpError(400, "Filtro de status inválido.");
    }
    where.push("f.status = @status");
    params.status = s;
  }

  const sql = `
    SELECT f.id, f.data, f.motivo, f.status, f.criado_em, f.decidido_em,
           f.colaborador_id, c.nome AS colaborador_nome
    FROM folgas f JOIN colaboradores c ON c.id = f.colaborador_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY f.data, f.id`;
  res.json(db.prepare(sql).all(params));
});

// EXTRA — PATCH /api/folgas/:id/status (apenas Gestor) — { "status": "APROVADO" | "RECUSADO" }
router.patch("/:id/status", exigirPerfil("GESTOR"), (req, res) => {
  const id = exigirId(req.params.id, "id");
  const status = String(req.body?.status ?? "").toUpperCase();
  if (!["APROVADO", "RECUSADO"].includes(status)) {
    throw new HttpError(400, `"status" deve ser APROVADO ou RECUSADO.`);
  }

  const folga = buscar.get(id);
  if (!folga) throw new HttpError(404, "Solicitação de folga não encontrada.");
  if (folga.status !== "PENDENTE") {
    throw new HttpError(409, `Esta solicitação já foi decidida (${folga.status}).`);
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE folgas SET status = ?, decidido_em = datetime('now'), decidido_por = ? WHERE id = ?"
    ).run(status, req.usuario.id, id);
    notificar(
      folga.colaborador_id,
      "FOLGA_" + status,
      `Sua folga de ${fmtBR(folga.data)} foi ${status === "APROVADO" ? "aprovada" : "recusada"}.`,
      id
    );
  })();

  res.json(buscar.get(id));
});

export default router;
