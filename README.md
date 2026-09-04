### Gerenciador de Orçamento Doméstico — Fullstack (TS/Node/React)

Este é um sistema completo de gerenciamento financeiro residencial desenvolvido para consolidar conceitos de arquitetura de software de mercado. O projeto foi construído do zero, abandonando a lógica puramente teórica para criar uma aplicação **Fullstack real** com stack única, persistência de arquivos e interface de usuário dinâmica. 

### O que este projeto resolve?

Muitos estudantes ficam presos no "inferno dos tutoriais" repetindo lógicas abstratas. Este projeto aplica **lógica de programação avançada** a um problema do mundo real: capturar movimentações financeiras (ganhos e despesas), calcular saldos dinamicamente, realizar operações de deleção (CRUD) e garantir que nenhum dado seja perdido ao fechar a aplicação através da persistência física em disco. 

### Tecnologias Utilizadas

### **Backend (O Cérebro & Banco de Dados)**

* **Node.js (v24+)**: Ambiente de execução nativo de alta performance.
* **TypeScript**: Camada de tipagem estática para blindagem de contratos de dados contra erros em tempo de desenvolvimento.
* **Express**: Framework HTTP para roteamento de endpoints da API REST (GET, POST, DELETE).
* **Módulo Nativo fs/promises**: Gerenciamento e escrita assíncrona (async/await) de dados persistidos no formato JSON.
* **CORS**: Middleware para liberação de credenciais de rede seguras para o ecossistema frontend.

### **Frontend (A Cabine de Comando)**

* **React**: Biblioteca baseada em componentes focada em reatividade de interfaces.
* **Vite**: Ferramenta de build moderna e ultra rápida para empacotamento do frontend.
* **Hooks (useState, useEffect)**: Gerenciamento imutável de estados locais do formulário e controle de ciclo de vida para sincronização de rede.
* **ESLint**: Corretor ortográfico e padronizador de código estrito para garantir as melhores práticas.

### Arquitetura e Fluxo do Ecossistema

┌────────────────────────┐                   ┌────────────────────────────────┐
│   FRONTEND (React)     │                   │     BACKEND (Node + Express)   │
│  http://localhost:5173 │                   │     http://localhost:3000      │
└───────────┬────────────┘                   └───────────────┬────────────────┘
            │                                                │
            ├─────── (GET /transacoes:)                 ────►│ ──► Lê o disco
            ◄─────── (Envia a lista em formato JSON) ────────┤
            │                                                │
            ├─────── (POST /transacoes: "Salva o gasto") ───►│ ──► Grava no JSON
            ◄─────── (Avisa: "Salvo com sucesso!") ──────────┤

### Conceitos de Engenharia Aplicados

1. **Imutabilidade & Operador Spread (...)**: Atualização segura e performática dos estados visuais no React sem mutar os arrays originais da aplicação.
2. **Operações Assíncronas (async/await)**: Gerenciamento de tarefas que dependem de tempo de resposta de hardware (disco rígido) e chamadas de rede sem travar o processamento da aplicação.
3. **Type Assertion & Literal Types**: Contratos estritos no TypeScript (tipo: "ganho" | "despesa") impedindo falhas de digitação humana no motor de saldo.
4. **Controlled Components**: Captura automatizada de interações e digitações do usuário em tempo real no formulário web.

### Como Rodar o Projeto Localmente

### **1. Instalação e Preparação Geral**

Certifique-se de ter o **Node.js** instalado na sua máquina. 

### **2. Rodando o Backend**

bash

# Entre na pasta do backend
cd gerenciador-orcamento

# Instale as dependências limpas
npm install

# Inicie o servidor contínuo com suporte nativo a tipos
node --experimental-strip-types src/index.ts

Use o código com cuidado.

O console exibirá Servidor rodando em http://localhost:3000. 

### **3. Rodando o Frontend**

Abra uma **nova aba de terminal** e execute: 

bash

# Entre na pasta do frontend
cd gerenciador-frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

Use o código com cuidado.

Acesse o link http://localhost:5173 no seu navegador. 

### Evolução Pessoal

Este projeto representa o ponto de virada onde assumi o controle de ponta a ponta de uma arquitetura web corporativa. O motor de cálculo, o gerenciamento assíncrono de arquivos e o mapeamento de requisições de rede foram desenhados e implementados linha por linha, garantindo total independência técnica e abrindo portas para a construção de produtos digitais escaláveis (SaaS).
