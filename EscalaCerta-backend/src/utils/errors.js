export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Middleware final: converte erros em respostas JSON { erro: "..." }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ erro: "Corpo da requisição muito grande." });
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor." });
}

export function notFound(req, res) {
  res.status(404).json({ erro: "Rota não encontrada." });
}
