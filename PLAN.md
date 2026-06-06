# PLCO Suite — Plano de Implementação

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React / Next.js (App Router) + Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Linguagem | TypeScript |
| PWA | next-pwa ou service worker custom |
| Estrutura | Single Next.js com route groups |

## Estrutura do Projeto

```
plco-suite/
├── src/
│   ├── app/                    # App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── (app)/              # App routes (layout autenticado)
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── calendar/
│   │   │   ├── notes/
│   │   │   └── settings/
│   │   └── (admin)/            # Admin routes (layout admin)
│   │       ├── dashboard/
│   │       ├── analytics/
│   │       └── users/
│   ├── components/
│   │   ├── ui/                 # Shared UI (shadcn/ui style)
│   │   ├── landing/            # Landing page components
│   │   ├── app/                # App components
│   │   └── admin/              # Admin components
│   ├── lib/
│   │   ├── db/                 # Supabase client, queries, types
│   │   ├── auth/               # Auth helpers
│   │   └── utils/              # Shared utilities
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # State management (Zustand)
│   └── styles/
├── public/
├── supabase/
│   └── migrations/             # Database migrations
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Database Schema (POC)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID UNIQUE REFERENCES auth.users(id),
  name      TEXT,
  avatar_url TEXT,
  role      TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Family nuclei
CREATE TABLE nuclei (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Nuclei members
CREATE TABLE nuclei_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id),
  role       TEXT CHECK (role IN ('father', 'mother', 'guardian', 'child', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(nuclei_id, user_id)
);

-- Tasks (Things-inspired sections)
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id     UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  created_by    UUID REFERENCES profiles(id),
  title         TEXT NOT NULL,
  description   TEXT,
  section       TEXT CHECK (section IN ('inbox', 'today', 'upcoming', 'anytime', 'someday')) DEFAULT 'inbox',
  due_date      DATE,
  project_id    UUID REFERENCES projects(id),
  area_id       UUID REFERENCES areas(id),
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  position      INT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  area_id    UUID REFERENCES areas(id),
  position   INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Areas
CREATE TABLE areas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nuclei_id  UUID REFERENCES nuclei(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Features

### Core
- [ ] Tarefas com seções Things: Inbox, Hoje, Em Breve, Qualquer Hora, Algum Dia
- [ ] Projetos dentro de Áreas
- [ ] Calendário integrado
- [ ] Notas compartilhadas
- [ ] Upload de arquivos (imagens, PDFs) — Supabase Storage
- [ ] Múltiplos núcleos familiares

### Usuários
- [ ] Roles: admin, user
- [ ] User pode ser pai, mãe, responsável, filho, membro
- [ ] Filho casado pode ter acesso a dois núcleos

### Admin
- [ ] Auditoria anônima de ações do usuário
- [ ] Analytics de uso geral
- [ ] CRM de usuários

### App
- [ ] PWA mobile-first, offline-first
- [ ] Sincronização com Supabase Realtime
- [ ] Notificações push
- [ ] API para atalhos iOS

### Monetização
- [ ] 3 meses por R$1, depois R$5/mês
- [ ] Pagamento único com 1 ano de atualizações

## Filosofia

- "Slow living and household"
- Organização familiar não-egoísta
- Foco no lar, não no indivíduo

## Inspirações

- **Design**: Things.app (https://culturedcode.com/things/)
- **Tarefas**: TickTick, Todoist
- **Notas**: Capacities

---

## Fases de Implementação

### Phase 1 — POC (MVP funcional)

Setup inicial:
1. Inicializar Next.js com App Router + Tailwind + TypeScript
2. Configurar Supabase (projeto, migrations, client)
3. Configurar estrutura de pastas

Landing page + Auth:
1. Landing page simples com value prop "organização para sua família"
2. Sistema de cadastro/login com Supabase Auth (email + senha, magic link)
3. Criação de perfil pós-cadastro

Núcleo + Tarefas:
1. Criação de núcleo familiar (onboarding: "dê um nome pra sua família")
2. CRUD de tarefas dentro do núcleo
3. Seções Things: Inbox, Hoje, Em Breve, Qualquer Hora, Algum Dia
   - Inbox: tasks sem projeto, sem data
   - Hoje: tasks com due_date <= hoje & !is_completed
   - Em Breve: tasks com due_date > hoje
   - Qualquer Hora: tasks sem due_date, com projeto
   - Algum Dia: tasks marcadas como someday
4. Arrastar tarefas entre seções (drag and drop)
5. Offline-first: armazenar tasks no IndexedDB (via Dexie.js ou similar)
6. Sincronizar com Supabase quando voltar online

### Phase 2 — Colaboração & Calendário

1. Convidar membros pro núcleo por email/link
2. Tela de gerenciamento de membros
3. Atribuição de tarefas entre membros
4. Calendário mensal/semanal com tarefas
5. Notificações push (via Supabase Realtime + service worker)

### Phase 3 — Projetos, Áreas & Notas

1. CRUD de Áreas
2. CRUD de Projetos vinculados a Áreas
3. Organizar tarefas dentro de projetos
4. Notas compartilhadas (texto rich editável, markdown)
5. Upload de arquivos no Supabase Storage

### Phase 4 — Admin & Analytics

1. Admin dashboard em `(admin)/`
2. Listagem de usuários (CRM básico)
3. Visualização de audit_logs
4. Gráficos de analytics (uso de features, tasks criadas, etc.)

### Phase 5 — Polimento & Lançamento

1. Suporte a múltiplos núcleos
2. Onboarding rápido (tour guiado)
3. Landing page refinada com pricing
4. Blog `(/blog)`
5. API pública para atalhos iOS
6. PWA completo com instalável
