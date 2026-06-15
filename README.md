# [PT-🇧🇷]
# OncoPed Academy — Web (Painel Administrativo)

Painel administrativo da plataforma OncoPed Academy, desenvolvido para gerenciamento de cursos, módulos, aulas, questionários, usuários e certificados. Desenvolvido como Trabalho de Conclusão de Curso (TCC) no Centro Universitário CESMAC.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

## Funcionalidades

- Gerenciamento de cursos, módulos e aulas
- Criação e edição de questionários com suporte a imagens
- Gerenciamento de usuários e controle de acesso
- Emissão e visualização de certificados
- Dashboard com gráficos de desempenho
- Upload de vídeos e imagens via Firebase Storage

## Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/tiagolvjy/OncoPedAcademyWeb.git
cd OncoPedAcademyWeb

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha o .env com as credenciais do Firebase
```

### Variáveis de ambiente necessárias

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Equipe

**Desenvolvedores:** Ana Beatriz Ferreira Mafficioni · Tiago Couto Moraes  
**Orientador:** Wagner de Oliveira Lima Palmeira de Araújo  
**Designer:** Dayane S. C. Pontes  
**Colaboração:** Carlos Alberto Correia Lessa Filho  
**Instituição:** Centro Universitário CESMAC — CITEC · 2026

# [EN]

# OncoPed Academy — Web (Admin Panel)

Administrative panel for the OncoPed Academy platform, built to manage courses, modules, lessons, quizzes, users and certificates. Developed as an undergraduate thesis (TCC) at Centro Universitário CESMAC.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

## Features

- Course, module and lesson management
- Quiz creation and editing with image support
- User management and access control
- Certificate issuance and tracking
- Performance dashboard with charts
- Video and image upload via Firebase Storage

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/tiagolvjy/OncoPedAcademyWeb.git
cd OncoPedAcademyWeb

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in the .env file with your Firebase credentials
```

### Required environment variables

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Team

**Developers:** Ana Beatriz Ferreira Mafficioni · Tiago Couto Moraes  
**Advisor:** Wagner de Oliveira Lima Palmeira de Araújo  
**Designer:** Dayane S. C. Pontes  
**Collaboration:** Carlos Alberto Correia Lessa Filho  
**Institution:** Centro Universitário CESMAC — CITEC · 2026