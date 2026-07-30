# SeniorFit — Casos de Uso

Este documento descreve formalmente os casos de uso do SeniorFit, identificando os atores, seus objetivos e os fluxos de interação com o sistema. Serve como referência para apresentação acadêmica.

---

## 1. Atores

| Ator | Descrição |
|---|---|
| **Aluno** | Usuário idoso cadastrado no sistema que realiza treinos. Possui `role = "STUDENT"`. |
| **Instrutor** | Profissional de educação física que monta os planos de treino. Possui `role = "INSTRUCTOR"`. |
| **Sistema** | O próprio SeniorFit, responsável por regras automáticas de negócio. |
| **Better Auth** | Subsistema externo de autenticação responsável por sessões e credenciais. |

---

## 2. Diagrama de Casos de Uso (Textual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SENIORFIT                                 │
│                                                                     │
│  ┌───────────────┐   UC01 Criar conta          ┌────────────────┐  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC02 Fazer login           │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC03 Fazer logout          │                │  │
│  │     Aluno     │──────────────────────────►  │    Sistema     │  │
│  │               │   UC04 Ver treino do dia     │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC05 Marcar exercício      │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC06 Ver agenda semanal    │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC07 Editar perfil         │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC08 Registrar peso        │                │  │
│  └───────────────┘──────────────────────────►  │                │  │
│                                                 │                │  │
│  ┌───────────────┐   UC09 Ver lista de alunos   │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC10 Ativar/desativar aluno│                │  │
│  │               │──────────────────────────►  │                │  │
│  │   Instrutor   │   UC11 Ver dados do aluno    │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC12 Criar plano de treino │                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC13 Editar plano de treino│                │  │
│  │               │──────────────────────────►  │                │  │
│  │               │   UC14 Criar exercício       │                │  │
│  └───────────────┘──────────────────────────►  └────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificações de Casos de Uso

---

### UC01 — Criar Conta

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Nenhuma |
| **Pós-condição** | Conta criada com `isActive = false`; aluno aguarda ativação pelo instrutor |

**Fluxo principal:**
1. O aluno acessa `/sign-up`
2. Preenche nome, e-mail e senha
3. O sistema valida: formato de e-mail, senha mínima de 8 caracteres, e-mail não duplicado
4. O sistema cria a conta com `role = "STUDENT"` e `isActive = false`
5. O sistema cria uma sessão e redireciona para `/workouts`
6. A página exibe aviso de conta inativa

**Fluxos alternativos:**

- **3a. E-mail já cadastrado:** Sistema exibe _"Já existe uma conta com este e-mail."_
- **3b. Senha muito curta:** Sistema exibe _"A senha deve ter pelo menos 8 caracteres."_
- **3c. E-mail inválido:** Sistema exibe _"O e-mail informado não é válido."_

---

### UC02 — Fazer Login

| | |
|---|---|
| **Ator principal** | Aluno ou Instrutor |
| **Pré-condição** | Conta existente no sistema |
| **Pós-condição** | Sessão criada; usuário redirecionado para sua área |

**Fluxo principal:**
1. O usuário acessa `/`
2. Preenche e-mail e senha
3. O sistema valida as credenciais
4. O sistema verifica `isActive`:
   - Se `false`: efetua logout imediato, exibe _"Conta inativa. Entre em contato com seu instrutor."_
5. O sistema verifica `role`:
   - `"STUDENT"` → redireciona para `/workouts`
   - `"INSTRUCTOR"` → redireciona para `/instructor/students`

**Fluxos alternativos:**

- **3a. Credenciais inválidas:** Sistema exibe mensagem de erro genérica
- **4a. Conta inativa:** Logout automático, mensagem exibida, usuário permanece em `/`

---

### UC03 — Fazer Logout

| | |
|---|---|
| **Ator principal** | Aluno ou Instrutor |
| **Pré-condição** | Usuário autenticado |
| **Pós-condição** | Sessão encerrada; cookie invalidado; usuário em `/` |

**Fluxo principal:**
1. O usuário clica em "Sair" no cabeçalho
2. O sistema exibe modal de confirmação: _"Deseja sair da sua conta?"_
3. O usuário confirma clicando em "Sair"
4. O sistema encerra a sessão no banco e invalida o cookie
5. O usuário é redirecionado para `/`

**Fluxos alternativos:**

- **3a. Usuário clica "Cancelar":** Modal fechado, usuário permanece na página atual
- **3b. Usuário clica fora do modal:** Modal fechado, sem logout

---

### UC04 — Ver Treino do Dia

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Aluno autenticado e com `isActive = true` |
| **Pós-condição** | Aluno visualiza os exercícios do dia |

**Fluxo principal:**
1. O aluno acessa `/workouts`
2. O sistema identifica o dia da semana atual
3. O sistema busca o `StudentWorkout` do aluno para esse dia
4. O sistema exibe: título do treino, lista de exercícios com nome, grupo muscular, séries/reps/duração e ícone SVG animado
5. Para cada exercício já concluído hoje, o botão aparece no estado "✓"
6. A barra de progresso exibe `X / N exercícios concluídos`

**Fluxos alternativos:**

- **3a. Sem plano para o dia:** Sistema exibe _"Dia de descanso"_ ou _"Nenhum treino atribuído para hoje"_
- **3b. Plano sem exercícios:** Sistema exibe lista vazia com mensagem informativa

---

### UC05 — Marcar Exercício como Concluído

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Aluno autenticado; treino do dia carregado |
| **Pós-condição** | Conclusão registrada (ou removida) no banco |

**Fluxo principal:**
1. O aluno toca o botão _"Feito?"_ em um exercício
2. O sistema registra um `ExerciseCompletion` com a data atual
3. O botão muda para _"✓"_
4. A barra de progresso atualiza
5. Se todos os exercícios foram concluídos, o banner de celebração é exibido

**Fluxo alternativo — Desmarcar:**

- **1a.** O aluno toca o botão _"✓"_ (exercício já concluído)
- **2a.** O sistema remove o `ExerciseCompletion` correspondente
- **3a.** O botão retorna para _"Feito?"_
- **4a.** A barra de progresso reduz

---

### UC06 — Ver Agenda Semanal

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Aluno autenticado |
| **Pós-condição** | Aluno visualiza o status de cada dia da semana |

**Fluxo principal:**
1. O aluno acessa `/schedule`
2. O sistema busca os planos de treino do aluno para os 7 dias da semana
3. Para cada dia, o sistema determina o status:
   - Sem plano → _"Descanso"_
   - Todos os exercícios concluídos → _"✓ Concluído"_ (verde)
   - Parte concluída → _"X/Y"_ (número de concluídos)
   - Data passada sem conclusões → _"Não realizado"_ (vermelho)
4. O aluno pode expandir qualquer dia para ver os exercícios listados

---

### UC07 — Editar Perfil

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Aluno autenticado |
| **Pós-condição** | Dados de perfil salvos no banco |

**Fluxo principal:**
1. O aluno acessa `/profile`
2. O sistema carrega os dados atuais do perfil (ou campos vazios se primeiro acesso)
3. O aluno edita: nome, idade, telefone, objetivo, altura, peso
4. O aluno submete o formulário
5. O sistema valida os campos e faz `upsert` no `UserProfile`
6. Confirmação visual de salvamento exibida

---

### UC08 — Registrar Peso

| | |
|---|---|
| **Ator principal** | Aluno |
| **Pré-condição** | Aluno autenticado; na página `/profile` |
| **Pós-condição** | Nova entrada de peso adicionada ao histórico |

**Fluxo principal:**
1. O aluno insere um valor de peso no campo dedicado
2. O aluno clica em _"Registrar"_
3. O sistema cria um `WeightEntry` com o peso e a data atual
4. A lista de histórico atualiza com a nova entrada
5. O sistema exibe indicador de variação em relação à entrada anterior:
   - Seta verde/vermelha baseada no objetivo do aluno

---

### UC09 — Ver Lista de Alunos

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado |
| **Pós-condição** | Instrutor visualiza todos os alunos cadastrados |

**Fluxo principal:**
1. O instrutor acessa `/instructor/students`
2. O sistema busca todos os usuários com `role = "STUDENT"`
3. O sistema exibe: nome, e-mail e badge de ativo/inativo para cada aluno
4. O instrutor pode clicar em um aluno para acessar sua página de detalhe

---

### UC10 — Ativar / Desativar Aluno

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado; na página de detalhe do aluno |
| **Pós-condição** | `isActive` do aluno atualizado no banco |

**Fluxo principal:**
1. O instrutor acessa `/instructor/students/[studentId]`
2. O instrutor clica no toggle de ativo/inativo
3. O sistema inverte o valor de `isActive` do aluno
4. O badge de status atualiza na tela

**Efeito colateral — Desativação:**
- Na próxima tentativa de login, o aluno receberá a mensagem de conta inativa
- Sessões existentes do aluno não são encerradas imediatamente (expiram naturalmente)

**Efeito colateral — Ativação:**
- O aluno passa a conseguir fazer login normalmente

---

### UC11 — Ver Dados do Aluno

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado |
| **Pós-condição** | Instrutor visualiza informações completas do aluno |

**Fluxo principal:**
1. O instrutor clica em um aluno na lista
2. O sistema exibe:
   - Dados pessoais: nome, e-mail, idade, telefone, objetivo
   - Composição corporal: altura, peso atual
   - Histórico de peso com indicadores de variação
   - Métricas de desempenho: aderência 7d e 30d, sequência, sessões no mês, grupo muscular mais treinado, tendência de peso
   - Histórico de atividade: últimas 30 conclusões de exercícios com data

---

### UC12 — Criar Plano de Treino

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado; na página de detalhe do aluno; dia selecionado sem plano |
| **Pós-condição** | `StudentWorkout` criado para o aluno no dia selecionado |

**Fluxo principal:**
1. O instrutor seleciona um dia da semana sem plano no editor
2. O instrutor define o título do treino (ex: _"Treino A - Superior"_)
3. O sistema cria um `StudentWorkout` vinculando o aluno, o instrutor e o dia
4. O editor exibe a lista de exercícios (vazia inicialmente)

**Restrição:** Cada aluno pode ter no máximo um plano por dia da semana.

---

### UC13 — Editar Plano de Treino

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado; plano existente para o dia selecionado |
| **Pós-condição** | Plano atualizado no banco |

**Fluxo principal (adicionar exercício):**
1. O instrutor seleciona um exercício do catálogo
2. Define séries, repetições e/ou duração
3. O sistema adiciona um `StudentWorkoutItem` ao final da lista

**Fluxo alternativo (remover exercício):**
1. O instrutor clica no botão de remoção de um item
2. O sistema remove o `StudentWorkoutItem` e todas as `ExerciseCompletion` vinculadas (cascade)

**Fluxo alternativo (reordenar):**
1. O instrutor altera a ordem dos exercícios
2. O sistema atualiza o campo `order` dos itens afetados

**Fluxo alternativo (excluir plano do dia):**
1. O instrutor solicita exclusão do plano inteiro de um dia
2. O sistema remove o `StudentWorkout` e, em cascata, todos os `StudentWorkoutItem` e `ExerciseCompletion` associados

---

### UC14 — Criar Exercício Personalizado

| | |
|---|---|
| **Ator principal** | Instrutor |
| **Pré-condição** | Instrutor autenticado |
| **Pós-condição** | Novo `Exercise` criado com `creatorId` do instrutor |

**Fluxo principal:**
1. O instrutor acessa o formulário de novo exercício na página de detalhe de um aluno
2. Preenche: nome, grupo muscular e descrição (opcional)
3. O sistema valida os campos obrigatórios
4. O sistema cria o exercício vinculado ao instrutor
5. O exercício fica disponível imediatamente no seletor do editor de treino

---

## 4. Resumo por Ator

### Aluno

| # | Caso de Uso | Frequência esperada |
|---|---|---|
| UC01 | Criar conta | Uma vez |
| UC02 | Fazer login | Diária |
| UC03 | Fazer logout | Diária |
| UC04 | Ver treino do dia | Diária |
| UC05 | Marcar exercício como concluído | Múltiplas vezes por dia |
| UC06 | Ver agenda semanal | Semanal |
| UC07 | Editar perfil | Esporádica |
| UC08 | Registrar peso | Semanal |

### Instrutor

| # | Caso de Uso | Frequência esperada |
|---|---|---|
| UC02 | Fazer login | Diária |
| UC03 | Fazer logout | Diária |
| UC09 | Ver lista de alunos | Diária |
| UC10 | Ativar / desativar aluno | Esporádica |
| UC11 | Ver dados e métricas do aluno | Semanal |
| UC12 | Criar plano de treino | Esporádica (setup inicial) |
| UC13 | Editar plano de treino | Semanal |
| UC14 | Criar exercício personalizado | Esporádica |
