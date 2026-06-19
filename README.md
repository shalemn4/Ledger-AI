# Ledger AI

**An auditable AI workspace.** Ledger AI helps teams understand, audit, and replay AI decisions through a calm, evidence-first workspace.

## Product model

The primary object is a **Run**: an immutable record of a user prompt, agent plan, retrieved context, tool calls, generated output, verification result, and evaluation scores. A run can be replayed step by step or shared as a read-only evidence link.

### Core user flow

1. The user creates a project and uploads policy, compliance, or research documents.
2. Documents are chunked and embedded, with vectors stored in pgvector.
3. The user asks Ledger to complete a task, such as creating a compliance roadmap.
4. Planner decomposes the task into explicit steps.
5. Knowledge retrieves source chunks via pgvector similarity search, reranks them with a cross-encoder, and exposes confidence, rerank score, and selection rationale.
6. Builder creates a cited artifact from the approved context.
7. Ledger verifies claims, scores the run with an automated eval harness (retrieval quality, answer faithfulness, citation accuracy), and records the full execution trace.
8. The user reviews the output, inspects eval scores, replays any step, and shares the run.

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
│   │   ├── Evals
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
    │   ├── ToolCalls
    │   └── EvalScores
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
- Eval scores panel (retrieval quality, faithfulness, citation accuracy)
- Planner, Knowledge, and Builder status cards
- Activity and tool call panels
- Interactive replay timeline
- Global search command surface
- Share replay feedback state

## Retrieval and evaluation pipeline

Ledger AI's Knowledge agent is backed by a real retrieval pipeline rather than mocked source matching:

- **Chunking** — uploaded documents are split into overlapping text chunks with metadata (source, page, position).
- **Embeddings** — chunks are embedded and stored in **pgvector**, enabling similarity search over project documents.
- **Reranking** — top-k vector search results are reordered with a cross-encoder reranker before being surfaced to the Builder agent.
- **Evals** — each run is scored automatically using a **RAGAS**-based harness across three dimensions:
  - *Retrieval quality* — whether the right chunks were selected for the task.
  - *Answer faithfulness* — whether the generated output is supported by retrieved context.
  - *Citation accuracy* — whether claims in the output trace back correctly to source chunks.
- **Persistence** — eval scores are stored as part of the immutable run trace, alongside model/version metadata and input/output hashes, so they replay and audit consistently with every other run step.

## Technical implementation

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zustand for replay and panel state
- Lucide icons
- pgvector for embedding storage and similarity search
- Cross-encoder reranking on retrieved chunks
- RAGAS for automated retrieval and faithfulness evals

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the landing page and `http://localhost:3000/workspace` for the product workspace.

## Production backend contract

The UI is structured for a FastAPI service with PostgreSQL and pgvector. The production API exposes projects, documents, runs, run steps, retrieval matches, rerank scores, eval scores, agent events, tool calls, and share links as first-class resources. Each run step is append-only and carries model/version metadata, input/output hashes, timestamps, and actor identity so replay remains reproducible and auditable.