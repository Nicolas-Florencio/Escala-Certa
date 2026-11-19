# EscalaCerta — API (Node.js + Express)

Back-end do EscalaCerta: autenticação JWT, escalas/plantões, trocas e folgas.
Banco **SQLite** (arquivo local, sem instalar nada), senhas com **bcrypt**.

## Como rodar

```bash
npm install
cp .env.example .env      # defina JWT_SECRET no .env
npm run seed              # (opcional) usuários e plantões de demonstração
npm run dev               # http://localhost:3000
npm test                  # testes automatizados
```

Login de demonstração (após o seed), senha `123456`:
`gestor@plantoes.com` (Gestor) · `nicolas@plantoes.com`, `emanuel@plantoes.com`, `luan@plantoes.com`, `davi@plantoes.com`, `arthur@plantoes.com` (Colaboradores).

Rotas protegidas exigem o header `Authorization: Bearer <token>`.
Erros seguem sempre o formato `{ "erro": "mensagem" }`.

## Endpoints pedidos

| Método | Rota | Acesso | Sucesso | Erros |
|---|---|---|---|---|
| POST | `/api/auth/login` | público | 200 `{ token, usuario }` | 400, 401 |
| POST | `/api/colaboradores` | Gestor | 201 `{ id, nome, email, funcao, perfil }` | 400, 401, 403, 409 (e-mail já existe) |
| POST | `/api/escalas` | Gestor | 201 plantão criado | 400, 403, 404, **409 (já escalado no turno)** |
| GET | `/api/escalas/me` | logado | 200 `{ plantoes: [], folgas: [] }` | 401 |
| POST | `/api/trocas` | logado | 201 troca `PENDENTE` + notificação ao colega | 400, 403, 404, 409 |
| PATCH | `/api/trocas/:id/status` | Gestor | 200 `{ troca, plantao }` | 400, 403, 404, 409 |
| POST | `/api/folgas` | logado | 201 folga `PENDENTE` | 400, 409 |

### Exemplos

```bash
# Login
curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"gestor@plantoes.com","senha":"123456"}'

# Criar plantão (Gestor)
curl -X POST localhost:3000/api/escalas -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"colaborador_id":3,"data":"2026-09-10","turno":"Noturno"}'

# Aprovar troca (Gestor)
curl -X PATCH localhost:3000/api/trocas/1/status -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"APROVADO"}'
```

`GET /api/escalas/me` aceita `?de=AAAA-MM-DD&ate=AAAA-MM-DD`.

## Regras de negócio implementadas

- **Conflito de escala (409):** o mesmo colaborador não pode ter dois plantões na mesma data e turno (garantido por `UNIQUE` no banco). Turnos aceitos: `Manhã`, `Tarde`, `Noturno` (edite em `src/config.js`).
- **Troca:** só o dono do plantão pode solicitá-lo; o colega de destino precisa existir, ser outra pessoa e não estar escalado no mesmo dia/turno; não pode haver duas trocas pendentes para o mesmo plantão.
- **Aprovação de troca:** o gestor envia `APROVADO` ou `RECUSADO`. Ao aprovar, o plantão é reatribuído ao colega **dentro de uma transação** (revalida o conflito no momento da aprovação; se falhar, nada é alterado). Uma troca só pode ser decidida uma vez (409 depois disso).
- **Notificações:** gravadas na tabela `notificacoes` ao solicitar a troca (colega de destino) e ao decidir troca/folga.
- **Cadastro de colaborador:** exige token de Gestor (não existe cadastro público, para ninguém se autopromover). O campo opcional `perfil` (`GESTOR` | `COLABORADOR`, padrão `COLABORADOR`) permite criar outros gestores. O primeiro gestor vem do `npm run seed`.
- **Segurança:** bcrypt (custo 10), JWT HS256 com expiração (`JWT_EXPIRES_IN`), perfil relido do banco a cada requisição, rate limit no login, `helmet`, CORS restrito (`CORS_ORIGIN`), mensagem única "Credenciais inválidas".

## Endpoints extras (não estavam na lista — o front precisa deles)

Podem ser removidos sem afetar os demais.

| Método | Rota | Para quê |
|---|---|---|
| GET | `/api/colaboradores` | Listar a equipe (tela Colaboradores / escolher colega na troca) |
| GET | `/api/escalas` | Escala da equipe para o calendário (`?de`, `?ate`, `?colaborador_id`) |
| GET | `/api/trocas` | Gestor vê todas; colaborador vê as suas (`?status=PENDENTE`) |
| GET | `/api/folgas` | Painel do gestor / minhas folgas (`?status=PENDENTE`) |
| PATCH | `/api/folgas/:id/status` | Gestor aprova/recusa folga (`APROVADO` / `RECUSADO`) |
| GET | `/api/notificacoes` | Notificações do usuário (`?nao_lidas=true`) |
| PATCH | `/api/notificacoes/:id/lida` | Marcar como lida |

## Estrutura

```
src/
├── server.js / app.js     # inicialização e montagem do Express
├── config.js / db.js      # variáveis de ambiente e schema SQLite
├── seed.js                # dados de demonstração
├── middleware/auth.js     # autenticar (JWT) e exigirPerfil
├── routes/                # auth, colaboradores, escalas, trocas, folgas, notificacoes
└── utils/                 # validações, erros, notificações
test/api.test.js           # testes de ponta a ponta (node:test)
```
