"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  Archive,
  ArrowLeft,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  ExternalLink,
  File,
  FileCheck2,
  FileText,
  Filter,
  Folder,
  History,
  LayoutGrid,
  Link2,
  ListChecks,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Upload,
  X,
  Trash2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileCode2,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useWorkspaceStore, DocumentItem } from "@/lib/workspace-store";
import { projectsData, ProjectConfig, SourceItem } from "@/lib/project-data";

// Shared steps across all replays
const steps = [
  { label: "Prompt", actor: "You", time: "00:00", color: "#DCCEF9" },
  { label: "Plan", actor: "Planner", time: "00:02", color: "#FFD8C2" },
  { label: "Search", actor: "Knowledge", time: "00:05", color: "#C9D8F2" },
  { label: "Retrieve", actor: "Knowledge", time: "00:09", color: "#C9D8F2" },
  { label: "Synthesize", actor: "Builder", time: "00:14", color: "#CFE8D6" },
  { label: "Output", actor: "Builder", time: "00:21", color: "#CFE8D6" },
  { label: "Verify", actor: "Knowledge", time: "00:24", color: "#DCCEF9" },
  { label: "Complete", actor: "System", time: "00:27", color: "#EFE8DD" },
];

function LeftSidebar() {
  const {
    currentView,
    setView,
    activeProjectId,
    setActiveProjectId,
    setSearchModalOpen
  } = useWorkspaceStore();

  const nav = [
    { id: "projects" as const, icon: LayoutGrid, label: "Projects", count: "4" },
    { id: "documents" as const, icon: FileText, label: "Documents", count: "24" },
    { id: "timeline" as const, icon: History, label: "Timeline" },
  ];

  return (
    <aside className="flex h-full w-[218px] shrink-0 flex-col border-r border-[#ddd8d0] bg-[#f2eee7] max-lg:w-[70px]">
      <div className="flex h-[58px] items-center border-b border-[#ddd8d0] px-4 max-lg:justify-center max-lg:px-0">
        <div className="max-lg:hidden"><Logo href="/" /></div>
        <div className="hidden max-lg:block"><Logo href="/" compact /></div>
      </div>

      <div className="p-2.5">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="mb-3 flex h-9 w-full items-center gap-2 rounded-[10px] border border-[#d7d1c9] bg-[#faf8f4] px-2.5 text-[11px] text-[#8b857d] transition-colors hover:bg-white max-lg:justify-center max-lg:px-0"
          aria-label="Search"
          id="search-trigger-btn"
        >
          <Search size={13} />
          <span className="max-lg:hidden">Search anything</span>
          <kbd className="ml-auto rounded border border-[#ddd8d0] bg-white px-1 py-0.5 text-[8px] max-lg:hidden">⌘ K</kbd>
        </button>

        <nav className="space-y-1">
          {nav.map(({ id, icon: Icon, label, count }) => {
            const active = currentView === id;
            return (
              <button
                key={label}
                onClick={() => setView(id)}
                className={`flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[11px] font-medium transition-colors max-lg:justify-center max-lg:px-0 ${active
                    ? "border border-[#d3cdc4] bg-white text-ink shadow-[0_1px_2px_rgba(37,36,34,.04)]"
                    : "text-[#716c65] hover:bg-white/60"
                  }`}
              >
                <Icon size={14} />
                <span className="max-lg:hidden">{label}</span>
                {count && <span className="ml-auto text-[9px] text-[#a09a91] max-lg:hidden">{count}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mx-3 border-t border-[#ddd7ce] max-lg:mx-2" />

      <div className="flex-1 overflow-auto p-2.5 hide-scrollbar max-lg:hidden">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[#938d85]">Projects</span>
          <Plus size={12} className="cursor-pointer text-[#847e75] hover:text-ink" onClick={() => alert("Creating a new project requires database connection. Select an existing project below.")} />
        </div>
        {[
          { key: "compliance-roadmap", name: "Compliance roadmap", color: "bg-peach" },
          { key: "vendor-review", name: "Vendor review", color: "bg-blue" },
          { key: "q3-strategy", name: "Q3 strategy", color: "bg-lavender" },
          { key: "policy-refresh", name: "Policy refresh", color: "bg-mint" },
        ].map((proj) => {
          const isActive = activeProjectId === proj.key && currentView === "projects";
          return (
            <button
              key={proj.key}
              onClick={() => {
                setActiveProjectId(proj.key);
                setView("projects");
              }}
              className={`mb-1 flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[10px] transition-colors ${isActive
                  ? "bg-[#e8e2d9] font-semibold text-ink"
                  : "text-[#706b63] hover:bg-[#ece7df]"
                }`}
            >
              <span className={`h-2 w-2 rounded-[3px] ${proj.color}`} />
              <span className="truncate">{proj.name}</span>
            </button>
          );
        })}

        <div className="mb-2 mt-6 flex items-center justify-between px-2">
          <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[#938d85]">Saved views</span>
        </div>
        <button
          onClick={() => setView("all-runs")}
          className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[10px] transition-colors ${currentView === "all-runs" ? "bg-[#e8e2d9] font-semibold text-ink" : "text-[#706b63] hover:bg-[#ece7df]"
            }`}
        >
          <Archive size={12} />All runs
        </button>
        <button
          onClick={() => setView("needs-review")}
          className={`flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[10px] transition-colors ${currentView === "needs-review" ? "bg-[#e8e2d9] font-semibold text-ink" : "text-[#706b63] hover:bg-[#ece7df]"
            }`}
        >
          <CircleDot size={12} />Needs review
          <span className="ml-auto rounded-full bg-[#ffd8c2] px-1.5 py-0.5 text-[8px] text-ink font-bold">3</span>
        </button>
      </div>

      <div className="border-t border-[#ddd8d0] p-2.5">
        <button className="flex h-10 w-full items-center gap-2.5 rounded-[10px] p-1.5 hover:bg-white/60 max-lg:justify-center">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[#c9c2b9] bg-white text-[9px] font-bold">AS</span>
          <span className="min-w-0 text-left max-lg:hidden"><span className="block truncate text-[10px] font-semibold">Asha Singh</span><span className="block text-[8px] text-[#918b83]">Acme, Inc.</span></span>
          <ChevronDown size={11} className="ml-auto max-lg:hidden" />
        </button>
      </div>
    </aside>
  );
}

function TopBar({ onShare, shared, onNewRun }: { onShare: () => void; shared: boolean; onNewRun: () => void }) {
  const { rightPanelOpen, toggleRightPanel, activeProjectId, projects } = useWorkspaceStore();
  const project = projects[activeProjectId] || projectsData[activeProjectId] || projectsData["compliance-roadmap"];

  return (
    <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#ded9d1] bg-[#fffefb] px-4 sm:px-5">
      <div className="min-w-0">
        <div className="mb-0.5 flex items-center gap-1 text-[9px] text-[#938d84]">
          <span>Projects</span>
          <ChevronRight size={9} />
          <span>Trust center</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="truncate text-[13px] font-semibold tracking-[-.02em]">{project.name}</h1>
          <span className="rounded-full border border-[#d8d2ca] px-1.5 py-0.5 text-[8px] text-[#7c766e] max-sm:hidden">Run #{project.runId}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onShare} className="flex h-8 items-center gap-1.5 rounded-lg border border-[#d8d2ca] bg-white px-2.5 text-[10px] font-semibold transition-colors hover:bg-[#f6f3ee]">
          {shared ? <Check size={12} className="text-[#50705a]" /> : <Share2 size={12} />}
          <span className="max-sm:hidden">{shared ? "Link copied" : "Share replay"}</span>
        </button>
        <button onClick={onNewRun} className="flex h-8 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[10px] font-semibold text-white hover:bg-[#3a3835]">
          <Sparkles size={11} />
          <span className="max-md:hidden">New run</span>
        </button>
        <button
          onClick={toggleRightPanel}
          className="grid h-8 w-8 place-items-center rounded-lg border border-[#d8d2ca] bg-white text-ink transition-colors hover:bg-[#fbfaf8]"
          aria-label="Toggle right panel"
        >
          {rightPanelOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
        </button>
      </div>
    </header>
  );
}

function SourceTable({ project, activeStep }: { project: ProjectConfig; activeStep: number }) {
  const { setSelectedDocumentId, setView } = useWorkspaceStore();

  const handleSourceClick = (name: string) => {
    // Match source file to local document
    let docId = "doc-1";
    if (name.includes("SOC 2")) docId = "doc-2";
    else if (name.includes("Retention")) docId = "doc-3";
    else if (name.includes("Vendor")) docId = "doc-4";

    setSelectedDocumentId(docId);
    setView("documents");
  };

  if (activeStep < 2) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#dcd6ce] p-5 text-center bg-white">
        <HelpCircle size={24} className="mb-2 text-[#9a948b] animate-pulse" />
        <p className="text-[11px] font-medium text-[#7c766e]">Sources will appear once the Search phase begins.</p>
      </div>
    );
  }

  if (activeStep === 2) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-blue/40 p-5 text-center bg-[#f2f6fc]">
        <Loader2 size={24} className="mb-2 text-blue animate-spin" />
        <p className="text-[11px] font-semibold text-ink">Scanning Vector Database...</p>
        <p className="text-[9px] text-[#817b73] mt-1">Checking semantic similarities in library documents</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#ddd7cf] bg-white">
      <div className="grid grid-cols-[1.6fr_1fr_70px] border-b border-[#e4dfd8] bg-[#f6f2ec] px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-[#8c867e] sm:grid-cols-[1.6fr_1.2fr_80px_70px]">
        <span>Document</span><span>Retrieved chunk</span><span className="hidden sm:block">Role</span><span>Match</span>
      </div>
      {project.sources.map((source, i) => (
        <button
          key={source.name}
          onClick={() => handleSourceClick(source.name)}
          className="grid w-full grid-cols-[1.6fr_1fr_70px] items-center border-b border-[#eee9e2] px-3 py-3 text-left last:border-0 hover:bg-[#faf8f4] sm:grid-cols-[1.6fr_1.2fr_80px_70px]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${["bg-peach", "bg-blue", "bg-lavender", "bg-mint"][i % 4]}`}>
              <FileText size={12} />
            </span>
            <span className="truncate text-[10px] font-semibold hover:underline text-ink">{source.name}</span>
          </span>
          <span className="truncate text-[9px] text-[#7e7870]">{source.chunk}</span>
          <span className="hidden text-[8px] text-[#807a72] sm:block">{source.tag}</span>
          <span className="flex flex-col items-end justify-center text-[9px] font-semibold">
            <span className="text-[#50705a] font-bold text-[9px]">Rerank: {source.score}%</span>
            {source.vectorScore !== undefined && (
              <span className="text-[#7c766e] text-[8px] font-medium">Vector: {source.vectorScore}%</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function DynamicOutputView({ project, activeStep }: { project: ProjectConfig; activeStep: number }) {
  const { setTab } = useWorkspaceStore();

  return (
    <div className="mx-auto w-full max-w-[760px] pb-8">
      {/* Prompt Block */}
      <div className="mb-4 rounded-2xl border border-[#ded8d0] bg-[#f3efe8] p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-lavender text-[9px] font-bold">You</div>
          <div>
            <p className="text-[11px] font-semibold leading-5 text-ink">{project.prompt}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[8px] text-[#88827a]">
              <span className="rounded-full bg-white px-2 py-1">{project.metadata}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic State Engine */}
      {activeStep === 0 && (
        <div className="rounded-2xl border border-[#ded8d0] bg-white p-8 text-center shadow-[0_8px_30px_rgba(42,39,35,.04)]">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#8b7ca4] mb-3" />
          <h3 className="text-[12px] font-semibold text-ink">Awaiting Agent Actions...</h3>
          <p className="text-[10px] text-[#7a7369] mt-1 max-w-[320px] mx-auto leading-4">
            Planner is reading the prompt to construct an auditable execution chain. Click Play or select Step 2 to proceed.
          </p>
        </div>
      )}

      {activeStep === 1 && (
        <div className="rounded-2xl border border-[#e1dcd4] bg-[#fffdf9] p-6 shadow-[0_8px_30px_rgba(42,39,35,.02)] transition-all">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-peach text-[10px] font-bold">P</span>
            <div>
              <h3 className="text-[12px] font-semibold">Execution plan formulated</h3>
              <p className="text-[8px] text-[#8c867e] mt-0.5">Planner Agent · v1.0.2</p>
            </div>
          </div>
          <div className="space-y-2 border-l border-[#ded9d1] pl-4 ml-3.5">
            {project.plan.map((stepDesc, idx) => (
              <div key={idx} className="flex items-start gap-2.5 py-1">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#f3efe8] text-[8px] font-bold text-ink">
                  {idx + 1}
                </span>
                <p className="text-[10px] text-[#56514b] leading-4">{stepDesc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e1dcd4] bg-[#fffdf9] p-6 opacity-70">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-peach text-[10px] font-bold">P</span>
              <h3 className="text-[12px] font-semibold">Execution plan complete</h3>
            </div>
          </div>
          <div className="rounded-2xl border border-blue/20 bg-blue/5 p-6 text-center animate-pulse">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue mb-3" />
            <h3 className="text-[12px] font-semibold text-ink">Knowledge agent searching vector spaces...</h3>
            <p className="text-[10px] text-[#7a7369] mt-1 leading-4">
              Analyzing corporate compliance library with pgvector semantic similarity.
            </p>
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#e1dcd4] bg-[#fffdf9] p-6 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-peach text-[10px] font-bold">P</span>
              <h3 className="text-[12px] font-semibold">Plan complete</h3>
            </div>
          </div>
          <div className="rounded-2xl border border-[#dcd6ce] bg-white p-5 shadow-[0_8px_30px_rgba(42,39,35,.03)]">
            <div className="mb-4 flex items-center justify-between border-b border-[#eee] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue"><FileSearchIcon size={12} /></span>
                <div>
                  <h3 className="text-[11px] font-semibold">Retrieval completed successfully</h3>
                  <p className="text-[8px] text-[#8e887e]">Knowledge Agent · 4 sources verified</p>
                </div>
              </div>
              <button onClick={() => setTab("sources")} className="text-[8px] font-bold text-blue hover:underline">
                Inspect chunks →
              </button>
            </div>
            <div className="space-y-2">
              {project.sources.map((source, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[#fbfaf8] border border-[#f1ebe2] p-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <FileText size={11} className="text-[#8e887f] shrink-0" />
                    <span className="text-[9px] font-semibold truncate text-ink">{source.name}</span>
                  </span>
                  <span className="text-[9px] font-bold text-[#5c7362] bg-[#eef6f0] px-1.5 py-0.5 rounded">
                    {source.score}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#dcd6ce] bg-white p-5 shadow-[0_8px_30px_rgba(42,39,35,.03)] opacity-60">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue"><FileSearchIcon size={12} /></span>
              <h3 className="text-[11px] font-semibold">Context sources verified</h3>
            </div>
          </div>
          <div className="rounded-2xl border border-mint/20 bg-white p-6 shadow-[0_8px_30px_rgba(42,39,35,.04)]">
            <div className="flex items-center gap-2.5 mb-5">
              <Loader2 className="h-5 w-5 animate-spin text-mint" />
              <div>
                <h3 className="text-[12px] font-semibold">Builder is synthesizing content...</h3>
                <p className="text-[8px] text-[#8e887f] mt-0.5">Generating cited structure from validated sources</p>
              </div>
            </div>
            {/* Pulsing Skeleton */}
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-100 rounded"></div>
              <div className="h-2 bg-gray-100 rounded w-5/6"></div>
              <div className="border border-gray-100 rounded-lg p-3 space-y-2 mt-4">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeStep >= 5 && (
        <article className="rounded-2xl border border-[#dcd6ce] bg-white p-5 shadow-[0_8px_30px_rgba(42,39,35,.04)] sm:p-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-[#ebe6df] pb-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-mint"><Sparkles size={15} /></span>
              <div>
                <p className="text-[13px] font-semibold">{project.output.title}</p>
                <p className="mt-0.5 text-[9px] text-[#89837b]">{project.output.subtitle}</p>
              </div>
            </div>

            {activeStep === 5 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#fcf8e3] px-2.5 py-1.5 text-[8px] font-bold text-[#8a6d3b] border border-[#faebcc] animate-pulse">
                <AlertTriangle size={10} /> Claims verifying...
              </span>
            )}
            {activeStep === 6 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#f2eefc] px-2.5 py-1.5 text-[8px] font-bold text-[#7252a1] border border-[#e1d5fa]">
                <Loader2 size={10} className="animate-spin" /> Verifying 6 claims
              </span>
            )}
            {activeStep === 7 && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#e9f3eb] px-2.5 py-1.5 text-[8px] font-bold text-[#50705a] border border-[#d0e9d5]">
                <ShieldCheck size={10} /> Claims sealed
              </span>
            )}
          </div>

          <p className="mb-6 text-[11px] leading-6 text-[#56524c]">{project.output.summary}</p>

          <div className="space-y-3">
            {project.output.phases.map((item) => (
              <section key={item.phase} className="rounded-xl border border-[#e1dcd4] bg-[#fdfcf9] p-4 transition-all hover:bg-[#fffdfb]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-[9px] font-bold ${item.color} text-ink`}>
                      {item.phase.slice(-2)}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#8c867e]">{item.phase}</p>
                      <h3 className="text-[12px] font-semibold text-ink">{item.title}</h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f0ebe4] px-2 py-1 text-[8px] font-semibold text-[#746e66]">{item.date}</span>
                </div>
                <div className="space-y-2 pl-9">
                  {item.tasks.map((task) => (
                    <div key={task} className="flex items-center gap-2 text-[10px] text-[#56514b]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8b7ca4]" />
                      {task}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setTab("sources");
                      alert(`Showing retrieval matches matching ${item.cite}.`);
                    }}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[8px] transition-colors ${activeStep === 5
                        ? "bg-[#fffdf5] border-[#faebcc] text-[#8a6d3b]"
                        : "bg-white border-[#ded8d0] text-[#777168] hover:bg-[#f6f3ee]"
                      }`}
                  >
                    <Link2 size={8} />
                    {item.cite}
                    {activeStep === 5 && <span className="ml-1 text-[6px] uppercase px-1 rounded bg-[#faebcc]">Check...</span>}
                    {activeStep >= 6 && <span className="ml-1 text-[6px] uppercase px-1 rounded bg-[#d0e9d5] text-[#50705a]">✓ Verified</span>}
                  </button>
                </div>
              </section>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function EvalsView({ project, activeStep }: { project: ProjectConfig; activeStep: number }) {
  if (activeStep < 3) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#dcd6ce] p-5 text-center bg-white">
        <HelpCircle size={24} className="mb-2 text-[#9a948b] animate-pulse" />
        <p className="text-[11px] font-medium text-[#7c766e]">Evaluations will begin once search chunks are retrieved.</p>
        <p className="text-[9px] text-[#a09a91] mt-1">Metrics (Retrieval, Faithfulness, Citation) populate at specific steps.</p>
      </div>
    );
  }

  const evals = project.evals || {
    retrievalQuality: 91,
    retrievalQualityReasoning: "The search retrieved compliance sections for risk management, which match the core concepts of the user request.",
    faithfulness: 88,
    faithfulnessReasoning: "Synthesized tasks are directly supported by sections of the retrieved compliance documents. No hallucinations detected.",
    citationAccuracy: 95,
    citationAccuracyReasoning: "Roadmap items properly cite references from the SOC 2 Matrix and EU AI Act sections without anomalies."
  };

  const evalSteps = [
    {
      label: "1. Prompt Assessment",
      status: "Verified",
      score: "100%",
      detail: `Evaluated prompt structure for intent clarity. Swarmed Planner to map target domains: "${project.prompt}".`,
      color: "bg-lavender"
    },
    {
      label: "2. Retrieval Quality",
      status: activeStep >= 4 ? "Evaluated" : "Assessing...",
      score: activeStep >= 4 ? `${evals.retrievalQuality}%` : "Calculating...",
      detail: evals.retrievalQualityReasoning,
      color: "bg-blue"
    },
    {
      label: "3. Output Faithfulness",
      status: activeStep >= 6 ? "Evaluated" : "Pending Synthesis...",
      score: activeStep >= 6 ? `${evals.faithfulness}%` : "Pending...",
      detail: activeStep >= 6 ? evals.faithfulnessReasoning : "Faithfulness checking will run once the final answer is generated in Step 6.",
      color: "bg-mint"
    },
    {
      label: "4. Citation Verification",
      status: activeStep >= 7 ? "Sealed" : "Pending Output...",
      score: activeStep >= 7 ? `${evals.citationAccuracy}%` : "Pending...",
      detail: activeStep >= 7 ? evals.citationAccuracyReasoning : "Citation checking runs during the claim validation phase in Step 7.",
      color: "bg-peach"
    }
  ];

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-6">
        <span className="eyebrow !text-[8px]">Evaluation Harness</span>
        <h2 className="mt-2 text-[18px] font-semibold tracking-[-.03em] mt-1">Run quality and compliance audit</h2>
        <p className="mt-1 text-[10px] text-[#817b73] mt-0.5">
          Automated evaluation logs for Run #{project.runId}. Sealed on the Run object trace.
        </p>
      </div>

      {/* Main Scorecards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Retrieval quality", score: evals.retrievalQuality, color: "bg-blue" },
          { label: "Answer faithfulness", score: evals.faithfulness, color: "bg-mint" },
          { label: "Citation accuracy", score: evals.citationAccuracy, color: "bg-peach" }
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#ddd7cf] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,.02)]">
            <span className={`mb-3 block h-1 w-10 rounded-full ${item.color}`} />
            <p className="text-[22px] font-semibold tracking-[-.04em] text-ink">{item.score}%</p>
            <p className="text-[9px] text-[#88827a] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Step details */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9a948b] mb-2">Step-by-step Evaluation Audit</h3>
        <div className="space-y-3">
          {evalSteps.map((s, idx) => (
            <div key={idx} className="rounded-xl border border-[#ddd7cf] bg-white p-4 transition-all hover:bg-[#fffdfb]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                  <h4 className="text-[11px] font-semibold text-ink">{s.label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-[#817b73] bg-[#f0ebe4] px-1.5 py-0.5 rounded">{s.status}</span>
                  <span className="text-[10px] font-bold text-ink">{s.score}</span>
                </div>
              </div>
              <p className="text-[10px] leading-5 text-[#5c564f]">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Judge Signature */}
      <div className="mt-5 rounded-xl border border-[#ddd7cf] bg-[#fffefb] p-4 font-mono text-[8px] text-[#716c65] space-y-1">
        <p className="font-semibold text-[9px] font-sans mb-1 text-ink flex items-center gap-1">
          <ShieldCheck size={11} className="text-[#50705a]" /> Evaluator Audit Seal
        </p>
        <p>SYSTEM_METRICS_JUDGE: gpt-4o-mini-evaluator</p>
        <p>AUDIT_RUN_HASH: 0x{project.runId}f82a9c3b8e4f82d1c9b3e8c7a6e5d</p>
        <p>SEAL_SIGNATURE: SEALED_BY_KNOWLEDGE_AGENT_KEY_V1_2</p>
        <p>TIMESTAMP: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}

function MainCanvas() {
  const { tab, setTab, activeStep, activeProjectId, projects } = useWorkspaceStore();
  const project = projects[activeProjectId] || projectsData[activeProjectId] || projectsData["compliance-roadmap"];

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f8f6f2]">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#e0dbd3] bg-[#fbfaf7] px-4 sm:px-5">
        <div className="flex h-full items-center gap-5">
          <button
            onClick={() => setTab("output")}
            className={`relative h-full text-[10px] font-semibold transition-colors ${tab === "output" ? "text-ink font-bold" : "text-[#8b857d] hover:text-ink"
              }`}
          >
            AI output
            {tab === "output" && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />}
          </button>
          <button
            onClick={() => setTab("sources")}
            className={`relative h-full text-[10px] font-semibold transition-colors ${tab === "sources" ? "text-ink font-bold" : "text-[#8b857d] hover:text-ink"
              }`}
          >
            Sources
            <span className="ml-1 rounded-full bg-[#ebe5dc] px-1.5 py-0.5 text-[8px] font-bold text-ink">
              {activeStep < 3 ? "0" : project.sources.length}
            </span>
            {tab === "sources" && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />}
          </button>
          <button
            onClick={() => setTab("evals")}
            className={`relative h-full text-[10px] font-semibold transition-colors ${tab === "evals" ? "text-ink font-bold" : "text-[#8b857d] hover:text-ink"
              }`}
          >
            Evals
            {activeStep >= 3 && project.evals && (
              <span className="ml-1.5 rounded-full bg-[#cfe8d6] px-1.5 py-0.5 text-[8px] font-bold text-[#50705a] border border-[#d0e9d5]">
                {Math.round((project.evals.retrievalQuality + project.evals.faithfulness + project.evals.citationAccuracy) / 3)}%
              </span>
            )}
            {tab === "evals" && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => alert("Copied output markdown to clipboard.")} className="grid h-7 w-7 place-items-center rounded-lg border border-[#dbd5cd] bg-white text-[#555] hover:bg-[#faf9f6]"><Copy size={11} /></button>
          <button className="grid h-7 w-7 place-items-center rounded-lg border border-[#dbd5cd] bg-white text-[#555] hover:bg-[#faf9f6]"><MoreHorizontal size={12} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 hide-scrollbar sm:px-6 sm:py-6">
        {tab === "output" ? (
          <DynamicOutputView project={project} activeStep={activeStep} />
        ) : tab === "sources" ? (
          <div className="mx-auto max-w-[860px]">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <span className="eyebrow !text-[8px]">Retrieval trace</span>
                <h2 className="mt-2 text-[18px] font-semibold tracking-[-.03em]">Why these documents?</h2>
                <p className="mt-1 text-[10px] text-[#817b73]">
                  {activeStep < 3 ? "0 documents selected." : `${project.sources.length} of 12 documents were selected for synthesis.`}
                </p>
              </div>
              <button className="flex h-8 items-center gap-1.5 rounded-lg border border-[#d9d3ca] bg-white px-2.5 text-[9px] hover:bg-[#fcfbf9]"><Filter size={10} />Filters</button>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {[
                [activeStep < 3 ? "0" : String(project.sources.length), 'Chunks used', activeStep < 3 ? 'bg-gray-300' : 'bg-peach'],
                [activeStep < 3 ? "0%" : "91.8%", 'Avg. confidence', activeStep < 3 ? 'bg-gray-300' : 'bg-mint'],
                [activeStep < 2 ? "0" : "12", 'Documents searched', activeStep < 2 ? 'bg-gray-300' : 'bg-blue']
              ].map(([value, label, color]) => (
                <div key={label} className="rounded-xl border border-[#ddd7cf] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,.02)]">
                  <span className={`mb-3 block h-1 w-10 rounded-full ${color}`} />
                  <p className="text-[19px] font-semibold tracking-[-.04em] text-ink">{value}</p>
                  <p className="text-[9px] text-[#88827a]">{label}</p>
                </div>
              ))}
            </div>

            <SourceTable project={project} activeStep={activeStep} />

            <div className="mt-4 rounded-xl border border-[#ddd7cf] bg-[#fffefb] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Braces size={12} className="text-[#7c766e]" />
                <p className="text-[10px] font-semibold">Selection rationale</p>
              </div>
              <p className="text-[10px] leading-5 text-[#6e6861]">
                {activeStep < 3
                  ? "Rationale will populate once context chunks are retrieved and ranked by semantic correlation."
                  : "These passages directly define governance ownership, access controls, retention windows, and vendor review cadence. Lower-ranked results were excluded because they described implementation guidance rather than auditable requirements."}
              </p>
            </div>
          </div>
        ) : (
          <EvalsView project={project} activeStep={activeStep} />
        )}
      </div>
    </section>
  );
}

function RightPanel({ onClose }: { onClose: () => void }) {
  const { rightPanelOpen, activeStep, activeProjectId, projects } = useWorkspaceStore();
  if (!rightPanelOpen) return null;

  const project = projects[activeProjectId] || projectsData[activeProjectId] || projectsData["compliance-roadmap"];

  // Dynamic agent states based on activeStep
  const pStatus = activeStep === 0 ? "Pending" : activeStep === 1 ? "In progress" : "Complete";
  const kStatus = activeStep < 2 ? "Pending" : (activeStep === 2 || activeStep === 3 || activeStep === 6) ? "In progress" : "Complete";
  const bStatus = activeStep < 4 ? "Pending" : activeStep === 4 ? "In progress" : "Complete";

  const agents = [
    {
      key: "P",
      name: "Planner",
      detail: activeStep === 0 ? "Analyzing prompt..." : activeStep === 1 ? "Decomposing task..." : "Plan complete",
      color: "bg-peach",
      state: pStatus
    },
    {
      key: "K",
      name: "Knowledge",
      detail: activeStep < 2 ? "Waiting for plan..." : activeStep === 2 ? "Searching db..." : activeStep === 3 ? "Retrieving context..." : activeStep === 6 ? "Verifying claims..." : `${project.sources.length} sources verified`,
      color: "bg-blue",
      state: kStatus
    },
    {
      key: "B",
      name: "Builder",
      detail: activeStep < 4 ? "Waiting for sources..." : activeStep === 4 ? "Synthesizing output..." : "Roadmap generated",
      color: "bg-mint",
      state: bStatus
    },
  ];

  // Dynamic activities
  const filteredActivities = project.activities.filter(a => a.stepIndex <= activeStep);
  // Dynamic tool calls
  const filteredTools = project.tools.filter(t => t.stepIndex <= activeStep);

  return (
    <>
      {/* Drawer overlay for mobile / medium viewports */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[#252422]/25 backdrop-blur-[2px] xl:hidden"
      />
      <aside className="fixed right-0 top-0 bottom-0 z-50 flex w-[260px] flex-col border-l border-[#ddd8d0] bg-[#faf8f4] shadow-2xl xl:static xl:z-auto xl:w-[250px] xl:shadow-none h-full overflow-hidden shrink-0">
        <div className="flex h-[58px] items-center justify-between border-b border-[#ded9d1] px-4 xl:hidden bg-[#fffefb]">
          <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[#817b73]">Agent Inspector</span>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg border border-[#d8d2ca] bg-white"><X size={12} /></button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-3.5 space-y-4">
          {/* Agent Status */}
          <div className="border-b border-[#e1dcd4] pb-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#817b73]">Agent status</p>
              <span className="flex items-center gap-1.5 text-[8px] font-medium text-[#62806a]">
                {activeStep === 7 ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#78a182]" />
                    All complete
                  </>
                ) : (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b8956e] animate-ping" />
                    Executing...
                  </>
                )}
              </span>
            </div>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.name} className="rounded-xl border border-[#dfd9d1] bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,.01)]">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-[9px] font-bold ${agent.color} text-ink`}>{agent.key}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-ink">{agent.name}</p>
                        {agent.state === "Complete" ? (
                          <Check size={10} className="text-[#66816d] font-bold" />
                        ) : agent.state === "In progress" ? (
                          <Loader2 size={10} className="text-[#b58c5c] animate-spin" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <p className="truncate text-[8px] text-[#8d877f]">{agent.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="border-b border-[#e1dcd4] pb-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#817b73]">Activity</p>
              <Activity size={11} className="text-[#8e887f]" />
            </div>
            {filteredActivities.length === 0 ? (
              <p className="text-[9px] text-[#938d85] italic pl-2">No activity events recorded.</p>
            ) : (
              <div className="ml-1 border-l border-[#d8d2ca] pl-3.5 relative">
                {filteredActivities.map((act, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                    <span className={`absolute -left-[18px] top-1 h-2 w-2 rounded-full border border-[#faf8f4] ${act.color}`} />
                    <p className="text-[9px] font-semibold leading-4 text-ink">{act.action}</p>
                    <p className="text-[8px] text-[#958f87]">{act.actor} · {act.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tool Calls */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#817b73]">Tool calls</p>
              <span className="rounded-full bg-[#ebe6df] px-1.5 text-[8px] font-bold text-ink">{filteredTools.length}</span>
            </div>
            {filteredTools.length === 0 ? (
              <p className="text-[9px] text-[#938d85] italic">No active tool executions.</p>
            ) : (
              <div className="space-y-1.5">
                {filteredTools.map((tool, i) => {
                  let ToolIcon = Search;
                  if (tool.iconKey === "file") ToolIcon = FileText;
                  else if (tool.iconKey === "checks") ToolIcon = ListChecks;
                  else if (tool.iconKey === "wrench") ToolIcon = Wrench;

                  return (
                    <button
                      key={i}
                      onClick={() => alert(`Showing execution tracing logs for ${tool.name}. Duration: ${tool.time}.`)}
                      className="flex w-full items-center gap-2 rounded-lg border border-[#e1dcd4] bg-white px-2.5 py-2 text-left hover:border-[#c9c2b8] hover:bg-[#fafaf9] transition-all"
                    >
                      <ToolIcon size={11} className="text-[#6f6961] shrink-0" />
                      <span className="flex-1 font-mono text-[8px] text-ink truncate">{tool.name}</span>
                      <span className="text-[8px] text-[#9a948b] shrink-0">{tool.time}</span>
                      <ChevronRight size={9} className="text-[#a8a197]" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function ReplayPanel() {
  const { activeStep, playing, setStep, togglePlaying, setPlaying, activeProjectId } = useWorkspaceStore();
  const [expanded, setExpanded] = useState(true);

  const project = projectsData[activeProjectId] || projectsData["compliance-roadmap"];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const current = useWorkspaceStore.getState().activeStep;
      if (current >= steps.length - 1) {
        setPlaying(false);
      } else {
        useWorkspaceStore.getState().setStep(current + 1);
        // Force state playing true because setStep turns it false
        useWorkspaceStore.setState({ playing: true });
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [playing, setPlaying]);

  const progress = (activeStep / (steps.length - 1)) * 100;

  return (
    <section className={`shrink-0 border-t border-[#cfc8bf] bg-[#eee8df] transition-[height] duration-300 ${expanded ? "h-[138px]" : "h-[42px]"}`}>
      <div className="flex h-[42px] items-center justify-between border-b border-[#dbd5cc] px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="grid h-6 w-6 place-items-center rounded-md border border-[#d4cec5] bg-white hover:bg-gray-50 transition-colors">
            {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          <span className="text-[10px] font-semibold text-ink">Replay timeline</span>
          <span className="rounded-full bg-[#e0d8ce] px-2 py-0.5 text-[8px] text-[#746e66] font-bold">Step {activeStep + 1} of {steps.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setStep(Math.max(0, activeStep - 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-[#d3cdc4] bg-white hover:bg-gray-50 transition-colors"><ChevronLeft size={12} /></button>
          <button onClick={togglePlaying} className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-white hover:bg-[#3d3a37] transition-colors">
            {playing ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
          </button>
          <button onClick={() => setStep(Math.min(steps.length - 1, activeStep + 1))} className="grid h-7 w-7 place-items-center rounded-lg border border-[#d3cdc4] bg-white hover:bg-gray-50 transition-colors"><ChevronRight size={12} /></button>
          <span className="ml-1 font-mono text-[8px] text-[#79736b]">{steps[activeStep].time} / 00:27</span>
        </div>
      </div>
      {expanded && (
        <div className="overflow-x-auto px-4 py-4 hide-scrollbar">
          <div className="relative mx-auto flex min-w-[720px] max-w-[980px] items-start justify-between">
            <div className="absolute left-5 right-5 top-[10px] h-1 rounded-full bg-[#d5cec5]">
              <div className="h-full rounded-full bg-[#766990] transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            {steps.map((step, i) => (
              <button
                key={step.label}
                onClick={() => setStep(i)}
                className="relative z-10 flex w-[78px] flex-col items-center text-center group"
              >
                <span
                  className={`mb-2 grid h-5 w-5 place-items-center rounded-full border-2 transition-all ${i <= activeStep ? "border-[#766990]" : "border-[#c8c1b8]"
                    }`}
                  style={{ background: i <= activeStep ? step.color : "#eee8df" }}
                >
                  {i === activeStep ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#645777]" />
                  ) : i < activeStep ? (
                    <Check size={9} strokeWidth={3} className="text-[#645777]" />
                  ) : null}
                </span>
                <span className={`text-[9px] font-semibold ${i === activeStep ? "text-ink font-bold" : "text-[#777168] group-hover:text-ink"}`}>{step.label}</span>
                <span className="mt-0.5 text-[7px] text-[#989188]">{step.actor}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ----------------------------------------------------
// DOCUMENTS VIEW & COMPONENTS
// ----------------------------------------------------
function DocumentsView() {
  const { documents, selectedDocumentId, setSelectedDocumentId, deleteDocument, uploadDocumentFile } = useWorkspaceStore();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadName, setUploadName] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingReal, setIsUploadingReal] = useState(false);

  const mockFiles = [
    { name: "ISO 27001 Annex A.pdf", size: "820 KB", chunks: 45, content: "ISO/IEC 27001 Annex A details 114 control objectives grouped in 14 domains. Organizations must implement mobile device security policies, restrict network configuration paths, enforce administrative separation of duties, and audit login access profiles regularly." },
    { name: "GDPR Article 32 Security.pdf", size: "510 KB", chunks: 32, content: "GDPR Article 32 mandates appropriate technical and organizational measures to ensure security. Requirements specify data pseudonymization, system resilience audits, rapid disaster recovery access paths, and annual evaluation of control effectiveness." },
    { name: "NIST AI Risk Framework.pdf", size: "2.1 MB", chunks: 180, content: "The NIST AI Risk Management Framework provides guidance on mapping, measuring, managing, and governing AI security. It emphasizes transparency, structural safety boundaries, third-party model assessments, and clear metadata auditing structures." }
  ];

  const triggerUpload = (file: typeof mockFiles[0]) => {
    setShowUploadModal(false);
    setUploadName(file.name);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Use standard upload API by creating a mock file object and sending it
          const blob = new Blob([file.content], { type: "text/plain" });
          const fileObj = new (File as any)([blob], file.name, { type: "text/plain" });
          
          uploadDocumentFile(fileObj).catch(err => {
            console.error("Failed to index mock file:", err);
            alert("Failed to index file in local vector database.");
          });
        }, 500);
      }
    }, 120);
  };

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowUploadModal(false);
    setUploadName(file.name);
    setUploadProgress(0);
    setIsUploadingReal(true);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 15, 90);
      setUploadProgress(progress);
    }, 150);

    try {
      await uploadDocumentFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        setIsUploadingReal(false);
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      setIsUploadingReal(false);
      alert(err.message || "Failed to upload document");
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocumentId);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f6f2] relative">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto hide-scrollbar">
        {/* Header summary */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e2ddd5] pb-4">
          <div>
            <span className="eyebrow">Data library</span>
            <h2 className="text-[20px] font-semibold tracking-[-.03em] mt-1">Uploaded compliance files</h2>
            <p className="text-[10px] text-[#817b73] mt-0.5">Corporate policies and compliance documents searched by Knowledge agent.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-[10px] font-semibold text-white hover:bg-[#3d3a37] transition-colors"
          >
            <Upload size={12} />
            <span>Upload document</span>
          </button>
        </div>

        {/* Upload progress indicator */}
        {uploadProgress !== null && (
          <div className="mb-4 rounded-xl border border-blue/20 bg-blue/5 p-4 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-ink">Uploading {uploadName}...</span>
              <span className="text-[9px] font-bold text-blue">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#e4ded6] overflow-hidden">
              <div className="h-full rounded-full bg-blue transition-[width] duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Grid summary stats */}
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-[#ddd7cf] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.01)]">
            <p className="text-[18px] font-semibold text-ink">{documents.length}</p>
            <p className="text-[9px] text-[#88827a] mt-0.5">Total documents</p>
          </div>
          <div className="rounded-xl border border-[#ddd7cf] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.01)]">
            <p className="text-[18px] font-semibold text-ink">
              {documents.reduce((acc, d) => acc + d.chunks, 0)}
            </p>
            <p className="text-[9px] text-[#88827a] mt-0.5">Chunks indexed</p>
          </div>
          <div className="rounded-xl border border-[#ddd7cf] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.01)]">
            <p className="text-[18px] font-semibold text-[#50705a] flex items-center gap-1.5">
              100% <Check size={14} className="text-[#50705a]" />
            </p>
            <p className="text-[9px] text-[#88827a] mt-0.5">System status</p>
          </div>
        </div>

        {/* Document list table */}
        <div className="overflow-hidden rounded-xl border border-[#ddd7cf] bg-white shadow-[0_4px_20px_rgba(37,36,34,.02)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e4dfd8] bg-[#f6f2ec] text-[8px] font-bold uppercase tracking-wider text-[#8c867e]">
                <th className="px-4 py-2.5">File Name</th>
                <th className="px-4 py-2.5">Size</th>
                <th className="px-4 py-2.5">Date Added</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Chunks</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedDocumentId(doc.id)}
                  className={`border-b border-[#eee9e2] last:border-0 hover:bg-[#faf8f4] cursor-pointer transition-colors ${selectedDocumentId === doc.id ? "bg-[#faf8f4]" : ""
                    }`}
                >
                  <td className="px-4 py-3 text-[10px] font-semibold text-ink flex items-center gap-2">
                    <FileText size={12} className="text-[#7c766e]" />
                    <span className="truncate max-w-[200px] hover:underline">{doc.name}</span>
                  </td>
                  <td className="px-4 py-3 text-[9px] text-[#6e6861]">{doc.size}</td>
                  <td className="px-4 py-3 text-[9px] text-[#6e6861]">{doc.uploadedAt}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold ${doc.status === "Indexed"
                        ? "bg-[#eef6f0] text-[#50705a]"
                        : doc.status === "Processing"
                          ? "bg-[#fffdf2] text-[#8a7238] animate-pulse"
                          : "bg-red-50 text-red-700"
                      }`}>
                      {doc.status === "Indexed" && <Check size={8} />}
                      {doc.status === "Processing" && <Loader2 size={8} className="animate-spin" />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[9px] font-mono text-[#6e6861]">{doc.chunks}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 text-[#8b857d] hover:text-red-700 rounded transition-colors"
                      aria-label="Delete document"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over document viewer */}
      {selectedDoc && (
        <>
          <div
            onClick={() => setSelectedDocumentId(null)}
            className="fixed inset-0 z-40 bg-[#252422]/20 backdrop-blur-[1px]"
          />
          <aside className="absolute right-0 top-0 bottom-0 z-50 flex w-[380px] flex-col border-l border-[#ddd8d0] bg-[#fffefb] shadow-2xl h-full overflow-hidden transition-transform duration-300">
            <div className="flex h-[58px] items-center justify-between border-b border-[#ded9d1] px-5 bg-[#fbfaf7]">
              <div>
                <p className="text-[8px] font-semibold text-[#8b857d]">DOCUMENT METADATA</p>
                <h3 className="text-[12px] font-bold text-ink truncate max-w-[240px]">{selectedDoc.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDocumentId(null)}
                className="grid h-7 w-7 place-items-center rounded-lg border border-[#d8d2ca] bg-white text-ink hover:bg-gray-50 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar">
              <div className="rounded-xl border border-[#e1dcd4] bg-[#f8f6f2] p-4 text-[10px] space-y-2">
                <div className="flex justify-between"><span className="text-[#837e75]">Size:</span><span className="font-semibold text-ink">{selectedDoc.size}</span></div>
                <div className="flex justify-between"><span className="text-[#837e75]">Status:</span><span className="font-semibold text-[#50705a]">{selectedDoc.status}</span></div>
                <div className="flex justify-between"><span className="text-[#837e75]">Chunks:</span><span className="font-mono text-ink">{selectedDoc.chunks}</span></div>
                <div className="flex justify-between"><span className="text-[#837e75]">Uploaded:</span><span className="font-semibold text-ink">{selectedDoc.uploadedAt}</span></div>
              </div>

              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#817b73] mb-2">Extracted Text Preview</h4>
                <div className="rounded-xl border border-[#e4ded6] bg-[#fbfcfb] p-3 text-[10px] text-[#4d4841] leading-5">
                  {selectedDoc.content}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#ebe6df] pb-1.5">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#817b73]">Simulated RAG Chunks</h4>
                  <span className="rounded bg-[#eee8df] px-1 text-[8px] font-bold text-ink">3 Chunks</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "chunk-102", score: 96, text: `§1.1 - ${selectedDoc.content.slice(0, 100)}...` },
                    { id: "chunk-103", score: 90, text: `§1.2 - ${selectedDoc.content.slice(80, 180)}...` },
                    { id: "chunk-104", score: 82, text: `§1.3 - ${selectedDoc.content.slice(150, 240)}...` },
                  ].map((chunk) => (
                    <div key={chunk.id} className="rounded-xl border border-[#ded8d0] p-3 hover:border-blue/30 transition-all bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-ink">{chunk.id}</span>
                        <span className="text-[8px] font-bold bg-blue/10 text-blue px-1.5 py-0.5 rounded">
                          {chunk.score}% match score
                        </span>
                      </div>
                      <p className="text-[9px] leading-4 text-[#716c65] italic">"{chunk.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Mock Upload Selection modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252422]/30 backdrop-blur-[2px]">
          <div className="w-[380px] rounded-2xl border border-[#cfc8be] bg-[#fffefb] p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2ddd5] pb-2">
              <h3 className="text-[12px] font-semibold text-ink">Select Document to Upload</h3>
              <button onClick={() => setShowUploadModal(false)}><X size={13} /></button>
            </div>
            <p className="text-[10px] text-[#817b73] leading-4">
              Select one of these preconfigured standard files to simulate pdf parsing, tokenization, and vector DB indexing:
            </p>
            <div className="space-y-2">
              {mockFiles.map((f, i) => (
                <button
                  key={i}
                  onClick={() => triggerUpload(f)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#e2ddd5] bg-white p-3 hover:bg-[#faf8f4] hover:border-ink/20 text-left transition-all group"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue/10 text-blue"><FileCode2 size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold truncate group-hover:underline text-ink">{f.name}</p>
                    <p className="text-[8px] text-[#938d85]">{f.size} · {f.chunks} chunks</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="border-t border-[#e2ddd5] pt-4 mt-4">
              <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#9a948b] mb-2">Or Upload Custom Document</p>
              <input
                type="file"
                accept=".txt,.pdf"
                id="custom-file-upload-input"
                onChange={handleRealFileUpload}
                className="hidden"
              />
              <label
                htmlFor="custom-file-upload-input"
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#dcd6ce] bg-[#fbfaf8] text-[10px] font-semibold text-[#56514b] hover:bg-[#f6f3ee] hover:border-[#b1aaa0] transition-all animate-pulse"
              >
                <Upload size={12} className="text-[#7c766e]" />
                <span>Choose txt or pdf file</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// TIMELINE AUDIT LOG VIEW
// ----------------------------------------------------
function TimelineView() {
  const [filterQuery, setFilterQuery] = useState("");

  const events = [
    { type: "run", title: "Run #R-2048 completed", desc: "Compliance readiness roadmap generated by Builder and verified by Knowledge.", time: "Today · 9:42 AM", project: "Compliance roadmap", status: "success" },
    { type: "upload", title: "Document Vendor Security Standard.pdf uploaded", desc: "890 KB file uploaded and indexed successfully into 89 chunks.", time: "Today · 9:10 AM", actor: "Asha Singh", status: "success" },
    { type: "run", title: "Run #R-2049 completed", desc: "Cloud Vendor Security Audit completed. CC6.3 compliant.", time: "Yesterday · 4:18 PM", project: "Vendor review", status: "success" },
    { type: "upload", title: "Document Data Retention Policy.pdf uploaded", desc: "320 KB file uploaded. 24 chunks indexed.", time: "June 15, 2026", actor: "System Agent", status: "success" },
    { type: "policy", title: "CCPA Policy check failed", desc: "Data processing policy lacks cookies opt-in disclosure in Q3 marketing assets.", time: "June 14, 2026", project: "Q3 strategy", status: "warning" },
    { type: "run", title: "Run #R-2050 created", desc: "Evaluate compliance risks initialized by Asha Singh.", time: "June 14, 2026", project: "Q3 strategy", status: "success" },
    { type: "settings", title: "API settings modified", desc: "Switched default LLM generation config to GPT-4.1.", time: "June 12, 2026", actor: "Admin Team", status: "info" }
  ];

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.desc.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (e.project && e.project.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto hide-scrollbar bg-[#f8f6f2]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e2ddd5] pb-4">
        <div>
          <span className="eyebrow">Durable history</span>
          <h2 className="text-[20px] font-semibold tracking-[-.03em] mt-1">Durable audit timeline</h2>
          <p className="text-[10px] text-[#817b73] mt-0.5">Durable, unalterable log of operations, document additions, and replayed runs.</p>
        </div>
        <div className="flex items-center gap-2 max-sm:w-full">
          <div className="relative max-sm:w-full">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
            <input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-8 rounded-lg border border-[#d3cdc4] bg-white pl-8 pr-2.5 text-[10px] outline-none max-sm:w-full"
              placeholder="Filter timeline history…"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto w-full">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#dcd6ce] bg-white">
            <History size={24} className="mx-auto text-[#938d85] mb-2" />
            <p className="text-[11px] font-medium text-[#7c766e]">No timeline events found matching query.</p>
          </div>
        ) : (
          <div className="relative border-l border-[#dcd6ce] pl-5 ml-4 space-y-6 py-2">
            {filteredEvents.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Event bullet */}
                <span className={`absolute -left-[27px] top-0.5 grid h-4.5 w-4.5 place-items-center rounded-full border-2 border-[#f8f6f2] text-white ${evt.status === "success"
                    ? "bg-[#6b8c73]"
                    : evt.status === "warning"
                      ? "bg-[#c59c5d]"
                      : "bg-[#79698c]"
                  }`}>
                  {evt.type === "run" && <Play size={8} fill="currentColor" />}
                  {evt.type === "upload" && <Upload size={8} />}
                  {evt.type === "policy" && <AlertTriangle size={8} />}
                  {evt.type === "settings" && <Wrench size={8} />}
                </span>

                <div>
                  <span className="text-[8px] font-semibold text-[#8b857d]">{evt.time}</span>
                  <h3 className="text-[11px] font-bold text-ink mt-0.5 group-hover:underline cursor-pointer">{evt.title}</h3>
                  <p className="text-[10px] text-[#6e6861] mt-1 leading-4">{evt.desc}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {evt.project && (
                      <span className="inline-flex rounded-full bg-[#eee8df] border border-[#dcd6ce] px-2 py-0.5 text-[8px] font-bold text-[#625e57]">
                        Project: {evt.project}
                      </span>
                    )}
                    {evt.actor && (
                      <span className="inline-flex rounded-full bg-[#f2eefc] border border-[#d5ccf5] px-2 py-0.5 text-[8px] font-bold text-[#7252a1]">
                        Actor: {evt.actor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icons
function FileSearchIcon(props: React.ComponentProps<typeof Search>) {
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <FileText size={10} className="text-blue" />
      <Search size={6} className="absolute bottom-0.5 right-0.5 text-blue font-bold" />
    </div>
  );
}

// ----------------------------------------------------
// RUNS DIRECTORY / SAVED VIEWS
// ----------------------------------------------------
function RunsDirectoryView({ filterNeedsReview }: { filterNeedsReview: boolean }) {
  const { setView, setActiveProjectId, setStep } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState("");

  const allRunsList = [
    { id: "R-2048", projectKey: "compliance-roadmap", name: "Compliance roadmap", prompt: "Create a roadmap based on compliance requirements.", actor: "You", date: "2026-06-18", status: "Verified" },
    { id: "R-2049", projectKey: "vendor-review", name: "Vendor review", prompt: "Analyze the vendor security assessment for Acme.", actor: "Security Team", date: "2026-06-17", status: "Verified" },
    { id: "R-2050", projectKey: "q3-strategy", name: "Q3 strategy", prompt: "Evaluate compliance risks for our Q3 marketing.", actor: "Marketing Ops", date: "2026-06-14", status: "Needs Review" },
    { id: "R-2051", projectKey: "policy-refresh", name: "Policy refresh", prompt: "Draft updates for our company-wide AI Acceptable Use Policy.", actor: "HR & Governance", date: "2026-06-12", status: "Needs Review" },
  ];

  const filtered = allRunsList.filter(run => {
    if (filterNeedsReview && run.status !== "Needs Review") return false;
    return (
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleReplay = (projectKey: string) => {
    setActiveProjectId(projectKey);
    setStep(7); // Jump to completed run
    setView("projects");
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto hide-scrollbar bg-[#f8f6f2]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e2ddd5] pb-4">
        <div>
          <span className="eyebrow">{filterNeedsReview ? "Action required" : "Durable registry"}</span>
          <h2 className="text-[20px] font-semibold tracking-[-.03em] mt-1">
            {filterNeedsReview ? "Runs needing review" : "All archived runs"}
          </h2>
          <p className="text-[10px] text-[#817b73] mt-0.5">
            {filterNeedsReview
              ? "Runs with warning flags or pending policy approvals."
              : "Complete history of all agent run logs and audit chains."}
          </p>
        </div>
        <div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b857d]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-lg border border-[#d3cdc4] bg-white pl-8 pr-2.5 text-[10px] outline-none w-[200px] text-ink placeholder-[#8b857d]"
              placeholder="Search run records…"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#ddd7cf] bg-white shadow-[0_4px_20px_rgba(37,36,34,.02)] border-collapse">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e4dfd8] bg-[#f6f2ec] text-[8px] font-bold uppercase tracking-wider text-[#8c867e]">
              <th className="px-4 py-2.5">Run ID</th>
              <th className="px-4 py-2.5">Project</th>
              <th className="px-4 py-2.5">Initial Prompt</th>
              <th className="px-4 py-2.5">Triggered By</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[10px] text-[#938d85] italic bg-white">
                  No run records found.
                </td>
              </tr>
            ) : (
              filtered.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => handleReplay(run.projectKey)}
                  className="border-b border-[#eee9e2] last:border-0 hover:bg-[#faf8f4] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-[10px] font-mono font-bold text-[#8b7ca4]">#{run.id}</td>
                  <td className="px-4 py-3 text-[10px] font-semibold text-ink">{run.name}</td>
                  <td className="px-4 py-3 text-[9px] text-[#716c65] truncate max-w-[200px]">{run.prompt}</td>
                  <td className="px-4 py-3 text-[9px] text-[#716c65]">{run.actor}</td>
                  <td className="px-4 py-3 text-[9px] text-[#716c65]">{run.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold ${run.status === "Verified"
                        ? "bg-[#eef6f0] text-[#50705a]"
                        : "bg-[#fffdf2] text-[#8a7238]"
                      }`}>
                      {run.status === "Verified" ? <Check size={8} /> : <AlertTriangle size={8} />}
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[9px] font-bold text-[#8b7ca4] hover:underline">
                      Replay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN APP COMPONENT & SEARCH MODAL
// ----------------------------------------------------
export function ReplayWorkspace() {
  const {
    currentView,
    toggleRightPanel,
    searchQuery,
    setSearchQuery,
    searchModalOpen,
    setSearchModalOpen,
    activeProjectId,
    setActiveProjectId,
    setView,
    setSelectedDocumentId,
    documents,
    projects,
    fetchProjects,
    fetchDocuments,
    createRun,
    isLoading
  } = useWorkspaceStore();

  const [shared, setShared] = useState(false);
  const [showNewRunModal, setShowNewRunModal] = useState(false);
  const [newRunPrompt, setNewRunPrompt] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchDocuments();
  }, [fetchProjects, fetchDocuments]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchModalOpen]);

  const share = async () => {
    setShared(true);
    try {
      const activeProj = projects[activeProjectId] || projectsData[activeProjectId] || projectsData["compliance-roadmap"];
      await navigator.clipboard.writeText(`${window.location.origin}/workspace?project=${activeProjectId}&replay=${activeProj.runId}`);
    } catch { }
    window.setTimeout(() => setShared(false), 1800);
  };

  // Search filter collections
  const filteredProjects = Object.values(projects).filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <main className="flex h-screen min-h-[640px] overflow-hidden bg-cream text-ink relative">
      <LeftSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onShare={share} shared={shared} onNewRun={() => setShowNewRunModal(true)} />

        <div className="flex min-h-0 flex-1 relative">
          {currentView === "projects" && <MainCanvas />}
          {currentView === "documents" && <DocumentsView />}
          {currentView === "timeline" && <TimelineView />}
          {(currentView === "all-runs" || currentView === "needs-review") && (
            <RunsDirectoryView filterNeedsReview={currentView === "needs-review"} />
          )}

          <RightPanel onClose={toggleRightPanel} />
        </div>

        {currentView === "projects" && <ReplayPanel />}
      </div>

      {/* New Run Prompt Modal */}
      {showNewRunModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252422]/30 backdrop-blur-[2px]">
          <div className="w-[420px] rounded-2xl border border-[#cfc8be] bg-[#fffefb] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2ddd5] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-peach bg-[#ffd8c2]/30 p-0.5 rounded" />
                <h3 className="text-[12px] font-semibold text-ink">Initialize New AI Agent Run</h3>
              </div>
              <button onClick={() => setShowNewRunModal(false)} className="text-[#7c766f] hover:text-ink"><X size={13} /></button>
            </div>
            <p className="text-[10px] text-[#817b73] leading-4">
              Enter a custom prompt or policy query. The system will decompose it, execute a vector similarity search, apply reranking, synthesize cited answers, and calculate RAGAS-style metrics.
            </p>
            <div className="space-y-3">
              <label className="block text-[8px] font-bold uppercase tracking-wider text-[#9a948b]">User Query Prompt</label>
              <textarea
                value={newRunPrompt}
                onChange={(e) => setNewRunPrompt(e.target.value)}
                placeholder="e.g. Audit the access control requirements and list the steps to establish logical compliance."
                rows={4}
                className="w-full rounded-xl border border-[#dcd6ce] bg-white p-3 text-[10px] outline-none text-ink placeholder-[#b0a99e] focus:border-ink/30 transition-all resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowNewRunModal(false)}
                className="h-8 rounded-lg border border-[#d8d2ca] bg-white px-3 text-[10px] font-semibold text-[#555] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newRunPrompt.trim()) return;
                  setShowNewRunModal(false);
                  await createRun(newRunPrompt);
                  setNewRunPrompt("");
                }}
                className="h-8 rounded-lg bg-ink px-3 text-[10px] font-semibold text-white hover:bg-[#3a3835] flex items-center gap-1.5"
              >
                <Sparkles size={10} />
                <span>Execute Run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAG Loop Processing Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#252422]/15 backdrop-blur-[2px] gap-3">
          <div className="rounded-2xl border border-[#dcd6ce] bg-[#fffefb] p-6 shadow-quiet flex flex-col items-center gap-3 w-[260px]">
            <Loader2 className="animate-spin h-6 w-6 text-[#75678e]" />
            <p className="text-[11px] font-bold text-ink">AI Agent Loop Executing...</p>
            <p className="text-[9px] text-[#817b73] max-w-[200px] text-center leading-4">
              Planner is structuring the roadmap, Knowledge is fetching vector chunks, and Reranker is scoring results.
            </p>
          </div>
        </div>
      )}

      {/* Global Cmd+K Search Overlay */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[#252422]/25 px-4 pt-[14vh] backdrop-blur-[2px]"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl border border-[#cfc8be] bg-[#fffefb] p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[#e2ddd5] px-3 py-2">
              <Search size={15} className="text-[#8b857d]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 flex-1 bg-transparent text-[13px] outline-none text-ink placeholder-[#8b857d]"
                placeholder="Search projects, documents, and runs…"
              />
              <button onClick={() => setSearchModalOpen(false)} className="text-[#8b857d] hover:text-ink"><X size={14} /></button>
            </div>

            <div className="p-2 overflow-y-auto max-h-[360px] hide-scrollbar">
              {!isSearching ? (
                <div>
                  <p className="px-2 pb-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-[#9a948b]">Quick access projects</p>
                  {Object.values(projectsData).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setView("projects");
                        setSearchModalOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] text-ink hover:bg-[#f3efe8] transition-colors text-left"
                    >
                      <span className="grid h-6 w-6 place-items-center rounded bg-peach/10 text-peach-700 shrink-0"><LayoutGrid size={11} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{p.name}</p>
                        <p className="text-[8px] text-[#8e887f] truncate">Run #{p.runId} · {p.prompt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matching Projects */}
                  <div>
                    <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#9a948b]">Matching Projects ({filteredProjects.length})</p>
                    {filteredProjects.length === 0 ? (
                      <p className="px-2 text-[10px] text-[#9a948b] italic py-1">No matching projects found.</p>
                    ) : (
                      filteredProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setView("projects");
                            setSearchModalOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-ink hover:bg-[#f3efe8] transition-colors text-left"
                        >
                          <Folder size={12} className="text-[#8b857d] shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-[8px] text-[#8e887f] ml-2">Run #{p.runId}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Matching Documents */}
                  <div>
                    <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-[#9a948b]">Matching Documents ({filteredDocs.length})</p>
                    {filteredDocs.length === 0 ? (
                      <p className="px-2 text-[10px] text-[#9a948b] italic py-1">No matching documents found.</p>
                    ) : (
                      filteredDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocumentId(doc.id);
                            setView("documents");
                            setSearchModalOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-ink hover:bg-[#f3efe8] transition-colors text-left"
                        >
                          <FileText size={12} className="text-[#8b857d] shrink-0" />
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-semibold">{doc.name}</span>
                            <span className="text-[8px] text-[#8e887f] ml-2">{doc.size}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
