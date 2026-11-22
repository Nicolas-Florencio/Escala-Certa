// Popula o banco com dados de demonstração (os mesmos usuários do front-end).
// Uso: npm run seed   — é idempotente: pode rodar mais de uma vez.
import bcrypt from "bcryptjs";
import { db } from "./db.js";

if (process.env.NODE_ENV === "production") {
  console.error("Seed de demonstração bloqueado em produção (senhas fracas).");
  process.exit(1);
}

const SENHA_DEMO = "123456";
const hash = bcrypt.hashSync(SENHA_DEMO, 10);

const usuarios = [
  ["Gestor", "gestor@plantoes.com", "Gestor", "GESTOR"],
  ["Nicolas", "nicolas@plantoes.com", "Colaborador", "COLABORADOR"],
  ["Emanuel", "emanuel@plantoes.com", "Colaborador", "COLABORADOR"],
  ["Luan", "luan@plantoes.com", "Colaborador", "COLABORADOR"],
  ["Davi", "davi@plantoes.com", "Colaborador", "COLABORADOR"],
  ["Arthur", "arthur@plantoes.com", "Colaborador", "COLABORADOR"],
];

const inserirUsuario = db.prepare(
  "INSERT OR IGNORE INTO colaboradores (nome, email, senha_hash, funcao, perfil) VALUES (?, ?, ?, ?, ?)"
);
const idPorEmail = db.prepare("SELECT id FROM colaboradores WHERE email = ?");
const inserirPlantao = db.prepare(
  "INSERT OR IGNORE INTO plantoes (colaborador_id, data, turno) VALUES (?, ?, ?)"
);

db.transaction(() => {
  for (const [nome, email, funcao, perfil] of usuarios) {
    inserirUsuario.run(nome, email, hash, funcao, perfil);
  }
  const plantoes = [
    ["emanuel@plantoes.com", "2026-09-06", "Manhã"],
    ["emanuel@plantoes.com", "2026-09-13", "Manhã"],
    ["luan@plantoes.com", "2026-09-20", "Manhã"],
    ["davi@plantoes.com", "2026-09-27", "Manhã"],
  ];
  for (const [email, data, turno] of plantoes) {
    inserirPlantao.run(idPorEmail.get(email).id, data, turno);
  }
})();

console.log("Seed concluído. Login de demonstração (senha 123456):");
console.log("  Gestor:      gestor@plantoes.com");
console.log("  Colaborador: nicolas@plantoes.com (também emanuel, luan, davi, arthur)");
