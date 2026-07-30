# SeniorFit — Análise do Stack Tecnológico

Este documento descreve e justifica cada tecnologia utilizada no desenvolvimento do SeniorFit, com foco nas decisões arquiteturais relevantes para apresentação acadêmica.

---

## 1. Visão Geral do Stack

O SeniorFit foi construído sobre o **T3 Stack**, uma combinação opinativa de tecnologias modernas para aplicações web full-stack com TypeScript. O T3 Stack é organizado em torno de um princípio central: **segurança de tipos de ponta a ponta** — do banco de dados ao componente de interface, sem perda de tipagem em nenhuma camada.

### Stack completo:

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework web | Next.js | 15.2.3 |
| Linguagem | TypeScript | 5.8.2 |
| API type-safe | tRPC | 11.0.0 |
| ORM e banco | Prisma + PostgreSQL | 6.6.0 |
| Autenticação | Better Auth | 1.3 |
| Estilização | Tailwind CSS | 4.0.15 |
| Data fetching | TanStack Query | 5.69.0 |
| Validação | Zod | 3.24.2 |
| Gerenciador de pacotes | pnpm | 10.6.2 |

---

## 2. Next.js 15 com App Router

### O que é
Next.js é um framework React para construção de aplicações web com suporte nativo a renderização no servidor (SSR), geração estática (SSG) e React Server Components (RSC). O **App Router** é o sistema de roteamento introduzido no Next.js 13 e estabilizado nas versões posteriores.

### Por que foi escolhido

**a) React Server Components (RSC)**
O App Router permite que componentes sejam renderizados no servidor sem enviar JavaScript adicional ao cliente. No SeniorFit, páginas como `/workouts` e `/schedule` carregam dados diretamente no servidor antes de enviar HTML ao navegador — reduzindo o tempo de interação inicial, crítico para usuários idosos com conexões mais lentas.

**b) Roteamento baseado em arquivo system**
Rotas são criadas pela estrutura de diretórios em `src/app/`. A rota `/instructor/students/[studentId]` é criada automaticamente pela pasta correspondente, sem configuração adicional. Isso reduz a complexidade de manutenção.

**c) Turbopack**
O Next.js 15 usa o Turbopack como bundler de desenvolvimento (substituto ao Webpack), oferecendo hot-reload significativamente mais rápido durante o desenvolvimento.

**d) Integração com o ecossistema React**
Como SeniorFit é um projeto de TCC com tempo limitado, utilizar Next.js garante integração nativa com React 19, streaming, Suspense e as APIs mais recentes sem configuração adicional.

### Alternativas consideradas
- **Remix**: Também suporta SSR, mas tem ecossistema menor e menos exemplos de integração com tRPC.
- **SvelteKit**: Excelente performance, mas requer aprender um novo paradigma (Svelte) além de TypeScript.
- **Vite + React (SPA pura)**: Sem SSR; toda a carga de dados seria feita no cliente, piorando a performance inicial.

---

## 3. TypeScript

### O que é
TypeScript é um superset tipado do JavaScript desenvolvido pela Microsoft. Todo código TypeScript é compilado para JavaScript antes de ser executado.

### Por que foi escolhido

**a) Segurança em tempo de desenvolvimento**
TypeScript captura erros de tipo antes da execução. No contexto do SeniorFit, isso evita bugs como passar `string` onde se espera `number` em campos de peso, altura e número de séries.

**b) Pré-requisito do stack**
tRPC, Prisma e Zod — as outras tecnologias centrais do projeto — são projetados especificamente para TypeScript e dependem de sua inferência de tipos para funcionar.

**c) Manutenibilidade acadêmica**
Como TCC, o código precisa ser compreensível por avaliadores. TypeScript documenta a intenção do código por meio dos tipos, tornando as interfaces de dados explícitas e auto-documentadas.

**d) Configuração strict**
O projeto usa `"strict": true` no `tsconfig.json`, ativando verificações mais rigorosas como `strictNullChecks` e `noImplicitAny`.

---

## 4. tRPC

### O que é
tRPC (TypeScript Remote Procedure Call) é uma biblioteca que permite definir funções no servidor e chamá-las a partir do cliente com segurança de tipos completa, sem necessidade de gerar código ou manter schemas intermediários (como no GraphQL ou OpenAPI).

### Por que foi escolhido

**a) Elimina a camada de contrato manual**
Em APIs REST tradicionais, o desenvolvedor define endpoints, serializa/desserializa dados manualmente e sincroniza os tipos entre cliente e servidor. Com tRPC, o tipo do procedimento no servidor é inferido automaticamente no cliente:

```ts
// Servidor (src/server/api/routers/studentWorkout.ts)
getToday: protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.studentWorkout.findFirst({ where: { studentId: ctx.session.user.id } });
})

// Cliente — o tipo de retorno é inferido automaticamente, sem declaração extra
const { data } = trpc.studentWorkout.getToday.useQuery();
// data é tipado como StudentWorkout | null automaticamente
```

**b) Validação integrada com Zod**
Cada input de procedimento é validado com schemas Zod. O SeniorFit usa isso para validar IDs, datas e campos de formulário antes de qualquer operação no banco.

**c) Procedimentos com middleware (camadas de segurança)**
O tRPC permite encadear middleware nos procedimentos. O projeto define três níveis:
- `publicProcedure`: qualquer um pode chamar
- `protectedProcedure`: requer sessão autenticada
- `instructorProcedure`: requer sessão com `role = "INSTRUCTOR"`

**d) Integração com TanStack Query**
`@trpc/react-query` gera hooks React Query automaticamente a partir dos procedimentos, fornecendo cache, estados de carregamento e invalidação de cache sem configuração adicional.

### Alternativas consideradas
- **REST com Express**: Flexível, mas exige sincronização manual de tipos e geração de documentação separada.
- **GraphQL (Apollo)**: Poderoso para APIs públicas complexas, mas com curva de aprendizado alta e overhead de configuração desnecessário para um projeto de escopo fechado.
- **Next.js API Routes puras**: Simples, mas sem tipagem end-to-end automática.

---

## 5. Prisma ORM

### O que é
Prisma é um ORM (Object-Relational Mapper) moderno para Node.js e TypeScript. Oferece um schema declarativo, migrations automáticas e um client de banco de dados com tipos gerados.

### Por que foi escolhido

**a) Schema como fonte única de verdade**
O arquivo `prisma/schema.prisma` define todos os modelos de dados. O Prisma gera automaticamente:
- O client TypeScript com tipos para cada model e operação
- As migrations SQL para o PostgreSQL
- A documentação implícita da estrutura do banco

**b) Tipos inferidos para consultas**
Ao fazer `db.studentWorkout.findFirst({ include: { items: { include: { exercise: true } } } })`, o Prisma infere o tipo de retorno exato incluindo os relacionamentos — sem necessidade de declarar interfaces manualmente.

**c) Relações e constraints declarativas**
O schema do SeniorFit define 10 modelos com relacionamentos complexos (StudentWorkout → StudentWorkoutItem → ExerciseCompletion). O Prisma cuida de gerar os JOINs e constraints SQL corretos, incluindo `onDelete: Cascade`.

**d) Prisma Studio**
Ferramenta visual de inspeção do banco de dados acessível via `pnpm db:studio`, útil durante o desenvolvimento para verificar dados sem escrever SQL.

### Alternativas consideradas
- **Drizzle ORM**: Mais leve e com SQL explícito, mas com ecossistema menor e menos integração com Better Auth.
- **TypeORM**: Mais antigo, com decorators que conflitam com o modo strict do TypeScript.
- **Knex.js**: Query builder sem tipos inferidos automaticamente.

---

## 6. PostgreSQL

### O que é
PostgreSQL é um sistema de gerenciamento de banco de dados relacional (SGBDR) open-source, amplamente utilizado em aplicações web de produção.

### Por que foi escolhido

**a) Suporte a constraints complexas**
O SeniorFit usa constraints compostas como `@@unique([studentId, dayOfWeek])` em `StudentWorkout` e `@@unique([studentId, studentWorkoutItemId, date])` em `ExerciseCompletion`. O PostgreSQL as aplica nativamente com desempenho.

**b) Compatibilidade com Better Auth e Prisma**
Ambas as bibliotecas têm suporte nativo e testado para PostgreSQL, incluindo os adapters de sessão e migração automática.

**c) Facilidade de setup com Docker**
O projeto inclui um `Makefile` com comandos para subir o PostgreSQL em container Docker localmente, sem necessidade de instalação global.

**d) Confiabilidade e maturidade**
PostgreSQL tem histórico comprovado de estabilidade, ACID compliance e desempenho para aplicações web — adequado tanto para desenvolvimento quanto para eventual produção.

### Alternativas consideradas
- **MySQL/MariaDB**: Igualmente suportado pelo Prisma, mas com menos recursos avançados de constraints.
- **SQLite**: Ideal para prototipagem, mas sem suporte a conexões concorrentes adequado para web.
- **MongoDB**: Banco não-relacional; inadequado para o modelo de dados estruturado e relacional do SeniorFit.

---

## 7. Better Auth

### O que é
Better Auth é uma biblioteca de autenticação moderna para Next.js que substitui o NextAuth.js (agora Auth.js). Oferece suporte a múltiplas estratégias de autenticação com integração nativa ao Prisma e campos de usuário customizados.

### Por que foi escolhido

**a) Campos de usuário customizados nativos**
O SeniorFit precisa de dois campos adicionais no modelo `User`: `role` (STUDENT/INSTRUCTOR) e `isActive` (controle de acesso pelo instrutor). Better Auth suporta campos customizados nativamente via configuração, sem precisar de tabelas auxiliares ou hacks no schema.

**b) Controle de `isActive` no fluxo de login**
Quando um aluno tem `isActive = false`, o sistema faz logout imediatamente após o sign-in e exibe uma mensagem de erro. Esse controle fino no fluxo de autenticação é mais simples de implementar com Better Auth do que com alternativas.

**c) Adapter Prisma**
O `@auth/prisma-adapter` sincroniza as tabelas de autenticação (`Session`, `Account`, `Verification`) com o schema Prisma, mantendo o banco de dados como fonte única de verdade.

**d) Sessões server-side com React cache()**
Better Auth usa sessões armazenadas no banco, acessíveis no servidor via `getSession()` com cache por request usando a API `cache()` do React — evitando múltiplas queries de autenticação por render.

### Alternativas consideradas
- **NextAuth.js v5 (Auth.js)**: A migração para v5 estava em beta instável no período de desenvolvimento; Better Auth oferecia API mais estável.
- **Clerk**: SaaS de autenticação com UI pronta. Custo e dependência de terceiros tornaram inviável para TCC.
- **Lucia Auth**: Deprecado durante o desenvolvimento do projeto.
- **Implementação manual com JWT**: Possível, mas desnecessariamente complexo para o escopo do projeto.

---

## 8. Tailwind CSS v4

### O que é
Tailwind CSS é um framework CSS utilitário que fornece classes de baixo nível (`flex`, `px-4`, `text-xl`) que são compostas diretamente no HTML/JSX para construir interfaces. A versão 4 foi lançada em 2025 e representa uma reescrita completa do engine.

### Por que foi escolhido

**a) Velocidade de desenvolvimento**
Tailwind elimina o ciclo de nomear classes CSS, escrever seletores e gerenciar arquivos separados. No SeniorFit, toda a interface foi construída diretamente nos componentes sem criar arquivos CSS externos para cada componente.

**b) Abordagem CSS-first no v4**
O Tailwind v4 não usa arquivo de configuração JavaScript (`tailwind.config.js`). A customização de tema é feita diretamente no CSS com a diretiva `@theme`:

```css
@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui;
}
```

Isso simplifica o projeto e mantém a configuração próxima ao CSS.

**c) `@apply` para semântica**
Para evitar repetição de longas cadeias de classes utilitárias nos componentes, o projeto usa `@apply` em arquivos CSS por página, criando classes semânticas:

```css
.workout-card {
  @apply rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm;
}
```

Isso combina a produtividade do Tailwind com a legibilidade de classes nomeadas.

**d) Suporte nativo a dark mode e responsividade**
O Tailwind fornece variantes `dark:` e prefixos de breakpoint (`sm:`, `md:`) que foram usados extensivamente para garantir acessibilidade visual e responsividade mobile-first.

**e) Integração com Prettier**
O plugin `prettier-plugin-tailwindcss` ordena automaticamente as classes Tailwind nos arquivos, mantendo consistência sem esforço manual.

### Alternativas consideradas
- **CSS Modules**: Mais verbose; requer criar e nomear arquivos para cada componente.
- **Styled Components / Emotion**: CSS-in-JS; adiciona overhead de runtime e complexidade com RSC (Server Components não suportam bem CSS-in-JS).
- **Sass/SCSS**: Sem integração com o paradigma utilitário; requer mais código para o mesmo resultado.

---

## 9. TanStack Query (React Query)

### O que é
TanStack Query é uma biblioteca de gerenciamento de estado assíncrono para React. Fornece hooks para buscar, cachear, sincronizar e atualizar dados remotos.

### Por que foi escolhido

**a) Integração direta com tRPC**
`@trpc/react-query` gera automaticamente hooks `useQuery` e `useMutation` a partir dos procedimentos tRPC, sem necessidade de configuração adicional.

**b) Cache e invalidação automática**
Após uma mutation (ex: marcar exercício como concluído), o cliente invalida automaticamente as queries relacionadas, forçando recarregamento dos dados atualizados — sem gerenciamento manual de estado.

**c) Estados de carregamento**
`isLoading`, `isPending`, `isError` são fornecidos por todos os hooks, facilitando a implementação de estados de carregamento e desabilitação de botões durante operações em andamento.

**d) Sem necessidade de Redux ou Context global**
Para o escopo do SeniorFit, TanStack Query gerencia todo o estado derivado de servidor. Não há Redux, Zustand ou Context personalizado para dados remotos — reduzindo complexidade arquitetural.

---

## 10. Zod

### O que é
Zod é uma biblioteca de validação e parsing de schemas TypeScript-first. Permite definir schemas de dados e validar/transformar inputs em runtime com tipos inferidos em compile-time.

### Por que foi escolhido

**a) Validação de inputs de API**
Cada procedimento tRPC que recebe dados do cliente define um schema Zod para o input:

```ts
addItem: instructorProcedure
  .input(z.object({
    studentWorkoutId: z.string(),
    exerciseId: z.string(),
    sets: z.number().min(1),
    reps: z.number().optional(),
    durationSecs: z.number().optional(),
  }))
  .mutation(...)
```

Isso garante que dados inválidos são rejeitados antes de chegar ao banco.

**b) Inferência de tipos**
`z.infer<typeof schema>` gera automaticamente o tipo TypeScript correspondente ao schema, eliminando duplicação entre validação e tipos.

**c) Validação de variáveis de ambiente**
O projeto usa Zod via `@t3-oss/env-nextjs` para validar variáveis de ambiente em tempo de build, garantindo que `DATABASE_URL` e `BETTER_AUTH_SECRET` estejam presentes e no formato correto.

**d) Mensagens de erro estruturadas**
Erros de validação Zod são serializados automaticamente pelo tRPC e enviados ao cliente com informações sobre qual campo falhou e por quê.

---

## 11. pnpm

### O que é
pnpm é um gerenciador de pacotes Node.js alternativo ao npm e Yarn, com foco em eficiência de disco e velocidade de instalação.

### Por que foi escolhido

**a) Instalações mais rápidas**
pnpm usa um store global de pacotes com hard links, evitando downloads duplicados entre projetos e acelerando `pnpm install`.

**b) Recomendação do T3 Stack**
O template oficial do T3 Stack usa pnpm por padrão, e os scripts no `package.json` e `Makefile` assumem pnpm.

**c) Workspace support**
Caso o projeto evolua para monorepo (ex: adicionar app mobile React Native), pnpm suporta workspaces nativamente.

---

## 12. Arquitetura: Como as tecnologias se integram

O diagrama abaixo ilustra o fluxo de dados de uma operação típica (marcar exercício como concluído):

```
[Browser]
    │
    ├─ React Server Component carrega a página /workouts
    │   └─ Prisma consulta StudentWorkout diretamente no servidor
    │   └─ HTML pré-renderizado enviado ao browser
    │
    ├─ ExerciseList.tsx (Client Component) renderiza lista de exercícios
    │
    └─ Usuário clica "Feito?" em um exercício
        │
        ├─ trpc.studentWorkout.toggleCompletion.useMutation() (TanStack Query)
        │
        ├─ tRPC serializa o request com SuperJSON e envia para /api/trpc
        │
        ├─ [Servidor] Middleware de autenticação verifica sessão (Better Auth)
        │
        ├─ [Servidor] Zod valida o input { studentWorkoutItemId, date }
        │
        ├─ [Servidor] Prisma executa upsert em ExerciseCompletion (PostgreSQL)
        │
        └─ TanStack Query invalida o cache de trpc.studentWorkout.getToday
            └─ Componente re-renderiza com dados atualizados
```

---

## 13. Justificativa de Conjunto

A combinação dessas tecnologias não é arbitrária. Cada escolha reforça as outras:

- **TypeScript** é o fio condutor que conecta todas as camadas com segurança de tipos.
- **tRPC + Zod** garantem que os dados que saem do banco chegam ao componente com o tipo correto, sem transformações manuais.
- **Prisma** gera tipos a partir do schema, eliminando discrepâncias entre o modelo de dados e o código da aplicação.
- **Next.js App Router** permite usar esses tipos no servidor sem serialização desnecessária, aproveitando Server Components para a maioria das leituras de dados.
- **TanStack Query** gerencia o estado cliente resultante das mutations tRPC, mantendo a UI sincronizada.
- **Better Auth** integra-se ao Prisma para que a autenticação faça parte do mesmo ciclo de tipos — `ctx.session.user` tem o mesmo tipo que o model `User` do Prisma.
- **Tailwind CSS v4** completa o stack na camada de apresentação sem adicionar complexidade de build.

O resultado é um sistema onde uma alteração no schema do banco (ex: adicionar um campo em `Exercise`) propaga erros de compilação automaticamente para todos os lugares do código que usam esse model — do procedimento tRPC ao componente React — sem execução do sistema.

---

## Referências

- T3 Stack: https://create.t3.gg
- Next.js App Router: https://nextjs.org/docs/app
- tRPC: https://trpc.io/docs
- Prisma: https://www.prisma.io/docs
- Better Auth: https://www.better-auth.com/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
- TanStack Query: https://tanstack.com/query/v5/docs
- Zod: https://zod.dev
