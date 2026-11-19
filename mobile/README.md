# EscalaCerta Mobile 📱

Aplicativo mobile do projeto **EscalaCerta**, desenvolvido para facilitar o acompanhamento de plantões e solicitações dos colaboradores.

Esta aplicação representa a interface utilizada pelo **colaborador**, permitindo visualizar sua escala e realizar solicitações relacionadas aos plantões.

---

## 🎯 Objetivo

O aplicativo tem como objetivo oferecer ao colaborador uma forma simples e prática de acompanhar sua rotina de trabalho sem depender de planilhas ou grupos de mensagens.

---

## 🚀 Funcionalidades

### 🔐 Login
Permite que o colaborador acesse o sistema utilizando suas credenciais.

### 📅 Visualização de Plantões
O colaborador pode visualizar os plantões nos quais está escalado, incluindo informações como:

- Data do plantão
- Turno
- Situação do plantão

### 🔄 Solicitação de Troca
Permite solicitar a troca de um plantão com outro colaborador.

A solicitação fica pendente até ser analisada e aprovada pelo responsável pela gestão da escala.

### 🏖️ Solicitação de Folga
O colaborador pode solicitar uma folga para uma determinada data.

A solicitação também ficará disponível para análise do gestor.

---

## 🛠️ Tecnologias Utilizadas

- React Native
- Expo
- Expo Router
- TypeScript
- Figma

---

## 🎨 Identidade Visual

O projeto **EscalaCerta** utiliza uma identidade visual no estilo corporativo moderno, com foco em legibilidade, organização e consistência entre as versões Web e Mobile.

### Paleta de Cores

| Uso | Cor | Hexadecimal |
|---|---|---|
| Primária | Azul | `#2563EB` |
| Secundária | Azul escuro | `#1E40AF` |
| Fundo | Cinza muito claro | `#F8FAFC` |
| Cards | Branco | `#FFFFFF` |
| Texto principal | Azul muito escuro | `#0F172A` |
| Texto secundário | Cinza | `#64748B` |
| Sucesso | Verde | `#16A34A` |
| Aviso | Amarelo | `#F59E0B` |
| Erro | Vermelho | `#DC2626` |
| Bordas | Cinza claro | `#E2E8F0` |

A cor azul é utilizada como destaque principal em botões, elementos de navegação e ações importantes. As demais cores são utilizadas para representar estados do sistema, como sucesso, alerta e erro.

---

### Diretrizes de Estilo

- Botões principais em azul com texto branco.
- Cards com fundo branco e bordas suaves.
- Fundo geral em cinza muito claro.
- Bordas arredondadas entre 10px e 14px.
- Uso de verde para ações concluídas ou aprovadas.
- Uso de amarelo para solicitações pendentes.
- Uso de vermelho para erros ou recusas.


---

## 📂 Estrutura Inicial

```
mobile/
├── src/
│   └── app/
│       ├── _layout.tsx
│       ├── index.tsx
│       └── dashboard.tsx
├── assets/
├── package.json
├── app.json
└── tsconfig.json

