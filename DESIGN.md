# PLCO Suite — Design System

> Inspirado por Things 3 (Cultured Code) — Apple Design Award Winner

---

## Filosofia de Design

### 1. Restrição Visual

95% da interface é neutra (branco, preto, cinza). Cor aparece **apenas** para informação semântica. Se tudo é colorido, nada se destaca.

```
Neutral (95% da interface):
├── Background: Off-white canvas / Dark mode variants
├── Text: Preto quase absoluto / branco
├── Bordas: Cinza muito sutil
└── Ícones: Monocromáticos

Cor com significado (5%):
├── Amarelo  = Hoje
├── Vermelho = Prazo / Atrasado
├── Azul     = Tags (atribuído pelo user)
├── Verde    = Completo (animação)
└── Índigo   = Esta Noite
```

### 2. Hierarquia Natural

Organizar o trabalho como a mente humana já pensa: do amplo (Áreas da vida) ao específico (tarefas individuais).

```
Áreas (nunca se completam — papéis da vida)
└── Projetos (têm fim — metas com prazo)
    └── Headings (marcos / categorias)
        └── Tarefas (ações individuais)
```

### 3. "Quando" vs "Prazo"

São perguntas diferentes:
- **Quando** = quando vou trabalhar nisso? (Hoje, Esta Noite, Algum Dia, ou data específica)
- **Prazo** = quando precisa estar pronto? (deadline)

Uma tarefa pode vencer sexta (prazo) mas você planeja trabalhar na quarta (quando). Essa separação permite planejar o dia por intenções sem perder de vista as datas reais.

### 4. "Algum Dia" é um Recurso, não um Fracasso

Dar um lar sem pressão para ideias vagas evita ansiedade na caixa de entrada. Tarefas em "Algum Dia" não poluem "Hoje" nem geram culpa.

### 5. Completar é uma Recompensa

A animação de conclusão entrega recompensa, não mero feedback. O "plink" sonoro e a animação suave do check fazem completar tarefas parecer bom.

### 6. Teclado primeiro, mouse bem-vindo

Atalhos devem ser descobríveis mas não obrigatórios. A interface sugere as teclas sem exigi-las.

### 7. Conteúdo é o Chrome

Não há camada visual decorativa entre o usuário e suas tarefas. Screenshots do produto são a decoração. O app É a marca.

---

## Paleta de Cores

### Superfície

| Token | Cor | Uso |
|-------|-----|-----|
| `--canvas` | `#f2f5f7` | Background principal (off-white com leve tom azulado) |
| `--surface` | `#ffffff` | Cards, inputs, superfícies elevadas |
| `--surface-dark` | `#26344a` | Dark mode: superfícies |
| `--surface-deep` | `#000f24` | Dark mode: background profundo |

### Texto

| Token | Cor | Uso |
|-------|-----|-----|
| `--ink` | `#303336` | Texto principal, headings |
| `--ink-soft` | `#44474b` | Texto secundário, corpo |
| `--ink-mid` | `#55606e` | Texto terciário, labels |
| `--ink-muted` | `#8e9196` | Placeholder, metadados |

### Bordas

| Token | Cor | Uso |
|-------|-----|-----|
| `--hairline` | `#dfe3e8` | Divisores, outlines, bordas de input |

### Accent (USAR COM MODERAÇÃO)

| Token | Cor | Uso |
|-------|-----|-----|
| `--primary` | `#2576eb` | Links ativos, botão CTA, ícones interativos |
| `--primary-light` | `#5c9cf5` | Hover states |

### Cores Semânticas (5% da interface)

| Token | Cor | Uso |
|-------|-----|-----|
| `--semantic-today` | `#f5c518` | Ícone de "Hoje" |
| `--semantic-deadline` | `#ff3b30` | Prazo / Atrasado |
| `--semantic-evening` | `#5856d6` | "Esta Noite" |
| `--semantic-complete` | `#34c759` | Animação de completo |
| `--semantic-tag` | `#007aff` | Tags (definido pelo usuário) |

---

## Tipografia

### Font Family

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, sans-serif;
```

**Apenas system-sans.** Sem fontes customizadas. A fonte nativa do sistema dá sensação nativa e carregamento instantâneo.

### Type Scale

| Role | Size | Weight | Line Height | Uso |
|------|------|--------|-------------|-----|
| `--text-caption` | 13px | 400 | 1.4 | Metadados, badges |
| `--text-body` | 15px | 400 | 1.5 | Tarefas, corpo |
| `--text-body-bold` | 15px | 600 | 1.5 | Título da tarefa |
| `--text-subheading` | 17px | 600 | 1.35 | Headings de seção |
| `--text-heading` | 20px | 700 | 1.25 | Título de área/projeto |
| `--text-display` | 28px | 700 | 1.2 | Tela de boas-vindas |

---

## Espaçamento

Base: múltiplos de 4px.

| Token | Value |
|-------|-------|
| `--space-2` | 2px |
| `--space-4` | 4px |
| `--space-8` | 8px |
| `--space-12` | 12px |
| `--space-16` | 16px |
| `--space-20` | 20px |
| `--space-24` | 24px |
| `--space-32` | 32px |
| `--space-40` | 40px |
| `--space-48` | 48px |
| `--space-64` | 64px |

### Padding padrão de cards: `--space-16` (16px)
### Gap entre elementos: `--space-8` (8px) ou `--space-12` (12px)

---

## Border Radius

| Token | Value | Uso |
|-------|-------|-----|
| `--radius-sm` | 3px | Ícones pequenos |
| `--radius-md` | 6px | Botões, inputs, cards de tarefa |
| `--radius-lg` | 12px | Cards maiores, modais |
| `--radius-xl` | 18px | Elementos tipo Mac-window |

---

## Sombras

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` |
| `--shadow-lg` | `0 8px 30px rgba(0,0,0,0.12)` |

---

## Animações

| Propriedade | Value | Uso |
|------------|-------|-----|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Spring suave — surgimento, abertura |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Transições de estado |
| `--duration-fast` | 150ms | Hover, cor, opacidade |
| `--duration-normal` | 300ms | Movimento, escala |
| `--duration-slow` | 500ms | Aparição de tela |

### Princípios de animação:
- **Propósito**: cada animação comunica uma mudança de estado
- **Física**: usar curvas spring, não easing lineares
- **Toque**: interações respondem no mesmo frame do gesto
- **Completar tarefa**: check animado + feedback tátil/sonoro

---

## Ícones

- **Lucide** para ícones do sistema
- Monocromáticos (herdam `currentColor`)
- Tamanhos: 16px (inline), 20px (tarefa), 24px (navegação)
- **Sem cor própria** — a cor é herdada do contexto semântico

---

## Design de Tela — Componentes

### 1. Task Row

O bloco fundamental do app. Cada tarefa é uma linha limpa, tipo papel branco.

```
┌──────────────────────────────────────────────────┐
│  ○  Título da tarefa                    [!] prazo │
│     Nome do Projeto                     [hoje]    │
└──────────────────────────────────────────────────┘
```

- Checkbox circular (○) → anima para check verde (✓) ao completar
- Título em `--text-body-bold`
- Metadados abaixo: projeto, tags, prazo — em `--text-caption`, `--ink-muted`
- Badge amarelo se está em "Hoje"
- Badge vermelho se atrasado
- Badge índigo se "Esta Noite"
- Hover: background sutil (`--canvas`)

### 2. Sidebar / Navegação

```
┌──────────────────┐
│  ☰ Inbox      (3)│  ← badge de não-processados
│  ★ Hoje       (5)│  ← badge de tarefas do dia
│  ☐ Em Breve     │
│  ◎ Qualq. Hora  │
│  ◇ Algum Dia    │
│                  │
│  ─── Áreas ───   │
│  ● Casa          │
│  ● Finanças      │
│  ● Saúde         │
│  ● Trabalho      │
│                  │
│  ─── Projetos ───│
│  █ Reforma       │
│  █ Viagem        │
└──────────────────┘
```

- Largura: 240px (desktop), 280px (mobile como overlay)
- Items com 32px de altura, padding 12px horizontal
- Áreas nunca têm badge de conclusão (não se completam)
- Projetos mostram progress pie (opcional)
- Seção ativa: background sutil + primary color no ícone

### 3. Seções Temporais (Things-inspired)

#### Inbox
- Captura rápida, sem organização
- Tarefas sem projeto, sem data
- Badge com contagem de não-processados
- Input de texto direto no topo: "Adicionar tarefa..."

#### Hoje
- Tarefas com start date ≤ hoje OU deadline ≤ hoje
- Divisão "Hoje" / "Esta Noite"
- Eventos do calendário no topo (futuro)
- Ordenação por drag and drop
- Idealmente 3-7 tarefas

#### Em Breve (Upcoming)
- Timeline dos próximos dias
- Próximos 7 dias listados individualmente
- Depois: agrupado por mês
- Tarefas com start date futuro
- Drag para reagendar

#### Qualquer Hora (Anytime)
- Todas as tarefas ativas sem data
- Tarefas soltas no topo, depois agrupadas por projeto/área
- Tarefas de "Hoje" aparecem com estrela amarela
- Mutualmente exclusivo com "Em Breve" e "Algum Dia"

#### Algum Dia (Someday)
- Tarefas e projetos sem compromisso atual
- Escondido de "Qualquer Hora" e "Em Breve"
- Revisão semanal recomendada
- Fonte com opacidade reduzida (0.6) sinalizando "hibernando"

### 4. Tarefa — Detail View

```
┌────────────────────────────────────────┐
│ ○  Comprar material da reforma        │
│                                      │
│ ┌─ Nota ────────────────────────────┐ │
│ │  - 3 sacos de cimento             │ │
│ │  - 10m de cano PVC               │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Lista ...... 🗸 areia 🗸 cimento     │
│ Quando ..... Hoje                    │
│ Prazo ...... sexta, 12 jun           │
│ Projeto .... Reforma Casa            │
│ Área ....... Casa                    │
│ Tags ....... [#compras] [#urgente]   │
└────────────────────────────────────────┘
```

- Ao abrir, a tarefa "se transforma" numa folha de papel branca (animação)
- Campos opcionais ficam escondidos até o usuário clicar
- Checklist dentro da tarefa (para subtarefas que não viram projetos)
- Markdown na nota

### 5. Projeto — View

```
┌──────────────────────────────────────┐
│ Reforma Casa                    🥧 67%│
│ ─────────────────────────────────── │
│                                      │
│ ┌─── 📋 Fundação ──────────────────┐│
│ │ ○ Comprar cimento                ││
│ │ ○ Contratar pedreiro            ││
│ │ ○ Limpar terreno                ││
│ └──────────────────────────────────┘│
│                                      │
│ ┌─── 🔧 Acabamento ────────────────┐│
│ │ ○ Escolher piso                 ││
│ │ ○ Comprar tinta                 ││
│ └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

- Headings (📋 Fundação, 🔧 Acabamento) dividem o projeto em marcos
- Progress pie calculado automaticamente
- Projetos podem ir para "Algum Dia" (somem da sidebar)

### 6. Área — View

```
┌──────────────────────────────────────┐
│ Casa                                  │
│ ─────────────────────────────────── │
│                                      │
│ Tarefas soltas:                      │
│ ○ Comprar detergente                 │
│                                      │
│ Projetos:                            │
│ ┌── Reforma Casa              🥧 67% │
│ ┌── Jardim                    🥧 20% │
└──────────────────────────────────────┘
```

- Áreas **nunca** se completam
- Contém projetos + tarefas soltas
- Máximo recomendado: 7 áreas

### 7. Quick Entry (Magic Plus)

- Botão "+" flutuante (mobile) / atalho (desktop)
- Ao começar a digitar, aparece seletor de destino:
  - Inbox (padrão)
  - Hoje
  - Projeto específico
- Natural language date parsing: "amanhã", "sábado", "em 3 dias"
- Drag do botão "+" para inserir em posição específica

### 8. Jump Start (Date Picker)

Popover rápido para definir data:

```
┌──────────────────────┐
│ Quando começar?      │
│                      │
│ [Hoje]  [Esta Noite] │
│                      │
│ ┌─ Calendário ─────┐ │
│ │                 │ │
│ │                 │ │
│ └─────────────────┘ │
│                      │
│ [Algum Dia]  [Limpar]│
│                      │
│ Lembrar: [⏰ 08:00]  │
│ Prazo:   [🚩 sexta]  │
└──────────────────────┘
```

---

## Layout por Dispositivo

### Mobile First (< 768px)

```
┌──────────────────┐
│ ☰  ★ Hoje    +   │ ← Header com hamburger + título + add
├──────────────────┤
│ ○ Comprar pão   │
│   🏠 Casa        │
│ ○ Pagar conta   │
│   💰 Finanças   │
│ ○ Ligar dentista│
│   🏥 Saúde      │
│                  │
│ ── Esta Noite ── │
│                  │
│ ○ Jogar lixo    │
│   🏠 Casa        │
├──────────────────┤
│ [Inbox][Hoje]    │ ← Bottom tab nav
│ [Breve][Hora]    │
│ [Dia]            │
└──────────────────┘
```

- Bottom tab navigation com 5 ícones
- Sidebar como overlay (desliza da esquerda)
- Fonte: 16px mínimo (para evitar zoom no input)

### Tablet (768px - 1024px)

- Sidebar visível (modo slim: 60px só ícones)
- Split view possível
- Tarefas com mais metadados visíveis

### Desktop (> 1024px)

- Sidebar completa (240px)
- Keyboard shortcuts:
  - `⌘N` = nova tarefa
  - `⌘I` = ir para Inbox
  - `⌘T` = ir para Hoje
  - `⌘U` = ir para Em Breve
  - `⌘⇧A` = ir para Qualquer Hora
  - `⌘S` = ir para Algum Dia
  - `⌘F` = buscar (Quick Find)
  - `Space` = completar tarefa selecionada
- Quick Find: comece a digitar para buscar tarefas/projetos/áreas

---

## Dark Mode

| Token | Light | Dark |
|-------|-------|------|
| `--canvas` | `#f2f5f7` | `#000f24` |
| `--surface` | `#ffffff` | `#26344a` |
| `--ink` | `#303336` | `#f0f0f2` |
| `--ink-soft` | `#44474b` | `#c0c4cc` |
| `--ink-mid` | `#55606e` | `#8892a0` |
| `--ink-muted` | `#8e9196` | `#5a6370` |
| `--hairline` | `#dfe3e8` | `#1e2d45` |

---

## Inspirações Visuais

| Aspecto | Referência |
|---------|-----------|
| Estrutura de tarefas | Things 3 — Inbox, Today, Upcoming, Anytime, Someday |
| Filosofia de design | Things 3 — Apple Design Award |
| Paleta de cores | Things marketing site + shadcn Things DS |
| Tipografia | System-ui (San Francisco) |
| Seções de projeto | Things 3 — Headings |
| Interações | Things 3 — Magic Plus, Jump Start |
| Tabela de design tokens | shadcn DESIGN.md spec |

---

## Arquitetura de Telas (POC)

```
┌─────────────────────────────────────┐
│         Landing Page                │
│  (/)                                │
│  - Value prop "Sua família          │
│    organizada como um time"         │
│  - CTA: "Começar grátis"           │
│  - Screenshots do app              │
└──────────────┬──────────────────────┘
               │ auth
               ▼
┌─────────────────────────────────────┐
│         Onboarding                  │
│  /app/onboarding                    │
│  1. Criar ou entrar em núcleo      │
│  2. Nome do núcleo familiar        │
│  3. Primeira tarefa (opcional)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Dashboard / Tasks             │
│  /app                              │
│  ┌─────────┬────────────────────┐ │
│  │ Sidebar │   Task List        │ │
│  │ Inbox   │   (seção atual)    │ │
│  │ Hoje    │                    │ │
│  │ Breve   │                    │ │
│  │ Hora    │                    │ │
│  │ Dia     │                    │ │
│  ├─────────┤                    │ │
│  │ Áreas   │                    │ │
│  │ Projetos│                    │ │
│  └─────────┴────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Tailwind CSS Config (Tokens)

```ts
export default {
  theme: {
    extend: {
      colors: {
        canvas: '#f2f5f7',
        surface: '#ffffff',
        ink: '#303336',
        'ink-soft': '#44474b',
        'ink-mid': '#55606e',
        'ink-muted': '#8e9196',
        hairline: '#dfe3e8',
        primary: '#2576eb',
        'primary-light': '#5c9cf5',
        today: '#f5c518',
        deadline: '#ff3b30',
        evening: '#5856d6',
        complete: '#34c759',
        tag: '#007aff',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system',
               'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        caption: ['13px', { lineHeight: '1.4' }],
        body: ['15px', { lineHeight: '1.5' }],
        subheading: ['17px', { lineHeight: '1.35', fontWeight: '600' }],
        heading: ['20px', { lineHeight: '1.25', fontWeight: '700' }],
        display: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      spacing: {
        2: '2px',
        18: '18px',
      },
      borderRadius: {
        sm: '3px',
        md: '6px',
        lg: '12px',
        xl: '18px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.06)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
        strong: '0 8px 30px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
}
```
