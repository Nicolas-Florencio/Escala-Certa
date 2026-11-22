import { Router } from "express";
import { config } from "../config.js";
import { db } from "../db.js";
import { autenticar, exigirPerfil } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { exigirData, exigirId } from "../utils/validators.js";

const router = Router();
router.use(autenticar);

const colaboradorExiste = db.prepare("SELECT 1 FROM colaboradores WHERE id = ?");
const inserir = db.prepare("INSERT INTO plantoes (colaborador_id, data, turno) VALUES (?, ?, ?)");
const buscar = db.prepare("SELECT id, colaborador_id, data, turno FROM plantoes WHERE id = ?");

// POST /api/escalas  (apenas Gestor)
router.post("/", exigirPerfil("GESTOR"), (req, res) => {
  const b = req.body ?? {};
  const colaboradorId = exigirId(b.colaborador_id, "colaborador_id");
  const data = exigirData(b.data);
  if (!config.turnos.includes(b.turno)) {
    throw new HttpError(400, `"turno" inválido. Use um destes: ${config.turnos.join(", ")}.`);
  }
  if (!colaboradorExiste.get(colaboradorId)) throw new HttpError(404, "Colaborador não encontrado.");

  try {
    const { lastInsertRowid } = inserir.run(colaboradorId, data, b.turno);
    res.status(201).json(buscar.get(lastInsertRowid));
  } catch (err) {
    // A UNIQUE (colaborador_id, data, turno) garante o conflito mesmo em requisições simultâneas
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new HttpError(409, "Conflito de escala: o colaborador já está escalado neste turno nesta data.");
    }
    throw err;
  }
});

// GET /api/escalas/me  — plantões e folgas do usuário autenticado
// Filtros opcionais: ?de=AAAA-MM-DD&ate=AAAA-MM-DD
router.get("/me", (req, res) => {
  const { de, ate } = req.query;
  if (de !== undefined) exigirData(de, "de");
  if (ate !== undefined) exigirData(ate, "ate");

  const filtro = (campo) =>
    (de ? ` AND ${campo} >= @de` : "") + (ate ? ` AND ${campo} <= @ate` : "");
  const params = { id: req.usuario.id, ...(de && { de }), ...(ate && { ate }) };

  const plantoes = db
    .prepare(
      `SELECT id, data, turno FROM plantoes WHERE colaborador_id = @id${filtro("data")} ORDER BY data, turno`
    )
    .all(params);
  const folgas = db
    .prepare(
      `SELECT id, data, motivo, status FROM folgas WHERE colaborador_id = @id${filtro("data")} ORDER BY data`
    )
    .all(params);

  res.json({ plantoes, folgas });
});

// EXTRA — GET /api/escalas : escala da equipe (calendário). Filtros: ?de, ?ate, ?colaborador_id
router.get("/", (req, res) => {
  const { de, ate, colaborador_id } = req.query;
  const where = [];
  const params = {};
  if (de !== undefined) {
    where.push("p.data >= @de");
    params.de = exigirData(de, "de");
  }
  if (ate !== undefined) {
    where.push("p.data <= @ate");
    params.ate = exigirData(ate, "ate");
  }
  if (colaborador_id !== undefined) {
    where.push("p.colaborador_id = @colab");
    params.colab = exigirId(colaborador_id, "colaborador_id");
  }

  const sql = `
    SELECT p.id, p.data, p.turno, p.colaborador_id, c.nome AS colaborador_nome
    FROM plantoes p JOIN colaboradores c ON c.id = p.colaborador_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY p.data, p.turno, c.nome`;
  res.json(db.prepare(sql).all(params));
});

export default router;
