# Changelog

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
