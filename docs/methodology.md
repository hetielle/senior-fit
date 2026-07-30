# SeniorFit — Metodologia de Desenvolvimento

Este documento descreve o processo, as práticas e as decisões que guiaram o desenvolvimento do SeniorFit, desde a concepção da arquitetura até a implementação das funcionalidades.

---

## 1. Abordagem Geral

O SeniorFit foi desenvolvido como um projeto individual de TCC, com escopo delimitado e prazo definido. A metodologia adotada foi **iterativa e incremental**: o sistema foi construído em camadas funcionais sucessivas, partindo da base de dados até a interface, com refinamentos contínuos ao longo do desenvolvimento.

A escolha por um stack opinativo e bem integrado (T3 Stack) foi deliberada para reduzir decisões de configuração e concentrar o esforço no problema do domínio — a experiência de treino para idosos.

---

## 2. Fases do Desenvolvimento

### Fase 1 — Definição do Domínio e Modelagem de Dados

A primeira etapa foi modelar o problema antes de escrever qualquer código de interface ou API.

**Atividades:**
- Identificação dos atores do sistema (Aluno, Instrutor)
- Mapeamento das entidades do domínio: usuário, perfil, exercício, treino, conclusão
- Definição das relações e restrições de integridade
- Escrita do `prisma/schema.prisma` com todos os modelos

**Decisão:** Modelar o banco primeiro (_schema-first_) garante que a estrutura de dados reflita fielmente o domínio antes de qualquer lógica ser escrita. Com Prisma, o schema é a fonte única de verdade — qualquer alteração posterior propaga automaticamente para a API e os componentes via TypeScript.

**Entregável da fase:** `prisma/schema.prisma` estável com 10 modelos, relacionamentos e constraints.

---

### Fase 2 — Scaffolding com T3 Stack

O projeto foi inicializado com o gerador oficial do T3 Stack (`pnpm create t3-app@latest`), que produziu a estrutura base com:

- Next.js 15 configurado com App Router
- tRPC com routers de exemplo
- Prisma com conexão ao banco
- Tailwind CSS v4
- TypeScript em modo strict
- ESLint e Prettier configurados

**Ajustes pós-geração:**
- Substituição do NextAuth.js pelo Better Auth
- Remoção de routers e componentes de exemplo (`post.ts`, `post.tsx`)
- Configuração dos campos customizados do usuário (`role`, `isActive`) no Better Auth
- Criação do `Makefile` com comandos Docker para o banco de dados

---

### Fase 3 — Implementação da API (tRPC Routers)

Com o schema definido e o ambiente configurado, os routers tRPC foram implementados domínio por domínio:

**Ordem de implementação:**

```
1. profile.ts     → operações de perfil e peso (mais simples, sem dependências)
2. exercise.ts    → criação de exercícios (instrutor)
3. workout.ts     → consultas de treino genérico
4. studentWorkout.ts → core do sistema: planos por aluno, conclusões
5. instructor.ts  → visão do instrutor sobre alunos e planos
```

**Práticas adotadas em cada router:**
- Definição de `publicProcedure`, `protectedProcedure` e `instructorProcedure` como contratos explícitos de acesso
- Validação de todos os inputs com schemas Zod antes de qualquer acesso ao banco
- Retorno de erros com `TRPCError` e códigos semânticos (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`)
- Inclusão de relações necessárias via `include` do Prisma (evitando N+1 queries)

---

### Fase 4 — Implementação das Páginas e Componentes

Com a API funcional, as páginas foram construídas de forma independente da camada de dados. A separação entre Server Components e Client Components guiou as decisões de onde cada lógica vive:

**Regra aplicada:**
- **Server Component**: carregamento inicial de dados, verificação de sessão, guards de rota
- **Client Component**: interações do usuário (cliques, formulários), estado local, mutations tRPC

**Ordem de implementação:**

```
1. Layout raiz (layout.tsx) → fonte, viewport, header
2. Login e Sign-up → autenticação base
3. /workouts → fluxo principal do aluno (treino do dia)
4. /schedule → agenda semanal (leitura)
5. /profile → perfil e histórico de peso
6. /instructor/students → lista de alunos
7. /instructor/students/[studentId] → detalhe, editor de treino
```

---

### Fase 5 — Refinamentos de UX e Acessibilidade

Após as funcionalidades estarem operacionais, uma fase dedicada de revisão de acessibilidade e experiência do usuário foi conduzida com foco no público idoso.

**Ajustes realizados** (documentados em `docs/elderly-ux-report.md`):
- Aumento sistemático de tamanhos de fonte e alvos de toque
- Responsividade mobile-first em todos os componentes
- Modal de confirmação no logout
- Toggle de visibilidade de senha
- Atributos `autocomplete` e `inputMode` em formulários
- Animações condicionais com `prefers-reduced-motion`
- Tradução de mensagens de erro técnicas para português claro
- Atributo `lang="pt-BR"` no `<html>`

---

### Fase 6 — Controle de Qualidade

**Ferramentas utilizadas:**

| Ferramenta | Finalidade |
|---|---|
| `pnpm typecheck` | Verificação de tipos TypeScript em todo o projeto |
| `pnpm lint` | ESLint com regras do Next.js (imports, hooks, acessibilidade) |
| `pnpm format:check` | Prettier garante formatação consistente do código |
| `pnpm build` | Build de produção — detecta erros que o servidor de dev omite |

**Ausência de testes automatizados:**
O escopo do TCC não incluiu uma suíte de testes automatizados (unit/integration/e2e). A validação foi feita por testes manuais em diferentes dispositivos e navegadores. Testes automatizados são identificados como trabalho futuro.

---

## 3. Controle de Versão

O projeto utiliza **Git** com repositório no GitHub.

**Convenção de commits:**
Os commits seguem um padrão de prefixos semânticos:

| Prefixo | Significado |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `chore:` | Ajustes sem impacto funcional (estilo, config, deps) |
| `refactor:` | Reorganização de código sem mudança de comportamento |

**Exemplos do histórico real do projeto:**
```
feat: add isActive
chore: acessibility fixes
fix: fix exercise display and remove github login
chore: change workout visualization
chore: add wheight progression visual comparisson
```

Não foram utilizados branches de feature; o desenvolvimento ocorreu diretamente na branch `main` dado o caráter individual do projeto.

---

## 4. Ambiente de Desenvolvimento

### Dependências de sistema

| Ferramenta | Versão | Papel |
|---|---|---|
| Node.js | ≥ 20 | Runtime JavaScript |
| pnpm | 10.6.2 | Gerenciador de pacotes |
| Docker | — | Banco de dados PostgreSQL em container |
| Git | — | Controle de versão |

### Banco de dados local

O PostgreSQL foi executado localmente via Docker, gerenciado pelo `Makefile`:

```bash
make db-create   # Cria e inicia container PostgreSQL
make db-start    # Retoma container parado
make db-stop     # Para o container
make db-rm       # Remove o container
```

Isso elimina a necessidade de instalar PostgreSQL globalmente e garante isolamento do ambiente de desenvolvimento.

### Variáveis de ambiente

O arquivo `.env` é validado em tempo de build pelo `src/env.js` (Zod + `@t3-oss/env-nextjs`). O repositório contém `.env.example` com todas as variáveis necessárias documentadas.

### Fluxo de trabalho diário

```bash
make db-start          # Inicia o banco
pnpm dev               # Inicia o servidor Next.js com Turbopack
# ... desenvolvimento ...
pnpm db:studio         # Inspeção visual do banco (quando necessário)
pnpm check             # Lint + typecheck antes de commitar
```

---

## 5. Decisões Arquiteturais e seus Critérios

### 5.1 Schema-first com Prisma

**Decisão:** Modelar o banco de dados antes de qualquer código de negócio.

**Critério:** Em projetos com múltiplos relacionamentos (como planos de treino aninhados), descobrir problemas de modelagem durante a escrita dos componentes é custoso. Definir o schema primeiro força a pensar no modelo de domínio de forma independente da interface.

---

### 5.2 T3 Stack como base

**Decisão:** Usar o gerador T3 em vez de configurar o stack manualmente.

**Critério:** Reduzir tempo gasto em configuração de boilerplate (webpack, hot-reload, ESLint, TypeScript paths) para concentrar o esforço no domínio. O T3 Stack representa escolhas bem estabelecidas na comunidade Next.js e é amplamente documentado.

---

### 5.3 App Router (não Pages Router)

**Decisão:** Usar o sistema de roteamento baseado em Server Components.

**Critério:** O App Router permite buscar dados diretamente no servidor sem criar APIs intermediárias para carregamentos iniciais. Guards de autenticação rodam no servidor antes do HTML ser enviado, eliminando flashes de conteúdo não autorizado.

---

### 5.4 tRPC em vez de REST

**Decisão:** Usar tRPC para todas as operações de leitura/escrita em runtime.

**Critério:** Em um projeto TypeScript full-stack, a principal vantagem do tRPC é eliminar a duplicação de tipos entre cliente e servidor. Qualquer alteração na assinatura de um procedimento causa erro de compilação imediato em todos os lugares que o chamam — sem necessidade de gerar código ou atualizar contratos manualmente.

---

### 5.5 Better Auth em vez de NextAuth.js

**Decisão:** Substituir NextAuth.js pelo Better Auth.

**Critério:** O projeto necessitava de campos customizados no modelo de usuário (`role`, `isActive`) e controle fino do fluxo de login (bloquear `isActive = false` antes de criar a sessão). Better Auth oferece suporte nativo a campos customizados e estava em versão estável durante o desenvolvimento; NextAuth.js v5 ainda estava em beta com API em mudança.

---

### 5.6 Tailwind CSS v4 sem arquivo de configuração

**Decisão:** Usar Tailwind v4 com tema definido em CSS (`@theme`).

**Critério:** A versão 4 elimina o arquivo `tailwind.config.js`, reduzindo a quantidade de arquivos de configuração do projeto. O tema é colocado junto ao CSS onde é usado, mantendo a configuração próxima ao contexto.

---

## 6. Limitações da Metodologia Adotada

| Limitação | Impacto | Mitigação aplicada |
|---|---|---|
| Ausência de testes automatizados | Bugs de regressão podem passar despercebidos | Tipagem TypeScript strict como primeira linha de defesa |
| Desenvolvimento solo (sem revisão de código) | Decisões não são questionadas por pares | Uso de linting e typecheck rigorosos como substituto parcial |
| Sem testes de usabilidade com usuários reais | Adequação ao público idoso não foi validada empiricamente | Decisões baseadas em guidelines de acessibilidade (WCAG, Apple HIG, Google Material) |
| Branch única (main) | Sem isolamento de features em desenvolvimento | Escopo pequeno e entregas incrementais minimizam o risco |
