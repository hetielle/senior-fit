# SeniorFit — Descrição dos Fluxos do Sistema

Este documento descreve como os dados e as interações do usuário percorrem todas as camadas do sistema, desde a requisição do browser até o banco de dados e de volta à interface. Serve como referência arquitetural para apresentação acadêmica.

---

## 1. Arquitetura em Camadas

O SeniorFit é organizado em quatro camadas distintas que se comunicam de forma tipada:

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO                                     │
│  React Components (Client) + Next.js Pages (Server)         │
│  Tailwind CSS, TanStack Query hooks                         │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE API                                              │
│  tRPC Routers + Procedures + Middleware                     │
│  Validação Zod, Autenticação Better Auth                    │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE ACESSO A DADOS                                   │
│  Prisma ORM Client                                          │
│  Modelos tipados, relacionamentos, transactions             │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE PERSISTÊNCIA                                     │
│  PostgreSQL                                                 │
│  Tabelas, constraints, índices, cascade deletes             │
└─────────────────────────────────────────────────────────────┘
```

A característica central desta arquitetura é que **TypeScript conecta todas as camadas**: uma alteração no schema do Prisma (camada 3) propaga erros de compilação automaticamente até os componentes React (camada 1), sem execução do sistema.

---

## 2. Inicialização da Aplicação

Quando o servidor Next.js sobe, os seguintes recursos são inicializados:

```
Processo Node.js inicia
  │
  ├─ next.config.js carregado
  │   └─ Configurações de bundler (Turbopack em dev)
  │
  ├─ src/env.js executado
  │   └─ Zod valida variáveis de ambiente (DATABASE_URL, BETTER_AUTH_SECRET)
  │   └─ Se inválidas: erro em build time (não em runtime)
  │
  ├─ src/server/db.ts inicializa Prisma Client (singleton)
  │   └─ Pool de conexões com PostgreSQL estabelecido
  │
  ├─ src/server/better-auth/config.ts configura Better Auth
  │   └─ Adapter Prisma conectado ao mesmo client do banco
  │   └─ Estratégia email/senha ativada
  │   └─ Campos customizados (role, isActive) registrados
  │
  └─ Rotas registradas pelo App Router
      ├─ /api/auth/[...all] → Better Auth handler
      └─ /api/trpc/[trpc]   → tRPC handler
```

---

## 3. Fluxo de Requisição de Página (Navegação)

Toda navegação para uma rota protegida segue este ciclo no servidor antes de qualquer HTML ser enviado ao browser:

```
Browser requisita /workouts
  │
  ├─ Next.js App Router identifica src/app/workouts/page.tsx
  │
  ├─ React Server Component executa no servidor
  │   │
  │   ├─ requireStudent() é chamado (guard de acesso)
  │   │   ├─ getSession() busca sessão via cookie (cache por request)
  │   │   ├─ Sem sessão → redirect("/")
  │   │   └─ role = "INSTRUCTOR" → redirect("/instructor/students")
  │   │
  │   ├─ Dados carregados diretamente do banco via Prisma
  │   │   └─ studentWorkout.getToday → StudentWorkout com items e exercícios
  │   │
  │   └─ HTML pré-renderizado gerado com dados embutidos
  │
  ├─ HTML enviado ao browser (Time To First Byte rápido)
  │
  ├─ React hidrata os Client Components no browser
  │   └─ TanStack Query sincroniza estado com os dados do servidor
  │
  └─ Página interativa
```

Durante a hidratação, o Next.js exibe automaticamente o arquivo `loading.tsx` correspondente até que o Server Component termine de buscar os dados — garantindo feedback visual imediato.

---

## 4. Fluxo de Autenticação

### 4.1 Cadastro

```
Usuário preenche /sign-up e envia formulário
  │
  ├─ SignUpForm.tsx (Client Component)
  │   └─ authClient.signUp.email({ name, email, password, role: "STUDENT" })
  │       └─ POST /api/auth/sign-up/email
  │
  ├─ [Servidor] Better Auth recebe requisição
  │   ├─ Valida formato de e-mail e comprimento mínimo de senha
  │   ├─ Verifica duplicidade de e-mail na tabela User (Prisma)
  │   ├─ Gera hash da senha (bcrypt)
  │   └─ Persiste no banco:
  │       ├─ User { name, email, passwordHash, role: "STUDENT", isActive: false }
  │       └─ Session { userId, token, expiresAt }
  │
  ├─ Cookie de sessão gravado no browser
  │
  └─ Resultado:
      ├─ Sucesso → redirect("/workouts")
      │   └─ Página exibe mensagem: conta inativa, aguardar instrutor
      └─ Erro → mensagem amigável em PT-BR exibida no formulário
          Exemplos:
          "User already exists" → "Já existe uma conta com este e-mail."
          "Password too short"  → "A senha deve ter pelo menos 8 caracteres."
```

### 4.2 Login

```
Usuário preenche / e envia formulário
  │
  ├─ LoginForm.tsx (Client Component)
  │   └─ authClient.signIn.email({ email, password })
  │       └─ POST /api/auth/sign-in/email
  │
  ├─ [Servidor] Better Auth
  │   ├─ Busca User por e-mail
  │   ├─ Compara senha com hash armazenado
  │   ├─ Cria Session no banco e grava cookie
  │   └─ Retorna user com campos customizados (role, isActive)
  │
  ├─ [Cliente] LoginForm verifica isActive na resposta
  │   ├─ isActive = false:
  │   │   ├─ authClient.signOut() — logout imediato
  │   │   └─ Exibe erro: "Conta inativa. Entre em contato com seu instrutor."
  │   │
  │   └─ isActive = true:
  │       ├─ role = "STUDENT"     → router.push("/workouts")
  │       └─ role = "INSTRUCTOR"  → router.push("/instructor/students")
  │
  └─ Usuário redirecionado para sua área
```

### 4.3 Verificação de Sessão (por requisição)

```
Qualquer Server Component protegido executa
  │
  ├─ getSession() chamado (src/server/better-auth/server.ts)
  │   └─ Usa React cache() — executado no máximo uma vez por request
  │
  ├─ Better Auth lê cookie da requisição
  │   └─ Busca Session no banco via token
  │       ├─ Não encontrada / expirada → null
  │       └─ Encontrada → { user: { id, name, email, role, isActive } }
  │
  └─ Guard usa a sessão para decidir acesso ou redirect
```

### 4.4 Logout

```
Usuário clica "Sair" no header
  │
  ├─ LogoutButton.tsx exibe modal de confirmação
  │   └─ "Deseja sair da sua conta?" [Cancelar] [Sair]
  │
  ├─ Confirmação → authClient.signOut()
  │   └─ DELETE /api/auth/sign-out
  │       └─ Session removida do banco
  │       └─ Cookie invalidado no browser
  │
  └─ redirect("/")
```

---

## 5. Fluxo de uma Chamada tRPC

Toda interação que lê ou modifica dados (fora do carregamento inicial da página) passa pelo tRPC. Este é o ciclo completo:

```
Client Component executa mutation ou query
  │
  ├─ Ex: trpc.studentWorkout.toggleCompletion.useMutation()
  │
  ├─ [Browser] TanStack Query + tRPC Client
  │   ├─ Serializa input com SuperJSON (suporta Date, Map, Set)
  │   └─ POST /api/trpc/studentWorkout.toggleCompletion
  │       └─ Body: { "0": { json: { studentWorkoutItemId: "...", date: "..." } } }
  │
  ├─ [Servidor] /api/trpc/[trpc]/route.ts recebe requisição
  │   └─ tRPC handler roteia para o procedimento correto
  │
  ├─ [Servidor] Middleware executado em cadeia:
  │
  │   1. Timing Middleware
  │      └─ Registra início da execução (logs de performance)
  │
  │   2. Auth Middleware (protectedProcedure)
  │      ├─ getSession() verifica cookie
  │      ├─ Sem sessão → TRPCError { code: "UNAUTHORIZED" }
  │      └─ Com sessão → ctx.session = { user: { id, role, ... } }
  │
  │   3. Role Middleware (instructorProcedure, se aplicável)
  │      ├─ ctx.session.user.role !== "INSTRUCTOR"
  │      │   → TRPCError { code: "FORBIDDEN" }
  │      └─ OK → prossegue
  │
  ├─ [Servidor] Validação Zod do input
  │   ├─ Input inválido → ZodError serializado e retornado ao cliente
  │   └─ Input válido → procedure handler executado
  │
  ├─ [Servidor] Procedure handler
  │   └─ Prisma executa query/mutation no PostgreSQL
  │       └─ Ex: ExerciseCompletion upsert (cria ou deleta)
  │
  ├─ [Servidor] Resultado serializado com SuperJSON
  │   └─ Response HTTP 200 com JSON tipado
  │
  ├─ [Browser] TanStack Query recebe resposta
  │   ├─ Desserializa com SuperJSON
  │   ├─ Atualiza cache interno
  │   └─ Invalida queries relacionadas (ex: getToday, getWeek)
  │
  └─ React re-renderiza componentes que dependem dos dados atualizados
```

---

## 6. Fluxos por Funcionalidade

### 6.1 Aluno — Ver Treino do Dia

```
Navegação para /workouts
  │
  ├─ [Servidor] Server Component executa
  │   ├─ requireStudent() verifica sessão e role
  │   └─ Dados passados como props para Client Components
  │
  ├─ trpc.studentWorkout.getToday.useQuery() (Client Component)
  │   ├─ Busca StudentWorkout onde studentId = user.id E dayOfWeek = hoje
  │   ├─ Inclui: items → exercise (nome, grupo muscular, SVG)
  │   └─ Inclui: completions do dia (para marcar exercícios já feitos)
  │
  ├─ ExerciseList.tsx renderiza:
  │   ├─ Título do treino
  │   ├─ Barra de progresso (completedIds.size / items.length)
  │   ├─ Para cada item:
  │   │   ├─ ExerciseSvg.tsx (ícone animado)
  │   │   ├─ Nome, grupo muscular, séries/reps/duração
  │   │   └─ Botão "Feito?" (estado: completado ou não)
  │   │
  │   └─ Se todos concluídos: banner 🎉
  │
  └─ Se sem treino para hoje: mensagem "Dia de descanso"
```

### 6.2 Aluno — Marcar Exercício como Feito

```
Usuário toca "Feito?" em um exercício
  │
  ├─ ExerciseList.tsx (Client Component)
  │   └─ toggleCompletion.mutate({ studentWorkoutItemId, date: hoje })
  │
  ├─ [Servidor] protectedProcedure valida sessão
  │
  ├─ [Servidor] Prisma executa lógica de toggle:
  │   ├─ Busca ExerciseCompletion onde
  │   │   (studentId, studentWorkoutItemId, date) = valores recebidos
  │   ├─ Existe → DELETE (desmarca)
  │   └─ Não existe → CREATE (marca como feito)
  │
  ├─ TanStack Query invalida trpc.studentWorkout.getToday
  │
  ├─ React re-renderiza ExerciseList com novo estado:
  │   ├─ Botão muda para "✓"
  │   ├─ Barra de progresso atualiza
  │   └─ Se último exercício: banner de celebração aparece
  │
  └─ Estado persiste no banco — recarregar a página mantém o progresso
```

### 6.3 Aluno — Ver Agenda Semanal

```
Navegação para /schedule
  │
  ├─ trpc.studentWorkout.getWeek.useQuery()
  │   ├─ Busca todos StudentWorkouts do aluno (7 dias)
  │   └─ Inclui completions de hoje para comparação
  │
  ├─ Para cada dia da semana (seg–dom):
  │   ├─ Sem plano atribuído → "Descanso"
  │   ├─ Com plano:
  │   │   ├─ Conta total de items
  │   │   ├─ Conta completions com date = hoje (para o dia atual)
  │   │   └─ Determina status:
  │   │       ├─ completions == total → "✓ Concluído" (verde)
  │   │       ├─ completions > 0     → "X/Y" (parcial)
  │   │       ├─ data passada, 0 completions → "Não realizado" (vermelho)
  │   │       └─ data futura, 0 completions → sem indicador de falha
  │   │
  │   └─ Botão "Ver exercício ▼" expande lista de exercícios do dia
  │
  └─ Dia atual destacado com borda diferenciada
```

### 6.4 Aluno — Atualizar Perfil e Registrar Peso

```
Navegação para /profile
  │
  ├─ trpc.profile.get.useQuery()
  │   ├─ Busca UserProfile do aluno (nome, idade, telefone, objetivo, altura, peso)
  │   └─ Busca últimas 10 WeightEntries ordenadas por data
  │
  ├─ Usuário edita campos e submete formulário
  │   └─ trpc.profile.upsert.useMutation({ name, age, phone, objective, height, weight })
  │       ├─ [Servidor] Zod valida todos os campos
  │       └─ Prisma upsert em UserProfile (cria se não existe, atualiza se existe)
  │
  ├─ Usuário insere peso e clica "Registrar"
  │   └─ trpc.profile.addWeight.useMutation({ weight })
  │       └─ Prisma CREATE WeightEntry { userId, weight, date: hoje }
  │
  ├─ TanStack Query invalida trpc.profile.get
  │
  └─ Lista de histórico re-renderiza com nova entrada
      └─ Indicador calculado comparando entry[n].weight vs entry[n-1].weight
          └─ Seta verde/vermelha/neutra baseada no objetivo do aluno
```

### 6.5 Instrutor — Ativar / Desativar Aluno

```
Instrutor acessa /instructor/students/[studentId]
  │
  ├─ trpc.instructor.getStudent.useQuery({ studentId })
  │   └─ Retorna User com profile, weightEntries, workouts e activityHistory
  │
  ├─ Instrutor clica no toggle de ativo/inativo
  │   └─ trpc.instructor.toggleStudentActive.useMutation({ studentId })
  │
  ├─ [Servidor] instructorProcedure verifica role = "INSTRUCTOR"
  │
  ├─ [Servidor] Prisma:
  │   ├─ Busca User atual para ler isActive
  │   └─ UPDATE User SET isActive = NOT isActive WHERE id = studentId
  │
  ├─ TanStack Query invalida trpc.instructor.getStudent
  │
  └─ Badge de status do aluno atualiza na tela
      └─ Se desativado: próximo login do aluno será bloqueado
```

### 6.6 Instrutor — Montar Plano de Treino

```
Instrutor seleciona um dia da semana no editor
  │
  ├─ trpc.studentWorkout.getStudentWeek.useQuery({ studentId })
  │   └─ Retorna os 7 StudentWorkouts do aluno (ou null para dias sem plano)
  │
  ├─ [Criar plano para um dia vazio]
  │   └─ trpc.studentWorkout.upsertStudentWorkout.useMutation({
  │         studentId, dayOfWeek, title })
  │       └─ Prisma UPSERT StudentWorkout
  │           @@unique([studentId, dayOfWeek]) garante unicidade
  │
  ├─ [Adicionar exercício ao plano]
  │   └─ trpc.studentWorkout.addItem.useMutation({
  │         studentWorkoutId, exerciseId, sets, reps, durationSecs })
  │       ├─ [Servidor] Conta items existentes para calcular order
  │       └─ Prisma CREATE StudentWorkoutItem
  │
  ├─ [Remover exercício do plano]
  │   └─ trpc.studentWorkout.removeItem.useMutation({ itemId })
  │       └─ Prisma DELETE StudentWorkoutItem
  │           onDelete: Cascade remove ExerciseCompletions vinculadas
  │
  ├─ [Reordenar exercícios]
  │   └─ trpc.studentWorkout.updateItem.useMutation({ itemId, order, sets, reps })
  │       └─ Prisma UPDATE StudentWorkoutItem SET order = novo_valor
  │
  └─ Após cada mutação: TanStack Query invalida getStudentWeek
      └─ Editor re-renderiza com estado atualizado do banco
```

### 6.7 Instrutor — Criar Exercício Personalizado

```
Instrutor preenche formulário de novo exercício
  │
  ├─ trpc.exercise.create.useMutation({ name, muscleGroup, description })
  │
  ├─ [Servidor] instructorProcedure verifica role = "INSTRUCTOR"
  │
  ├─ [Servidor] Zod valida:
  │   ├─ name: string não vazio
  │   ├─ muscleGroup: string não vazio
  │   └─ description: string opcional
  │
  ├─ Prisma CREATE Exercise { name, muscleGroup, description, creatorId: instructorId }
  │
  └─ Exercício disponível no seletor de exercícios do editor de plano
```

---

### 6.8 Instrutor — Ver Métricas de Desempenho do Aluno

```
Instrutor acessa /instructor/students/[studentId]
  │
  ├─ StudentMetrics.tsx (Client Component)
  │   └─ trpc.instructor.getStudentMetrics.useQuery({ studentId })
  │
  ├─ [Servidor] instructorProcedure verifica role = "INSTRUCTOR"
  │
  ├─ [Servidor] Promise.all com 5 queries Prisma:
  │   ├─ studentWorkout.findMany → planos do aluno com contagem de itens por dia
  │   ├─ exerciseCompletion.count → conclusões nos últimos 7 dias
  │   ├─ exerciseCompletion.findMany → conclusões nos últimos 30 dias (com muscleGroup)
  │   ├─ exerciseCompletion.findMany → datas distintas (até 365) para streak
  │   └─ weightEntry.findMany → últimas 3 entradas de peso
  │
  ├─ [Servidor] Cálculos:
  │   ├─ Aderência 7d = (conclusões 7d / exercícios atribuídos em 7d) × 100
  │   ├─ Aderência 30d = (conclusões 30d / exercícios atribuídos em 30d) × 100
  │   ├─ Sequência = dias consecutivos com conclusão, contados a partir de hoje ou ontem
  │   ├─ Sessões 30d = quantidade de datas distintas com conclusão no período
  │   ├─ Grupo mais treinado = muscleGroup com maior frequência nos últimos 30 dias
  │   └─ Tendência de peso = diff entre registro mais recente e penúltimo (limiar ±0,5 kg)
  │
  ├─ Resposta serializada com SuperJSON e enviada ao cliente
  │
  └─ StudentMetrics re-renderiza com os dados:
      ├─ Tiles de aderência coloridos (verde ≥80%, âmbar ≥50%, vermelho <50%)
      ├─ Tile de sequência e sessões em zinc
      ├─ Tile de grupo muscular
      └─ Badge de tendência de peso (oculto se dados insuficientes)
```

---

## 7. Ciclo de Vida do Estado no Cliente

O TanStack Query gerencia o estado derivado de servidor com as seguintes regras:

```
[Carregamento inicial da página]
  └─ useQuery() executado → dados buscados via tRPC → cache populado

[Usuário navega para outra página e volta]
  └─ Cache verificado:
      ├─ Dados "frescos" (dentro do staleTime) → exibidos imediatamente sem refetch
      └─ Dados "stale" → exibidos imediatamente + refetch em background

[Mutação executada com sucesso]
  └─ onSuccess callback:
      └─ queryClient.invalidateQueries(["trpc", "studentWorkout", "getToday"])
          └─ Query marcada como stale → refetch automático
          └─ Componente re-renderiza com dados atualizados

[Erro em mutação]
  └─ isError = true no hook
      └─ Mensagem de erro exibida no componente
      └─ Estado anterior mantido (sem rollback automático necessário)
```

---

## 8. Proteção de Rotas — Matriz Completa

| Rota | Guard aplicado | Sem sessão | STUDENT | INSTRUCTOR |
|---|---|---|---|---|
| `/` | Nenhum | ✓ Acesso | ✓ Acesso | ✓ Acesso |
| `/sign-up` | Nenhum | ✓ Acesso | ✓ Acesso | ✓ Acesso |
| `/workouts` | `requireStudent()` | → `/` | ✓ Acesso | → `/instructor/students` |
| `/schedule` | `requireStudent()` | → `/` | ✓ Acesso | → `/instructor/students` |
| `/profile` | `requireStudent()` | → `/` | ✓ Acesso | → `/instructor/students` |
| `/instructor/students` | `requireInstructor()` | → `/` | → `/workouts` | ✓ Acesso |
| `/instructor/students/[id]` | `requireInstructor()` | → `/` | → `/workouts` | ✓ Acesso |

Todos os redirects acontecem **no servidor**, antes de qualquer HTML ser enviado ao browser — o usuário nunca vê conteúdo de uma rota não autorizada por um instante sequer.

---

## 9. Fluxo de Dados — Diagrama Completo

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER                                                         │
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────────────────┐ │
│  │  Server Components  │    │  Client Components               │ │
│  │  (HTML pré-render)  │    │  TanStack Query hooks            │ │
│  │                     │    │  trpc.[router].[procedure]       │ │
│  │  Dados chegam como  │    │  .useQuery() / .useMutation()    │ │
│  │  props no HTML      │    │                                  │ │
│  └──────────┬──────────┘    └────────────────┬─────────────────┘ │
│             │ React Hydration                 │ HTTP POST         │
└─────────────┼─────────────────────────────────┼──────────────────┘
              │                                 │
              ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  SERVIDOR NEXT.JS                                                │
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────────────────────────┐ │
│  │  App Router      │    │  /api/trpc/[trpc]                   │ │
│  │  Server Render   │    │                                     │ │
│  │                  │    │  ┌───────────────────────────────┐  │ │
│  │  requireAuth()   │    │  │  Middleware Chain              │  │ │
│  │  requireStudent()│    │  │  1. Timing                    │  │ │
│  │  requireInstruc- │    │  │  2. Auth (Better Auth)        │  │ │
│  │  tor()           │    │  │  3. Role check (se necessário)│  │ │
│  │                  │    │  │  4. Zod validation            │  │ │
│  │  getSession()    │    │  │  5. Procedure handler         │  │ │
│  │  (cache/request) │    │  └───────────────┬───────────────┘  │ │
│  └────────┬─────────┘    └──────────────────┼──────────────────┘ │
│           │                                  │                   │
└───────────┼──────────────────────────────────┼───────────────────┘
            │                                  │
            ▼                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│  PRISMA ORM                                                      │
│                                                                  │
│  db.studentWorkout.findFirst(...)                                │
│  db.exerciseCompletion.upsert(...)                               │
│  db.user.update(...)                                             │
│                                                                  │
│  → Gera SQL tipado                                               │
│  → Aplica constraints e índices                                  │
│  → Retorna objetos TypeScript tipados                            │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  POSTGRESQL                                                      │
│                                                                  │
│  Tabelas: User, StudentWorkout, StudentWorkoutItem,              │
│           ExerciseCompletion, UserProfile, WeightEntry, ...      │
│                                                                  │
│  Constraints: UNIQUE, CASCADE DELETE, INDEXED queries            │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Tratamento de Erros

O sistema trata erros em três camadas distintas:

**Camada de API (tRPC)**
- `UNAUTHORIZED`: Sessão ausente → cliente redireciona para login
- `FORBIDDEN`: Role incorreta → erro exibido no componente
- `BAD_REQUEST`: Input inválido por Zod → campos de formulário destacados com mensagem

**Camada de Banco (Prisma)**
- Violações de constraint única → Prisma lança `PrismaClientKnownRequestError`
- O tRPC captura e serializa como `INTERNAL_SERVER_ERROR`

**Camada de Cliente (TanStack Query)**
- `isError = true` ativa estado de erro no componente
- Botões de ação retornam ao estado habilitado
- Mensagens de erro exibidas próximas ao elemento que falhou

---

## 11. Segurança

| Aspecto | Implementação |
|---|---|
| Senhas | Hash bcrypt gerenciado pelo Better Auth |
| Sessões | Armazenadas no banco; token opaco no cookie (httpOnly) |
| Autorização | Verificada no servidor em cada procedimento tRPC |
| Validação de input | Zod em todos os inputs de API — nunca confiar no cliente |
| Proteção de rotas | Guards no servidor — redirects antes do render |
| Código server-only | `import "server-only"` em módulos do servidor evita vazamento para o bundle do cliente |
| Variáveis de ambiente | Validadas em build time; nunca expostas ao cliente sem prefixo `NEXT_PUBLIC_` |
