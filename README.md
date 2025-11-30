Chatbot Inteligente - Biblioteca Universitária

Visão Geral

Este bot permite aos alunos consultar horários, renovar empréstimos e reservar livros utilizando linguagem natural.

Arquitetura

Bot Framework (Node.js): Lógica principal.

Azure CLU: Processamento de Linguagem Natural (Intenções e Entidades).

Azure Cosmos DB: Base de dados NoSQL para guardar empréstimos.

GitHub Actions: CI/CD para deploy automático no Azure App Service.

Como Executar Localmente

Clonar o repositório.

Executar npm install.

Configurar o ficheiro .env com as chaves do Azure.

Executar npm start.

Usar o Bot Framework Emulator e conectar a http://localhost:3978/api/messages.
