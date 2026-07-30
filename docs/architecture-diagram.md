# SeniorFit — Diagrama de Componentes e Arquitetura

Este documento descreve a estrutura estática do sistema: como os módulos, componentes e camadas estão organizados e como se relacionam entre si. Complementa o `system-flow.md` (visão dinâmica) com uma perspectiva estrutural.

---

## 1. Visão Macro da Arquitetura

O SeniorFit é uma aplicação **monolítica full-stack** hospedada em um único processo Node.js (Next.js). Não há separação em microserviços ou APIs externas próprias — toda a lógica de negócio, acesso a dados e interface residem no mesmo projeto.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PROCESSO NEXT.JS                              │
│                                                                      │
│  ┌─────────────────────────┐   ┌──────────────────────────────────┐  │
│  │   FRONTEND              │   │   BACKEND                        │  │
│  │   (App Router / React)  │   │   (Node.js Server Runtime)       │  │
│  │                         │   │                                  │  │
│  │  Server Components      │   │  tRPC API Handler                │  │
│  │  Client Components      │   │  Better Auth Handler             │  │
│  │  TanStack Query         │   │  Prisma Client                   │  │
│  │  Tailwind CSS           │   │  Session Management              │  │
│  └─────────────────────────┘   └──────────────────────────────────┘  │
│                                                                      │
└───────────────────────────────────────────┬──────────────────────────┘
                                            │
                                            │ TCP / SQL
                                            ▼
                              ┌─────────────────────────┐
                              │       PostgreSQL         │
                              │   (Docker container)     │
                              └─────────────────────────┘
```

---

## 2. Diagrama de Componentes — Frontend

```
src/app/
│
├── layout.tsx                         [Server Component]
│   └── Provedor raiz da aplicação
│       ├── TRPCReactProvider          [Client Component]
│       │   └── Configura tRPC + TanStack Query para toda a árvore
│       ├── AppHeader                  [Client Component]
│       │   ├── Logo
│       │   ├── Nav links (role-aware: aluno x instrutor)
│       │   └── LogoutButton           [Client Component]
│       │       └── Modal de confirmação
│       └── NextToploader              [Client Component]
│           └── Barra de progresso de navegação
│
├── page.tsx  (/)                      [Server Component → Client Form]
│   └── LoginForm                      [Client Component]
│       ├── Input email + autocomplete
│       ├── Input senha + toggle visibilidade
│       └── authClient.signIn.email()
│
├── sign-up/page.tsx                   [Server Component → Client Form]
│   └── SignUpForm                     [Client Component]
│       ├── Input nome, email, senha
│       ├── Toggle visibilidade de senha
│       ├── Mapa de erros PT-BR
│       └── authClient.signUp.email()
│
├── workouts/page.tsx                  [Server Component]
│   ├── requireStudent() → guard
│   └── ExerciseList                   [Client Component]
│       ├── Barra de progresso
│       ├── Para cada item:
│       │   ├── ExerciseSvg            [Client Component]
│       │   │   └── Ícone SVG animado
│       │   └── Botão "Feito?" / "✓"
│       │       └── trpc.studentWorkout.toggleCompletion
│       └── Banner de celebração (condicional)
│
├── schedule/page.tsx                  [Server Component]
│   ├── requireStudent() → guard
│   └── ScheduleExerciseList           [Client Component]
│       └── Para cada dia:
│           ├── Status badge (concluído/parcial/descanso/não realizado)
│           └── Botão "Ver exercício" → expande lista de exercícios
│
├── profile/page.tsx                   [Server Component]
│   ├── requireStudent() → guard
│   └── [formulário de perfil inline]  [Client Component]
│       ├── Campos: nome, idade, telefone, objetivo, altura, peso
│       │   └── trpc.profile.upsert
│       └── Seção de peso:
│           ├── Input + trpc.profile.addWeight
│           └── Lista de WeightEntries com indicadores ↑↓
│
├── instructor/
│   └── students/
│       ├── page.tsx                   [Server Component]
│       │   ├── requireInstructor() → guard
│       │   └── Lista de alunos com badges
│       │       └── trpc.instructor.getStudents
│       │
│       └── [studentId]/page.tsx       [Server Component]
│           ├── requireInstructor() → guard
│           └── [conteúdo inline]       [Client Component]
│               ├── Card de dados do aluno
│               ├── StudentActiveBadge  [Client Component]
│               ├── StudentActiveToggle [Client Component]
│               │   └── trpc.instructor.toggleStudentActive
│               ├── Histórico de peso
│               ├── StudentMetrics      [Client Component]
│               │   └── trpc.instructor.getStudentMetrics (aderência, sequência, sessões, grupo muscular, tendência de peso)
│               ├── ActivityHistory     [Client Component]
│               │   └── trpc.instructor.getStudent (últimas 30 conclusões)
│               └── WorkoutPlanEditor   [Client Component]
│                   ├── Seletor de dia da semana
│                   ├── Editor de exercícios (add/remove/reorder)
│                   │   └── trpc.studentWorkout.*
│                   └── Formulário de criação de exercício
│                       └── trpc.exercise.create
│
└── _components/                       [Componentes compartilhados]
    ├── AppHeader.tsx
    ├── LogoutButton.tsx
    ├── LoginForm.tsx
    ├── SignUpForm.tsx
    ├── ExerciseList.tsx
    ├── ExerciseSvg.tsx
    ├── ScheduleExerciseList.tsx
    ├── WorkoutPlanEditor.tsx
    ├── ActivityHistory.tsx
    ├── StudentActiveBadge.tsx
    ├── StudentActiveToggle.tsx
    ├── StudentMetrics.tsx
    ├── SubmitButton.tsx
    └── HeaderSkeleton.tsx
```

---

## 3. Diagrama de Componentes — Backend (tRPC)

```
src/server/api/
│
├── root.ts
│   └── AppRouter (agrega todos os routers)
│       ├── profile      → profileRouter
│       ├── exercise     → exerciseRouter
│       ├── workout      → workoutRouter
│       ├── studentWork  → studentWorkoutRouter
│       └── instructor   → instructorRouter
│
├── trpc.ts
│   ├── createTRPCContext()
│   │   └── Injeta: db (Prisma), session (Better Auth), headers
│   ├── publicProcedure
│   │   └── Sem restrições de acesso
│   ├── protectedProcedure
│   │   └── Middleware: verifica sessão → injeta ctx.session
│   │       └── Sem sessão → TRPCError UNAUTHORIZED
│   └── instructorProcedure
│       └── Middleware: protectedProcedure + verifica role
│           └── role ≠ "INSTRUCTOR" → TRPCError FORBIDDEN
│
└── routers/
    │
    ├── profile.ts
    │   ├── get           [protectedProcedure] → UserProfile + WeightEntries
    │   ├── upsert        [protectedProcedure] → CREATE/UPDATE UserProfile
    │   └── addWeight     [protectedProcedure] → CREATE WeightEntry
    │
    ├── exercise.ts
    │   └── create        [instructorProcedure] → CREATE Exercise
    │
    ├── workout.ts
    │   └── getToday      [protectedProcedure] → Workout genérico do dia
    │
    ├── studentWorkout.ts
    │   ├── getToday            [protectedProcedure] → StudentWorkout do dia + completions
    │   ├── getWeek             [protectedProcedure] → 7 StudentWorkouts + completions
    │   ├── toggleCompletion    [protectedProcedure] → UPSERT ExerciseCompletion
    │   ├── getStudentWeek      [instructorProcedure] → semana de um aluno específico
    │   ├── upsertStudentWorkout[instructorProcedure] → CREATE/UPDATE StudentWorkout
    │   ├── addItem             [instructorProcedure] → CREATE StudentWorkoutItem
    │   ├── removeItem          [instructorProcedure] → DELETE StudentWorkoutItem
    │   ├── updateItem          [instructorProcedure] → UPDATE StudentWorkoutItem
    │   └── deleteStudentWorkout[instructorProcedure] → DELETE StudentWorkout
    │
    └── instructor.ts
        ├── getStudents          [instructorProcedure] → todos os alunos
        ├── getStudent           [instructorProcedure] → aluno + perfil + workouts + histórico
        ├── toggleStudentActive  [instructorProcedure] → UPDATE User.isActive
        └── getStudentMetrics    [instructorProcedure] → aderência 7d/30d, sequência, sessões, grupo muscular, tendência de peso
```

---

## 4. Diagrama de Componentes — Autenticação

```
src/server/better-auth/
│
├── config.ts
│   └── Configuração central do Better Auth
│       ├── emailAndPassword: { enabled: true }
│       ├── database: prismaAdapter(db)
│       └── user.additionalFields:
│           ├── role:     { type: "string", defaultValue: "STUDENT" }
│           └── isActive: { type: "boolean", defaultValue: false }
│
├── index.ts
│   └── auth = betterAuth(config)  ← instância principal
│
├── server.ts
│   └── getSession()
│       └── auth.api.getSession({ headers })
│           └── React cache() — uma execução por request HTTP
│
├── client.ts
│   └── authClient = createAuthClient()
│       └── Usado nos Client Components:
│           ├── authClient.signIn.email()
│           ├── authClient.signUp.email()
│           └── authClient.signOut()
│
└── guards.ts
    ├── requireAuth()       → redirect("/") se sem sessão
    ├── requireStudent()    → redirect conforme role
    └── requireInstructor() → redirect conforme role
```

---

## 5. Diagrama de Componentes — Banco de Dados

```
prisma/
│
├── schema.prisma
│   ├── datasource db { provider = "postgresql" }
│   ├── generator client { output = "../../generated/prisma" }
│   │
│   └── Models:
│       ├── User                  (autenticação + role + isActive)
│       ├── UserProfile           (dados pessoais e de saúde)
│       ├── WeightEntry           (histórico de peso)
│       ├── Exercise              (catálogo de exercícios)
│       ├── StudentWorkout        (plano por aluno por dia)
│       ├── StudentWorkoutItem    (exercício no plano do aluno)
│       ├── ExerciseCompletion    (conclusão de exercício por data)
│       ├── Session               (Better Auth)
│       ├── Account               (Better Auth OAuth)
│       └── Verification          (Better Auth)
│
└── seed.ts
    └── Script para popular dados iniciais de desenvolvimento
```

---

## 6. Diagrama de Dependências entre Módulos

```
                    ┌──────────────────┐
                    │   Browser/Client  │
                    └────────┬─────────┘
                             │ HTTP
                    ┌────────▼─────────┐
                    │   Next.js App    │
                    │   Router         │
                    └────┬────────┬────┘
                         │        │
              ┌──────────▼──┐  ┌──▼──────────────┐
              │  Page/Layout │  │  API Routes      │
              │  (RSC)       │  │  /api/trpc/[...] │
              │              │  │  /api/auth/[...] │
              └──────┬───────┘  └──────┬───────────┘
                     │                 │
              ┌──────▼──────────────────▼──────────┐
              │          Server Services            │
              │                                    │
              │  ┌─────────────┐  ┌─────────────┐  │
              │  │  tRPC Root  │  │ Better Auth  │  │
              │  │  Router     │  │ Config       │  │
              │  └──────┬──────┘  └──────┬───────┘  │
              │         │                │           │
              │  ┌──────▼────────────────▼───────┐  │
              │  │         Prisma Client          │  │
              │  │         src/server/db.ts       │  │
              │  └───────────────┬────────────────┘  │
              └──────────────────┼────────────────────┘
                                 │ TCP/SQL
                    ┌────────────▼─────────────┐
                    │        PostgreSQL         │
                    └──────────────────────────┘
```

---

## 7. Separação Cliente / Servidor

Uma característica central da arquitetura Next.js com App Router é a distinção entre código que roda no servidor e código que roda no browser:

| Módulo | Onde executa | Motivo |
|---|---|---|
| `src/server/db.ts` | Servidor apenas | Credenciais do banco não devem ir ao browser |
| `src/server/api/routers/*.ts` | Servidor apenas | Lógica de negócio e acesso ao banco |
| `src/server/better-auth/server.ts` | Servidor apenas | `getSession()` requer headers HTTP |
| `src/server/better-auth/client.ts` | Browser | Chama a API de autenticação via HTTP |
| `src/trpc/server.ts` | Servidor apenas | Chama procedures tRPC diretamente, sem HTTP |
| `src/trpc/react.tsx` | Browser | Hooks `useQuery`/`useMutation` para componentes client |
| Páginas (`page.tsx`) | Servidor (RSC) | Data fetching, guards, sem JS enviado |
| Componentes com `"use client"` | Browser | Interatividade, formulários, estado local |

O arquivo `server-only` é importado em módulos puramente server-side, causando erro de build se acidentalmente importados em Client Components.

---

## 8. Estrutura de Diretórios Completa

```
senior-fit/
├── src/
│   ├── app/                    # Next.js App Router (páginas e layouts)
│   │   ├── _components/        # Componentes React reutilizáveis
│   │   ├── api/
│   │   │   ├── auth/[...all]/  # Better Auth handler
│   │   │   └── trpc/[trpc]/    # tRPC handler
│   │   ├── instructor/         # Rotas do instrutor (protegidas)
│   │   ├── profile/            # Perfil do aluno
│   │   ├── schedule/           # Agenda semanal
│   │   ├── sign-up/            # Cadastro
│   │   ├── workouts/           # Treino do dia
│   │   ├── globals.css         # Estilos globais Tailwind
│   │   ├── layout.tsx          # Layout raiz
│   │   └── page.tsx            # Página de login (/)
│   │
│   ├── server/                 # Código server-only
│   │   ├── api/
│   │   │   ├── routers/        # tRPC procedures por domínio
│   │   │   ├── root.ts         # Agregador de routers
│   │   │   └── trpc.ts         # Context, procedures, middleware
│   │   ├── better-auth/        # Configuração de autenticação
│   │   └── db.ts               # Prisma Client singleton
│   │
│   ├── trpc/                   # Utilitários tRPC client-side
│   │   ├── react.tsx           # Provider e hooks React
│   │   ├── query-client.ts     # TanStack Query config
│   │   └── server.ts           # tRPC server-side helpers
│   │
│   └── env.js                  # Validação de variáveis de ambiente (Zod)
│
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── seed.ts                 # Dados iniciais de desenvolvimento
│
├── generated/
│   └── prisma/                 # Prisma Client gerado (não editar)
│
├── public/                     # Assets estáticos
├── docs/                       # Documentação acadêmica
├── package.json
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── eslint.config.js
├── prettier.config.js
└── Makefile                    # Comandos Docker para o banco
```
