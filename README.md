# Ledger AI

**An auditable AI workspace.** Ledger AI helps teams understand, audit, and replay AI decisions through a calm, evidence-first workspace.

## Product model

The primary object is a **Run**: an immutable record of a user prompt, agent plan, retrieved context, tool calls, generated output, and verification result. A run can be replayed step by step or shared as a read-only evidence link.

### Core user flow

1. The user creates a project and uploads policy, compliance, or research documents.
2. The user asks Ledger to complete a task, such as creating a compliance roadmap.
3. Planner decomposes the task into explicit steps.
4. Knowledge retrieves and ranks source chunks, exposing confidence and selection rationale.
5. Builder creates a cited artifact from the approved context.
6. Ledger verifies claims and records the full execution trace.
7. The user reviews the output, replays any step, and shares the run.

## Information architecture

```text
Ledger AI
├── Projects
│   ├── Workspace
│   ├── Runs
│   │   ├── Output
│   │   ├── Sources / retrieval trace
│   │   ├── Agent activity
│   │   ├── Tool calls
│   │   └── Replay timeline
│   └── Project settings
├── Documents
│   ├── Library
│   ├── Viewer
│   └── Chunk / metadata inspector
└── Timeline
    ├── Workspace events
    ├── Document changes
    └── Run history
```

## Component hierarchy

```text
RootLayout
├── LandingPage
│   ├── Navigation
│   ├── Hero
│   ├── ProductPreview
│   ├── FeatureGrid
│   ├── ReplayProof
│   └── CTA / Footer
└── ReplayWorkspace
    ├── LeftSidebar
    │   ├── GlobalSearch
    │   ├── PrimaryNavigation
    │   ├── ProjectList
    │   └── AccountMenu
    ├── TopBar
    ├── MainCanvas
    │   ├── OutputView
    │   │   └── CitedRoadmap
    │   └── SourceTable
    ├── RightPanel
    │   ├── AgentStatus
    │   ├── ActivityFeed
    │   └── ToolCalls
    └── ReplayPanel
        ├── TransportControls
        └── StepTimeline
```

## UI system

### Design principles

- **Evidence before spectacle:** sources, confidence, and provenance sit close to the output.
- **Calm density:** small type and compact controls are balanced with generous grouping and whitespace.
- **Familiar machinery:** window chrome, ledger lines, paper surfaces, and restrained status dots recall classic office software without becoming nostalgic theater.
- **Color has a job:** pastels identify agents and execution phases; they are not decorative gradients sprayed across every surface.
- **Inspectability is spatial:** output is central, navigation is left, operational state is right, and time is always below.

### Tokens

| Token | Value | Use |
|---|---:|---|
| `cream` | `#F8F6F2` | Application canvas |
| `beige` | `#EFE8DD` | Navigation and replay surfaces |
| `peach` | `#FFD8C2` | Planner / phase one |
| `lavender` | `#DCCEF9` | User and verification states |
| `mint` | `#CFE8D6` | Builder / successful output |
| `blue` | `#C9D8F2` | Knowledge / retrieval |
| `ink` | `#252422` | Primary type and actions |
| `line` | `#DED9D1` | Borders and separators |

- Type: Inter → Geist → IBM Plex Sans → system sans.
- Base radius: 8–16px for controls and cards; 18–24px for larger product surfaces.
- Shadows: reserved for floating windows and modals. Most hierarchy comes from borders and background shifts.
- Motion: 180–300ms for controls and panels; replay advances at a readable demonstration cadence.

## Screens included

- Responsive marketing landing page
- Compliance roadmap run workspace
- AI output with claim-level citations
- RAG source and confidence inspector
- Planner, Knowledge, and Builder status cards
- Activity and tool call panels
- Interactive replay timeline
- Global search command surface
- Share replay feedback state

## Technical implementation

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand for replay and panel state
- Lucide icons

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/workspace` for the product workspace.

## Production backend contract

The UI is structured for a FastAPI service with PostgreSQL and pgvector. A production API would expose projects, documents, runs, run steps, retrieval matches, agent events, tool calls, and share links as first-class resources. Each run step should be append-only and carry model/version metadata, input/output hashes, timestamps, and actor identity so replay remains reproducible and auditable.

