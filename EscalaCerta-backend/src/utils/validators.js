import { HttpError } from "./errors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Aceita "2026-09-10" e rejeita datas inexistentes como "2026-02-31"
export function dataValida(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function exigirData(valor, campo = "data") {
  if (!dataValida(valor)) {
    throw new HttpError(400, `"${campo}" inválida. Use o formato AAAA-MM-DD.`);
  }
  return valor;
}

// Converte número ou string numérica em inteiro positivo; senão lança 400
export function exigirId(valor, campo) {
  const n = typeof valor === "string" && /^\d+$/.test(valor) ? Number(valor) : valor;
  if (typeof n !== "number" || !Number.isSafeInteger(n) || n < 1) {
    throw new HttpError(400, `"${campo}" deve ser um número inteiro positivo.`);
  }
  return n;
}

export function exigirTexto(valor, campo, { min = 1, max = 100 } = {}) {
  if (typeof valor !== "string") throw new HttpError(400, `"${campo}" é obrigatório.`);
  const t = valor.trim();
  if (t.length < min || t.length > max) {
    throw new HttpError(400, `"${campo}" deve ter entre ${min} e ${max} caracteres.`);
  }
  return t;
}

// Texto opcional: devolve null se ausente/vazio
export function textoOpcional(valor, campo, max = 255) {
  if (valor === undefined || valor === null || valor === "") return null;
  if (typeof valor !== "string") throw new HttpError(400, `"${campo}" deve ser texto.`);
  const t = valor.trim();
  if (t.length > max) throw new HttpError(400, `"${campo}" deve ter no máximo ${max} caracteres.`);
  return t || null;
}

export function exigirEmail(valor) {
  const e = exigirTexto(valor, "email", { min: 3, max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(e)) throw new HttpError(400, `"email" inválido.`);
  return e;
}

export function fmtBR(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
