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

