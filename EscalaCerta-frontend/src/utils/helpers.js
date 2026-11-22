// Funções auxiliares usadas em várias telas do EscalaCerta

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Converte "2026-09-06" em "06/09/2026"
export function fmtBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Retorna o nome do dia da semana de uma data no formato "AAAA-MM-DD"
export function diaSemanaExtenso(iso) {
  const d = new Date(iso + "T12:00:00");
  return DIAS_SEMANA[d.getDay()];
}

// Escolhe a cor da "pill" de status (verde = aprovado, amarelo = pendente, vermelho = rejeitado)
export function pillClasse(status) {
  if (status === "Pendente" || status === "Solicitada") return "pill pill-warn";
  if (status === "Aprovada") return "pill pill-ok";
  return "pill pill-danger";
}
