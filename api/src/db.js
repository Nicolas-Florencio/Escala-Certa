import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

if (config.dbPath !== ":memory:") {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

export const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS colaboradores (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    funcao      TEXT NOT NULL,
    perfil      TEXT NOT NULL DEFAULT 'COLABORADOR' CHECK (perfil IN ('GESTOR', 'COLABORADOR')),
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Plantões da escala. A UNIQUE impede o mesmo colaborador no mesmo turno/dia (409).
  CREATE TABLE IF NOT EXISTS plantoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id),
    data            TEXT NOT NULL,
    turno           TEXT NOT NULL,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (colaborador_id, data, turno)
  );
  CREATE INDEX IF NOT EXISTS idx_plantoes_data ON plantoes(data);

  CREATE TABLE IF NOT EXISTS trocas (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    plantao_origem_id       INTEGER NOT NULL REFERENCES plantoes(id),
    colaborador_origem_id   INTEGER NOT NULL REFERENCES colaboradores(id),
    colaborador_destino_id  INTEGER NOT NULL REFERENCES colaboradores(id),
    motivo                  TEXT,
    status                  TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO')),
    criado_em               TEXT NOT NULL DEFAULT (datetime('now')),
    decidido_em             TEXT,
    decidido_por            INTEGER REFERENCES colaboradores(id)
  );

  CREATE TABLE IF NOT EXISTS folgas (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id),
    data            TEXT NOT NULL,
    motivo          TEXT,
    status          TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO')),
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    decidido_em     TEXT,
    decidido_por    INTEGER REFERENCES colaboradores(id)
  );

  CREATE TABLE IF NOT EXISTS notificacoes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    colaborador_id  INTEGER NOT NULL REFERENCES colaboradores(id),
    tipo            TEXT NOT NULL,
    mensagem        TEXT NOT NULL,
    referencia_id   INTEGER,
    lida            INTEGER NOT NULL DEFAULT 0,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_notificacoes_colab ON notificacoes(colaborador_id, lida);
`);
