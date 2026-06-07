# Changelog

## [0.6.0] — 2026-06-07

### Added
- **Sync na sidebar (desktop)**: botão "Sincronizar" na parte inferior da sidebar, com feedback visual de loading e confirmação
- **Pull-to-refresh (mobile)**: gesto de puxar para baixo nas views do app dispara sincronização manual (push + pull), com indicador visual de distância e loading

## [0.5.0] — 2026-06-07

### Added
- **Sincronização manual**: botão "Sincronizar dados" no painel de Configurações que força push de alterações pendentes + pull do servidor, com feedback visual de sucesso/erro
- **Cache reload completo**: botão "Recarregar PWA (limpar cache)" agora também apaga todos os bancos IndexedDB, localStorage, sessionStorage e caches de SW, preservando apenas autenticação Supabase (`sb-*`) e núcleo ativo — equivalente a reinstalar o app do zero e repuxar tudo da nuvem

### Changed
- SettingsSheet: botão de recarregar renomeado para "Recarregar PWA (limpar cache)" e ampliado para limpeza total do cache local

## [0.4.0] — 2026-06-07

### Added
- **Tarefas em áreas**: tarefa pode pertencer diretamente a uma área (`area_id`) sem necessariamente estar num projeto. Área detalhada mostra tarefas diretas + via projetos.
- **Sidebar com hierarquia completa**: Seções (Hoje, Breve, Qualquer Hora, Algum Dia) → Áreas expansíveis com projetos aninhados → Projetos standalone. Sem Inbox/Navegar na sidebar.
- **Navegar page (mobile)**: espelha conteúdo da sidebar — seções, áreas, projetos standalone, com botão de configurações.
- **Botão "Nova lista" unificado**: dropdown com "Nova área" / "Novo projeto" na sidebar (desktop) e Navegar (mobile), substituindo os botões "+" separados.
- **Editar nome**: ícone lápis (hover na sidebar, sempre visível no mobile) abre Dialog para renomear área ou projeto.
- **Drag-and-drop projeto → área**: projetos standalone podem ser arrastados para dentro de áreas, tanto na sidebar quanto no Navegar.
- **Contexto de área no FAB**: `CreateTaskFab` herda `areaId` da URL, e `TaskDetail` volta a ter selectores de área e projeto.
- **Ícones novos**: áreas usam `Layers2` (camadas), projetos usam `FolderClosed` (pasta).

### Changed
- Sidebar: PLCO logo linka para `/app/today` (antes Inbox); Navegar removido da sidebar.
- Área clicável na sidebar/Navegar → navega para `/app/areas/[id]`; chevron separado expande/recolhe projetos.
- Dexie schema bump v5: `area_id` adicionado de volta no índice de `tasks`.

### Fixed
- **Hydration error**: `<button>` dentro de `<button>` no `AreaList` — trocado para `<div role="button">` com chevron separado.

## [0.3.0] — 2026-06-07

### Added
- **Áreas e Projetos dinâmicos**: CRUD completo com criação inline na página Navegar, listagem clicável, e páginas de detalhe (`/app/areas/[id]`, `/app/projects/[id]`) com lista de tarefas filtrada
- **FAB com contexto**: CreateTaskFab herda `area_id`/`project_id` automaticamente quando usado dentro de páginas de área/projeto
- **TaskDetail com área/projeto**: seletor de área e projeto no painel de edição de tarefa, com loading de listas do IndexedDB
- **useAreas / useProjects hooks**: hooks local-first com CRUD completo + enfileiramento de sync para áreas e projetos
- **Sync engine generalizado**: suporte a múltiplos tipos de entidade (`task`, `area`, `project`) com push/pull/conflict/initialPull para cada tipo
- **Dexie schema v3**: novas tabelas `areas` e `projects` com índices, migração automática de `sync_queue` (`task_id` → `entity_id`, `entity_type`)
- **Páginas de entidade**: layout do app oculta header em páginas de área/projeto, exibindo apenas back button + nome da entidade

### Changed
- Sync engine refatorado para operar sobre qualquer entidade (task/area/project) via `entityType`
- `syncEngine.enqueue` agora exige `entityType` como segundo parâmetro
- `syncEngine.resolveConflict` aceita `entityType` opcional
- `CreateTaskForm` aceita `areaId`/`projectId` e passa ao criar tarefa no Dexie + sync

### Fixed
- Header do layout escondido em páginas de área/projeto (estava exibindo título da seção incorretamente)
- Comentário `eslint-disable` desnecessário removido do task-detail

## [0.2.0] — 2026-06-07

### Added
- **Navegar como menu**: página de navegação com links clicáveis para Qualquer Hora e Algum Dia, preparada para receber Projetos e Áreas
- **SettingsSheet**: folha de configurações com versão do app, versão do cache, botão "Recarregar PWA" (limpa caches + incrementa versão + recarrega) e "Sair" (logout + redirect)
- **Hoje com overdue**: visão "Hoje" agora inclui tarefas vencidas (due_date <= hoje) de qualquer seção, além das tarefas na seção "today"
- **Índice due_date no Dexie**: schema do banco local foi bumpado de v1 para v2 com índice em `due_date`
- **useScrollInputIntoView**: hook global que resolve overlap do teclado iOS em inputs de modais/sheets, usando `visualViewport` API + `scrollIntoView`
- **pb-safe**: utility CSS com `env(safe-area-inset-bottom, 16px)` para padding inferior seguro em dispositivos com notch/home indicator

### Changed
- **Performance**: removido componente PageTransition (animação de 250ms) — troca entre views agora é instantânea
- **Performance**: removido estado `loading` do hook `useTasks` — dados são lidos diretamente do IndexedDB sem flash de "Carregando..."
- **Hydration**: store do núcleo (`nucleus.ts`) agora separa inicialização SSR da leitura do sessionStorage via método `hydrate()`, eliminando mismatch de hidratação
- **Bottom dock**: padding inferior aumentado no mobile com `pb-safe`

### Fixed
- **Build Vercel**: CSS com `@utility pb-safe` duplicado e bloco `:root` quebrado — consolidado e normalizado
- **Hydration error**: texto de empty state no TaskSection agora condicionado a `hydrated`, garantindo matching servidor/cliente

## [0.1.0] — 2026-06-06

### Added
- Projeto inicializado com Next.js 16, Tailwind CSS v4, TypeScript, shadcn/ui (base-nova)
- PWA manifest + ícones
- Landing page, autenticação (login/register), onboarding
- Páginas de seções: Inbox, Hoje, Em Breve, Qualquer Hora, Algum Dia
- Supabase schema completo (profiles, nuclei, nuclei_members, tasks, projetos, áreas)
- Middleware de autenticação com redirect
- NucleusSelector — seletor de núcleo familiar
- Task CRUD completo com criação via FAB, edição inline, checkbox, drag-and-drop
- Offline-first com Dexie.js + SyncEngine (push/pull/conflict resolution)
- Realtime Supabase subscription
- Bottom dock com 4 ícones (Inbox, Hoje, Breve, Navegar)
- Sidebar com todas as seções + NucleusSelector
- JumpStart date picker com Calendar + shortcuts
- SyncConflictDialog para resolução de conflitos
- Design system Things 3 (DESIGN.md) aplicado via tokens CSS
