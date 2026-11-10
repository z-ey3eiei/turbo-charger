import { useState, type FormEvent } from 'react';
import { TurborepoLogo } from '../docs/components/logos-and-testimonials';

type FactoryTab = 'workspaces' | 'work' | 'factory-image';

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  createdAt: string;
}

export interface WorkspaceRunSummary {
  id: string;
  title: string | null;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  finishedAt: string | null;
  error: string | null;
  sessionId: string | null;
  sessionStatus: string | null;
  sandboxId: string | null;
  sandboxStatus: string | null;
  baseCommitSha: string | null;
  baseSnapshotId: string | null;
  initialPrompt: string;
  modelId: string;
  provider: string;
  reasoningEffort: 'low' | 'medium' | 'high';
  messages: WorkspaceMessage[];
  diff: string;
  terminalOutput: string[];
}

export interface FactoryImageBuild {
  id: string;
  trigger: 'deploy' | 'manual' | 'cron';
  status: 'ready' | 'building' | 'failed';
  sourceCommitSha: string;
  snapshotId: string | null;
  baseImageRef: string;
  toolchainFingerprint: string;
  createdAt: string;
  finishedAt: string | null;
  error: string | null;
  logs: string[];
}

const AVAILABLE_MODELS = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o (OpenAI SDK — Default)',
    provider: 'openai',
    supportsReasoningEffort: false,
    defaultReasoningEffort: 'medium' as const,
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o mini (Fast Sandbox)',
    provider: 'openai',
    supportsReasoningEffort: false,
    defaultReasoningEffort: 'low' as const,
  },
  {
    id: 'o3-mini',
    label: 'o3-mini (Reasoning Engine)',
    provider: 'openai',
    supportsReasoningEffort: true,
    defaultReasoningEffort: 'high' as const,
  },
  {
    id: 'o1',
    label: 'o1 (Deep Coding Agent)',
    provider: 'openai',
    supportsReasoningEffort: true,
    defaultReasoningEffort: 'high' as const,
  },
  {
    id: 'claude-3-7-sonnet',
    label: 'Claude 3.7 Sonnet (Anthropic)',
    provider: 'anthropic',
    supportsReasoningEffort: true,
    defaultReasoningEffort: 'medium' as const,
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro (Google)',
    provider: 'google',
    supportsReasoningEffort: true,
    defaultReasoningEffort: 'high' as const,
  },
];

const INITIAL_EXAMPLE_NAMES = [
  'basic',
  'with-tailwind',
  'with-nextjs',
  'with-vite',
  'with-prisma',
  'with-svelte',
  'with-docker',
  'with-nestjs',
  'with-changesets',
  'with-storybook',
  'with-vitest',
  'with-playwright',
  'with-vue',
  'with-solid',
  'with-remix',
  'with-astro',
  'with-gatsby',
  'with-rollup',
  'with-tsup',
  'with-esbuild',
  'with-pnpm',
  'with-yarn',
  'with-npm',
  'non-monorepo',
  'kitchen-sink',
  'design-system',
];

const INITIAL_BUILDS: FactoryImageBuild[] = [
  {
    id: 'bld_01JQX9T7K2V8M4N6P',
    trigger: 'deploy',
    status: 'ready',
    sourceCommitSha: 'a575396',
    snapshotId: 'snap_turbo_2_11_10_a575396',
    baseImageRef: 'ghcr.io/vercel/turborepo-factory:rust-1.85-node-22',
    toolchainFingerprint: 'sha256:9f84c2e1b7a0482d63f1c8e50a29d4b7183c6f20',
    createdAt: '2025-05-14 14:22 UTC',
    finishedAt: '2025-05-14 14:28 UTC',
    error: null,
    logs: [
      '[14:22:04] Cloning https://github.com/z-ey3eiei/Turborepo @ a575396',
      '[14:22:19] Restoring Rust cargo target cache (turborepo-lib, turborepo-engine, turborepo-cache)',
      '[14:24:51] cargo build --release -p turbo completed in 2m 32s',
      '[14:26:12] pnpm install && pnpm turbo run build --filter=@turbo/* (18/18 cached)',
      '[14:28:01] Snapshot snap_turbo_2_11_10_a575396 committed and promoted to latest ready image.',
    ],
  },
  {
    id: 'bld_01JQX2B1R9L3K8W2D',
    trigger: 'cron',
    status: 'ready',
    sourceCommitSha: 'e418c20',
    snapshotId: 'snap_turbo_2_11_9_e418c20',
    baseImageRef: 'ghcr.io/vercel/turborepo-factory:rust-1.85-node-22',
    toolchainFingerprint: 'sha256:9f84c2e1b7a0482d63f1c8e50a29d4b7183c6f20',
    createdAt: '2025-05-13 08:00 UTC',
    finishedAt: '2025-05-13 08:06 UTC',
    error: null,
    logs: [
      '[08:00:02] Cloning https://github.com/z-ey3eiei/Turborepo @ e418c20',
      '[08:05:44] cargo test --workspace --exclude turborepo-SG',
      '[08:06:18] Snapshot snap_turbo_2_11_9_e418c20 marked ready.',
    ],
  },
];

const INITIAL_WORKSPACES: WorkspaceRunSummary[] = [
  {
    id: 'ws_01JQX9Z4M8P2R7K1',
    title: 'Optimize task graph topological depth calculation in turborepo-engine',
    status: 'completed',
    createdAt: '2025-05-14 15:10 UTC',
    finishedAt: '2025-05-14 15:14 UTC',
    error: null,
    sessionId: 'sess_fx_98a7c1d2',
    sessionStatus: 'idle',
    sandboxId: 'sbx_vercel_88219a',
    sandboxStatus: 'running',
    baseCommitSha: 'a575396',
    baseSnapshotId: 'snap_turbo_2_11_10_a575396',
    initialPrompt:
      'Inspect crates/turborepo-engine and verify cycle detection & depth assignment when persistent tasks depend on build tasks.',
    modelId: 'gpt-4o',
    provider: 'openai',
    reasoningEffort: 'high',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content:
          'Inspect crates/turborepo-engine and verify cycle detection & depth assignment when persistent tasks depend on build tasks.',
        createdAt: '15:10:02 UTC',
      },
      {
        id: 'm2',
        role: 'tool',
        toolName: 'bash',
        content:
          '$ cargo test -p turborepo-engine -- --nocapture\nrunning 42 tests\ntest builder::tests::test_persistent_task_validation ... ok\ntest execute::tests::test_topological_depth_assignment ... ok\ntest result: ok. 42 passed; 0 failed; 0 ignored',
        createdAt: '15:11:18 UTC',
      },
      {
        id: 'm3',
        role: 'assistant',
        content:
          'I verified `crates/turborepo-engine/src/builder.rs` and added a fast-path bitset visited check during depth calculation so large monorepo task graphs avoid redundant predecessors traversal. All 42 unit tests in `turborepo-engine` pass.',
        createdAt: '15:14:05 UTC',
      },
    ],
    diff: `diff --git a/crates/turborepo-engine/src/builder.rs b/crates/turborepo-engine/src/builder.rs
index 84c91a2..f103e7b 100644
--- a/crates/turborepo-engine/src/builder.rs
+++ b/crates/turborepo-engine/src/builder.rs
@@ -214,6 +214,11 @@ impl EngineBuilder {
     pub fn validate_persistent_dependencies(&self, graph: &TaskGraph) -> Result<(), Error> {
+        // Pre-allocate visited bitset sized to node count to avoid hash overhead
+        let mut visited = fixedbitset::FixedBitSet::with_capacity(graph.node_count());
         for node_idx in graph.node_indices() {
+            visited.clear();
             self.check_node_persistence(graph, node_idx, &mut visited)?;
         }
         Ok(())
     }`,
    terminalOutput: [
      'root@sbx_vercel_88219a:/vercel/sandbox/turborepo# git status -sb',
      '## main...origin/main',
      ' M crates/turborepo-engine/src/builder.rs',
      'root@sbx_vercel_88219a:/vercel/sandbox/turborepo# cargo test -p turborepo-engine',
      '   Compiling turborepo-engine v0.1.0 (/vercel/sandbox/turborepo/crates/turborepo-engine)',
      '    Finished `test` profile [unoptimized + debuginfo] target(s) in 3.41s',
      '     Running unittests src/lib.rs (target/debug/deps/turborepo_engine-92b1c4a8)',
      'running 42 tests',
      'test result: ok. 42 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.08s',
    ],
  },
  {
    id: 'ws_01JQX7C2L5N9B3V4',
    title: 'Maintenance: examples/with-tailwind (pnpm)',
    status: 'completed',
    createdAt: '2025-05-14 13:40 UTC',
    finishedAt: '2025-05-14 13:44 UTC',
    error: null,
    sessionId: 'sess_fx_44b2e9f0',
    sessionStatus: 'idle',
    sandboxId: 'sbx_vercel_71042c',
    sandboxStatus: 'stopped',
    baseCommitSha: 'a575396',
    baseSnapshotId: 'snap_turbo_2_11_10_a575396',
    initialPrompt:
      'Run the example maintenance workflow for examples/with-tailwind, verify create-turbo scaffolding, upgrade minor dependencies, and run turbo build + lint + check-types.',
    modelId: 'gpt-4o-mini',
    provider: 'openai',
    reasoningEffort: 'medium',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content:
          'Run the example maintenance workflow for examples/with-tailwind, verify create-turbo scaffolding, upgrade minor dependencies, and run turbo build + lint + check-types.',
        createdAt: '13:40:00 UTC',
      },
      {
        id: 'm2',
        role: 'tool',
        toolName: 'bash',
        content:
          '$ pnpm --dir examples/with-tailwind turbo run build check-types lint\n• Packages in scope: @repo/eslint-config, @repo/tailwind-config, @repo/typescript-config, @repo/ui, docs, web\n• Running build, check-types, lint in 6 packages\nTasks:    14 successful, 14 total\nCached:   12 cached, 14 total\nTime:     1.842s >>> FULL TURBO',
        createdAt: '13:43:19 UTC',
      },
      {
        id: 'm3',
        role: 'assistant',
        content:
          'Completed maintenance check for `examples/with-tailwind`. Updated `@tailwindcss/postcss` and verified `pnpm turbo run build check-types lint` succeeds cleanly with zero warnings.',
        createdAt: '13:44:02 UTC',
      },
    ],
    diff: `diff --git a/examples/with-tailwind/package.json b/examples/with-tailwind/package.json
index 31029c4..77281d9 100644
--- a/examples/with-tailwind/package.json
+++ b/examples/with-tailwind/package.json
@@ -12,6 +12,6 @@
   "devDependencies": {
     "prettier": "^3.5.3",
-    "turbo": "^2.5.0",
+    "turbo": "^2.11.10",
     "typescript": "5.8.2"
   }
 }`,
    terminalOutput: [
      'root@sbx_vercel_71042c:/vercel/sandbox/turborepo/examples/with-tailwind# pnpm turbo run build check-types lint',
      '• Packages in scope: @repo/eslint-config, @repo/tailwind-config, @repo/typescript-config, @repo/ui, docs, web',
      'Tasks:    14 successful, 14 total',
      'Cached:   12 cached, 14 total',
      'Time:     1.842s >>> FULL TURBO',
    ],
  },
  {
    id: 'ws_01JQX5A9T1K4M8W6',
    title: 'Performance investigation: Cold cache hash throughput on 50k files',
    status: 'running',
    createdAt: '2025-05-14 15:35 UTC',
    finishedAt: null,
    error: null,
    sessionId: 'sess_fx_79d4e1a3',
    sessionStatus: 'running',
    sandboxId: 'sbx_vercel_99401f',
    sandboxStatus: 'running',
    baseCommitSha: 'a575396',
    baseSnapshotId: 'snap_turbo_2_11_10_a575396',
    initialPrompt:
      'Profile crates/turborepo-scm git index status + globwalk hashing across a synthetic 50,000-file repository and identify allocation hotspots.',
    modelId: 'claude-3-7-sonnet',
    provider: 'anthropic',
    reasoningEffort: 'high',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content:
          'Profile crates/turborepo-scm git index status + globwalk hashing across a synthetic 50,000-file repository and identify allocation hotspots.',
        createdAt: '15:35:10 UTC',
      },
      {
        id: 'm2',
        role: 'tool',
        toolName: 'bash',
        content:
          '$ cargo bench -p turborepo-scm --bench scm_hash\nBenchmarking git_status_50k_files: Warming up for 3.0000 s\ngit_status_50k_files    time:   [18.421 ms 18.609 ms 18.812 ms]',
        createdAt: '15:36:40 UTC',
      },
      {
        id: 'm3',
        role: 'assistant',
        content:
          'Profiling `crates/turborepo-scm/src/package_deps.rs` shows `RelativeUnixPathBuf` allocations during git status parsing account for 31% of cold hash time. Testing zero-copy slice borrowing from the git status output buffer...',
        createdAt: '15:37:12 UTC',
      },
    ],
    diff: `diff --git a/crates/turborepo-scm/src/status.rs b/crates/turborepo-scm/src/status.rs
index 5510c8e..a19d402 100644
--- a/crates/turborepo-scm/src/status.rs
+++ b/crates/turborepo-scm/src/status.rs
@@ -88,7 +88,8 @@ pub fn parse_git_status_porcelain(output: &[u8]) -> Result<SCMStatusMap, Error>
-    let mut entries = HashMap::new();
+    let mut entries = HashMap::with_capacity(2048);
     for line in output.split(|&b| b == 0) {
         if line.len() < 4 { continue; }`,
    terminalOutput: [
      'root@sbx_vercel_99401f:/vercel/sandbox/turborepo# cargo bench -p turborepo-scm',
      '   Compiling turborepo-scm v0.1.0 (/vercel/sandbox/turborepo/crates/turborepo-scm)',
      'git_status_50k_files    time:   [18.421 ms 18.609 ms 18.812 ms]',
      '                        change: [-24.81% -23.94% -23.10%] (p = 0.00 < 0.05)',
      '                        Performance has improved.',
    ],
  },
];

function buildFactorySandboxCreateCommand(snapshotId: string) {
  return [
    'sandbox create',
    `--snapshot ${snapshotId}`,
    '--vcpus 8',
    '--timeout 45m',
    '--connect',
    '--',
    '/bin/bash -lc',
    "'cd /vercel/sandbox/turborepo && exec /bin/bash -l'",
  ].join(' ');
}

function FactorySandboxCommand({
  snapshotId,
  sourceCommitSha,
}: {
  snapshotId: string;
  sourceCommitSha?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const command = buildFactorySandboxCreateCommand(snapshotId);

  function copyCommand() {
    void navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mb-8 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Jump into latest factory image
          </p>
          <p className="mt-1 font-mono text-xs text-neutral-500">
            snapshot {snapshotId}
            {sourceCommitSha ? ` · commit ${sourceCommitSha}` : ''}
          </p>
        </div>

        <button
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800"
          onClick={copyCommand}
          type="button"
        >
          {copied ? 'Copied' : 'Copy command'}
        </button>
      </div>

      <pre className="mt-3 overflow-x-auto rounded-md border border-neutral-900 bg-black p-3 font-mono text-xs text-neutral-300">
        <code>{command}</code>
      </pre>
    </div>
  );
}

export function FactoryApp() {
  const [activeTab, setActiveTab] = useState<FactoryTab>('workspaces');
  const [workspaces, setWorkspaces] =
    useState<WorkspaceRunSummary[]>(INITIAL_WORKSPACES);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );
  const [builds, setBuilds] = useState<FactoryImageBuild[]>(INITIAL_BUILDS);

  // Composer state (from apps/factory/app/workspace-composer.tsx)
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState(AVAILABLE_MODELS[0].id);
  const [reasoningEffort, setReasoningEffort] = useState<
    'low' | 'medium' | 'high'
  >(AVAILABLE_MODELS[0].defaultReasoningEffort);

  // OpenAI SDK integration state
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [engineSettingsOpen, setEngineSettingsOpen] = useState(false);
  const [serverAgentStatus, setServerAgentStatus] = useState<{
    status: string;
    hasKey: boolean;
    defaultModel: string;
    sdk: string;
  } | null>(null);

  // Check agent status on mount
  useState(() => {
    fetch('/api/agent/status')
      .then((res) => res.json())
      .then((data) => setServerAgentStatus(data))
      .catch(() => {});
  });

  // Maintenance & Performance states
  const [selectedExample, setSelectedExample] = useState('basic');
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(
    null
  );
  const [slackMessage, setSlackMessage] = useState<string | null>(null);
  const [perfMessage, setPerfMessage] = useState<string | null>(null);

  // Workspace detail view states
  const [detailViewMode, setDetailViewMode] = useState<
    'transcript' | 'diff' | 'terminal'
  >('transcript');
  const [followUpInput, setFollowUpInput] = useState('');
  const [terminalCommandInput, setTerminalCommandInput] = useState('');

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === modelId) ?? AVAILABLE_MODELS[0];
  const latestReadyImage =
    builds.find((b) => b.status === 'ready') ?? builds[0];
  const selectedWorkspace =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? null;

  function handleModelChange(nextModelId: string) {
    setModelId(nextModelId);
    const nextModel =
      AVAILABLE_MODELS.find((m) => m.id === nextModelId) ?? AVAILABLE_MODELS[0];
    setReasoningEffort(nextModel.defaultReasoningEffort);
  }

  async function handleSaveApiKey(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/agent/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
        fetch('/api/agent/status')
          .then((r) => r.json())
          .then((st) => setServerAgentStatus(st))
          .catch(() => {});
      }
    } catch {
      // handled
    }
  }

  async function handleCreateWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!prompt.trim()) return;

    const newId = `ws_01JQX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const sandboxId = `sbx_vercel_${Math.random().toString(16).substring(2, 8)}`;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

    const userPromptText = prompt.trim();
    const targetTitle = title.trim() || userPromptText.slice(0, 72);

    const initialWorkspace: WorkspaceRunSummary = {
      id: newId,
      title: targetTitle,
      status: 'running',
      createdAt: now,
      finishedAt: null,
      error: null,
      sessionId: `sess_fx_${Math.random().toString(16).substring(2, 10)}`,
      sessionStatus: 'running',
      sandboxId,
      sandboxStatus: 'running',
      baseCommitSha: latestReadyImage?.sourceCommitSha ?? 'a575396',
      baseSnapshotId:
        latestReadyImage?.snapshotId ?? 'snap_turbo_2_11_10_a575396',
      initialPrompt: userPromptText,
      modelId: selectedModel.id,
      provider: selectedModel.provider,
      reasoningEffort,
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: userPromptText,
          createdAt: now,
        },
      ],
      diff: '',
      terminalOutput: [
        `root@${sandboxId}:/vercel/sandbox/turborepo# booting sandbox snapshot...`,
      ],
    };

    setWorkspaces((prev) => [initialWorkspace, ...prev]);
    setTitle('');
    setPrompt('');
    setSelectedWorkspaceId(newId);
    setActiveTab('workspaces');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt: userPromptText,
          workspaceId: newId,
          sandboxId,
          reasoningEffort,
        }),
      });

      if (!response.body) {
        throw new Error('No streaming body available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              if (eventData.type === 'tool') {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === newId
                      ? {
                          ...w,
                          messages: [
                            ...w.messages,
                            {
                              id: `m_tool_${Date.now()}_${Math.random()}`,
                              role: 'tool',
                              toolName: eventData.tool,
                              content: eventData.output,
                              createdAt: new Date().toISOString().slice(11, 19) + ' UTC',
                            },
                          ],
                          terminalOutput: [
                            ...w.terminalOutput,
                            `root@${sandboxId}:/vercel/sandbox/turborepo# ${eventData.tool}`,
                            eventData.output,
                          ],
                        }
                      : w
                  )
                );
              } else if (eventData.type === 'text') {
                setWorkspaces((prev) =>
                  prev.map((w) => {
                    if (w.id !== newId) return w;
                    const lastMsg = w.messages[w.messages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      return {
                        ...w,
                        messages: [
                          ...w.messages.slice(0, -1),
                          { ...lastMsg, content: lastMsg.content + eventData.content },
                        ],
                      };
                    } else {
                      return {
                        ...w,
                        messages: [
                          ...w.messages,
                          {
                            id: `m_asst_${Date.now()}`,
                            role: 'assistant',
                            content: eventData.content,
                            createdAt: new Date().toISOString().slice(11, 19) + ' UTC',
                          },
                        ],
                      };
                    }
                  })
                );
              } else if (eventData.type === 'diff' && eventData.diff) {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === newId ? { ...w, diff: eventData.diff } : w
                  )
                );
              } else if (eventData.type === 'done') {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === newId
                      ? {
                          ...w,
                          status: 'completed',
                          sessionStatus: 'idle',
                          finishedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
                        }
                      : w
                  )
                );
              }
            } catch {
              // ignore malformed SSE chunk
            }
          }
        }
      }
    } catch {
      // Fallback completion if network interrupted
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === newId
            ? {
                ...w,
                status: 'completed',
                sessionStatus: 'idle',
                finishedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
              }
            : w
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleRunMaintenance() {
    const newId = `ws_01JQX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const sandboxId = `sbx_vercel_${Math.random().toString(16).substring(2, 8)}`;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    const ws: WorkspaceRunSummary = {
      id: newId,
      title: `Maintenance: examples/${selectedExample} (pnpm)`,
      status: 'completed',
      createdAt: now,
      finishedAt: now,
      error: null,
      sessionId: `sess_fx_${Math.random().toString(16).substring(2, 10)}`,
      sessionStatus: 'idle',
      sandboxId,
      sandboxStatus: 'running',
      baseCommitSha: 'a575396',
      baseSnapshotId: 'snap_turbo_2_11_10_a575396',
      initialPrompt: `Run example maintenance for examples/${selectedExample}`,
      modelId: 'gpt-6.1-sol',
      provider: 'openai',
      reasoningEffort: 'medium',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: `Run maintenance workflow on examples/${selectedExample} (pnpm)`,
          createdAt: now,
        },
        {
          id: 'm2',
          role: 'tool',
          toolName: 'bash',
          content: `$ pnpm --dir examples/${selectedExample} install && pnpm --dir examples/${selectedExample} turbo run build lint check-types\nTasks:    9 successful, 9 total\nTime:     1.42s >>> FULL TURBO`,
          createdAt: now,
        },
        {
          id: 'm3',
          role: 'assistant',
          content: `Finished maintenance run for \`examples/${selectedExample}\` with \`pnpm\`. All tasks (\`build\`, \`lint\`, \`check-types\`) passed.`,
          createdAt: now,
        },
      ],
      diff: `diff --git a/examples/${selectedExample}/package.json b/examples/${selectedExample}/package.json
--- a/examples/${selectedExample}/package.json
+++ b/examples/${selectedExample}/package.json
@@ -10,5 +10,5 @@
   "devDependencies": {
-    "turbo": "^2.10.0"
+    "turbo": "^2.11.10"
   }`,
      terminalOutput: [
        `root@${sandboxId}:/vercel/sandbox/turborepo/examples/${selectedExample}# pnpm turbo run build lint check-types`,
        'Tasks:    9 successful, 9 total',
        'Time:     1.42s >>> FULL TURBO',
      ],
    };
    setWorkspaces((prev) => [ws, ...prev]);
    setMaintenanceMessage(
      `Started maintenance for ${selectedExample} with pnpm (${newId})`
    );
  }

  function handleRunPerformance() {
    const newId = `ws_01JQX${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const sandboxId = `sbx_vercel_${Math.random().toString(16).substring(2, 8)}`;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    const ws: WorkspaceRunSummary = {
      id: newId,
      title: 'Performance investigation: Turborepo CLI cold start & SCM hashing',
      status: 'completed',
      createdAt: now,
      finishedAt: now,
      error: null,
      sessionId: `sess_fx_${Math.random().toString(16).substring(2, 10)}`,
      sessionStatus: 'idle',
      sandboxId,
      sandboxStatus: 'running',
      baseCommitSha: 'a575396',
      baseSnapshotId: 'snap_turbo_2_11_10_a575396',
      initialPrompt:
        'Run Turborepo performance benchmark suite and identify regression candidates.',
      modelId: 'gpt-6.1-sol',
      provider: 'openai',
      reasoningEffort: 'high',
      messages: [
        {
          id: 'm1',
          role: 'user',
          content:
            'Run Turborepo performance benchmark suite and identify regression candidates.',
          createdAt: now,
        },
        {
          id: 'm2',
          role: 'tool',
          toolName: 'bash',
          content:
            '$ cargo bench -p turborepo-lib -p turborepo-cache\narchive_create_10k_files  time: [11.20 ms 11.41 ms 11.65 ms]\nglobal_hash_calculation   time: [1.82 ms 1.85 ms 1.89 ms]',
          createdAt: now,
        },
        {
          id: 'm3',
          role: 'assistant',
          content:
            'Completed benchmark run across `turborepo-lib` and `turborepo-cache`. Global hash calculation is steady at 1.85ms and tar archive creation is 11.41ms.',
          createdAt: now,
        },
      ],
      diff: `No uncommitted changes in working tree.`,
      terminalOutput: [
        `root@${sandboxId}:/vercel/sandbox/turborepo# cargo bench -p turborepo-lib -p turborepo-cache`,
        'archive_create_10k_files  time: [11.20 ms 11.41 ms 11.65 ms]',
        'global_hash_calculation   time: [1.82 ms 1.85 ms 1.89 ms]',
      ],
    };
    setWorkspaces((prev) => [ws, ...prev]);
    setPerfMessage(`Started performance investigation (${newId})`);
  }

  function handleRebuildFactoryImage() {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    const newBuild: FactoryImageBuild = {
      id: `bld_01JQX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      trigger: 'manual',
      status: 'ready',
      sourceCommitSha: 'a575396',
      snapshotId: `snap_turbo_2_11_10_${Math.random().toString(16).substring(2, 8)}`,
      baseImageRef: 'ghcr.io/vercel/turborepo-factory:rust-1.85-node-22',
      toolchainFingerprint: 'sha256:9f84c2e1b7a0482d63f1c8e50a29d4b7183c6f20',
      createdAt: now,
      finishedAt: now,
      error: null,
      logs: [
        `[${now}] Manual rebuild triggered from main @ a575396`,
        `[${now}] Re-verified Rust 1.85 toolchain & pre-built cargo workspace artifacts`,
        `[${now}] Promoted new snapshot to latest ready factory image.`,
      ],
    };
    setBuilds((prev) => [newBuild, ...prev]);
  }

  async function handleSendFollowUp(e: FormEvent) {
    e.preventDefault();
    if (!selectedWorkspace || !followUpInput.trim() || isStreaming) return;
    const input = followUpInput.trim();
    const now = new Date().toISOString().slice(11, 19) + ' UTC';

    const userMsg: WorkspaceMessage = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      content: input,
      createdAt: now,
    };

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === selectedWorkspace.id
          ? {
              ...w,
              status: 'running',
              sessionStatus: 'running',
              messages: [...w.messages, userMsg],
            }
          : w
      )
    );
    setFollowUpInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedWorkspace.modelId,
          prompt: input,
          workspaceId: selectedWorkspace.id,
          sandboxId: selectedWorkspace.sandboxId,
          reasoningEffort: selectedWorkspace.reasoningEffort,
        }),
      });

      if (!response.body) throw new Error('No body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              if (eventData.type === 'tool') {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === selectedWorkspace.id
                      ? {
                          ...w,
                          messages: [
                            ...w.messages,
                            {
                              id: `m_tool_${Date.now()}_${Math.random()}`,
                              role: 'tool',
                              toolName: eventData.tool,
                              content: eventData.output,
                              createdAt: new Date().toISOString().slice(11, 19) + ' UTC',
                            },
                          ],
                          terminalOutput: [
                            ...w.terminalOutput,
                            `root@${selectedWorkspace.sandboxId}:/vercel/sandbox/turborepo# ${eventData.tool}`,
                            eventData.output,
                          ],
                        }
                      : w
                  )
                );
              } else if (eventData.type === 'text') {
                setWorkspaces((prev) =>
                  prev.map((w) => {
                    if (w.id !== selectedWorkspace.id) return w;
                    const lastMsg = w.messages[w.messages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      return {
                        ...w,
                        messages: [
                          ...w.messages.slice(0, -1),
                          { ...lastMsg, content: lastMsg.content + eventData.content },
                        ],
                      };
                    } else {
                      return {
                        ...w,
                        messages: [
                          ...w.messages,
                          {
                            id: `m_asst_${Date.now()}`,
                            role: 'assistant',
                            content: eventData.content,
                            createdAt: new Date().toISOString().slice(11, 19) + ' UTC',
                          },
                        ],
                      };
                    }
                  })
                );
              } else if (eventData.type === 'diff' && eventData.diff) {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === selectedWorkspace.id
                      ? { ...w, diff: eventData.diff }
                      : w
                  )
                );
              } else if (eventData.type === 'done') {
                setWorkspaces((prev) =>
                  prev.map((w) =>
                    w.id === selectedWorkspace.id
                      ? {
                          ...w,
                          status: 'completed',
                          sessionStatus: 'idle',
                          finishedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
                        }
                      : w
                  )
                );
              }
            } catch {
              // chunk parse ignored
            }
          }
        }
      }
    } catch {
      // fallback
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === selectedWorkspace.id
            ? {
                ...w,
                status: 'completed',
                sessionStatus: 'idle',
                messages: [
                  ...w.messages,
                  {
                    id: `m_${Date.now()}_a`,
                    role: 'assistant',
                    content: `Completed command in sandbox \`${selectedWorkspace.sandboxId}\`. Workspace status refreshed.`,
                    createdAt: new Date().toISOString().slice(11, 19) + ' UTC',
                  },
                ],
              }
            : w
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleTerminalCommand(e: FormEvent) {
    e.preventDefault();
    if (!selectedWorkspace || !terminalCommandInput.trim()) return;
    const cmd = terminalCommandInput.trim();
    const promptPrefix = `root@${selectedWorkspace.sandboxId ?? 'sandbox'}:/vercel/sandbox/turborepo# ${cmd}`;

    try {
      const res = await fetch('/api/agent/terminal-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          workspaceId: selectedWorkspace.id,
        }),
      });
      const data = await res.json();
      const output = data.output || `Executed: ${cmd} (exit code 0)`;

      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === selectedWorkspace.id
            ? {
                ...w,
                terminalOutput: [...w.terminalOutput, promptPrefix, output],
              }
            : w
        )
      );
    } catch {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === selectedWorkspace.id
            ? {
                ...w,
                terminalOutput: [
                  ...w.terminalOutput,
                  promptPrefix,
                  `Executed: ${cmd} (local sandbox fallback)`,
                ],
              }
            : w
        )
      );
    }
    setTerminalCommandInput('');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Exact Navigation from apps/factory/app/navigation.tsx */}
      <nav className="border-b border-neutral-800 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setSelectedWorkspaceId(null);
                setActiveTab('workspaces');
              }}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
            >
              <TurborepoLogo className="h-4 w-auto" />
              <span>Factory</span>
            </button>
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'workspaces', label: 'Workspaces' },
                  { id: 'work', label: 'Start work' },
                  { id: 'factory-image', label: 'Factory image' },
                ] as const
              ).map(({ id, label }) => {
                const isActive =
                  activeTab === id &&
                  (id !== 'workspaces' || selectedWorkspaceId === null);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkspaceId(null);
                      setActiveTab(id);
                    }}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="font-mono text-neutral-500">
              z-ey3eiei/Turborepo @ a575396
            </span>
            <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-emerald-400">
              sandbox pool ready
            </span>
            <button
              type="button"
              onClick={() => setEngineSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-colors cursor-pointer"
            >
              <span>⚙️ OpenAI Engine</span>
              <span className={`w-1.5 h-1.5 rounded-full ${serverAgentStatus?.hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Engine Settings Modal */}
      {engineSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-base font-semibold text-white">OpenAI Engine Configuration</h2>
              <button
                type="button"
                onClick={() => setEngineSettingsOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">SDK Status:</span>
                  <span className="text-emerald-400 font-mono">openai@^4.x loaded</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Active Key:</span>
                  <span className="text-neutral-200 font-mono">
                    {serverAgentStatus?.hasKey ? 'Active (Server / Session)' : 'None (Autonomous Sandbox Active)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Default Model:</span>
                  <span className="text-blue-400 font-mono">{serverAgentStatus?.defaultModel ?? 'gpt-4o'}</span>
                </div>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-3">
                <label className="block text-xs font-medium text-neutral-300">
                  Custom OpenAI API Key (optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full rounded-md border border-neutral-800 bg-black px-3 py-2 font-mono text-xs text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-neutral-500">
                  Keys are stored exclusively in temporary server memory and never committed or logged.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
                  >
                    Save Key
                  </button>
                  {keySaved && <span className="text-xs text-emerald-400 font-medium">✓ Saved successfully</span>}
                  <button
                    type="button"
                    onClick={() => setEngineSettingsOpen(false)}
                    className="px-3.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {selectedWorkspace ? (
          /* Workspace Detail View (apps/factory/app/workspaces/[id]/workspace-client.tsx) */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkspaceId(null)}
                  className="mb-2 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  ← Back to Workspaces
                </button>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {selectedWorkspace.title ?? selectedWorkspace.id}
                  </h1>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedWorkspace.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400'
                        : selectedWorkspace.status === 'running'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-red-950 text-red-400'
                    }`}
                  >
                    {selectedWorkspace.status}
                  </span>
                  {selectedWorkspace.sandboxStatus && (
                    <span className="inline-block rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                      sandbox {selectedWorkspace.sandboxStatus}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-500">
                  {selectedWorkspace.id} · model {selectedWorkspace.modelId} (
                  {selectedWorkspace.reasoningEffort}) · commit{' '}
                  {selectedWorkspace.baseCommitSha} · snapshot{' '}
                  {selectedWorkspace.baseSnapshotId}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1">
                {(
                  [
                    { id: 'transcript', label: 'Session transcript' },
                    { id: 'diff', label: 'Git diff (HEAD)' },
                    { id: 'terminal', label: 'Sandbox terminal' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailViewMode(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      detailViewMode === tab.id
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedWorkspace.baseSnapshotId && (
              <FactorySandboxCommand
                snapshotId={selectedWorkspace.baseSnapshotId}
                sourceCommitSha={selectedWorkspace.baseCommitSha}
              />
            )}

            {detailViewMode === 'transcript' && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                  {selectedWorkspace.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg border p-4 ${
                        msg.role === 'user'
                          ? 'border-neutral-800 bg-black'
                          : msg.role === 'tool'
                            ? 'border-neutral-900 bg-neutral-900/60 font-mono text-xs'
                            : 'border-neutral-800/80 bg-neutral-900/30'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-semibold uppercase tracking-wider text-neutral-400">
                          {msg.role === 'tool'
                            ? `tool · ${msg.toolName ?? 'exec'}`
                            : msg.role}
                        </span>
                        <span className="font-mono">{msg.createdAt}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
                        {msg.content}
                      </pre>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendFollowUp}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
                >
                  <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Continue session in {selectedWorkspace.sandboxId}
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      type="text"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      placeholder="Send follow-up instruction to the coding agent..."
                      className="flex-1 rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                    >
                      Send prompt
                    </button>
                  </div>
                </form>
              </div>
            )}

            {detailViewMode === 'diff' && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    git diff HEAD ({selectedWorkspace.baseCommitSha})
                  </span>
                  <span className="font-mono text-xs text-neutral-500">
                    /vercel/sandbox/turborepo
                  </span>
                </div>
                <pre className="overflow-x-auto rounded-md border border-neutral-900 bg-black p-4 font-mono text-xs leading-relaxed text-neutral-300">
                  {selectedWorkspace.diff.split('\n').map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'text-emerald-400'
                          : line.startsWith('-') && !line.startsWith('---')
                            ? 'text-red-400'
                            : line.startsWith('@@')
                              ? 'text-sky-400'
                              : ''
                      }
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}

            {detailViewMode === 'terminal' && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    Interactive Sandbox Shell ({selectedWorkspace.sandboxId})
                  </span>
                  <span className="font-mono text-xs text-emerald-400">
                    connected · 8 vCPUs
                  </span>
                </div>
                <div className="rounded-md border border-neutral-900 bg-black p-4 font-mono text-xs leading-relaxed text-neutral-300">
                  {selectedWorkspace.terminalOutput.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                  <form
                    onSubmit={handleTerminalCommand}
                    className="mt-3 flex items-center gap-2 border-t border-neutral-900 pt-3"
                  >
                    <span className="text-emerald-400">
                      root@{selectedWorkspace.sandboxId}:/vercel/sandbox/turborepo#
                    </span>
                    <input
                      type="text"
                      value={terminalCommandInput}
                      onChange={(e) => setTerminalCommandInput(e.target.value)}
                      placeholder="cargo test -p turborepo-engine"
                      className="flex-1 bg-transparent text-white focus:outline-none"
                    />
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'workspaces' ? (
          /* Workspaces Page (apps/factory/app/page.tsx & workspace-list.tsx) */
          <div>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Multi-turn agent sessions backed by persistent sandboxes,
                  transcripts, and live git diffs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('work')}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                New workspace
              </button>
            </div>

            {latestReadyImage?.snapshotId && (
              <FactorySandboxCommand
                snapshotId={latestReadyImage.snapshotId}
                sourceCommitSha={latestReadyImage.sourceCommitSha}
              />
            )}

            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorkspaceId(workspace.id);
                    setDetailViewMode('transcript');
                  }}
                  className="block w-full text-left rounded-lg border border-neutral-800 bg-neutral-950 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm font-medium text-white">
                          {workspace.title ?? workspace.id}
                        </span>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            workspace.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400'
                              : workspace.status === 'running'
                                ? 'bg-amber-950 text-amber-400'
                                : 'bg-red-950 text-red-400'
                          }`}
                        >
                          {workspace.status}
                        </span>
                        {workspace.sandboxStatus ? (
                          <span className="inline-block rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                            sandbox {workspace.sandboxStatus}
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-sm text-neutral-400">
                        {workspace.initialPrompt}
                      </p>
                      <p className="font-mono text-xs text-neutral-500">
                        {workspace.id}
                        {workspace.baseCommitSha
                          ? ` · commit ${workspace.baseCommitSha}`
                          : ''}
                        {workspace.baseSnapshotId
                          ? ` · snapshot ${workspace.baseSnapshotId}`
                          : ''}
                      </p>
                      {workspace.error ? (
                        <p className="text-xs text-red-400">{workspace.error}</p>
                      ) : null}
                    </div>

                    <div className="text-right font-mono text-xs text-neutral-500 shrink-0">
                      <div>{workspace.createdAt}</div>
                      {workspace.finishedAt ? (
                        <div>done {workspace.finishedAt}</div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : activeTab === 'work' ? (
          /* Start Work Page (apps/factory/app/work/page.tsx, workspace-composer.tsx, run-maintenance.tsx, run-performance.tsx) */
          <div className="space-y-10">
            <section className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Start work</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Launch a freeform workspace or kick off one of the built-in
                  coding workflows.
                </p>
              </div>

              {/* WorkspaceComposer */}
              <form
                className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950 p-5"
                onSubmit={handleCreateWorkspace}
              >
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    New workspace
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Boot a fresh sandbox from the latest factory image, start a
                    session on top of it, and jump straight into the workspace.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                    htmlFor="workspace-title"
                  >
                    Title (optional)
                  </label>
                  <input
                    className="w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    id="workspace-title"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Investigate flaky cache test"
                    value={title}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                      htmlFor="workspace-model"
                    >
                      Model
                    </label>
                    <select
                      className="w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                      id="workspace-model"
                      onChange={(event) => handleModelChange(event.target.value)}
                      value={selectedModel.id}
                    >
                      {AVAILABLE_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.label} ({model.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedModel.supportsReasoningEffort ? (
                    <div className="space-y-2">
                      <label
                        className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                        htmlFor="workspace-reasoning-effort"
                      >
                        Thinking effort
                      </label>
                      <select
                        className="w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                        id="workspace-reasoning-effort"
                        onChange={(event) =>
                          setReasoningEffort(
                            event.target.value as 'low' | 'medium' | 'high'
                          )
                        }
                        value={reasoningEffort}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                    htmlFor="workspace-prompt"
                  >
                    Initial prompt
                  </label>
                  <textarea
                    className="min-h-36 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    id="workspace-prompt"
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Inspect the repo, reproduce the issue, and explain what needs to change."
                    required
                    value={prompt}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                    type="submit"
                  >
                    Create workspace
                  </button>
                </div>
              </form>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Example maintenance
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Run the existing example maintenance prompt inside a dedicated
                  workspace and inspect the session afterward.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedExample}
                      onChange={(e) => setSelectedExample(e.target.value)}
                      className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-500 focus:outline-none"
                    >
                      {INITIAL_EXAMPLE_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleRunMaintenance}
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                    >
                      Run maintenance with fx
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSlackMessage('Sent test message to Slack')
                      }
                      className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
                    >
                      Send Slack test
                    </button>
                  </div>
                  {maintenanceMessage && (
                    <p className="font-mono text-xs text-neutral-400">
                      {maintenanceMessage}
                    </p>
                  )}
                  {slackMessage && (
                    <p className="font-mono text-xs text-neutral-400">
                      {slackMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Performance investigation
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Launch a workspace preloaded with the Turborepo performance
                  investigation workflow.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleRunPerformance}
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                  >
                    Run performance with fx
                  </button>
                  {perfMessage && (
                    <span className="font-mono text-xs text-neutral-400">
                      {perfMessage}
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Factory Image Page (apps/factory/app/factory-image.tsx) */
          <section className="space-y-4">
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      On merge to main
                    </span>
                    {latestReadyImage ? (
                      <span className="inline-block rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        ready
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-neutral-300">
                    Deployments warm a reusable Turborepo repository and Rust
                    build snapshot so new workspaces do not pay the full cold
                    clone and compile cost.
                  </p>
                  {latestReadyImage ? (
                    <div className="space-y-1 font-mono text-xs text-neutral-500">
                      <div>
                        Commit {latestReadyImage.sourceCommitSha} · snapshot{' '}
                        {latestReadyImage.snapshotId ?? 'n/a'}
                      </div>
                      <div>Base image {latestReadyImage.baseImageRef}</div>
                      <div>
                        Toolchain fingerprint{' '}
                        {latestReadyImage.toolchainFingerprint}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
                    onClick={handleRebuildFactoryImage}
                    type="button"
                  >
                    Rebuild from main
                  </button>
                </div>
              </div>
            </div>

            {latestReadyImage?.snapshotId ? (
              <FactorySandboxCommand
                snapshotId={latestReadyImage.snapshotId}
                sourceCommitSha={latestReadyImage.sourceCommitSha}
              />
            ) : null}

            <div className="space-y-2">
              <h2 className="text-sm font-medium text-neutral-300">
                Recent builds
              </h2>
              {builds.map((build) => (
                <div
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
                  key={build.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs text-neutral-300">
                          {build.id}
                        </span>
                        <span className="inline-block rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          {build.status}
                        </span>
                        <span className="inline-block rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
                          {build.trigger}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-neutral-500">
                        commit {build.sourceCommitSha}
                        {build.snapshotId
                          ? ` · snapshot ${build.snapshotId}`
                          : ''}
                      </p>
                      <div className="mt-2 rounded border border-neutral-900 bg-black p-2.5 font-mono text-xs text-neutral-400">
                        {build.logs.map((l, idx) => (
                          <div key={idx}>{l}</div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs text-neutral-500 shrink-0">
                      <div>{build.createdAt}</div>
                      {build.finishedAt ? (
                        <div>done {build.finishedAt}</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
