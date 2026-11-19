import { db } from "../db.js";

const inserir = db.prepare(
  "INSERT INTO notificacoes (colaborador_id, tipo, mensagem, referencia_id) VALUES (?, ?, ?, ?)"
);

// Grava uma notificação para o colaborador (consultada em GET /api/notificacoes)
export function notificar(colaboradorId, tipo, mensagem, referenciaId = null) {
  inserir.run(colaboradorId, tipo, mensagem, referenciaId);
}
