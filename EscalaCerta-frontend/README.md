# EscalaCerta

Aplicativo de gerenciamento de escala de plantões e folgas — projeto da disciplina
Laboratório de Desenvolvimento Multiplataforma (ISW038).

Agora consome a **API real** (Node/Express) em vez de dados mockados.

## Como rodar

```bash
npm install
cp .env.example .env    # ajuste VITE_API_URL se a API não estiver em localhost:3000
npm run dev
```

É preciso que o back-end (`EscalaCerta-backend`) esteja rodando (`npm run dev` +
`npm run seed` nele) antes de logar aqui.

## Login de demonstração

- Gestor: `gestor@plantoes.com` / senha `123456`
- Colaborador: `emanuel@plantoes.com` / senha `123456` (também: nicolas, luan, davi, arthur)

## Estrutura de pastas

```
EscalaCerta/
├── index.html
├── package.json
├── vite.config.js
├── .env.example         # VITE_API_URL
└── src/
    ├── main.jsx            # ponto de entrada do React
    ├── App.jsx             # componente principal: estado, chamadas à API e navegação
    ├── index.css           # estilos globais (cores, layout, calendário, formulários) — inalterado
    ├── services/
    │   └── api.js          # camada de acesso à API (fetch + token JWT)
    ├── utils/
    │   └── helpers.js      # funções auxiliares (formatar data, cor do status, etc.)
    ├── components/
    │   ├── Login.jsx
    │   ├── LoginVisual.jsx
    │   ├── RecuperarSenha.jsx
    │   └── Sidebar.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── Escala.jsx           # calendário de plantões
        ├── CriarPlantao.jsx
        ├── Colaboradores.jsx
        ├── Solicitacoes.jsx     # lista de trocas
        ├── NovaTroca.jsx        # colaborador pede troca
        ├── AnaliseTroca.jsx     # gestor aprova/rejeita troca
        ├── TrocaResultado.jsx
        └── Folgas.jsx
```

## Como o app funciona por dentro

- **`src/services/api.js`** centraliza as chamadas HTTP (base URL, header
  `Authorization: Bearer <token>`, parse de erros no formato `{ erro }`).
- **`App.jsx`** guarda a sessão (token + usuário) e o estado `db` (colaboradores,
  plantões, trocas, folgas), recarregado da API após o login e depois de cada
  ação (`criarPlantao`, `solicitarTroca`, `aprovarFolga` etc. agora são
  assíncronas e chamam a API antes de atualizar a tela).
- A navegação entre telas continua sem `react-router` — um estado `rota`
  trocado pela função `navegar()`.
- Os dados não persistem mais em memória local: a cada login/ação, o app busca
  o estado atual do back-end. Recarregar a página desloga (não há
  "lembrar sessão" ainda).

## Diferenças em relação à versão mockada

O modelo de dados do back-end é mais simples que o mock original em alguns pontos,
então estas telas mudaram além do mínimo de "trocar fetch por state":

- **Criar plantão:** o campo "Tipo" (Domingo/Feriado) virou "Turno"
  (Manhã/Tarde/Noturno), que é o que a API espera.
- **Colaboradores:** o formulário de cadastro ganhou os campos e-mail, função e
  senha, porque `POST /api/colaboradores` exige todos eles.
- **Folgas:** a API não modela um "saldo de folgas disponíveis" nem vincula a
  folga a um plantão específico — é só uma solicitação de data + motivo. A tela
  do colaborador foi simplificada para isso; o Dashboard mostra "folgas
  pendentes" no lugar de "folgas disponíveis".
- **Esqueci minha senha:** a API não tem endpoint de redefinição própria (não
  fazia parte do escopo pedido para o back-end); a tela avisa para falar com o
  gestor em vez de travar silenciosamente.
- Corrigido um nome de arquivo com erro de maiúscula/minúscula
  (`LoginVIsual.jsx` → `LoginVisual.jsx`) que impedia o build em sistemas de
  arquivos case-sensitive (Linux/CI).

Nenhum CSS foi alterado — todas as classes e o `index.css` são os mesmos do
projeto original.
