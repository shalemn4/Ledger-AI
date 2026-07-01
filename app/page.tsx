"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSearch,
  GitBranch,
  History,
  Play,
  Pause,
  Search,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertTriangle,
  Cpu,
  FileText
} from "lucide-react";
import { Logo } from "@/components/logo";

const demoSteps = [
  { label: "Prompt", actor: "You", time: "00:00", color: "bg-lavender" },
  { label: "Plan", actor: "Planner", time: "00:02", color: "bg-peach" },
  { label: "Search", actor: "Knowledge", time: "00:05", color: "bg-blue" },
  { label: "Retrieve", actor: "Knowledge", time: "00:09", color: "bg-blue" },
  { label: "Synthesize", actor: "Builder", time: "00:14", color: "bg-mint" },
  { label: "Output", actor: "Builder", time: "00:21", color: "bg-mint" },
  { label: "Verify", actor: "Knowledge", time: "00:24", color: "bg-lavender" },
  { label: "Complete", actor: "System", time: "00:27", color: "bg-gray-200" },
];

const features = [
  {
    number: "01",
    title: "Replay AI workflows",
    copy: "Step through prompts, context, tool calls, and outputs exactly as they happened.",
    color: "bg-peach",
    icon: Play,
  },
  {
    number: "02",
    title: "Audit every decision",
    copy: "See the source, confidence, and reasoning behind every generated claim.",
    color: "bg-lavender",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Remember everything",
    copy: "A durable timeline gives your team a shared memory of what changed and why.",
    color: "bg-mint",
    icon: History,
  },
  {
    number: "04",
    title: "Coordinate agents",
    copy: "Planner, Knowledge, and Builder agents work together in a visible, inspectable loop.",
    color: "bg-blue",
    icon: GitBranch,
  },
];

type ProductPreviewProps = {
  demoStep: number;
  demoPlaying: boolean;
  setDemoStep: (step: number) => void;
  setDemoPlaying: (playing: boolean) => void;
};

function ProductPreview({ demoStep, demoPlaying, setDemoStep, setDemoPlaying }: ProductPreviewProps) {
  const progressPercent = (demoStep / (demoSteps.length - 1)) * 100;

  // Dynamic status states
  const plannerStatus = demoStep === 0 ? "Pending" : demoStep === 1 ? "In progress" : "Complete";
  const knowledgeStatus = demoStep < 2 ? "Pending" : (demoStep === 2 || demoStep === 3 || demoStep === 6) ? "In progress" : "Complete";
  const builderStatus = demoStep < 4 ? "Pending" : demoStep === 4 ? "In progress" : "Complete";

  const pDetail = demoStep === 0 ? "Reading prompt..." : "Plan complete";
  const kDetail = demoStep < 2 ? "Waiting..." : demoStep === 2 ? "Searching..." : demoStep === 3 ? "Retrieving..." : demoStep === 6 ? "Verifying..." : "4 sources found";
  const bDetail = demoStep < 4 ? "Waiting..." : demoStep === 4 ? "Drafting..." : "Roadmap generated";

  // Dynamic activity log
  const activities = [
    { text: "Run initialized", active: demoStep >= 0 },
    { text: "Decomposed task into steps", active: demoStep >= 1 },
    { text: "Searched 12 compliance files", active: demoStep >= 2 },
    { text: "Selected 4 source chunks", active: demoStep >= 3 },
    { text: "Synthesizing roadmap draft", active: demoStep >= 4 },
    { text: "Roadmap output compiled", active: demoStep >= 5 },
    { text: "Verified 9 generated claims", active: demoStep >= 6 },
    { text: "Sealed run audit trail", active: demoStep >= 7 },
  ].filter(a => a.active).reverse();

  return (
    <div className="window mx-auto max-w-[1120px] text-left relative shadow-2xl">
      <div className="window-bar flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="window-dot bg-[#f0a693]" />
          <span className="window-dot bg-[#e8cf8e]" />
          <span className="window-dot bg-[#9fc9a8]" />
          <span className="ml-3 text-[10px] font-medium tracking-wide text-[#89837a]">DEMO WORKSPACE / COMPLIANCE REPLAY</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] uppercase bg-ink/10 text-ink/60 px-2 py-0.5 rounded font-bold">
          {demoPlaying ? (
            <span className="flex items-center gap-1"><span className="h-1 w-1 bg-peach rounded-full animate-ping" /> Live demo running</span>
          ) : (
            <span>Demo paused</span>
          )}
        </div>
      </div>

      <div className="grid h-[520px] grid-cols-[165px_1fr_220px] max-lg:grid-cols-[150px_1fr] max-md:h-[430px] max-md:grid-cols-[95px_1fr]">

        {/* Left Sidebar */}
        <div className="border-r border-[#e3ded6] bg-[#f4f0e9] p-3">
          <div className="mb-5 flex items-center gap-2 px-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg border border-[#cbc5bc] bg-white text-[9px] font-bold">AC</span>
            <div className="max-md:hidden">
              <p className="text-[10px] font-semibold">Acme, Inc.</p>
              <p className="text-[8px] text-[#918b82]">Design team</p>
            </div>
          </div>
          {[
            ["▦", "Projects", true],
            ["▤", "Documents", false],
            ["◴", "Timeline", false],
          ].map(([icon, label, active]) => (
            <div key={label as string} className={`mb-1 flex h-8 items-center gap-2 rounded-lg px-2 text-[10px] ${active ? "border border-[#d4cec5] bg-white font-semibold" : "text-[#716c64]"}`}>
              <span>{icon as string}</span><span className="max-md:hidden">{label as string}</span>
            </div>
          ))}
          <p className="mb-2 mt-7 px-2 text-[8px] font-bold uppercase tracking-[.14em] text-[#9a948b] max-md:hidden">Recent</p>
          <div className="space-y-2 px-2 max-md:hidden">
            <p className="text-[9px] font-semibold text-ink">Compliance roadmap</p>
            <p className="text-[9px] text-[#817b73]">Vendor review</p>
            <p className="text-[9px] text-[#817b73]">Q3 planning</p>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex min-w-0 flex-col bg-[#fffefb]">
          <div className="flex h-12 items-center justify-between border-b border-[#e3ded6] px-5 shrink-0">
            <div>
              <p className="text-[10px] text-[#8a847b]">Projects / Trust center</p>
              <p className="text-[12px] font-semibold">Compliance roadmap</p>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-md border border-[#d8d2ca] bg-white px-2 py-1 text-[8px] font-medium text-[#555]">Share</span>
              <span className="rounded-md bg-[#292825] px-2 py-1 text-[8px] text-white">Run task</span>
            </div>
          </div>

          {/* Dynamic Canvas content based on demoStep */}
          <div className="flex-1 overflow-y-auto p-5 max-md:p-3 hide-scrollbar">
            <div className="mx-auto max-w-[560px]">

              {/* User Prompt Box */}
              <div className="mb-4 rounded-xl border border-[#ded8d0] bg-[#f7f3ed] p-3">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#dccef9] text-[9px] font-bold">You</div>
                  <div>
                    <p className="text-[9px] font-semibold">Create a roadmap based on compliance requirements.</p>
                    <p className="mt-1 text-[8px] text-[#89837a]">Using 12 documents · Started 9:42 AM</p>
                  </div>
                </div>
              </div>

              {/* Step 0: Initialized */}
              {demoStep === 0 && (
                <div className="rounded-xl border border-[#ded8d0] bg-white p-6 text-center animate-pulse">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#8b7ca4] mb-2" />
                  <p className="text-[10px] font-semibold">Planner Agent Initializing...</p>
                  <p className="text-[8px] text-[#89837a] mt-0.5">Reading prompt to decompose execution flow.</p>
                </div>
              )}

              {/* Step 1: Planning */}
              {demoStep === 1 && (
                <div className="rounded-xl border border-[#ded8d0] bg-[#fffdfa] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-peach text-[9px] font-bold text-ink">P</span>
                    <p className="text-[10px] font-bold">Planner sequence created:</p>
                  </div>
                  <div className="space-y-1.5 pl-8 border-l border-[#ded9d1]">
                    <p className="text-[9px] text-[#555]">1. Map retention requirements</p>
                    <p className="text-[9px] text-[#555]">2. Update vendor review process</p>
                    <p className="text-[9px] text-[#555]">3. Complete access control audit</p>
                  </div>
                </div>
              )}

              {/* Step 2: Search */}
              {demoStep === 2 && (
                <div className="rounded-xl border border-blue/20 bg-blue/5 p-5 text-center animate-pulse">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue mb-2" />
                  <p className="text-[10px] font-semibold text-ink">Knowledge agent searching vector library...</p>
                  <p className="text-[8px] text-blue/60 mt-0.5">Scanning 12 PDF manuals for compliance checks</p>
                </div>
              )}

              {/* Step 3: Retrieve */}
              {demoStep === 3 && (
                <div className="rounded-xl border border-[#ded8d0] bg-white p-4 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-[#eee] pb-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded bg-blue text-[9px] text-white"><FileText size={10} /></span>
                    <p className="text-[10px] font-bold">Knowledge agent selected 4 source chunks:</p>
                  </div>
                  <div className="space-y-1">
                    {["EU AI Act — Controls.pdf (96% match)", "SOC 2 Control Matrix.pdf (93% match)", "Data Retention Policy.pdf (89% match)"].map((x, i) => (
                      <div key={i} className="flex justify-between items-center text-[8px] bg-[#fbfaf8] border border-[#f0eae0] p-1.5 rounded">
                        <span className="truncate text-ink">{x}</span>
                        <span className="text-[8px] text-[#50705a] font-bold">Verified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Synthesize */}
              {demoStep === 4 && (
                <div className="rounded-xl border border-[#ded8d0] bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-mint" />
                    <p className="text-[10px] font-semibold">Builder synthesizing roadmap...</p>
                  </div>
                  <div className="space-y-2 animate-pulse">
                    <div className="h-2.5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                  </div>
                </div>
              )}

              {/* Steps >= 5: Generated Output */}
              {demoStep >= 5 && (
                <div className="rounded-xl border border-[#ded8d0] bg-white p-4 shadow-[0_8px_24px_rgba(37,36,34,.04)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#cfe8d6]"><Sparkles size={11} /></span>
                      <div>
                        <p className="text-[10px] font-semibold text-ink">Compliance roadmap</p>
                        <p className="text-[8px] text-[#89837a]">Generated by Builder</p>
                      </div>
                    </div>
                    {demoStep === 5 && (
                      <span className="rounded-full bg-[#fdf8e2] px-2 py-1 text-[8px] font-semibold text-[#8a7038] border border-[#fbeed5] animate-pulse">
                        Claims verifying...
                      </span>
                    )}
                    {demoStep === 6 && (
                      <span className="rounded-full bg-[#f2eefc] px-2 py-1 text-[8px] font-semibold text-[#7252a1] border border-[#e1d5fa]">
                        Verifying 9 claims...
                      </span>
                    )}
                    {demoStep === 7 && (
                      <span className="rounded-full bg-[#edf5ee] px-2 py-1 text-[8px] font-semibold text-[#52705a] border border-[#d0e9d5]">
                        Verified & Sealed
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {[
                      { item: "Map retention requirements", tag: "Q2", cite: "EU AI Act" },
                      { item: "Update vendor review process", tag: "Q3", cite: "SOC 2 CC6.1" },
                      { item: "Complete access control audit", tag: "Q4", cite: "Vendor Std" }
                    ].map((row, i) => (
                      <div key={row.item} className="flex items-center gap-3 border-t border-[#eee9e2] pt-3">
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md text-[8px] font-bold ${["bg-peach", "bg-lavender", "bg-blue"][i]}`}>{i + 1}</span>
                        <p className="flex-1 text-[9px] font-medium text-ink">{row.item}</p>
                        <span className="text-[8px] text-[#918b82] font-semibold bg-gray-50 border border-gray-200 px-1 py-0.5 rounded flex items-center gap-1">
                          {row.cite}
                          {demoStep >= 6 && <span className="text-[6px] text-[#52705a] font-bold">✓</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Replay Scrubber Bar */}
          <div className="border-t border-[#dcd6ce] bg-[#f3eee7] px-5 py-3 shrink-0 select-none">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-ink">
                <button
                  onClick={() => {
                    if (demoPlaying) {
                      setDemoPlaying(false);
                    } else {
                      if (demoStep >= demoSteps.length - 1) {
                        setDemoStep(0);
                      }
                      setDemoPlaying(true);
                    }
                  }}
                  className="p-1 hover:bg-[#e4ded6] rounded transition-colors"
                >
                  {demoPlaying ? <Pause size={9} fill="currentColor" /> : <Play size={9} fill="currentColor" />}
                </button>
                <span>Replay · Step {demoStep + 1} of {demoSteps.length} ({demoSteps[demoStep].label})</span>
              </div>
              <span className="text-[8px] font-mono text-[#8c867e]">{demoSteps[demoStep].time} / 00:27</span>
            </div>

            {/* Timeline Scrubber */}
            <div className="relative h-1.5 rounded-full bg-[#d9d3cb] overflow-hidden flex items-center">
              <div
                className="h-full bg-[#74658f] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />

              {/* Overlay clickable dots */}
              <div className="absolute inset-0 flex justify-between px-0.5">
                {demoSteps.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDemoStep(idx);
                      setDemoPlaying(false);
                    }}
                    className={`h-2.5 w-2.5 -translate-y-0.5 rounded-full border border-white transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${idx <= demoStep ? "bg-[#74658f]" : "bg-[#c8c1b8]"
                      }`}
                    title={s.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Agents panel) */}
        <div className="border-l border-[#e3ded6] bg-[#faf8f4] p-3 max-lg:hidden flex flex-col overflow-hidden">
          <div className="mb-3 flex items-center justify-between shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#817b73]">Agents</p>
            {demoStep === 7 ? (
              <span className="h-1.5 w-1.5 rounded-full bg-[#79a684]" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-peach animate-ping" />
            )}
          </div>

          <div className="space-y-2 shrink-0">
            {[
              ["P", "Planner", pDetail, "bg-peach", plannerStatus],
              ["K", "Knowledge", kDetail, "bg-blue", knowledgeStatus],
              ["B", "Builder", bDetail, "bg-mint", builderStatus],
            ].map(([letter, name, state, color, status]) => (
              <div key={name} className="rounded-lg border border-[#e0dad2] bg-white p-2 text-ink">
                <div className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[9px] font-bold ${color}`}>{letter}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-semibold truncate">{name}</p>
                      {status === "Complete" ? (
                        <Check size={8} className="text-[#52705a] font-bold" />
                      ) : status === "In progress" ? (
                        <span className="h-1 w-1 rounded-full bg-peach animate-ping" />
                      ) : null}
                    </div>
                    <p className="text-[7px] text-[#8d877e] truncate">{state}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-wider text-[#817b73] shrink-0">Latest activity</p>
          <div className="flex-1 overflow-y-auto pr-1 hide-scrollbar">
            <div className="space-y-3.5 border-l border-[#d7d1c8] pl-3 py-1 relative">
              {activities.map((a, i) => (
                <div key={i} className="relative leading-tight">
                  <span className="absolute -left-[15px] top-1.5 h-1.5 w-1.5 rounded-full bg-[#74658f] border border-[#faf8f4]" />
                  <p className="text-[8px] font-semibold text-ink leading-relaxed">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoStep, setDemoStep] = useState(7); // Default to final state
  const [demoPlaying, setDemoPlaying] = useState(false);

  // Interval timer for the in-place ProductPreview demo
  useEffect(() => {
    if (!demoPlaying) return;
    const interval = setInterval(() => {
      setDemoStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          setDemoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [demoPlaying]);

  const handleWatchOverview = () => {
    setDemoStep(0);
    setDemoPlaying(true);
    const element = document.getElementById("product");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="overflow-hidden bg-cream text-ink">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex h-14 max-w-[1180px] items-center justify-between rounded-2xl border border-[#ded9d1]/90 bg-[#f8f6f2]/90 px-4 shadow-[0_8px_30px_rgba(45,42,37,.05)] backdrop-blur-md">
          <Logo />
          <div className="hidden items-center gap-7 text-[12px] font-medium text-[#6c6861] md:flex">
            <a href="#product" className="transition-colors hover:text-ink">Product</a>
            <a href="#features" className="transition-colors hover:text-ink">Features</a>
            <a href="#security" className="transition-colors hover:text-ink">Security</a>
            <a href="#pricing" className="transition-colors hover:text-ink">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="hidden px-3 text-[12px] font-semibold sm:inline-flex text-ink">Sign in</Link>
            <Link href="/auth" className="btn-primary !min-h-9 !rounded-[10px] !px-3.5">Start free <ArrowRight size={13} /></Link>
          </div>
        </nav>
      </header>

      <section className="grain relative px-5 pb-24 pt-40 text-center sm:pt-48">
        <div className="absolute left-[7%] top-48 h-36 w-36 rounded-full bg-peach/45 blur-3xl" />
        <div className="absolute right-[4%] top-24 h-52 w-52 rounded-full bg-lavender/35 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-mint/30 blur-3xl" />

        <div className="relative mx-auto max-w-[860px]">
          <div className="eyebrow lift-in">An auditable AI workspace</div>
          <h1 className="lift-in delay-1 mt-7 text-balance text-[clamp(48px,7vw,92px)] font-medium leading-[.94] tracking-[-.065em] text-ink">
            Understand every<br />AI decision.
          </h1>
          <p className="lift-in delay-2 mx-auto mt-7 max-w-[620px] text-balance text-[16px] leading-7 text-[#6c6861] sm:text-[18px]">
            The first AI workspace that lets teams see, audit, and replay every AI workflow - from source to final answer.
          </p>
          <div className="lift-in delay-3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth" className="btn-primary min-w-36">Start free <ArrowRight size={14} /></Link>
            <button
              onClick={handleWatchOverview}
              className="btn-secondary min-w-36 cursor-pointer"
            >
              <Play size={13} fill="currentColor" /> Watch overview
            </button>
          </div>
          <p className="mt-4 text-[11px] text-[#98928a]">No credit card required · Set up in 2 minutes</p>
        </div>

        <div id="product" className="relative mx-auto mt-20 max-w-[1200px] px-0 sm:px-4">
          <div className="absolute -inset-10 -z-10 rounded-[4rem] bg-gradient-to-r from-peach/35 via-lavender/20 to-mint/35 blur-2xl" />
          <ProductPreview
            demoStep={demoStep}
            demoPlaying={demoPlaying}
            setDemoStep={setDemoStep}
            setDemoPlaying={setDemoPlaying}
          />
        </div>
      </section>

      <section className="border-y border-[#ded9d1] bg-[#f2ede5] px-5 py-5">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-12 gap-y-4 text-[10px] font-semibold uppercase tracking-[.15em] text-[#8b857c] sm:justify-between">
          <span>Built for accountable teams</span>
          <span className="text-[12px] normal-case tracking-normal text-[#655f58]">Northstar</span>
          <span className="text-[12px] normal-case tracking-normal text-[#655f58]">Tandem Labs</span>
          <span className="text-[12px] normal-case tracking-normal text-[#655f58]">Fieldwork</span>
          <span className="text-[12px] normal-case tracking-normal text-[#655f58]">Common Thread</span>
        </div>
      </section>

      <section id="features" className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-14 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">Nothing hidden</div>
              <h2 className="mt-5 max-w-[650px] text-[clamp(38px,5vw,62px)] font-medium leading-[1] tracking-[-.055em]">AI work your whole team can trust.</h2>
            </div>
            <p className="max-w-[470px] text-[15px] leading-7 text-[#6d6861] md:justify-self-end">Ledger turns every workflow into a clear record. Inspect what happened, find the source, and share the evidence - without chasing logs.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {features.map(({ number, title, copy, color, icon: Icon }) => (
              <article key={number} className="group paper-card relative min-h-[260px] overflow-hidden p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-9">
                <div className={`absolute -right-8 -top-8 h-40 w-40 rounded-full ${color} opacity-35 blur-2xl transition-transform duration-500 group-hover:scale-125`} />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[.15em] text-[#99928a]">{number}</span>
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border border-[#2f2d29]/10 ${color}`}><Icon size={18} strokeWidth={1.8} /></span>
                  </div>
                  <div className="mt-auto pt-16">
                    <h3 className="text-[22px] font-semibold tracking-[-.035em]">{title}</h3>
                    <p className="mt-2 max-w-[420px] text-[13px] leading-6 text-[#716c65]">{copy}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-[#262522] px-5 py-28 text-[#f7f4ee] sm:py-36">
        <div className="mx-auto grid max-w-[1120px] gap-16 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#c8c1b7]">Replay mode</span>
            <h2 className="mt-6 text-[clamp(38px,5vw,60px)] font-medium leading-[1] tracking-[-.055em]">A paper trail for machine work.</h2>
            <p className="mt-6 max-w-[480px] text-[14px] leading-7 text-[#b7b0a7]">Like version history for AI. Every prompt, retrieval, action, and edit is preserved in a shareable run record.</p>
            <ul className="mt-8 space-y-3 text-[13px] text-[#e3ded5]">
              {["Immutable execution records", "Source-level citations", "Shareable replay links", "Role-based access controls"].map((item) => (
                <li key={item} className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full bg-mint text-[#26352b]"><Check size={11} strokeWidth={3} /></span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#302f2b] p-3 shadow-2xl">
            <div className="rounded-[17px] border border-white/10 bg-[#f5f1ea] p-5 text-ink sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div><p className="text-[11px] text-[#867f76]">Run #R-2048</p><h3 className="text-[16px] font-semibold">Compliance roadmap</h3></div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[9px] font-bold text-[#41604a]">8 / 8 complete</span>
              </div>
              <div className="space-y-2">
                {[
                  ["09:42:04", "Prompt received", "You", "bg-lavender"],
                  ["09:42:06", "Task decomposed", "Planner", "bg-peach"],
                  ["09:42:09", "Searched 12 documents", "Knowledge", "bg-blue"],
                  ["09:42:14", "Selected 4 source chunks", "Knowledge", "bg-blue"],
                  ["09:42:21", "Roadmap generated", "Builder", "bg-mint"],
                ].map(([time, event, actor, color]) => (
                  <div key={event} className="grid grid-cols-[58px_12px_1fr_auto] items-center gap-2 rounded-xl border border-[#ded8d0] bg-white p-3">
                    <span className="font-mono text-[9px] text-[#979087]">{time}</span>
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    <span className="text-[10px] font-semibold sm:text-[11px]">{event}</span>
                    <span className="text-[9px] text-[#817a72]">{actor}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#e9e3d9] p-3">
                <button
                  onClick={() => {
                    setDemoStep(5);
                    setDemoPlaying(false);
                    const element = document.getElementById("product");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-white hover:bg-black"
                >
                  <Play size={12} fill="currentColor" />
                </button>
                <div className="h-1 flex-1 rounded-full bg-[#c8c0b5]"><div className="h-full w-3/4 rounded-full bg-[#75678e]" /></div>
                <span className="font-mono text-[9px] text-[#6f6961]">00:24</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="grain px-5 py-28 text-center sm:py-36">
        <div className="mx-auto max-w-[800px]">
          <div className="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-2xl border border-[#d5cec5] bg-white shadow-[3px_3px_0_#d8cbed]"><FileSearch size={23} /></div>
          <h2 className="text-[clamp(40px,6vw,70px)] font-medium leading-[.98] tracking-[-.06em]">Make AI explain itself.</h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15px] leading-7 text-[#6e6962]">Give your team a workspace where trust is built into every run, not added after the fact.</p>
          <Link href="/auth" className="btn-primary mt-8 min-w-36">Start free <ArrowRight size={14} /></Link>
        </div>
      </section>

      <footer className="border-t border-[#ddd7ce] px-5 py-8">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-5 sm:flex-row">
          <Logo />
          <p className="text-[11px] text-[#8f8980]">© 2026 Ledger AI. Decisions, documented.</p>
          <p className="text-[11px] text-[#8f8980]">Made with ❤️ by Shalem</p>
          <div className="flex gap-5 text-[11px] font-medium text-[#6f6a63]"><a href="#">Privacy</a><a href="#">Security</a><a href="#">Terms</a></div>
        </div>
      </footer>
    </main>
  );
}
