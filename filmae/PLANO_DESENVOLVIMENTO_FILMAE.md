# Plano de Desenvolvimento Filmaê (Histórico de Execução)

> Última atualização: 2026-10-16  
> Responsável: Assistente IA + equipe Filmaê  
> Referências de entrada:
>
> - `C:\Users\rbfernandes\Downloads\Filmae_Contrato_API_Endpoints.docx`
> - `C:\Users\rbfernandes\Downloads\Protótipo Filmaê.zip`

## 1) Objetivo

Concluir a implementação do app Filmaê no padrão do repositório atual (Expo Router + TypeScript estrito), mantendo o backend em aberto via contrato tipado e serviços desacoplados, com entregas faseadas por tela e validação contínua.

## 2) Premissas de implementação

1. Seguir os padrões já existentes no repositório (`AGENTS.md` / `CLAUDE.md`).
2. Toda chamada HTTP deve permanecer encapsulada em `src/services/*`.
3. Telas em `src/app/*` não montam URL nem importam `axios` diretamente.
4. Manter compatibilidade com o pseudo-contrato de API (`/api/v1/*`) sem engessar backend.
5. Validar cada etapa com:
   - `npm run format`
   - `npm run check`
6. Recurso de foguinhos/gamificação: fora do core por enquanto (desacoplado para evolução futura).

## 3) Escopo funcional (visão consolidada)

### 3.1 Já implementado (base atual)

- Splash, onboarding, login, cadastro
- Etapas iniciais de perfil: gêneros, filmes favoritos, texto livre

### 3.2 A implementar/concluir

- Loading de autenticação e confirmação de perfil criado
- Home, descobrir, detalhe, filme do dia
- Coleção, avaliação, adição de filme
- Perfil, dashboard, histórico, notificações
- Módulos extras (Pipocai/memória/avatares/duelo) em trilha desacoplada

## 4) Estratégia técnica (escalável)

### 4.1 Contrato em aberto (frontend-ready)

- Definir tipos de request/response por domínio em `src/types/*`.
- Padronizar envelopes:
  - sucesso: `data` + `meta`
  - erro: `error.code` + `error.message` + `requestId`
- Estruturar serviços por domínio:
  - `auth.service.ts`
  - `onboarding.service.ts`
  - `home.service.ts`
  - `movies.service.ts`
  - `collection.service.ts`
  - `ratings.service.ts`
  - `dashboard.service.ts`
  - `notifications.service.ts`
  - `profile.service.ts`

### 4.2 Desacoplamento para backend futuro

- Manter implementação mockada controlada por serviço.
- Troca futura para backend real deve acontecer na camada de serviço, sem refatorar tela.
- Garantir estados de UI: loading, sucesso, vazio e erro.

## 5) Mapa de endpoints (referência de contrato)

### 5.1 Autenticação

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### 5.2 Onboarding / Preferências

- `GET /api/v1/users/me/onboarding`
- `GET /api/v1/genres`
- `PUT /api/v1/users/me/onboarding/genres`
- `PUT /api/v1/users/me/onboarding/favorite-movies`
- `PUT /api/v1/users/me/onboarding/profile-story`
- `POST /api/v1/users/me/onboarding/complete`

### 5.3 Home / Recomendação

- `GET /api/v1/home`
- `GET /api/v1/recommendations`
- `GET /api/v1/recommendations/daily`
- `GET /api/v1/recommendations/outside-bubble`

### 5.4 Catálogo / Descoberta / Detalhe

- `GET /api/v1/movies`
- `GET /api/v1/movies/{tconst}`
- `GET /api/v1/movies/{tconst}/credits`
- `GET /api/v1/series/{tconst}/episodes`
- `GET /api/v1/people/{nconst}`

### 5.5 Coleção

- `GET /api/v1/users/me/collection`
- `GET /api/v1/users/me/collection/{tconst}`
- `PUT /api/v1/users/me/collection/{tconst}`
- `DELETE /api/v1/users/me/collection/{tconst}`

### 5.6 Avaliações

- `PUT /api/v1/users/me/ratings/{tconst}`
- `DELETE /api/v1/users/me/ratings/{tconst}`

### 5.7 Dashboard / Notificações / Perfil

- `GET /api/v1/users/me/dashboard`
- `GET /api/v1/users/me/notifications`
- `PATCH /api/v1/users/me/notifications/{id}`
- `POST /api/v1/users/me/notifications/read-all`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`
- `GET /api/v1/users/me/preferences`
- `PUT /api/v1/users/me/preferences`
- `DELETE /api/v1/users/me`

## 6) Plano por etapas (execução)

## Etapa 0 — Preparação técnica

**Status:** CONCLUÍDA (aguardando aprovação)  
**Objetivo:** estabilizar baseline e estrutura de contratos/tipos

**Entregas previstas**

- Limpeza de baseline local
- Tipos base de API/erro/meta
- Organização inicial de serviços por domínio

**Critério de conclusão**

- Build/lint/format sem erro
- Estrutura pronta para implementação incremental

---

## Etapa 1 — Auth + Onboarding completo

**Status:** CONCLUÍDA (aguardando aprovação)

**Telas**

- Cadastro/Login (ajustes finais)
- Loading de autenticação
- Perfil criado
- Fluxo 3 etapas com retentativa e “deixar para depois”

**Serviços**

- `auth.service.ts`
- `onboarding.service.ts`

**Critério de conclusão**

- Fluxo completo funcionando sem backend final (mockado)
- Navegação consistente e estados de erro tratados

---

## Etapa 2 — Home + Descoberta + Detalhe + Filme do dia

**Status:** CONCLUÍDA (aguardando aprovação)

**Serviços**

- `home.service.ts`
- `movies.service.ts`
- `people.service.ts` (se necessário nesta fase)

**Critério de conclusão**

- Home agregada
- Descoberta com filtros básicos
- Detalhe com dados essenciais e fallback seguro

---

## Etapa 3 — Coleção + Avaliações

**Status:** CONCLUÍDA (aguardando aprovação)

**Serviços**

- `collection.service.ts`
- `ratings.service.ts`

**Critério de conclusão**

- 4 estados da coleção aplicados
- Escrita idempotente na modelagem do frontend

---

## Etapa 4 — Perfil + Dashboard + Histórico + Notificações

**Status:** CONCLUÍDA (aguardando aprovação)

**Serviços**

- `profile.service.ts`
- `dashboard.service.ts`
- `notifications.service.ts`

**Critério de conclusão**

- Tela de perfil funcional
- Dashboard com KPIs principais
- Notificações com leitura individual e em lote

---

## Etapa 5 — Extras desacoplados (fora do core imediato)

**Status:** EM ANDAMENTO

**Módulos**

- Pipocai chat/memória
- Galeria de avatares (postergada, desacoplada de foguinhos no escopo atual)

**Nota de escopo**

- Sem travar entrega core por foguinhos/gamificação
- Preparar contratos internos para evolução futura

## 7) Registro histórico por etapa

> Este bloco deve ser atualizado ao final de cada etapa **após teste e aprovação**.

### Template de atualização

- **Etapa:**
- **Período:**
- **Status final:** (Aprovada / Ajustes pendentes)
- **Resumo técnico:**
- **Arquivos criados/alterados/removidos:**
- **Endpoints cobertos (ou mockados):**
- **Validação executada:**
  - `npm run format` ✅/❌
  - `npm run check` ✅/❌
- **Riscos/pendências para próxima etapa:**

### Histórico

#### 2026-10-16 — Registro inicial

- Plano consolidado criado com base no contrato de API e no protótipo.
- Nenhuma etapa concluída ainda.

#### 2026-10-16 — Início da Etapa 0

- Etapa 0 iniciada para estabilização da baseline técnica.
- Próxima atualização ocorrerá após validação (`npm run format` e `npm run check`).

#### 2026-10-16 — Etapa 0 validada tecnicamente

- **Etapa:** Etapa 0 — Preparação técnica
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Adicionada base tipada para contrato API (`api`, `auth`, `onboarding`).
  - Criados serviços iniciais desacoplados para autenticação e onboarding (mockados).
  - Criado normalizador de erros de serviço para padronizar tratamento de falhas.
  - Adicionado `.gitattributes` para padronização de LF e estabilidade do Prettier em Windows.
- **Arquivos criados/alterados/removidos:**
  - Criados: `.gitattributes`, `src/types/api.ts`, `src/types/auth.ts`, `src/types/onboarding.ts`, `src/services/service-error.ts`, `src/services/auth.service.ts`, `src/services/onboarding.service.ts`.
  - Alterados: arquivos do projeto formatados pelo Prettier para manter baseline consistente.
- **Endpoints cobertos (ou mockados):**
  - Auth: `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`.
  - Onboarding: `/users/me/onboarding`, `/users/me/onboarding/genres`, `/users/me/onboarding/favorite-movies`, `/users/me/onboarding/profile-story`, `/users/me/onboarding/complete`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Integrar telas de login/cadastro/onboarding aos novos serviços.
  - Implementar telas de loading e confirmação de perfil criado.

#### 2026-10-16 — Etapa 1 validada tecnicamente

- **Etapa:** Etapa 1 — Auth + Onboarding completo
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Implementado fluxo de loading assíncrono para autenticação e conclusão de perfil.
  - Implementada tela de loading (`auth-loading`) com retry e fallback para login.
  - Implementada tela de confirmação de perfil criado (`perfil-criado`).
  - Login e cadastro passaram a usar serviços de autenticação mockados.
  - Finalização do onboarding passou a usar serviços de onboarding mockados e redirecionamento para tela de confirmação.
  - Removidos warnings de `console.warn` no fluxo de login/cadastro.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/services/auth-loading.service.ts`, `src/app/auth-loading.tsx`, `src/app/perfil-criado.tsx`.
  - Alterados: `src/app/login.tsx`, `src/app/cadastro.tsx`, `src/app/perfil-cinefilo.tsx`, `src/services/onboarding.service.ts`.
- **Endpoints cobertos (ou mockados):**
  - Auth: `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`.
  - Onboarding: `/users/me/onboarding/genres`, `/users/me/onboarding/favorite-movies`, `/users/me/onboarding/profile-story`, `/users/me/onboarding/complete`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Mapear `nextScreen=home` para rota real quando a Home for implementada na etapa 2.
  - Evoluir persistência real de sessão e onboarding com backend definitivo.

#### 2026-10-16 — Etapa 2 validada tecnicamente

- **Etapa:** Etapa 2 — Home + Descoberta + Detalhe + Filme do dia
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Implementadas rotas Expo Router para Home, Descoberta, Detalhe de Filme e Filme do Dia.
  - Implementados serviços de domínio para Home e Movies com contrato mockado e pronto para backend real.
  - Criada base tipada para catálogo de filmes, resultados de busca e payload da Home.
  - Criados componentes reutilizáveis para navegação inferior e pôsteres de filmes.
  - Atualizado fluxo de login mockado para redirecionar para Home quando aplicável.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/app/home.tsx`, `src/app/descobrir.tsx`, `src/app/filme/[id].tsx`, `src/app/filme-do-dia.tsx`, `src/services/home.service.ts`, `src/services/movies.service.ts`, `src/data/catalog.ts`, `src/components/navigation/AppBottomNav.tsx`, `src/components/movie/MoviePosterTile.tsx`, `src/types/home.ts`, `src/types/movies.ts`, `src/utils/movies.ts`.
  - Alterados: `src/services/auth-loading.service.ts`, `src/services/auth.service.ts`, `src/app/login.tsx`, `src/app/perfil-criado.tsx`, `src/data/preferences.ts`.
- **Endpoints cobertos (ou mockados):**
  - Home/Recomendações: `/home`, `/recommendations`, `/recommendations/daily`, `/recommendations/outside-bubble`.
  - Catálogo: `/movies`, `/movies/{tconst}`, `/genres`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Conectar ações de coleção/avaliação das telas aos serviços reais da etapa 3.
  - Integrar navegação para telas de perfil/notificações quando estiverem implementadas.

#### 2026-10-16 — Etapa 3 validada tecnicamente

- **Etapa:** Etapa 3 — Coleção + Avaliações
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Implementados serviços de coleção e avaliações com contrato em aberto e comportamento idempotente.
  - Criada store compartilhada para estado de coleção/nota por filme, garantindo consistência entre Home, Descobrir, Detalhe e Filme do Dia.
  - Nova tela de coleção com filtros por estado (tudo, quero assistir, assistidos, favoritos e reassistir), resumo de contadores e ações de atualização.
  - Tela de detalhe conectada aos serviços de coleção/avaliação (favoritar, watchlist, assistido, reassistir, nota e limpeza de nota).
  - Tela Filme do Dia conectada às ações reais de coleção para “quero assistir” e “já assisti”.
  - Navegação inferior atualizada para incluir atalho direto para coleção.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/app/colecao.tsx`, `src/services/collection.service.ts`, `src/services/ratings.service.ts`, `src/services/movie-user-state.store.ts`, `src/types/collection.ts`, `src/types/ratings.ts`.
  - Alterados: `src/app/filme/[id].tsx`, `src/app/filme-do-dia.tsx`, `src/app/home.tsx`, `src/services/home.service.ts`, `src/services/movies.service.ts`, `src/components/navigation/AppBottomNav.tsx`.
- **Endpoints cobertos (ou mockados):**
  - Coleção: `/users/me/collection`, `/users/me/collection/{tconst}` (GET, PUT, DELETE).
  - Avaliações: `/users/me/ratings/{tconst}` (PUT, DELETE).
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Persistir estado de coleção/avaliação em backend real quando disponível.
  - Evoluir UX de feedback transacional (toasts e estados por ação) após definição final do fluxo de perfil/dashboard.

#### 2026-10-16 — Etapa 4 validada tecnicamente

- **Etapa:** Etapa 4 — Perfil + Dashboard + Histórico + Notificações
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Implementadas telas dedicadas de Perfil, Histórico e Notificações.
  - Implementados serviços de domínio `profile`, `dashboard` e `notifications` com contratos em aberto e estrutura pronta para backend real.
  - Perfil passou a exibir dados da conta, edição de nome/bio, KPIs de dashboard e atalhos para histórico/notificações.
  - Histórico passou a listar filmes assistidos com data e nota, com navegação para detalhe.
  - Notificações passaram a suportar leitura individual e em lote.
  - Home e navegação inferior foram integradas aos novos fluxos (acesso a perfil e notificações).
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/app/perfil.tsx`, `src/app/historico.tsx`, `src/app/notificacoes.tsx`, `src/services/profile.service.ts`, `src/services/dashboard.service.ts`, `src/services/notifications.service.ts`, `src/types/profile.ts`, `src/types/dashboard.ts`, `src/types/notifications.ts`.
  - Alterados: `src/components/navigation/AppBottomNav.tsx`, `src/app/home.tsx`, `src/services/home.service.ts`, `src/services/movie-user-state.store.ts`.
- **Endpoints cobertos (ou mockados):**
  - Perfil: `/users/me`, `/users/me/preferences`, `/users/me/password`.
  - Dashboard: `/users/me/dashboard`.
  - Notificações: `/users/me/notifications`, `/users/me/notifications/{id}`, `/users/me/notifications/read-all`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Substituir stores mock por persistência real e sincronização de sessão.
  - Refinar políticas de notificação (tipos, prioridade e deep links) após definição final do backend.

#### 2026-10-16 — Revisão de aderência ao protótipo (sem foguinhos e sem mock)

- **Etapa:** Revisão da Etapa 4 (feedback de produto)
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Removido bloco de foguinhos/níveis da Home para manter o escopo sem gamificação.
  - Criada tela dedicada de dashboard (`/dashboard`) e ligação direta na seção de perfil.
  - Serviços de Auth, Onboarding, Home, Movies, Coleção, Avaliações, Dashboard, Perfil e Notificações migrados para chamadas reais via `api`.
  - Login social passou a exibir indisponibilidade explícita até integração real com provider OAuth (sem token mock).
  - Removidos retornos mockados desses domínios; em caso de indisponibilidade de backend, as telas exibem mensagem de erro explícita.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/app/dashboard.tsx`.
  - Alterados: `src/app/home.tsx`, `src/app/perfil.tsx`, `src/app/descobrir.tsx`, `src/app/colecao.tsx`, `src/app/notificacoes.tsx`, `src/app/login.tsx`, `src/app/cadastro.tsx`, `src/components/movie/MoviePosterTile.tsx`, `src/types/movies.ts`, `src/services/auth.service.ts`, `src/services/onboarding.service.ts`, `src/services/home.service.ts`, `src/services/movies.service.ts`, `src/services/collection.service.ts`, `src/services/ratings.service.ts`, `src/services/dashboard.service.ts`, `src/services/profile.service.ts`, `src/services/notifications.service.ts`, `src/services/service-error.ts`, `src/data/catalog.ts`.
  - Removidos: `src/services/movie-user-state.store.ts`.
- **Endpoints cobertos (ou mockados):**
  - Auth: `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`.
  - Onboarding: `/users/me/onboarding`, `/users/me/onboarding/genres`, `/users/me/onboarding/favorite-movies`, `/users/me/onboarding/profile-story`, `/users/me/onboarding/complete`.
  - Home/Recomendações: `/home`, `/recommendations`, `/recommendations/daily`, `/recommendations/outside-bubble`.
  - Catálogo: `/movies`, `/movies/{tconst}`, `/genres`.
  - Coleção: `/users/me/collection`, `/users/me/collection/{tconst}`.
  - Avaliações: `/users/me/ratings/{tconst}`.
  - Perfil: `/users/me`, `/users/me/preferences`.
  - Dashboard: `/users/me/dashboard`.
  - Notificações: `/users/me/notifications`, `/users/me/notifications/{id}`, `/users/me/notifications/read-all`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Confirmar shape final de payloads com backend para os campos de UI (ex.: gradientes, compatibilidade e motivos).
  - Integrar autenticação social com provider real (Google) para substituir a indisponibilidade temporária no botão.

#### 2026-10-16 — Modo mock local para validação visual (sem API)

- **Etapa:** Ajuste transversal de infraestrutura de serviços
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Consolidada camada de mocks em `src/services/mock-api.ts` para suportar teste visual local sem backend.
  - Ativado chaveamento por ambiente com `EXPO_PUBLIC_USE_MOCK_API=true`, mantendo API real como padrão em produção.
  - Integrados ao modo mock os serviços de Auth, Onboarding, Home, Movies, Coleção, Avaliações, Dashboard, Perfil e Notificações.
  - Mantida a política de mensagens amigáveis para usuário final quando a API real estiver indisponível ou não configurada.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/services/mock-api.ts`.
  - Alterados: `src/config/env.ts`, `.env.example`, `src/services/auth.service.ts`, `src/services/onboarding.service.ts`, `src/services/home.service.ts`, `src/services/movies.service.ts`, `src/services/collection.service.ts`, `src/services/ratings.service.ts`, `src/services/dashboard.service.ts`, `src/services/profile.service.ts`, `src/services/notifications.service.ts`, `src/services/api.ts`, `src/services/service-error.ts`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Validar visualmente todas as telas com backend desligado e fluxo completo (login, onboarding, home, detalhe, coleção, perfil, dashboard, histórico e notificações).
  - Substituir progressivamente os mocks pelos endpoints reais conforme contrato do backend for fechado.

#### 2026-10-16 — Etapa 5 (parcial) com foco em Pipocai e registro de filmes

- **Etapa:** Etapa 5 — Extras desacoplados (primeira entrega)
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Implementadas telas de Pipocai (`/pipocai`) e Memória do Pipocai (`/pipocai-memoria`) com fluxo completo para teste visual local.
  - Implementadas telas de adicionar filme assistido (`/adicionar-filme`) e avaliar filme (`/avaliar-filme/[id]`) conectadas aos serviços de catálogo, coleção e avaliações.
  - Navegação inferior atualizada para refletir o protótipo: botão central para registrar filme e aba Pipocai interativa.
  - Adicionada camada de domínio `pipocai.service.ts` com contrato desacoplado e suporte ao modo mock local.
  - Extendida a camada `mock-api` com estado e operações de conversa/memória do Pipocai.
- **Arquivos criados/alterados/removidos:**
  - Criados: `src/app/pipocai.tsx`, `src/app/pipocai-memoria.tsx`, `src/app/adicionar-filme.tsx`, `src/app/avaliar-filme/[id].tsx`, `src/services/pipocai.service.ts`, `src/types/pipocai.ts`.
  - Alterados: `src/components/navigation/AppBottomNav.tsx`, `src/app/perfil.tsx`, `src/services/mock-api.ts`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Definir contrato de backend para Pipocai (chat/memória) antes de trocar a implementação mock por API real.
  - Planejar galeria de avatares sem acoplamento ao sistema de foguinhos, mantendo escopo desacoplado.

#### 2026-10-16 — Consolidação sem mock e UX navegável com API indisponível

- **Etapa:** Ajuste transversal pós-feedback (produção real sem mock)
- **Período:** 2026-10-16
- **Status final:** Ajustes entregues e validados tecnicamente (aguardando aprovação)
- **Resumo técnico:**
  - Removido o modo mock do runtime e dos serviços; o app passa a operar apenas com integração real via `api`.
  - Removido arquivo de mock central e referências de chaveamento por ambiente.
  - Ajustadas telas principais para permanecerem acessíveis quando a API falhar, com mensagens contextuais por seção, sem bloquear navegação.
  - Fluxos de filme e Pipocai mantidos acessíveis com fallback visual e ações de atualização.
- **Arquivos criados/alterados/removidos:**
  - Alterados: `.env.example`, `src/config/env.ts`, `src/services/auth.service.ts`, `src/services/onboarding.service.ts`, `src/services/home.service.ts`, `src/services/movies.service.ts`, `src/services/collection.service.ts`, `src/services/ratings.service.ts`, `src/services/dashboard.service.ts`, `src/services/profile.service.ts`, `src/services/notifications.service.ts`, `src/services/pipocai.service.ts`, `src/app/home.tsx`, `src/app/descobrir.tsx`, `src/app/colecao.tsx`, `src/app/dashboard.tsx`, `src/app/historico.tsx`, `src/app/notificacoes.tsx`, `src/app/perfil.tsx`, `src/app/adicionar-filme.tsx`, `src/app/avaliar-filme/[id].tsx`, `src/app/pipocai.tsx`, `src/app/pipocai-memoria.tsx`, `src/app/filme-do-dia.tsx`, `src/app/filme/[id].tsx`.
  - Removidos: `src/services/mock-api.ts`.
- **Validação executada:**
  - `npm run format` ✅
  - `npm run check` ✅
- **Riscos/pendências para próxima etapa:**
  - Confirmar contrato final de endpoints do Pipocai com backend (`conversation`, `messages` e `memories`).
  - Refinar microcopy de indisponibilidade por domínio após alinhamento com produto.

## 8) Regras de atualização contínua deste documento

1. Ao concluir uma etapa:
   - atualizar status da etapa para **CONCLUÍDA**;
   - preencher o bloco de histórico com evidências de validação.
2. Ao iniciar etapa seguinte:
   - marcar como **EM ANDAMENTO**;
   - registrar eventuais mudanças de escopo.
3. Não apagar histórico anterior; apenas append de novas entradas.
