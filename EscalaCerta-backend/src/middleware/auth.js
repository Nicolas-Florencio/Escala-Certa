import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { db } from "../db.js";
import { HttpError } from "../utils/errors.js";

const buscarUsuario = db.prepare(
  "SELECT id, nome, email, funcao, perfil FROM colaboradores WHERE id = ?"
);

// Exige "Authorization: Bearer <token>" e popula req.usuario
export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    throw new HttpError(401, "Token de autenticação não informado.");
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new HttpError(401, "Token inválido ou expirado.");
  }

  // Confere no banco: reflete mudança de perfil e usuário removido
  const usuario = buscarUsuario.get(Number(payload.sub));
  if (!usuario) throw new HttpError(401, "Usuário do token não existe mais.");

  req.usuario = usuario;
  next();
}

// Restringe a rota a determinados perfis. Ex.: exigirPerfil("GESTOR")
export const exigirPerfil =
  (...perfis) =>
  (req, res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      throw new HttpError(403, "Acesso negado: perfil sem permissão para esta operação.");
    }
    next();
  };