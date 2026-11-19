import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { db } from "../db.js";
import { HttpError } from "../utils/errors.js";

const router = Router();

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.loginRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

// Hash falso: compara mesmo quando o e-mail não existe, para o tempo de
// resposta não revelar se o e-mail está cadastrado.
const HASH_FALSO = bcrypt.hashSync("senha-falsa", 10);

const buscarPorEmail = db.prepare("SELECT * FROM colaboradores WHERE email = ?");

// POST /api/auth/login
router.post("/login", limitarLogin, async (req, res) => {
  const { email, senha } = req.body ?? {};
  if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
    throw new HttpError(400, "Informe email e senha.");
  }

  const usuario = buscarPorEmail.get(email.trim().toLowerCase());
  const senhaOk = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FALSO);
  if (!usuario || !senhaOk) throw new HttpError(401, "Credenciais inválidas.");

  const token = jwt.sign({ perfil: usuario.perfil }, config.jwtSecret, {
    algorithm: "HS256",
    subject: String(usuario.id),
    expiresIn: config.jwtExpiresIn,
  });

  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      funcao: usuario.funcao,
      perfil: usuario.perfil,
    },
  });
});

export default router;
