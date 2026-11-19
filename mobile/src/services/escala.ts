import { apiRequest } from './api';

export type Plantao = {
  id: number;
  data: string;
  turno: 'Manhã' | 'Tarde' | 'Noturno';
};

export type Folga = {
  id: number;
  data: string;
  motivo?: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
};

export type MinhaEscalaResponse = {
  plantoes: Plantao[];
  folgas: Folga[];
};

// Busca a escala do colaborador autenticado
export async function buscarMinhaEscala(): Promise<MinhaEscalaResponse> {
  return apiRequest('/escalas/me');
}