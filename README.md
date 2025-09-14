# 🚀 CRUD NestJS + React

Uma aplicação moderna de **CRUD** (Create, Read, Update, Delete) para gerenciamento de usuários, desenvolvida com **NestJS** no backend e **React** no frontend, apresentando um design elegante em dark mode.

![Badge](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Badge](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Badge](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Badge](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Índice

- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [📦 Instalação](#-instalação)
- [🚀 Como executar](#-como-executar)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔗 API Endpoints](#-api-endpoints)
- [🎨 Interface](#-interface)
- [🤝 Contribuição](#-contribuição)

## ✨ Funcionalidades

### 🔐 Autenticação
- **Registro** de novos usuários
- **Login** com email e senha
- **JWT Token** para autenticação segura
- **Logout** com limpeza de sessão

### 👥 Gerenciamento de Usuários
- **Listar** todos os usuários cadastrados
- **Visualizar** detalhes do usuário
- **Interface moderna** em dark mode
- **Design responsivo** para mobile e desktop

### 🎨 Interface do Usuário
- **Dark mode** elegante
- **Glassmorphism** com efeitos de vidro
- **Animações suaves** e transições
- **Loading states** informativos
- **Validação de formulários**

## 🛠️ Tecnologias

### Backend (NestJS)
- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Linguagem principal
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas
- **Prisma/TypeORM** - ORM para banco de dados
- **PostgreSQL/MySQL** - Banco de dados

### Frontend (React)
- **React 18** - Biblioteca para interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **React Hooks** - Gerenciamento de estado

## 📦 Instalação

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** ou **MySQL** (para o banco de dados)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/crud-nestjs-react.git
cd crud-nestjs-react
```

### 2. Instale as dependências do Backend
```bash
cd backend
npm install
```

### 3. Instale as dependências do Frontend
```bash
cd ../frontend
npm install
```

### 4. Configure as variáveis de ambiente

**Backend (.env)**
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/crud_db"
JWT_SECRET="seu_jwt_secret_super_seguro"
PORT=5000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Como executar

### 1. Executar o Backend
```bash
cd backend

# Executar migrações do banco
npm run migrate

# Iniciar o servidor de desenvolvimento
npm run start:dev
```

O backend estará disponível em: `http://localhost:5000`

### 2. Executar o Frontend
```bash
cd frontend

# Iniciar o servidor de desenvolvimento
npm start
```

O frontend estará disponível em: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
crud-nestjs-react/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔗 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/register` | Registrar novo usuário |
| `POST` | `/login` | Fazer login |

### Usuários
| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `GET` | `/users` | Listar usuários | ✅ Bearer Token |
| `GET` | `/users/:id` | Buscar usuário por ID | ✅ Bearer Token |
| `PUT` | `/users/:id` | Atualizar usuário | ✅ Bearer Token |
| `DELETE` | `/users/:id` | Deletar usuário | ✅ Bearer Token |

### Exemplo de Uso da API

**Registro**
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456"
  }'
```

**Login**
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "123456"
  }'
```

**Listar Usuários**
```bash
curl -X GET http://localhost:5000/users \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## 🎨 Interface

### 🌙 Tela de Login
- **Design moderno** em dark mode
- **Toggle** entre Login e Registro
- **Validação** em tempo real
- **Loading states** durante requisições

### 📊 Dashboard
- **Lista de usuários** com avatars
- **Cards elegantes** com hover effects
- **Animações suaves** ao carregar
- **Botões de ação** (editar/excluir)

### ✨ Características Visuais
- **Glassmorphism** com backdrop blur
- **Gradientes** azul e roxo
- **Animações CSS** personalizadas
- **Responsive design** mobile-first

## 🔒 Segurança

- **Passwords** criptografadas com bcrypt
- **JWT tokens** para autenticação stateless
- **Validação** de dados no backend
- **Headers CORS** configurados
- **Rate limiting** nas rotas sensíveis

## 🧪 Testes

### Backend
```bash
cd backend

# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend
```bash
cd frontend

# Testes com Jest
npm test

# Testes em modo watch
npm run test:watch
```

## 🚀 Deploy

### Backend (Heroku)
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create crud-backend

# Configurar variáveis
heroku config:set DATABASE_URL="sua_database_url"
heroku config:set JWT_SECRET="seu_jwt_secret"

# Deploy
git push heroku main
```

### Frontend (Netlify)
```bash
# Build de produção
npm run build

# Deploy no Netlify
# Faça upload da pasta build/ no dashboard do Netlify
```

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie sua **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### 📝 Padrões de Commit
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação de código
- `refactor:` refatoração
- `test:` testes

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Pedro Henrique Gomes**
- GitHub: [@pedrogom7](https://github.com/pedrogom7)
- LinkedIn: [Pedro Henrique Gomes](https://linkedin.com/in/pedrogom7)

---

⭐ **Deixe uma estrela se este projeto te ajudou!**

## 📚 Recursos Adicionais

- [Documentação do NestJS](https://nestjs.com/)
- [Documentação do React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [JWT.io](https://jwt.io/)

---

<div align="center">
  Feito com ❤️ e ☕ por <strong>Pedro Gomes</strong>
</div>
