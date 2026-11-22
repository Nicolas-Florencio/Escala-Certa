import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { autenticar, exigirPerfil } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";
import { exigirEmail, exigirTexto } from "../utils/validators.js";

const router = Router();
router.use(autenticar);

const emailExiste = db.prepare("SELECT 1 FROM colaboradores WHERE email = ?");
const inserir = db.prepare(
  "INSERT INTO colaboradores (nome, email, senha_hash, funcao, perfil) VALUES (?, ?, ?, ?, ?)"
);

// POST /api/colaboradores  (apenas Gestor)
router.post("/", exigirPerfil("GESTOR"), async (req, res) => {
  const b = req.body ?? {};
  const nome = exigirTexto(b.nome, "nome", { min: 2, max: 100 });
  const email = exigirEmail(b.email);
  const funcao = exigirTexto(b.funcao, "funcao", { min: 2, max: 60 });
  const senha = exigirTexto(b.senha, "senha", { min: 6, max: 72 }); // bcrypt lê no máx. 72 bytes
  const perfil = b.perfil === undefined ? "COLABORADOR" : String(b.perfil).toUpperCase();
  if (!["GESTOR", "COLABORADOR"].includes(perfil)) {
    throw new HttpError(400, `"perfil" deve ser GESTOR ou COLABORADOR.`);
  }

  if (emailExiste.get(email)) throw new HttpError(409, "Já existe um colaborador com este e-mail.");

  const senhaHash = await bcrypt.hash(senha, 10);
  const { lastInsertRowid } = inserir.run(nome, email, senhaHash, funcao, perfil);

  res.status(201).json({ id: Number(lastInsertRowid), nome, email, funcao, perfil });
});

// EXTRA — GET /api/colaboradores : lista a equipe (a tela de Colaboradores e o
// seletor de colega na troca precisam disso). Só o gestor vê o e-mail.
router.get("/", (req, res) => {
  const gestor = req.usuario.perfil === "GESTOR";
  const cols = gestor ? "id, nome, email, funcao, perfil" : "id, nome, funcao, perfil";
  res.json(db.prepare(`SELECT ${cols} FROM colaboradores ORDER BY nome`).all());
});

export default router;
