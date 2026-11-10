import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  GitBranch,
  Zap,
  SlidersHorizontal,
  Play,
  FileCode2,
  FolderGit2,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { MonorepoPreset } from '../data/turborepoData';
import { TaskGraphResult, deterministicHexHash } from '../engine/turboEngine';

interface TurbochargerResolverProps {
  preset: MonorepoPreset;
  graph: TaskGraphResult;
  onNavigateRoute?: (route: string) => void;
  compactDrawer?: boolean;
}

interface ResolutionPresetTarget {
  id: string;
  specifier: string;
  category: 'Workspace Package' | 'Rust Crate' | 'Next.js Route' | 'Task Pipeline';
  resolvedFilePath: string;
  packageScope: string;
  resolverEngine: string;
  upstreamDeps: string[];
  downstreamConsumers: string[];
  cacheSignature: string;
  latencyMs: number;
  stages: Array<{
    step: number;
    title: string;
    module: string;
    detail: string;
    output: string;
    durationUs: number;
  }>;
}

const RESOLVER_TARGETS: ResolutionPresetTarget[] = [
  {
    id: 'ui-button',
    specifier: '@repo/ui/button',
    category: 'Workspace Package',
    resolvedFilePath: 'packages/ui/src/button.tsx',
    packageScope: '@repo/ui',
    resolverEngine: 'turborepo-repository + oxc_resolver',
    upstreamDeps: ['@repo/typescript-config', '@repo/eslint-config'],
    downstreamConsumers: ['web', 'docs'],
    cacheSignature: '7c21e09a3b5f812d',
    latencyMs: 0.38,
    stages: [
      {
        step: 1,
        title: 'Specifier & Package Exports Parse',
        module: 'crates/turborepo-repository/src/package_graph',
        detail: 'Parsed scoped specifier `@repo/ui/button` into package `@repo/ui` and subpath `./button`.',
        output: 'pkg: "@repo/ui" | subpath: "./button"',
        durationUs: 64,
      },
      {
        step: 2,
        title: 'pnpm-workspace & package.json Exports Map',
        module: 'packages/ui/package.json#exports',
        detail: 'Matched `./button` export condition `"./button": "./src/button.tsx"` with TypeScript types resolution.',
        output: 'resolved -> /vercel/sandbox/turborepo/packages/ui/src/button.tsx',
        durationUs: 92,
      },
      {
        step: 3,
        title: 'Boundaries & Tag Policy Verification',
        module: 'crates/turborepo-boundaries/src/lib.rs',
        detail: 'Verified importer tag rules: `ui` tag allows imports from `config`, denies imports from `app`.',
        output: '0 boundary violations · status: PASS',
        durationUs: 81,
      },
      {
        step: 4,
        title: 'Topological Task Graph Wave Assignment',
        module: 'crates/turborepo-engine/src/builder.rs',
        detail: 'Assigned `@repo/ui#build` to Wave 1 before `web#build` and `docs#build` (Wave 2).',
        output: 'Wave 1 -> unlocks [web#build, docs#build]',
        durationUs: 78,
      },
      {
        step: 5,
        title: 'SCM File Hash & Remote Cache Lookup',
        module: 'crates/turborepo-cache/src/http.rs',
        detail: 'Computed FNV/SHA-256 content digest across `packages/ui/src/**` and queried Remote Cache.',
        output: 'HIT · artifact 7c21e09a3b5f812d (restored in 11ms)',
        durationUs: 65,
      },
    ],
  },
  {
    id: 'devtools-flow',
    specifier: 'apps/docs/app/[lang]/devtools/devtools-client.tsx',
    category: 'Next.js Route',
    resolvedFilePath: 'apps/docs/app/[lang]/devtools/devtools-client.tsx',
    packageScope: 'docs (turborepo.dev)',
    resolverEngine: 'turborepo-devtools + reactflow',
    upstreamDeps: ['@repo/ui', 'reactflow', 'crates/turborepo-devtools'],
    downstreamConsumers: ['turborepo.dev/devtools'],
    cacheSignature: 'e490c1a85f2b3719',
    latencyMs: 0.44,
    stages: [
      {
        step: 1,
        title: 'App Router Dynamic Segment Resolution',
        module: 'apps/docs/app/[lang]/devtools/page.tsx',
        detail: 'Resolved `[lang]/devtools` route tree and client boundary `DevtoolsClient`.',
        output: 'route: /[lang]/devtools -> DevtoolsClient',
        durationUs: 72,
      },
      {
        step: 2,
        title: 'WebSocket Graph State & Depth Calculator',
        module: 'apps/docs/components/diagram/layout.ts',
        detail: 'Computed DAG topological depths via `calculateDepths(nodes, edges)` for ReactFlow layout.',
        output: '12 nodes · 18 directed edges · max depth: 3',
        durationUs: 108,
      },
      {
        step: 3,
        title: 'Custom TurboNode & Floating TurboEdge Bindings',
        module: 'apps/docs/app/[lang]/devtools/turbo-node.tsx',
        detail: 'Mounted conic-gradient `.turbo-flow` nodes with dynamic intersection handles.',
        output: 'nodeTypes: { turbo: TurboNode } · edgeTypes: { turbo: TurboEdge }',
        durationUs: 94,
      },
      {
        step: 4,
        title: 'Framework Env Wildcard Inference',
        module: 'crates/turborepo-frameworks/src/frameworks.json',
        detail: 'Detected `nextjs` framework; inferred `NEXT_PUBLIC_*` and `VERCEL_*` environment inputs.',
        output: 'matched: NEXT_PUBLIC_API_URL, VERCEL_ENV',
        durationUs: 86,
      },
      {
        step: 5,
        title: 'Remote Cache Artifact Verification',
        module: 'crates/turborepo-lib/src/run/cache.rs',
        detail: 'Verified cached `.next` output artifact signature in Vercel Remote Cache.',
        output: 'HIT · artifact e490c1a85f2b3719 >>> FULL TURBO',
        durationUs: 80,
      },
    ],
  },
  {
    id: 'rust-engine',
    specifier: 'crates/turborepo-engine/src/builder.rs',
    category: 'Rust Crate',
    resolvedFilePath: 'crates/turborepo-engine/src/builder.rs',
    packageScope: 'turborepo-engine',
    resolverEngine: 'Cargo Workspace + petgraph DAG',
    upstreamDeps: ['turborepo-Repository', 'turborepo-graph-utils', 'petgraph'],
    downstreamConsumers: ['turborepo-lib', 'turbo (CLI binary)'],
    cacheSignature: '9f84c2e1b7a0482d',
    latencyMs: 0.51,
    stages: [
      {
        step: 1,
        title: 'Cargo Workspace Member Lookup',
        module: 'Cargo.toml#workspace.members',
        detail: 'Resolved crate `turborepo-engine` inside 80-crate Rust workspace at `crates/turborepo-engine`.',
        output: 'crate: turborepo-engine v0.1.0 (edition 2021)',
        durationUs: 88,
      },
      {
        step: 2,
        title: 'Task Definition & ^dependsOn Graph Expansion',
        module: 'crates/turborepo-engine/src/builder.rs',
        detail: 'Expanded topological `^build` dependencies and validated persistent task constraints.',
        output: 'FixedBitSet visited check · 0 cycles detected',
        durationUs: 115,
      },
      {
        step: 3,
        title: 'Affected SCM Index Diff Resolution',
        module: 'crates/turborepo-scm/src/package_deps.rs',
        detail: 'Cross-referenced git status porcelain against crate source tree.',
        output: 'clean working tree @ commit a575396',
        durationUs: 102,
      },
      {
        step: 4,
        title: 'Factory Snapshot Pre-warmed Target Link',
        module: 'apps/factory/app/factory-image.tsx',
        detail: 'Linked pre-compiled release rlib from snapshot `snap_turbo_2_11_10_a575396`.',
        output: 'snapshot: snap_turbo_2_11_10_a575396 · 8 vCPUs',
        durationUs: 110,
      },
      {
        step: 5,
        title: 'Task Execution & Binary Output Hash',
        module: 'crates/turborepo-lib/src/shim.rs',
        detail: 'Bound resolved engine graph to `turbo` CLI shim v2.11.10.',
        output: 'HIT · digest 9f84c2e1b7a0482d',
        durationUs: 95,
      },
    ],
  },
  {
    id: 'factory-composer',
    specifier: 'apps/factory/app/workspace-composer.tsx',
    category: 'Task Pipeline',
    resolvedFilePath: 'apps/factory/app/workspace-composer.tsx',
    packageScope: 'factory (@turbo/factory)',
    resolverEngine: 'Turborepo Factory Sandbox Resolver',
    upstreamDeps: ['apps/factory/app/navigation.tsx', 'snap_turbo_2_11_10_a575396'],
    downstreamConsumers: ['apps/factory/app/work/page.tsx'],
    cacheSignature: 'a575396f0291bc48',
    latencyMs: 0.35,
    stages: [
      {
        step: 1,
        title: 'Factory Route & Composer Bindings',
        module: 'apps/factory/app/work/page.tsx',
        detail: 'Resolved `WorkspaceComposer`, `RunMaintenance`, and `RunPerformance` workflow modules.',
        output: 'route: /work -> WorkspaceComposer',
        durationUs: 62,
      },
      {
        step: 2,
        title: 'Coding Agent Model & Reasoning Effort Resolution',
        module: 'apps/factory/app/workspace-composer.tsx',
        detail: 'Selected `gpt-6.1-sol` / `claude-opus-4-5` / `gemini-3.1-pro` with configurable thinking effort.',
        output: 'model: gpt-6.1-sol · effort: high',
        durationUs: 74,
      },
      {
        step: 3,
        title: 'Sandbox Image Snapshot Provisioning',
        module: 'apps/factory/app/factory-sandbox-command.tsx',
        detail: 'Generated `sandbox create --snapshot snap_turbo_2_11_10_a575396 --vcpus 8 --timeout 45m`.',
        output: 'sandbox ready in 420ms',
        durationUs: 80,
      },
      {
        step: 4,
        title: 'Live Git Diff & Transcript Stream',
        module: 'apps/factory/app/workspaces/[id]/workspace-client.tsx',
        detail: 'Connected real-time session transcript, `git diff HEAD`, and interactive bash shell.',
        output: 'stream: active · exit code 0',
        durationUs: 69,
      },
      {
        step: 5,
        title: 'Workspace Output Artifact Commit',
        module: 'apps/factory/app/workspace-list.tsx',
        detail: 'Persisted workspace run summary and snapshot diff.',
        output: 'HIT · artifact a575396f0291bc48',
        durationUs: 65,
      },
    ],
  },
];

type SlideCurveKey = 'spring-snappy' | 'expo-smooth' | 'quart-glide';

const SLIDE_CURVES: Record<
  SlideCurveKey,
  {
    label: string;
    cssBezier: string;
    description: string;
    transition: {
      type?: 'spring' | 'tween';
      stiffness?: number;
      damping?: number;
      mass?: number;
      duration?: number;
      ease?: [number, number, number, number];
    };
  }
> = {
  'spring-snappy': {
    label: 'Turbocharger Spring (340 / 32)',
    cssBezier: 'spring(1, 340, 32, 0)',
    description: 'Zero-overshoot physical spring tuned for instant UI/UX panel & drawer slides.',
    transition: { type: 'spring', stiffness: 340, damping: 32, mass: 0.85 },
  },
  'expo-smooth': {
    label: 'Geist Expo Out (0.16, 1, 0.3, 1)',
    cssBezier: 'cubic-bezier(0.16, 1, 0.3, 1)',
    description: 'High initial velocity with a long,feather-smooth deceleration tail.',
    transition: { type: 'tween', duration: 0.44, ease: [0.16, 1, 0.3, 1] },
  },
  'quart-glide': {
    label: 'Quart Glide (0.22, 1, 0.36, 1)',
    cssBezier: 'cubic-bezier(0.22, 1, 0.36, 1)',
    description: 'Balanced silk slide curve ideal for multi-step resolver cards and tab indicators.',
    transition: { type: 'tween', duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export const TurbochargerResolver: React.FC<TurbochargerResolverProps> = ({
  preset,
  graph,
  onNavigateRoute,
  compactDrawer = false,
}) => {
  const [activeMode, setActiveMode] = useState<'resolver' | 'ux-motion'>('resolver');
  const [queryInput, setQueryInput] = useState<string>('@repo/ui/button');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('ui-button');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [slideKey, setSlideKey] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  // Motion studio controls
  const [curveKey, setCurveKey] = useState<SlideCurveKey>('spring-snappy');
  const [slideDistance, setSlideDistance] = useState<number>(32);
  const [demoSlideIndex, setDemoSlideIndex] = useState<number>(0);
  const [copiedCss, setCopiedCss] = useState<boolean>(false);

  const activeCurve = SLIDE_CURVES[curveKey];

  // Dynamically resolve either one of our rich preset targets or any custom path entered by the user
  const resolvedTarget = useMemo<ResolutionPresetTarget>(() => {
    const q = queryInput.trim().toLowerCase();
    const matchedPreset =
      RESOLVER_TARGETS.find(
        (t) =>
          t.id === selectedTargetId &&
          (t.specifier.toLowerCase() === q || !q)
      ) ??
      RESOLVER_TARGETS.find(
        (t) =>
          t.specifier.toLowerCase().includes(q) ||
          t.resolvedFilePath.toLowerCase().includes(q) ||
          t.packageScope.toLowerCase().includes(q)
      );

    if (matchedPreset) {
      return matchedPreset;
    }

    // Dynamic custom specifier resolution against the live monorepo preset & task graph
    const matchedPkg =
      preset.packages.find(
        (p) =>
          q.includes(p.name.toLowerCase()) || q.includes(p.path.toLowerCase())
      ) ?? preset.packages[0];

    const customHash = deterministicHexHash(`turbocharger:${queryInput}:${matchedPkg.name}`);
    return {
      id: `custom-${customHash.slice(0, 6)}`,
      specifier: queryInput.trim() || matchedPkg.name,
      category: matchedPkg.type === 'app' ? 'Next.js Route' : 'Workspace Package',
      resolvedFilePath: `${matchedPkg.path}/${matchedPkg.files[0]?.path ?? 'src/index.ts'}`,
      packageScope: matchedPkg.name,
      resolverEngine: 'Turbocharger Live DAG Resolver',
      upstreamDeps: matchedPkg.dependencies.length > 0 ? matchedPkg.dependencies : ['root-tsconfig'],
      downstreamConsumers: preset.packages
        .filter((p) => p.dependencies.includes(matchedPkg.name))
        .map((p) => p.name),
      cacheSignature: customHash,
      latencyMs: 0.41,
      stages: [
        {
          step: 1,
          title: 'Specifier Tokenization & Workspace Lookup',
          module: 'crates/turborepo-repository/src/package_graph',
          detail: `Parsed custom query "${queryInput}" and matched workspace "${matchedPkg.name}" at ${matchedPkg.path}.`,
          output: `pkg: "${matchedPkg.name}" (${matchedPkg.type})`,
          durationUs: 68,
        },
        {
          step: 2,
          title: 'Entry File & Export Map Resolution',
          module: `${matchedPkg.path}/package.json`,
          detail: `Resolved primary source entry ${matchedPkg.path}/${matchedPkg.files[0]?.path ?? 'src/index.ts'}.`,
          output: `resolved -> /vercel/sandbox/turborepo/${matchedPkg.path}`,
          durationUs: 89,
        },
        {
          step: 3,
          title: 'Package Boundaries & Tag Audit',
          module: 'crates/turborepo-boundaries/src/lib.rs',
          detail: `Audited tags [${matchedPkg.tags.join(', ')}] against workspace boundary constraints.`,
          output: '0 violations · boundary check PASS',
          durationUs: 76,
        },
        {
          step: 4,
          title: 'Task Graph Topological Wave Scheduling',
          module: 'crates/turborepo-engine/src/builder.rs',
          detail: `Scheduled "${matchedPkg.name}#build" across ${graph.waves.length} parallel execution waves.`,
          output: `Global Hash: ${graph.globalHash.slice(0, 12)}`,
          durationUs: 94,
        },
        {
          step: 5,
          title: 'Deterministic Cache Digest Generation',
          module: 'crates/turborepo-cache/src/lib.rs',
          detail: 'Computed deterministic 64-bit FNV/SHA digest for instant Remote Cache replay.',
          output: `HIT · digest ${customHash}`,
          durationUs: 83,
        },
      ],
    };
  }, [queryInput, selectedTargetId, preset, graph]);

  const handleSelectTarget = (target: ResolutionPresetTarget) => {
    setSlideDirection(1);
    setSelectedTargetId(target.id);
    setQueryInput(target.specifier);
    setActiveStageIdx(0);
    setSlideKey((prev) => prev + 1);
  };

  const handleStepStage = (nextIdx: number) => {
    setSlideDirection(nextIdx >= activeStageIdx ? 1 : -1);
    setActiveStageIdx(nextIdx);
  };

  const DEMO_SLIDES = [
    {
      badge: '01 · GRAPH RESOLVER',
      title: 'Zero-Latency Workspace Module Resolution',
      subtitle:
        'Resolves workspace exports, tsconfig paths, and Cargo crates in < 0.45ms with deterministic topological ordering.',
      metric: '0.38 ms',
      metricLabel: 'Avg Resolution Time',
      accent: 'from-[#FF1E56] to-[#a853ba]',
    },
    {
      badge: '02 · SMOOTH SLIDE ENGINE',
      title: 'Hardware-Accelerated Spring Slide Physics',
      subtitle:
        'Every drawer, tab indicator, and resolution card glides with tuned spring stiffness (340/32) and cubic-bezier(0.22, 1, 0.36, 1).',
      metric: '120 fps',
      metricLabel: 'Compositor Frame Pacing',
      accent: 'from-[#a853ba] to-[#0096FF]',
    },
    {
      badge: '03 · REMOTE CACHE REPLAY',
      title: 'Instant Artifact Restoration Across Teams & CI',
      subtitle:
        'Content-addressable task hashes link resolved dependency trees directly to Vercel Remote Cache artifacts.',
      metric: '>>> FULL TURBO',
      metricLabel: 'Cache Hit Replay',
      accent: 'from-[#0096FF] to-[#10B981]',
    },
  ];

  const cssSnippet = `.sidename {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(110deg, #ff1e56 0%, #a853ba 48%, #0096ff 100%);
  -webkit-background-clip: text;
  color: transparent;
  transition: transform 0.38s ${activeCurve.cssBezier};
}

.slide-smooth {
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}`;

  const handleCopySnippet = () => {
    void navigator.clipboard.writeText(cssSnippet).then(() => {
      setCopiedCss(true);
      window.setTimeout(() => setCopiedCss(false), 1600);
    });
  };

  return (
    <div
      className={`w-full ${
        compactDrawer ? 'p-4' : 'mx-auto max-w-[1220px] px-6 py-8'
      }`}
    >
      {/* Top Header Banner with class="sidename" Turbocharger */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 shadow-sm">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #FF1E56 0%, #a853ba 50%, #0096FF 100%)',
          }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-1 text-xs font-medium">
                <Zap className="h-3.5 w-3.5 text-[#FF1E56]" />
                <span className="sidename text-sm">Turbocharger</span>
              </span>
              <span className="font-mono text-xs text-gray-800 dark:text-neutral-400">
                UI/UX &amp; DAG Dependency Resolver · v2.11.10
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-1000">
              <span className="sidename mr-2">Turbocharger</span>
              UI/UX Smooth Slide Resolver
            </h1>
            <p className="max-w-2xl text-sm text-gray-900 dark:text-neutral-400">
              Inspect real-time workspace module resolution, topological task waves,
              and interactive smooth-slide motion curves across{' '}
              <code className="font-mono text-xs text-gray-1000">
                z-ey3eiei/Turborepo
              </code>
              .
            </p>
          </div>

          {/* Mode Switcher with Smooth Sliding Pill */}
          <div className="relative inline-flex items-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 p-1">
            {(
              [
                {
                  id: 'resolver',
                  label: 'Module & DAG Resolver',
                  icon: Layers,
                },
                {
                  id: 'ux-motion',
                  label: 'UI/UX Slide Animator',
                  icon: SlidersHorizontal,
                },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMode(tab.id)}
                  className={`relative z-10 flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'text-gray-1000'
                      : 'text-gray-800 hover:text-gray-1000'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId={
                        compactDrawer
                          ? 'drawer-resolver-mode-pill'
                          : 'main-resolver-mode-pill'
                      }
                      transition={activeCurve.transition}
                      className="absolute inset-0 -z-10 rounded-md bg-background-100 shadow-xs border border-gray-200/80 dark:border-neutral-700"
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 text-[#FF1E56]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mode Content with Smooth Slide Transition */}
      <AnimatePresence mode="wait">
        {activeMode === 'resolver' ? (
          <motion.div
            key="mode-resolver"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={activeCurve.transition}
            className="mt-6 space-y-6"
          >
            {/* Search & Target Specifier Bar */}
            <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => {
                      setQueryInput(e.target.value);
                      setActiveStageIdx(0);
                    }}
                    placeholder="Enter package specifier, route, or crate path (e.g. @repo/ui/button, crates/turborepo-engine)..."
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 pl-10 pr-4 py-2.5 font-mono text-sm text-gray-1000 placeholder:text-gray-700 focus:border-[#0096FF] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSlideDirection(1);
                    setSlideKey((prev) => prev + 1);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF1E56] to-[#0096FF] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resolve &amp; Slide Pipeline</span>
                </button>
              </div>

              {/* Quick Specifier Chips with sliding active highlight */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-700 mr-1">
                  Presets:
                </span>
                {RESOLVER_TARGETS.map((target) => {
                  const selected = resolvedTarget.id === target.id;
                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => handleSelectTarget(target)}
                      className={`relative rounded-md px-3 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                        selected
                          ? 'text-gray-1000 font-semibold'
                          : 'text-gray-800 hover:text-gray-1000 bg-background-200/70'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId={
                            compactDrawer
                              ? 'drawer-target-chip'
                              : 'main-target-chip'
                          }
                          transition={activeCurve.transition}
                          className="absolute inset-0 rounded-md border border-[#FF1E56]/50 bg-[#FF1E56]/10 dark:bg-[#FF1E56]/15"
                        />
                      )}
                      <span className="relative z-10">{target.specifier}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolved Summary Strip + Sliding Stage Pipeline */}
            <div
              className={`grid gap-6 ${
                compactDrawer ? 'grid-cols-1' : 'lg:grid-cols-12'
              }`}
            >
              {/* Left Column: 5-Stage Smooth Sliding Pipeline List */}
              <div
                className={
                  compactDrawer ? 'space-y-3' : 'lg:col-span-5 space-y-3'
                }
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-800 dark:text-neutral-400">
                    Resolution Pipeline (5 Stages)
                  </span>
                  <span className="font-mono text-xs text-emerald-500">
                    {resolvedTarget.latencyMs} ms total
                  </span>
                </div>

                <motion.div
                  key={`pipeline-${resolvedTarget.id}-${slideKey}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.065 },
                    },
                  }}
                  className="space-y-2.5"
                >
                  {resolvedTarget.stages.map((stage, idx) => {
                    const isSelected = activeStageIdx === idx;
                    return (
                      <motion.button
                        key={stage.step}
                        type="button"
                        variants={{
                          hidden: { opacity: 0, x: -slideDistance },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: activeCurve.transition,
                          },
                        }}
                        onClick={() => handleStepStage(idx)}
                        className={`relative w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer slide-card-hover ${
                          isSelected
                            ? 'border-[#0096FF] bg-background-100 shadow-sm'
                            : 'border-gray-200 dark:border-neutral-800 bg-background-100/70 hover:border-gray-400 dark:hover:border-neutral-700'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId={
                              compactDrawer
                                ? 'drawer-stage-bar'
                                : 'main-stage-bar'
                            }
                            transition={activeCurve.transition}
                            className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r bg-gradient-to-b from-[#FF1E56] to-[#0096FF]"
                          />
                        )}
                        <div className="flex items-start justify-between gap-3 pl-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 font-mono text-[11px] font-bold text-gray-1000">
                                {stage.step}
                              </span>
                              <span className="text-sm font-semibold text-gray-1000">
                                {stage.title}
                              </span>
                            </div>
                            <p className="font-mono text-[11px] text-gray-800 dark:text-neutral-400 truncate max-w-[320px]">
                              {stage.module}
                            </p>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-500 shrink-0">
                            {stage.durationUs} µs
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              {/* Right Column: Active Stage Slide Detail & Dependency Inspector */}
              <div
                className={
                  compactDrawer ? 'space-y-4' : 'lg:col-span-7 space-y-4'
                }
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="sidename text-xs">Turbocharger</span>
                    <span className="text-xs font-mono text-gray-800 dark:text-neutral-400">
                      Stage Inspector ({activeStageIdx + 1} /{' '}
                      {resolvedTarget.stages.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={activeStageIdx === 0}
                      onClick={() =>
                        handleStepStage(Math.max(0, activeStageIdx - 1))
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 dark:border-neutral-800 bg-background-100 text-gray-900 disabled:opacity-40 cursor-pointer"
                      aria-label="Previous stage"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        activeStageIdx === resolvedTarget.stages.length - 1
                      }
                      onClick={() =>
                        handleStepStage(
                          Math.min(
                            resolvedTarget.stages.length - 1,
                            activeStageIdx + 1
                          )
                        )
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 dark:border-neutral-800 bg-background-100 text-gray-900 disabled:opacity-40 cursor-pointer"
                      aria-label="Next stage"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Animated Slide Card for Selected Stage */}
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.div
                      key={`${resolvedTarget.id}-stage-${activeStageIdx}`}
                      custom={slideDirection}
                      initial={{
                        opacity: 0,
                        x: slideDirection * slideDistance,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: -slideDirection * slideDistance,
                      }}
                      transition={activeCurve.transition}
                      className="space-y-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#FF1E56]/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#FF1E56]">
                              Stage 0{resolvedTarget.stages[activeStageIdx].step}
                            </span>
                            <span className="font-mono text-xs text-gray-800 dark:text-neutral-400">
                              {resolvedTarget.category}
                            </span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold text-gray-1000">
                            {resolvedTarget.stages[activeStageIdx].title}
                          </h3>
                          <p className="mt-1 font-mono text-xs text-[#0096FF]">
                            {resolvedTarget.stages[activeStageIdx].module}
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 text-right font-mono">
                          <div className="text-[11px] text-gray-700">
                            STAGE LATENCY
                          </div>
                          <div className="text-sm font-bold text-emerald-500">
                            {resolvedTarget.stages[activeStageIdx].durationUs} µs
                          </div>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-gray-900 dark:text-neutral-300">
                        {resolvedTarget.stages[activeStageIdx].detail}
                      </p>

                      <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 p-3.5 font-mono text-xs">
                        <div className="mb-1 text-[11px] uppercase tracking-wider text-gray-700">
                          Resolver Output Trace
                        </div>
                        <div className="text-emerald-500 break-all">
                          $ {resolvedTarget.stages[activeStageIdx].output}
                        </div>
                      </div>

                      {/* Resolved Metadata Grid */}
                      <div className="grid gap-3 sm:grid-cols-2 pt-2">
                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-neutral-400">
                            <FileCode2 className="h-3.5 w-3.5 text-[#0096FF]" />
                            <span>Resolved File Path</span>
                          </div>
                          <div className="mt-1 font-mono text-xs text-gray-1000 break-all">
                            {resolvedTarget.resolvedFilePath}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-neutral-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Remote Cache Digest</span>
                          </div>
                          <div className="mt-1 font-mono text-xs text-gray-1000">
                            {resolvedTarget.cacheSignature}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-neutral-400">
                            <GitBranch className="h-3.5 w-3.5 text-[#FF1E56]" />
                            <span>Upstream Dependencies</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {resolvedTarget.upstreamDeps.map((dep) => (
                              <span
                                key={dep}
                                className="rounded bg-background-100 px-2 py-0.5 font-mono text-[11px] text-gray-900 border border-gray-200 dark:border-neutral-800"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-neutral-400">
                            <FolderGit2 className="h-3.5 w-3.5 text-amber-500" />
                            <span>Downstream Consumers</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {resolvedTarget.downstreamConsumers.length > 0 ? (
                              resolvedTarget.downstreamConsumers.map((consumer) => (
                                <span
                                  key={consumer}
                                  className="rounded bg-background-100 px-2 py-0.5 font-mono text-[11px] text-gray-900 border border-gray-200 dark:border-neutral-800"
                                >
                                  {consumer}
                                </span>
                              ))
                            ) : (
                              <span className="font-mono text-[11px] text-gray-700">
                                Leaf target (no downstream consumers)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Jump Actions */}
                      {onNavigateRoute && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 dark:border-neutral-800 pt-4">
                          <span className="text-xs text-gray-800 dark:text-neutral-400">
                            Open resolved target in workspace tools:
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onNavigateRoute('devtools')}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-1.5 text-xs font-medium text-gray-1000 hover:border-[#0096FF] transition-colors cursor-pointer"
                            >
                              <span>Inspect in Devtools</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigateRoute('factory')}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-1.5 text-xs font-medium text-gray-1000 hover:border-[#FF1E56] transition-colors cursor-pointer"
                            >
                              <span>Launch in Factory (fx)</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Mode 2: UI/UX Smooth Slide Animation & .sidename Studio */
          <motion.div
            key="mode-ux-motion"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={activeCurve.transition}
            className="mt-6 grid gap-6 lg:grid-cols-12"
          >
            {/* Left Controls: Curve & Slide Distance */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-1000">
                    Slide Physics &amp; Curve Resolver
                  </h3>
                  <span className="sidename text-xs">Turbocharger</span>
                </div>

                <div className="space-y-2">
                  {(Object.keys(SLIDE_CURVES) as SlideCurveKey[]).map((key) => {
                    const item = SLIDE_CURVES[key];
                    const selected = curveKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCurveKey(key)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#FF1E56] bg-[#FF1E56]/5 dark:bg-[#FF1E56]/10'
                            : 'border-gray-200 dark:border-neutral-800 bg-background-200/50 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-1000">
                            {item.label}
                          </span>
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              selected ? 'text-[#FF1E56]' : 'opacity-20'
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-800 dark:text-neutral-400">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900">
                      Slide Offset Distance (`translateX`)
                    </span>
                    <span className="font-mono text-gray-1000">
                      {slideDistance}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={80}
                    step={4}
                    value={slideDistance}
                    onChange={(e) => setSlideDistance(Number(e.target.value))}
                    className="w-full accent-[#FF1E56] cursor-pointer"
                  />
                </div>
              </div>

              {/* CSS / Class Name Reference (.sidename Turbocharger) */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-gray-700">
                      Class Specifier
                    </span>
                    <h4 className="text-sm font-bold text-gray-1000">
                      <code>.sidename</code> &amp; <code>.slide-smooth</code>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-neutral-800 bg-background-200 px-2.5 py-1 text-xs font-medium text-gray-1000 cursor-pointer"
                  >
                    {copiedCss ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy CSS</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 p-3 font-mono text-xs leading-relaxed text-gray-900 dark:text-neutral-300">
                  <code>{cssSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Right Interactive Slide Showcase */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-gray-700">
                      Interactive Preview
                    </span>
                    <h3 className="text-lg font-bold text-gray-1000">
                      <span className="sidename mr-2">Turbocharger</span>
                      Smooth Slide Carousel
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {DEMO_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSlideDirection(i >= demoSlideIndex ? 1 : -1);
                          setDemoSlideIndex(i);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          demoSlideIndex === i
                            ? 'w-7 bg-gradient-to-r from-[#FF1E56] to-[#0096FF]'
                            : 'w-2 bg-gray-300 dark:bg-neutral-700'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Smooth Sliding Feature Card */}
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-200 p-6 min-h-[210px] flex flex-col justify-between">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.div
                      key={`demo-slide-${demoSlideIndex}-${curveKey}`}
                      custom={slideDirection}
                      initial={{
                        opacity: 0,
                        x: slideDirection * slideDistance,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: -slideDirection * slideDistance,
                      }}
                      transition={activeCurve.transition}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-[#FF1E56]">
                          {DEMO_SLIDES[demoSlideIndex].badge}
                        </span>
                        <span className="sidename text-sm">Turbocharger</span>
                      </div>

                      <h4 className="text-xl font-bold text-gray-1000">
                        {DEMO_SLIDES[demoSlideIndex].title}
                      </h4>

                      <p className="text-sm leading-relaxed text-gray-900 dark:text-neutral-400">
                        {DEMO_SLIDES[demoSlideIndex].subtitle}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-neutral-800">
                        <div>
                          <div className="font-mono text-lg font-bold text-gray-1000">
                            {DEMO_SLIDES[demoSlideIndex].metric}
                          </div>
                          <div className="text-xs text-gray-700">
                            {DEMO_SLIDES[demoSlideIndex].metricLabel}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSlideDirection(-1);
                              setDemoSlideIndex(
                                (prev) =>
                                  (prev - 1 + DEMO_SLIDES.length) %
                                  DEMO_SLIDES.length
                              );
                            }}
                            className="rounded-md border border-gray-200 dark:border-neutral-700 bg-background-100 px-3 py-1.5 text-xs font-medium text-gray-1000 cursor-pointer"
                          >
                            ← Prev Slide
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSlideDirection(1);
                              setDemoSlideIndex(
                                (prev) => (prev + 1) % DEMO_SLIDES.length
                              );
                            }}
                            className="rounded-md bg-gradient-to-r from-[#FF1E56] to-[#0096FF] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                          >
                            Next Slide →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Live .sidename Preview Strip */}
                <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-gray-700">
                      Active Brand Lockup Element
                    </div>
                    <div className="text-xs text-gray-900 dark:text-neutral-400">
                      <code>
                        &lt;span className="sidename"&gt;Turbocharger&lt;/span&gt;
                      </code>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-100 px-4 py-2">
                    <span className="sidename text-xl">Turbocharger</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
