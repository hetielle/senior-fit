# SeniorFit — Diagrama Entidade-Relacionamento (ER)

Este documento descreve o modelo de dados do SeniorFit: as entidades, seus atributos, os relacionamentos entre elas e as restrições de integridade aplicadas no banco de dados PostgreSQL via Prisma.

---

## 1. Diagrama ER (Notação Textual)

```
┌──────────────────────────────────────────────────────────────────────┐
│  AUTENTICAÇÃO (Better Auth)                                          │
│                                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────────┐    │
│  │   Account   │    │   Session    │    │    Verification      │    │
│  │─────────────│    │──────────────│    │──────────────────────│    │
│  │ id (PK)     │    │ id (PK)      │    │ id (PK)              │    │
│  │ userId (FK) │    │ userId (FK)  │    │ identifier           │    │
│  │ provider    │    │ token        │    │ value                │    │
│  │ accountId   │    │ expiresAt    │    │ expiresAt            │    │
│  │ ...         │    │ ...          │    └──────────────────────┘    │
│  └──────┬──────┘    └──────┬───────┘                                │
│         │                  │                                        │
│         └─────────┬────────┘                                        │
│                   │ N:1                                              │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                  User                                         │
│───────────────────────────────────────────────────────────────────────────────│
│ id          String   PK                                                       │
│ name        String                                                            │
│ email       String   UNIQUE                                                   │
│ role        String   DEFAULT "STUDENT"    ("STUDENT" | "INSTRUCTOR")          │
│ isActive    Boolean  DEFAULT false                                            │
│ createdAt   DateTime                                                          │
│ updatedAt   DateTime                                                          │
└──────┬────────────────────────────────────────────┬────────────────────┬──────┘
       │                                            │                    │
       │ 1:1                                        │ 1:N                │ 1:N
       ▼                                            ▼                    ▼
┌──────────────────────┐             ┌──────────────────────┐  ┌────────────────────────┐
│     UserProfile      │             │     WeightEntry       │  │   ExerciseCompletion   │
│──────────────────────│             │──────────────────────│  │────────────────────────│
│ id          String PK│             │ id          String PK│  │ id          String  PK │
│ userId      FK UNIQUE│             │ userId      FK       │  │ studentId   FK         │
│ age         Int?     │             │ weight      Float    │  │ studentWork-           │
│ phone       String?  │             │ date        DateTime │  │   ItemId    FK         │
│ objective   String?  │             └──────────────────────┘  │ date        DateTime   │
│ height      Float?   │               INDEX(userId)           │                        │
│ weight      Float?   │                                       │ UNIQUE(studentId,      │
│ createdAt   DateTime │                                       │   studentWorkoutItemId,│
│ updatedAt   DateTime │                                       │   date)                │
└──────────────────────┘                                       │ INDEX(studentId, date) │
                                                               └──────────┬─────────────┘
                                                                          │ N:1
                                                                          │
       ┌──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            StudentWorkoutItem                                    │
│──────────────────────────────────────────────────────────────────────────────────│
│ id                String   PK                                                    │
│ studentWorkoutId  FK       CASCADE DELETE                                        │
│ exerciseId        FK                                                             │
│ order             Int                                                            │
│ sets              Int                                                            │
│ reps              Int?                                                           │
│ durationSecs      Int?                                                           │
│                   INDEX(studentWorkoutId)                                        │
└───────────────────────────────┬──────────────────┬───────────────────────────────┘
                                │ N:1              │ N:1
                                │                  │
                                ▼                  ▼
         ┌──────────────────────────────┐   ┌─────────────────────────────────────┐
         │       StudentWorkout         │   │             Exercise                │
         │──────────────────────────────│   │─────────────────────────────────────│
         │ id           String  PK      │   │ id           String  PK             │
         │ studentId    FK              │   │ name         String                 │
         │ instructorId FK              │   │ description  String?                │
         │ dayOfWeek    Int   (0–6)     │   │ muscleGroup  String                 │
         │ title        String          │   │ sets         Int?                   │
         │ createdAt    DateTime        │   │ reps         Int?                   │
         │ updatedAt    DateTime        │   │ durationSecs Int?                   │
         │                             │   │ creatorId    FK? (User instructor)  │
         │ UNIQUE(studentId, dayOfWeek)│   └─────────────────────────────────────┘
         │ INDEX(studentId)            │
         └──────────────────────────────┘
              │ N:1            │ N:1
              │                │
        (studentId)      (instructorId)
              │                │
              └────────┬───────┘
                       ▼
                     User
```

---

## 2. Entidades e Atributos

### 2.1 User

Entidade central do sistema, gerenciada pelo Better Auth. Representa qualquer usuário — aluno ou instrutor.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | UUID gerado pelo Better Auth |
| `name` | String | NOT NULL | Nome completo |
| `email` | String | UNIQUE | E-mail de login |
| `emailVerified` | Boolean | DEFAULT false | Verificação de e-mail |
| `image` | String? | — | URL de avatar (opcional) |
| `role` | String | DEFAULT "STUDENT" | `"STUDENT"` ou `"INSTRUCTOR"` |
| `isActive` | Boolean | DEFAULT false | Controle de acesso pelo instrutor |
| `createdAt` | DateTime | — | Data de criação da conta |
| `updatedAt` | DateTime | — | Última atualização |

**Regras:**
- Todo usuário criado por cadastro público recebe `role = "STUDENT"` e `isActive = false`
- Um usuário com `isActive = false` é impedido de fazer login
- `role = "INSTRUCTOR"` é atribuído manualmente no banco de dados

---

### 2.2 UserProfile

Dados pessoais e de saúde do aluno. Criado sob demanda (lazy) na primeira edição do perfil.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `userId` | String | FK → User, UNIQUE | Relacionamento 1:1 com User |
| `age` | Int? | — | Idade em anos |
| `phone` | String? | — | Telefone de contato |
| `objective` | String? | — | Meta de treino (ex: "Perder peso") |
| `height` | Float? | — | Altura em centímetros |
| `weight` | Float? | — | Peso atual em quilogramas |
| `createdAt` | DateTime | — | |
| `updatedAt` | DateTime | — | |

---

### 2.3 WeightEntry

Histórico de registros de peso do aluno ao longo do tempo.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `userId` | String | FK → User, INDEX | Aluno que registrou |
| `weight` | Float | NOT NULL | Peso em quilogramas |
| `date` | DateTime | NOT NULL | Data do registro |

**Regras:**
- Um aluno pode ter múltiplos registros na mesma data
- Os registros são exibidos em ordem decrescente de data

---

### 2.4 Exercise

Catálogo de exercícios disponíveis no sistema. Pode ser um exercício padrão (sem `creatorId`) ou personalizado por um instrutor.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `name` | String | NOT NULL | Nome do exercício |
| `description` | String? | — | Descrição e instruções |
| `muscleGroup` | String | NOT NULL | Grupo muscular principal |
| `sets` | Int? | — | Séries padrão sugeridas |
| `reps` | Int? | — | Repetições padrão sugeridas |
| `durationSecs` | Int? | — | Duração padrão em segundos |
| `creatorId` | String? | FK → User | Instrutor que criou (null = exercício global) |

---

### 2.5 StudentWorkout

Plano de treino atribuído por um instrutor a um aluno para um dia específico da semana.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `studentId` | String | FK → User, INDEX | Aluno dono do plano |
| `instructorId` | String | FK → User | Instrutor que criou |
| `dayOfWeek` | Int | 0–6 (Dom–Sáb) | Dia da semana |
| `title` | String | NOT NULL | Nome do treino (ex: "Treino A") |
| `createdAt` | DateTime | — | |
| `updatedAt` | DateTime | — | |

**Restrições:**
- `@@unique([studentId, dayOfWeek])` — um aluno só pode ter um plano por dia da semana
- `@@index([studentId])` — otimiza consultas por aluno

---

### 2.6 StudentWorkoutItem

Representa um exercício dentro de um plano de treino de aluno, com parâmetros específicos para aquele aluno.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `studentWorkoutId` | String | FK → StudentWorkout, CASCADE | Plano ao qual pertence |
| `exerciseId` | String | FK → Exercise | Exercício base |
| `order` | Int | NOT NULL | Posição na lista do treino |
| `sets` | Int | NOT NULL | Séries definidas pelo instrutor |
| `reps` | Int? | — | Repetições (ou null se por tempo) |
| `durationSecs` | Int? | — | Duração em segundos (ou null se por reps) |

**Restrições:**
- `onDelete: Cascade` — ao deletar o `StudentWorkout`, todos os itens são removidos
- `@@index([studentWorkoutId])` — otimiza listagem de itens por treino

---

### 2.7 ExerciseCompletion

Registro de conclusão de um exercício por um aluno em uma data específica. É a tabela central de rastreamento de progresso.

| Atributo | Tipo | Restrição | Descrição |
|---|---|---|---|
| `id` | String | PK | |
| `studentId` | String | FK → User | Aluno que concluiu |
| `studentWorkoutItemId` | String | FK → StudentWorkoutItem | Exercício concluído |
| `date` | DateTime | NOT NULL | Data da conclusão |

**Restrições:**
- `@@unique([studentId, studentWorkoutItemId, date])` — impede dupla marcação no mesmo dia
- `@@index([studentId, date])` — otimiza consultas de "quais exercícios o aluno fez hoje/nessa semana"

---

### 2.8 Session, Account, Verification

Entidades gerenciadas pelo Better Auth para autenticação. Não são manipuladas diretamente pela aplicação.

| Entidade | Propósito |
|---|---|
| `Session` | Sessão ativa de um usuário (token, expiração) |
| `Account` | Vínculo a provedor OAuth (GitHub, Google) |
| `Verification` | Token temporário para verificação de e-mail |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Descrição |
|---|---|---|
| User → UserProfile | 1:1 | Um usuário tem no máximo um perfil |
| User → WeightEntry | 1:N | Um usuário pode ter múltiplos registros de peso |
| User → StudentWorkout (como student) | 1:N | Um aluno pode ter até 7 planos (um por dia) |
| User → StudentWorkout (como instructor) | 1:N | Um instrutor pode criar planos para vários alunos |
| StudentWorkout → StudentWorkoutItem | 1:N | Um plano contém múltiplos exercícios |
| Exercise → StudentWorkoutItem | 1:N | Um exercício pode aparecer em múltiplos planos |
| StudentWorkoutItem → ExerciseCompletion | 1:N | Um item pode ser concluído em múltiplas datas |
| User → ExerciseCompletion | 1:N | Um aluno pode ter múltiplas conclusões |
| User → Exercise (como creator) | 1:N | Um instrutor pode criar múltiplos exercícios |
| User → Session | 1:N | Um usuário pode ter múltiplas sessões ativas |

---

## 4. Índices e Constraints de Integridade

| Tabela | Constraint | Tipo | Propósito |
|---|---|---|---|
| `User` | `email` | UNIQUE | Impede contas duplicadas |
| `UserProfile` | `userId` | UNIQUE | Garante relação 1:1 com User |
| `StudentWorkout` | `(studentId, dayOfWeek)` | UNIQUE | Um plano por aluno por dia |
| `StudentWorkout` | `studentId` | INDEX | Performance em consultas por aluno |
| `StudentWorkoutItem` | `studentWorkoutId` | INDEX | Performance em listagem de itens |
| `StudentWorkoutItem` | `studentWorkoutId` | CASCADE DELETE | Limpeza em cascata ao deletar plano |
| `ExerciseCompletion` | `(studentId, studentWorkoutItemId, date)` | UNIQUE | Idempotência na marcação |
| `ExerciseCompletion` | `(studentId, date)` | INDEX | Performance na agenda semanal |
| `WeightEntry` | `userId` | INDEX | Performance no histórico de peso |

---

## 5. Diagrama Simplificado de Relacionamentos

```
User ──────────── UserProfile        (1:1)
User ──────────── WeightEntry        (1:N)
User ──────────── Exercise           (1:N, como criador)
User ──────────── ExerciseCompletion (1:N, como student)
User ──────────── StudentWorkout     (1:N, como student)
User ──────────── StudentWorkout     (1:N, como instructor)

StudentWorkout ── StudentWorkoutItem (1:N, cascade delete)
Exercise ──────── StudentWorkoutItem (1:N)

StudentWorkoutItem ── ExerciseCompletion (1:N)
```
