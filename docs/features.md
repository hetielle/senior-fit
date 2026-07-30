# SeniorFit — Catálogo de Funcionalidades

Este documento descreve todas as funcionalidades implementadas no SeniorFit, organizadas por perfil de usuário e área do sistema. Serve como referência para apresentação acadêmica.

---

## 1. Autenticação e Controle de Acesso

### 1.1 Cadastro de Conta

**Rota:** `/sign-up`
**Acesso:** Público

O usuário cria uma conta com nome, e-mail e senha. O sistema aplica as seguintes regras:

- A senha deve ter no mínimo 8 caracteres (validado no frontend e no servidor via Better Auth)
- Contas criadas automaticamente recebem `role = "STUDENT"` e `isActive = false`
- O instrutor precisa ativar a conta manualmente antes que o aluno possa acessar o sistema
- Mensagens de erro são exibidas em português com `role="alert"` para leitores de tela

### 1.2 Login

**Rota:** `/` (página inicial)
**Acesso:** Público

Autenticação por e-mail e senha. O sistema verifica dois critérios após a validação da senha:

1. **`isActive`**: Se `false`, o sistema efetua logout imediatamente e exibe a mensagem _"Conta inativa. Entre em contato com seu instrutor."_
2. **`role`**: Após login bem-sucedido, o redirecionamento é automático:
   - `STUDENT` → `/workouts`
   - `INSTRUCTOR` → `/instructor/students`

### 1.3 Logout com Confirmação

**Disponível em:** Todas as páginas autenticadas (header)

O botão "Sair" abre um modal de confirmação antes de efetuar o logout, evitando saídas acidentais — especialmente relevante para o público idoso.

### 1.4 Controle de Acesso por Role

O sistema implementa três níveis de proteção aplicados no servidor antes do render de cada página:

| Guard | Comportamento |
|---|---|
| `requireAuth()` | Redireciona para `/` se não há sessão |
| `requireStudent()` | Garante `role = "STUDENT"`; redireciona instructors para `/instructor/students` |
| `requireInstructor()` | Garante `role = "INSTRUCTOR"`; redireciona students para `/workouts` |

Nenhuma rota protegida é acessível sem autenticação — o redirecionamento ocorre no servidor, não no cliente.

---

## 2. Funcionalidades do Aluno (STUDENT)

### 2.1 Treino do Dia

**Rota:** `/workouts`

Exibe o plano de treino atribuído pelo instrutor para o dia atual da semana.

**Detalhes exibidos por exercício:**
- Nome do exercício
- Grupo muscular
- Número de séries (`sets`)
- Número de repetições (`reps`) ou duração em segundos (`durationSecs`)
- Ícone SVG animado ilustrando o movimento

**Comportamento:**
- Se não há treino atribuído para o dia ou o dia é de descanso, uma mensagem informativa é exibida
- O dia e a data são exibidos em português (ex: _"Segunda-feira, 28 de julho"_)

### 2.2 Marcação de Exercícios como Concluídos

**Rota:** `/workouts`
**Persistência:** Banco de dados (tabela `ExerciseCompletion`)

Cada exercício possui um botão **"Feito?"** que o aluno toca ao concluir o movimento. O sistema:

1. Registra a conclusão com a data atual no banco (`ExerciseCompletion`)
2. A operação é idempotente: tocar novamente _desfaz_ a marcação (toggle)
3. Uma barra de progresso no topo da lista exibe `X / N exercícios concluídos`
4. Ao concluir **todos** os exercícios do dia, um banner de celebração é exibido:

```
🎉  Treino concluído!
    Parabéns! Você completou todos os exercícios de hoje.
```

5. O estado de conclusão persiste ao recarregar a página — o progresso não é perdido

### 2.3 Agenda Semanal

**Rota:** `/schedule`

Exibe os 7 dias da semana (segunda a domingo) com o status de cada um.

**Status possíveis por dia:**

| Status | Descrição | Indicador visual |
|---|---|---|
| Descanso | Sem treino atribuído | "Descanso" |
| Concluído | Todos exercícios feitos | "✓ Concluído" (verde) |
| Parcial | Parte dos exercícios feita | "3/5" (número) |
| Não realizado | Dia com treino mas sem conclusões | "Não realizado" (vermelho) |
| Hoje | Dia atual (qualquer status) | Borda destacada |

**Expansão de detalhe:**
Cada dia pode ser expandido com o botão **"Ver exercício ▼"** para visualizar os exercícios atribuídos naquele dia, com nome e grupo muscular.

### 2.4 Perfil do Aluno

**Rota:** `/profile`

Formulário para o aluno manter seus dados pessoais e de saúde atualizados.

**Campos editáveis:**

| Campo | Tipo | Teclado mobile |
|---|---|---|
| Nome completo | Texto | Alfanumérico |
| Idade | Número | Numérico |
| Telefone | Texto | Telefônico |
| Objetivo | Seleção | — |
| Altura (cm) | Decimal | Numérico com vírgula |
| Peso atual (kg) | Decimal | Numérico com vírgula |

**Objetivos disponíveis:**
- Perder peso
- Ganhar massa muscular
- Manter peso
- Melhorar condicionamento
- Reabilitação

### 2.5 Registro de Histórico de Peso

**Rota:** `/profile`

Abaixo do formulário de perfil, uma seção dedicada ao acompanhamento de evolução corporal:

- **Input de nova entrada:** Campo de peso + botão "Registrar"
- **Histórico:** Lista das últimas 10 entradas com data e peso
- **Indicadores comparativos:** Cada entrada (exceto a primeira) exibe a variação em relação à entrada anterior:

| Objetivo do aluno | Ganho de peso | Perda de peso |
|---|---|---|
| Ganhar massa muscular | `↑ +1,2kg` (verde — positivo) | `↓ -0,8kg` (vermelho — negativo) |
| Perder peso | `↑ +1,2kg` (vermelho — negativo) | `↓ -0,8kg` (verde — positivo) |
| Manter peso / outros | `↑ +1,2kg` (neutro) | `↓ -0,8kg` (neutro) |

O sistema interpreta a variação de peso de acordo com o objetivo declarado pelo aluno, tornando o feedback visualmente adequado para cada contexto.

---

## 3. Funcionalidades do Instrutor (INSTRUCTOR)

### 3.1 Lista de Alunos

**Rota:** `/instructor/students`

Exibe todos os alunos cadastrados no sistema com:
- Nome completo
- E-mail
- Badge de status ativo/inativo
- Link para a página de detalhe do aluno

### 3.2 Ativar / Desativar Aluno

**Rota:** `/instructor/students/[studentId]`

O instrutor pode alternar o status `isActive` de um aluno com um toggle. O efeito é imediato:

- **Desativar:** O aluno é impedido de fazer login. Se já estiver logado, será desconectado na próxima verificação de sessão
- **Ativar:** O aluno passa a conseguir fazer login normalmente

Isso permite que instrutores suspendam temporariamente alunos sem excluir seus dados ou plano de treino.

### 3.3 Visualização de Dados do Aluno

**Rota:** `/instructor/students/[studentId]`

O instrutor visualiza o perfil completo do aluno:
- Nome, e-mail, idade, telefone, objetivo
- Composição corporal: altura, peso, IMC implícito
- Histórico de peso com indicadores de variação (mesma lógica da visão do aluno)
- Histórico de atividade: últimas 30 conclusões de exercícios com data e nome do exercício

### 3.4 Métricas de Desempenho

**Rota:** `/instructor/students/[studentId]`

Seção exibida dentro do card do aluno, após o histórico de peso. Apresenta indicadores calculados automaticamente a partir dos dados de conclusão de exercícios e registros de peso.

**Métricas exibidas:**

| Métrica | Descrição | Colorização |
|---|---|---|
| **Aderência 7 dias** | % de exercícios concluídos vs. atribuídos nos últimos 7 dias | ≥80% verde · ≥50% âmbar · <50% vermelho · sem plano `–` |
| **Aderência 30 dias** | Mesma lógica para os últimos 30 dias | Idem |
| **Sequência** | Número de dias consecutivos com pelo menos uma conclusão | Neutro |
| **Sessões** | Dias distintos com treino realizado nos últimos 30 dias | Neutro |
| **Grupo mais treinado** | Grupo muscular com mais conclusões nos últimos 30 dias | Neutro |

**Tendência de peso:** badge exibido abaixo dos tiles quando há pelo menos 2 registros de peso. Compara o registro mais recente com os dois anteriores e exibe:
- `↑ Ganhando peso` (vermelho)
- `↓ Perdendo peso` (verde)
- `→ Estável` (âmbar)

**Estado de carregamento:** tiles exibem `–` com animação de pulse enquanto os dados são buscados via tRPC.

### 3.5 Editor de Plano de Treino

**Rota:** `/instructor/students/[studentId]`

Interface para o instrutor montar o plano de treino semanal de um aluno.

**Estrutura do plano:**
- Cada aluno tem até 7 planos de treino (um por dia da semana)
- Cada plano tem um título e uma lista ordenada de exercícios
- Os exercícios têm séries (`sets`), repetições (`reps`) e/ou duração (`durationSecs`)

**Operações disponíveis:**

| Operação | Descrição |
|---|---|
| Criar plano do dia | Define treino para um dia que ainda não tem plano |
| Editar título | Atualiza o nome do treino (ex: "Treino A - Superior") |
| Adicionar exercício | Seleciona exercício existente e define séries/reps/duração |
| Remover exercício | Remove o item do plano sem excluir o exercício base |
| Reordenar exercícios | Ajusta a ordem de execução dos exercícios |
| Excluir plano do dia | Remove todo o treino de um dia específico |

Todas as alterações são persistidas imediatamente via tRPC mutations sem necessidade de salvar manualmente.

### 3.6 Criação de Exercícios Personalizados

**Rota:** `/instructor/students/[studentId]`

O instrutor pode criar exercícios customizados além do catálogo padrão:

**Campos:**
- Nome do exercício (obrigatório)
- Grupo muscular (obrigatório)
- Descrição (opcional)

O exercício criado fica vinculado ao instrutor (`creatorId`) e disponível para ser adicionado a qualquer plano de treino.

---

## 4. Navegação e Layout

### 4.1 Cabeçalho Responsivo

Presente em todas as páginas autenticadas. O conteúdo varia por role:

**Links de navegação — STUDENT:**
- Treino de hoje → `/workouts`
- Agenda → `/schedule`
- Perfil → `/profile`
- Sair (com modal de confirmação)

**Links de navegação — INSTRUCTOR:**
- Alunos → `/instructor/students`
- Sair (com modal de confirmação)

### 4.2 Estados de Carregamento

Todas as páginas têm um estado de skeleton loader exibido durante o carregamento de dados:
- O cabeçalho exibe um skeleton enquanto a sessão é verificada
- Cada página tem um arquivo `loading.tsx` que o Next.js exibe automaticamente durante o data-fetching

---

## 5. Fluxos do Sistema

### 5.1 Fluxo do Aluno — Dia típico

```
Login
  └─ /workouts (treino do dia)
       ├─ Marca exercícios como feitos
       ├─ Barra de progresso atualiza
       └─ Banner de celebração ao concluir todos
```

### 5.2 Fluxo do Instrutor — Configuração de aluno

```
Login
  └─ /instructor/students (lista de alunos)
       └─ Seleciona aluno → /instructor/students/[id]
            ├─ Ativa a conta do aluno (isActive = true)
            ├─ Cria exercícios customizados (se necessário)
            └─ Monta o plano semanal:
                 ├─ Seleciona um dia da semana
                 ├─ Define título do treino
                 └─ Adiciona exercícios com séries/reps
```

### 5.3 Fluxo de primeiro acesso do aluno

```
Aluno cria conta em /sign-up
  └─ Conta criada com isActive = false
       └─ Tenta fazer login → bloqueado com mensagem de erro
            └─ Instrutor acessa a conta do aluno e ativa (isActive = true)
                 └─ Aluno faz login → redirecionado para /workouts
```

---

## 6. Regras de Negócio

| Regra | Descrição |
|---|---|
| Unicidade de treino por dia | Um aluno não pode ter dois planos para o mesmo dia da semana (`@@unique([studentId, dayOfWeek])`) |
| Unicidade de conclusão | Um exercício só pode ser marcado como feito uma vez por data (`@@unique([studentId, studentWorkoutItemId, date])`) |
| Controle de acesso por role | Rotas `/instructor/*` bloqueiam alunos; rotas `/workouts`, `/schedule`, `/profile` bloqueiam instrutores |
| Conta inativa | `isActive = false` bloqueia login independente de credenciais corretas |
| Progresso histórico | Conclusões de exercícios são armazenadas com data, permitindo retroativamente consultar qualquer semana |

---

## 7. Modelo de Dados em Resumo

O sistema é sustentado por 10 tabelas no banco de dados PostgreSQL:

| Tabela | Propósito |
|---|---|
| `User` | Dados de autenticação e role (Better Auth) |
| `UserProfile` | Dados pessoais e de saúde do aluno |
| `WeightEntry` | Histórico de registros de peso |
| `Exercise` | Catálogo de exercícios (base e customizados) |
| `StudentWorkout` | Plano de treino atribuído a um aluno em um dia |
| `StudentWorkoutItem` | Exercício dentro de um plano de treino |
| `ExerciseCompletion` | Registro de conclusão de exercício por data |
| `Session` | Sessões ativas dos usuários (Better Auth) |
| `Account` | Contas OAuth vinculadas (Better Auth) |
| `Verification` | Tokens de verificação de e-mail (Better Auth) |

---

## 8. Localização

Toda a interface está em **português brasileiro (pt-BR)**:
- Dias da semana, datas e meses no formato brasileiro
- Mensagens de erro e validação em português
- Atributo `lang="pt-BR"` no `<html>` para leitores de tela
- Textos de status, botões, labels e feedbacks em PT-BR

---

## Resumo de Funcionalidades por Perfil

| Funcionalidade | Aluno | Instrutor |
|---|---|---|
| Login / Logout | ✓ | ✓ |
| Cadastro de conta | ✓ | — |
| Ver treino do dia | ✓ | — |
| Marcar exercício como feito | ✓ | — |
| Ver agenda semanal | ✓ | — |
| Editar perfil pessoal | ✓ | — |
| Registrar peso | ✓ | — |
| Ver histórico de peso | ✓ | ✓ (do aluno) |
| Ver métricas de desempenho | — | ✓ |
| Listar alunos | — | ✓ |
| Ativar / desativar aluno | — | ✓ |
| Ver dados do aluno | — | ✓ |
| Ver histórico de atividade do aluno | — | ✓ |
| Criar plano de treino | — | ✓ |
| Editar plano de treino | — | ✓ |
| Criar exercícios personalizados | — | ✓ |
