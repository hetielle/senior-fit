# SeniorFit — Relatório de Acessibilidade e UX para Idosos

Este documento registra todas as decisões de design e melhorias de experiência do usuário implementadas no SeniorFit com foco no público idoso. Serve como referência para apresentação acadêmica.

---

## 1. Contexto

O SeniorFit é uma aplicação web de acompanhamento de treinos físicos voltada para alunos idosos de academias. O público-alvo apresenta características que impõem requisitos específicos de usabilidade:

- Maior dificuldade motora fina (toque impreciso em telas)
- Acuidade visual reduzida (necessidade de textos e elementos maiores)
- Menor familiaridade com interfaces digitais (necessidade de affordances claras)
- Uso predominante de dispositivos móveis
- Susceptibilidade a ansiedade diante de erros ou ações irreversíveis

---

## 2. Melhorias de Tipografia e Escala Visual

### Problema
A interface original utilizava tamanhos de fonte padrão (12–16px) e elementos interativos com dimensões mínimas inadequadas para o público idoso.

### Solução
Todos os tamanhos tipográficos foram revisados e aumentados sistematicamente:

| Elemento | Antes | Depois |
|---|---|---|
| Títulos de página | `text-3xl` (30px) | `text-4xl` (36px) |
| Nome do exercício | `text-base` (16px) | `text-xl` (20px) |
| Labels de formulário | `text-sm` (14px) | `text-base–text-lg` (16–18px) |
| Texto de navegação | `text-sm` (14px) | `text-base` (16px) |
| Subtítulos e datas | `text-sm` (14px) | `text-base` (16px) |

Pesos de fonte foram elevados de `font-medium` para `font-semibold` e `font-bold` para melhor contraste visual sem depender exclusivamente de cor.

---

## 3. Alvos de Toque (Touch Targets)

### Problema
Os botões interativos tinham dimensões abaixo do mínimo recomendado. O botão de marcação de exercício media 28×28px (`h-7 w-7`), menos que a metade do recomendado pela Apple (44px) e Google (48px).

### Solução

| Elemento | Antes | Depois |
|---|---|---|
| Botão de completar exercício | 28×28px | 48×64px mínimo |
| Botões de formulário | 40px altura | 56px altura |
| Links de navegação (header) | `px-4 py-2` | `px-5 py-3` |
| Botão "Ver exercício" (agenda) | Chevron invisível | Botão com texto, mínimo 44px |
| Botões do editor (instrutor) | 24×24px | 36×36px |

---

## 4. Responsividade para Dispositivos Móveis

### Problema
A aplicação foi inicialmente desenvolvida sem adaptação para telas pequenas, resultando em:
- Cabeçalho transbordando horizontalmente em telas de 375px
- Formulários com grade de 2 colunas cramped em mobile
- Login card com largura fixa de 50% sem fallback responsivo
- Logo ocupando espaço lateral sem utilidade em mobile

### Solução

**Viewport meta tag** adicionada via export `Viewport` no `layout.tsx`:
```ts
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};
```

**Cabeçalho responsivo**: padding reduzido (`px-4`) em mobile; logo 100px; nav com `text-sm px-2` em mobile, expandindo para `text-base px-5` em `sm:` (640px+).

**Login/Cadastro**: Logo aparece dentro do card em mobile (`block sm:hidden`) e ao lado em desktop (`hidden sm:block`). Card usa `w-full margin: 1rem` em mobile e `max-w-lg` em desktop.

**Grids de formulário**: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`. Campos de formulário ocupam a largura total em mobile, permitindo inputs confortáveis.

**Formulário de peso**: `flex-row` → `flex-col sm:flex-row`, evitando inputs e botões cramped lado a lado em mobile.

**Body comp stats (instrutor)**: `flex-wrap` com `min-width: 80px` por stat, permitindo wrap gracioso em telas estreitas.

---

## 5. Feedback Tátil (Estados `active:`)

### Problema
Interações touch em mobile não geravam resposta visual, pois os estados `hover:` do CSS não são ativados por toque.

### Solução
Estados `active:` adicionados em todos os elementos interativos:
- Botões: `active:scale-95` (check de exercício), `active:bg-*` (botões primários)
- Cards de aluno: `active:bg-zinc-50 active:border-zinc-400`
- Links de navegação: `active:bg-zinc-100`
- Botão "Ver exercício": `active:bg-zinc-100`

---

## 6. Confirmação antes de Sair (Logout)

### Problema
O botão "Sair" executava o logout imediatamente. Idosos que tocam o botão por acidente perdem a sessão sem possibilidade de cancelar, causando confusão e necessidade de re-autenticar.

### Solução
`LogoutButton.tsx` foi atualizado para exibir um modal de confirmação com duas etapas:

1. Toque em "Sair" → abre modal com pergunta **"Deseja sair da sua conta?"**
2. Usuário escolhe **"Cancelar"** (fecha modal) ou **"Sair"** (executa logout)

O modal pode ser fechado tocando fora dele (`onClick` no overlay).

---

## 7. Celebração ao Concluir Treino

### Problema
Ao marcar o último exercício como feito, nenhum feedback especial era apresentado. Para um público idoso que pode ter dificuldade em perceber mudanças sutis de estado, a ausência de confirmação positiva é desmotivante.

### Solução
O componente `ExerciseList.tsx` exibe um banner de celebração quando `completedIds.size === items.length`:

```
🎉  Treino concluído!
    Parabéns! Você completou todos os exercícios de hoje.
```

O banner é estilizado em verde, com ícone grande, proporcionando reforço positivo claro e imediato.

---

## 8. Botão de Completar com Texto

### Problema
O botão de marcar exercício como feito exibia apenas o caractere `○` (círculo vazio), sem indicação verbal de sua função. Idosos menos familiarizados com padrões de UI podem não reconhecer esse símbolo como ação.

### Solução
O botão passou a exibir o texto **"Feito?"** no estado não completado e **"✓"** no estado completado, com `aria-label` descritivo ("Marcar exercício como feito" / "Desmarcar exercício") para leitores de tela.

---

## 9. Exibir/Ocultar Senha

### Problema
Campos de senha mostram apenas `••••••••`. Idosos, que tendem a cometer mais erros de digitação, não conseguem verificar o que foi digitado, levando a tentativas de login frustradas.

### Solução
Ambos os formulários (`LoginForm.tsx` e `SignUpForm.tsx`) receberam um botão **"Mostrar" / "Ocultar"** posicionado dentro do campo de senha. O toggle alterna o `type` do input entre `"password"` e `"text"`. Em formulários de cadastro, cada campo de senha possui seu próprio toggle independente.

---

## 10. Autocompletar e Teclado Correto em Formulários

### Problema
Ausência de atributos `autocomplete` impede que o navegador e gerenciadores de senha preencham automaticamente os campos. Ausência de `inputMode` faz com que teclados numéricos não sejam acionados em campos de número.

### Solução

**Atributos `autocomplete` adicionados:**

| Campo | Valor |
|---|---|
| Nome (login/cadastro) | `name` |
| E-mail | `email` |
| Senha (login) | `current-password` |
| Senha (cadastro) | `new-password` |
| Telefone (perfil) | `tel` |

**Atributos `inputMode` adicionados:**

| Campo | Valor |
|---|---|
| Idade | `numeric` → abre teclado numérico |
| Telefone | `tel` → abre teclado telefônico |
| Altura | `decimal` → abre teclado numérico com vírgula |
| Peso | `decimal` → abre teclado numérico com vírgula |

---

## 11. Mensagens de Erro Amigáveis

### Problema
Erros da API de autenticação eram exibidos em inglês técnico (ex: `"User already exists"`), incompreensíveis para o usuário idoso.

### Solução
`SignUpForm.tsx` implementa um mapa de tradução que converte mensagens de erro conhecidas para português claro:

| Erro original | Mensagem exibida |
|---|---|
| `User already exists` | "Já existe uma conta com este e-mail. Tente entrar ou use outro e-mail." |
| `Invalid email` | "O e-mail informado não é válido." |
| `Password too short` | "A senha deve ter pelo menos 8 caracteres." |
| Desconhecido | "Ocorreu um erro ao criar a conta. Tente novamente." |

Todos os erros incluem `role="alert"` para leitores de tela anunciarem a mensagem imediatamente.

---

## 12. Botão "Ver exercício" na Agenda Semanal

### Problema
A agenda semanal usava o caractere `▼` como indicação de expansão de item. Esse elemento não tem affordance clara de botão — idosos podem não saber que é clicável, e o alvo de toque era mínimo.

### Solução
Substituído por um `<button>` com texto explícito:
- Estado recolhido: **"Ver exercício ▼"**
- Estado expandido: **"Recolher ▲"**

O botão tem `min-height: 44px`, `aria-expanded` para acessibilidade, e estado `active:` para feedback tátil.

---

## 13. Animações Respeitam Preferência do Usuário

### Problema
As animações dos SVGs de exercícios (19 no total) executam continuamente. Usuários idosos com desordens vestibulares ou fotossensibilidade podem experienciar desconforto com movimento contínuo na tela.

### Solução
Adicionado em `ExerciseSvg.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .exercise-svg * {
    animation: none !important;
  }
}
```

Isso pausa todas as animações quando o usuário ativa "Reduzir movimento" nas configurações de acessibilidade do sistema operacional (iOS, Android, macOS, Windows).

---

## 14. Link de Voltar na Tela de Detalhe do Aluno

### Problema
A navegação da visão de instrutor não oferecia caminho de retorno explícito da tela de detalhe do aluno para a lista de alunos. O único recurso era o botão "Voltar" do navegador, que não é sempre visível em mobile.

### Solução
Adicionado link **"← Voltar para alunos"** no topo do conteúdo da página de detalhe, antes do card do aluno.

---

## 15. Idioma do Documento

O atributo `lang` do elemento `<html>` foi corrigido de `"en"` para `"pt-BR"`:

```tsx
<html lang="pt-BR">
```

Isso garante que leitores de tela (como VoiceOver e TalkBack, usados por idosos com deficiência visual) pronunciem o português corretamente, com a prosódia e fonemas adequados.

---

## Resumo das Mudanças por Arquivo

| Arquivo | Melhorias |
|---|---|
| `layout.tsx` | Viewport meta tag; `lang="pt-BR"` |
| `globals.css` | Header responsivo; modal de confirmação de logout; estados `active:` |
| `page.css` | Login card responsivo; logo mobile; password toggle; role options empilhadas |
| `page.tsx` / `sign-up/page.tsx` | Logo dentro do card em mobile |
| `workouts/page.css` | Touch targets; banner de celebração; fontes maiores |
| `schedule/page.css` | Botão "Ver exercício" com texto; touch targets |
| `profile/page.css` | Grid responsivo; formulário de peso empilhado |
| `profile/page.tsx` | `inputMode`; `autoComplete` em todos os campos |
| `instructor/students/page.css` | Cards responsivos; estados `active:` |
| `instructor/students/[studentId]/page.css` | Grids responsivos; inputs do editor responsivos; link "Voltar" |
| `instructor/students/[studentId]/page.tsx` | Link "← Voltar para alunos" |
| `LogoutButton.tsx` | Modal de confirmação antes do logout |
| `ExerciseList.tsx` | Banner de celebração; botão "Feito?" com texto |
| `LoginForm.tsx` | `autoComplete`; password toggle; `role="alert"` em erros; tipo `FormEvent` corrigido |
| `SignUpForm.tsx` | `autoComplete`; password toggle; erros amigáveis em PT; tipo `FormEvent` corrigido |
| `ExerciseSvg.css` | `prefers-reduced-motion` pausa todas as animações |
| `ScheduleExerciseList.tsx` | Botão explícito com `aria-expanded` substitui chevron invisível |
