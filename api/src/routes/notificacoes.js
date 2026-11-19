import { Router } from "express";
import { db } from "../db.js";
import { autenticar } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { exigirId } from "../utils/validators.js";

const router = Router();
router.use(autenticar);

// EXTRA — GET /api/notificacoes : notificações do usuário logado (?nao_lidas=true)
router.get("/", (req, res) => {
  const soNaoLidas = req.query.nao_lidas === "true";
  const linhas = db
    .prepare(
      `SELECT id, tipo, mensagem, referencia_id, lida, criado_em
       FROM notificacoes WHERE colaborador_id = ? ${soNaoLidas ? "AND lida = 0" : ""}
       ORDER BY id DESC`
    )
    .all(req.usuario.id);
  res.json(linhas.map((n) => ({ ...n, lida: Boolean(n.lida) })));
});

// EXTRA — PATCH /api/notificacoes/:id/lida : marca como lida
router.patch("/:id/lida", (req, res) => {
  const id = exigirId(req.params.id, "id");
  const r = db
    .prepare("UPDATE notificacoes SET lida = 1 WHERE id = ? AND colaborador_id = ?")
    .run(id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, "Notificação não encontrada.");
  res.json({ id, lida: true });
});

export default router;
