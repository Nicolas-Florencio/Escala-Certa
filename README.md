# EscalaCerta - MVP 📅

**EscalaCerta** é um sistema projetado para facilitar a organização de escalas de plantão e folgas para equipes, eliminando o uso de planilhas e grupos de mensagens.

Projeto desenvolvido para a disciplina de **Laboratório de Desenvolvimento Multiplataforma**.
**Equipe:** Luan Thomazini Marques de Oliveira, Nicolas Florencio Alves, Emanuel Araujo de Oliveira.

---

## 🚀 Funcionalidades do MVP
A API suporta as operações essenciais do MVP, incluindo autenticação, gestão de escalas pelo gestor (Web) e solicitações via aplicativo (Mobile).

---

## 🎨 Protótipo da Interface

As interfaces do sistema **EscalaCerta** foram prototipadas no Figma, contemplando as principais telas previstas para o MVP nas versões Web e Mobile.
Figma: https://www.figma.com/design/u4gELnXDHcFvwlTcvXYGtr/Gest%C3%A3o-de-Plant%C3%B5es?m=auto&t=KC6SxUlVKbT4KCcf-1

---
## 📡 Principais Endpoints e Resultados Esperados

### 1. Autenticação e Cadastro
- **`POST /api/auth/login`**
  - **Objetivo:** Autenticar usuários (Gestores e Colaboradores).
  - **Payload:** `{ "email": "usuario@email.com", "senha": "password123" }`
  - **Resultado Esperado (200 OK):** Retorna o Token JWT e dados básicos do usuário.

- **`POST /api/colaboradores`**
  - **Objetivo:** Cadastrar um novo colaborador e sua função.
  - **Payload:** `{ "nome": "João", "email": "joao@email.com", "funcao": "Enfermeiro", "senha": "..." }`
  - **Resultado Esperado (201 Created):** Retorna o ID do novo colaborador. Senha armazenada com criptografia.

### 2. Gestão de Escalas
- **`POST /api/escalas`**
  - **Objetivo:** Criar um plantão na escala (Acesso: Gestor).
  - **Payload:** `{ "colaborador_id": 3, "data": "2026-09-10", "turno": "Noturno" }`
  - **Resultado Esperado:** 
    - `201 Created`: Plantão salvo com sucesso.
    - `409 Conflict`: Erro retornado se houver conflito de horário (colaborador já escalado no mesmo turno).

- **`GET /api/escalas/me`**
  - **Objetivo:** Retornar a escala do colaborador autenticado.
  - **Resultado Esperado (200 OK):** Lista de plantões e folgas do usuário logado.

### 3. Trocas e Folgas
- **`POST /api/trocas`**
  - **Objetivo:** Solicitar a troca de um plantão com outro colega.
  - **Payload:** `{ "plantao_origem_id": 15, "colaborador_destino_id": 8 }`
  - **Resultado Esperado (201 Created):** Solicitação registrada com status `PENDENTE`. Dispara notificação para o colega envolvido.

- **`PATCH /api/trocas/{id}/status`**
  - **Objetivo:** Gestor aprova ou recusa a solicitação de troca.
  - **Payload:** `{ "status": "APROVADO" }`
  - **Resultado Esperado (200 OK):** Status atualizado e escala reatribuída no banco de dados.

- **`POST /api/folgas`**
  - **Objetivo:** Solicitar uma folga em data específica.
  - **Payload:** `{ "data": "2026-09-15", "motivo": "Assunto Pessoal" }`
  - **Resultado Esperado (201 Created):** Solicitação de folga enviada para o painel do gestor.

---
*Documentação gerada com base no Backlog Inicial do Projeto (v1).*
