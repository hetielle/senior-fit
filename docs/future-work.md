# SeniorFit — Limitações e Trabalhos Futuros

Este documento registra as limitações atuais do SeniorFit e as evoluções funcionais e técnicas identificadas como trabalho futuro. Serve como referência para a seção de conclusão do artigo acadêmico.

---

## 1. Limitações Atuais

### 1.1 Ausência de Testes Automatizados

O SeniorFit não possui suíte de testes automatizados. A validação foi realizada exclusivamente por testes manuais durante o desenvolvimento. Isso implica:

- **Risco de regressão:** Uma alteração em um módulo pode introduzir bugs em outro sem detecção imediata
- **Cobertura limitada:** Cenários de borda (ex: dois usuários marcando o mesmo exercício simultaneamente) não foram sistematicamente verificados
- **Ausência de CI confiável:** Sem testes, um pipeline de integração contínua não pode garantir a integridade do sistema a cada commit

A principal mitigação adotada foi o TypeScript em modo strict, que elimina uma classe inteira de bugs em tempo de compilação — mas não substitui testes de comportamento em runtime.

### 1.2 Ausência de Validação com Usuários Reais

As decisões de UX e acessibilidade para o público idoso foram baseadas em diretrizes estabelecidas (WCAG 2.1, Apple Human Interface Guidelines, Google Material Design) e não em testes com usuários reais do público-alvo. Isso significa que:

- Suposições sobre dificuldades do público idoso podem não corresponder às dificuldades reais dos usuários finais
- A eficácia das escolhas de acessibilidade (tamanho de fonte, alvos de toque, feedback tátil) não foi medida empiricamente
- Fluxos que parecem intuitivos para o desenvolvedor podem apresentar barreiras não previstas para o usuário idoso

### 1.3 Sem Suporte a Múltiplos Instrutores por Aluno

O modelo de dados associa cada `StudentWorkout` a exatamente um instrutor (`instructorId`). Um aluno não pode ter planos criados por instrutores diferentes — por exemplo, um instrutor de musculação e um de pilates.

### 1.4 Sem Comunicação entre Instrutor e Aluno

Não há canal de comunicação dentro do sistema. Dúvidas sobre exercícios, ajustes de carga ou feedback de treino precisam ocorrer por fora da plataforma (telefone, WhatsApp).

### 1.5 Sem Notificações

O sistema não envia lembretes de treino, notificações de novos planos atribuídos ou alertas de inatividade. O aluno precisa acessar ativamente o sistema para verificar seu treino.

### 1.6 Acesso Exclusivamente via Browser

Não existe versão mobile nativa. O acesso se dá pelo navegador do dispositivo. Embora o sistema seja responsivo, a experiência em dispositivos móveis é inferior à de um aplicativo nativo em aspectos como:

- Ausência de ícone na tela inicial do dispositivo (sem PWA configurado)
- Sem acesso offline
- Sem integração com recursos nativos (câmera, notificações push nativas, biometria)

### 1.7 Ativação Manual de Alunos

Novos alunos entram com `isActive = false` e precisam ser ativados manualmente pelo instrutor no banco de dados ou pela interface. Não há fluxo de convite ou aprovação automatizado — o instrutor precisa saber que um novo aluno se cadastrou.

### 1.8 Sem Deploy em Produção

O sistema foi desenvolvido e validado em ambiente local. Não foi realizado deploy em infraestrutura de produção, portanto aspectos como escalabilidade, disponibilidade, segurança de rede e custos operacionais não foram avaliados.

---

## 2. Trabalhos Futuros

### 2.1 Aplicativo Mobile Nativo

**Descrição:** Desenvolver um aplicativo para iOS e Android usando **React Native** (preferencialmente com **Expo**), compartilhando a lógica de negócio do backend atual via tRPC.

**Justificativa:** O público idoso tende a usar predominantemente smartphones. Um aplicativo nativo oferece:
- Ícone acessível na tela inicial, sem precisar abrir o browser
- Notificações push nativas (lembrete de treino)
- Acesso offline para visualizar o treino mesmo sem internet
- Melhor integração com o sistema operacional (tamanho de fonte do sistema, modo escuro automático)

**Viabilidade técnica:** O backend tRPC é agnóstico de cliente — o mesmo router que serve a interface web pode servir um app React Native sem alterações.

---

### 2.2 Notificações Push de Lembrete de Treino

**Descrição:** Enviar notificações push nos dias em que o aluno tem treino atribuído, lembrando-o de realizar os exercícios.

**Justificativa:** Idosos podem esquecer de acessar o sistema regularmente. Um lembrete no horário preferido aumenta a aderência ao plano de treino — um dos principais desafios de programas de atividade física para essa faixa etária.

**Implementação sugerida:**
- Configuração de horário preferido de lembrete no perfil do aluno
- Backend com job agendado (cron) que verifica alunos com treino no dia e sem conclusões
- Envio via **Firebase Cloud Messaging (FCM)** para Android e **APNs** para iOS
- No contexto web: **Web Push API** como alternativa para browsers desktop

---

### 2.3 Comunicação entre Instrutor e Aluno

**Descrição:** Canal de mensagens dentro da plataforma para troca de feedback entre instrutor e aluno.

**Justificativa:** Atualmente, qualquer comunicação ocorre fora do sistema. Integrar um canal de comunicação centraliza a relação instrutor-aluno e permite que o instrutor:
- Responda dúvidas sobre execução de exercícios
- Envie orientações personalizadas
- Notifique o aluno sobre alterações no plano

**Formas de implementação:**
- **Comentários por treino:** Mais simples; o instrutor deixa um comentário no plano do dia e o aluno visualiza ao abrir o treino
- **Chat direto:** Mais complexo; requer WebSockets ou polling; bibliotecas como **Pusher** ou **Socket.io** podem ser utilizadas

---

### 2.4 Suporte a Múltiplos Instrutores por Aluno

**Descrição:** Permitir que um aluno tenha planos de treino criados por mais de um instrutor (ex: musculação + fisioterapia).

**Justificativa:** Em academias maiores ou clínicas de reabilitação, é comum que um idoso seja acompanhado por profissionais de diferentes especialidades simultaneamente.

**Alteração necessária no modelo de dados:**
- Remover `instructorId` do `StudentWorkout` ou torná-lo opcional
- Criar uma tabela de associação `InstructorStudent` para modelar o relacionamento N:N
- Adaptar os guards de autorização para verificar se o instrutor tem vínculo com o aluno antes de permitir edição

---

### 2.5 Testes de Usabilidade com o Público Idoso

**Descrição:** Conduzir sessões de teste de usabilidade com usuários reais da faixa etária-alvo (60+ anos), observando como interagem com a interface e identificando barreiras não previstas.

**Justificativa:** As decisões de acessibilidade implementadas foram baseadas em diretrizes e heurísticas, não em evidência empírica com o público real. Testes com usuários permitiriam:
- Identificar pontos de confusão na navegação
- Validar ou refutar hipóteses sobre tamanho de fonte, alvos de toque e textos de botão
- Medir tempo de conclusão de tarefas (ex: marcar um exercício, registrar peso)
- Coletar dados qualitativos sobre satisfação e confiança no uso

**Metodologia sugerida:** Protocolo de pensamento em voz alta (_think-aloud_) com 5 a 8 participantes, avaliando as tarefas principais (login, marcar treino, ver agenda, registrar peso).

---

### 2.6 Suíte de Testes Automatizados

**Descrição:** Implementar testes em três níveis:

| Nível | Ferramenta sugerida | O que cobre |
|---|---|---|
| **Unitário** | Vitest | Funções utilitárias, lógica de cálculo (indicadores de peso, status de agenda) |
| **Integração** | Vitest + tRPC test client | Procedures tRPC com banco de dados de teste (PostgreSQL em memória ou Docker) |
| **End-to-end** | Playwright | Fluxos completos no browser: login, marcar exercício, criar plano de treino |

**Justificativa:** Com uma suíte de testes, alterações no sistema (novos campos, refatorações) podem ser validadas automaticamente, reduzindo o risco de regressão e aumentando a confiança em deploys.

---

### 2.7 Internacionalização (i18n)

**Descrição:** Suporte a múltiplos idiomas na interface, começando por inglês além do português brasileiro.

**Justificativa:** Embora o público-alvo atual seja brasileiro, a solução técnica poderia ser adotada em outros países com populações envelhecidas. A internacionalização remove essa barreira de expansão.

**Implementação sugerida:**
- Biblioteca **next-intl** integrada ao App Router do Next.js
- Arquivos de tradução JSON por idioma
- Roteamento com prefixo de locale (`/pt-BR/workouts`, `/en/workouts`)

---

### 2.8 Deploy em Produção

**Descrição:** Configurar infraestrutura de produção com pipeline de CI/CD para o sistema estar acessível publicamente.

**Componentes necessários:**

| Componente | Opção sugerida | Alternativa |
|---|---|---|
| Hosting Next.js | Vercel | Railway, Render |
| Banco de dados | Neon (PostgreSQL serverless) | Supabase, Railway PostgreSQL |
| CI/CD | GitHub Actions | — |
| Variáveis de ambiente | Gerenciadas pela plataforma de hosting | — |

**Pipeline sugerido:**
```
Push para main
  └─ GitHub Actions:
      ├─ pnpm typecheck
      ├─ pnpm lint
      ├─ pnpm build
      └─ Deploy automático (Vercel)
```

**Considerações de segurança para produção:**
- HTTPS obrigatório (fornecido pelo Vercel/Railway)
- `BETTER_AUTH_SECRET` rotacionado periodicamente
- Backups automáticos do banco de dados
- Rate limiting nas rotas de autenticação

---

### 2.9 Progressive Web App (PWA)

**Descrição:** Transformar o SeniorFit em uma PWA, permitindo instalação na tela inicial do smartphone sem necessidade de publicação em lojas de aplicativos.

**Justificativa:** É uma evolução incremental da versão web atual que entrega parte dos benefícios de um app nativo com esforço de implementação menor:
- Ícone na tela inicial do dispositivo
- Tela de splash ao abrir
- Funcionamento offline básico (visualizar o treino do dia sem internet)
- Experiência de tela cheia sem barra do browser

**Implementação sugerida:**
- `next-pwa` ou `@ducanh2912/next-pwa` para configuração do Service Worker
- `manifest.json` com ícones, cores e nome da aplicação
- Cache de página do treino do dia para acesso offline

---

## 3. Priorização Sugerida

Considerando o impacto no usuário final e a viabilidade técnica:

| Prioridade | Trabalho futuro | Impacto | Esforço |
|---|---|---|---|
| **Implementado** | Métricas de desempenho para o instrutor | Alto — visibilidade de aderência e progresso | — |
| Alta | 2.2 Notificações push de lembrete | Alto — aderência ao treino | Médio |
| Alta | 2.5 Testes de usabilidade com idosos | Alto — valida todo o produto | Baixo |
| Alta | 2.6 Suíte de testes automatizados | Alto — qualidade do código | Médio |
| Alta | 2.8 Deploy em produção | Alto — uso real do sistema | Médio |
| Média | 2.9 PWA | Médio — melhoria de acesso mobile | Baixo |
| Média | 2.3 Comunicação instrutor-aluno | Médio — experiência do usuário | Alto |
| Média | 2.1 Aplicativo mobile nativo | Médio — canal preferido de idosos | Alto |
| Baixa | 2.4 Múltiplos instrutores por aluno | Baixo para o escopo atual | Médio |
| Baixa | 2.7 Internacionalização | Baixo para o escopo atual | Médio |
