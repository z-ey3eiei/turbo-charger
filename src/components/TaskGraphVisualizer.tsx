import React, { useMemo, useState } from 'react';
import {
  Play,
  RotateCcw,
  FileEdit,
  Zap,
  CheckCircle2,
  Clock,
  Terminal,
  GitBranch,
  Layers,
  SlidersHorizontal,
  ArrowRight,
  Database,
} from 'lucide-react';
import { MonorepoPreset } from '../data/turborepoData';
import { TaskGraphResult, TaskNode } from '../engine/turboEngine';

interface TaskGraphVisualizerProps {
  preset: MonorepoPreset;
  graph: TaskGraphResult;
  selectedTask: string;
  onSelectTask: (task: string) => void;
  filterExpr: string;
  onChangeFilter: (filter: string) => void;
  fileMutations: Record<string, number>;
  onMutatePackage: (pkgName: string) => void;
  onResetMutations: () => void;
  cachedHashes: Set<string>;
  lastRunStatuses: Record<string, 'cache-hit' | 'executed' | 'idle'>;
  isRunning: boolean;
  remoteCacheEnabled: boolean;
  onToggleRemoteCache: () => void;
  onExecuteRun: (forceNoCache?: boolean) => void;
  onClearCache: () => void;
  lastRunElapsedMs: number | null;
  fullTurboAchieved: boolean;
}

const FILTER_PRESETS = [
  { label: 'All Workspaces', value: '*' },
  { label: 'Apps Only (apps/*)', value: 'apps/*' },
  { label: 'Packages Only (packages/*)', value: 'packages/*' },
  { label: 'Affected ([HEAD^1])', value: '[HEAD^1]' },
];

export const TaskGraphVisualizer: React.FC<TaskGraphVisualizerProps> = ({
  preset,
  graph,
  selectedTask,
  onSelectTask,
  filterExpr,
  onChangeFilter,
  fileMutations,
  onMutatePackage,
  onResetMutations,
  cachedHashes,
  lastRunStatuses,
  isRunning,
  remoteCacheEnabled,
  onToggleRemoteCache,
  onExecuteRun,
  onClearCache,
  lastRunElapsedMs,
  fullTurboAchieved,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTuiPane, setActiveTuiPane] = useState<string | null>(null);

  const availableTasks = useMemo(() => {
    return Object.keys(preset.turboJson.tasks).filter((t) => !t.includes('#'));
  }, [preset]);

  const activeNode: TaskNode | null = useMemo(() => {
    if (selectedNodeId) {
      const found = graph.nodes.find((n) => n.id === selectedNodeId);
      if (found) return found;
    }
    return graph.nodes[0] || null;
  }, [graph.nodes, selectedNodeId]);

  const activeTuiNode: TaskNode | null = useMemo(() => {
    if (activeTuiPane) {
      const found = graph.nodes.find((n) => n.id === activeTuiPane);
      if (found) return found;
    }
    return activeNode;
  }, [graph.nodes, activeTuiPane, activeNode]);

  // Compute SVG layout coordinates per wave
  const svgLayout = useMemo(() => {
    const colWidth = 248;
    const rowHeight = 86;
    const padX = 32;
    const padY = 36;

    const maxNodesInWave = Math.max(1, ...graph.waves.map((w) => w.length));
    const totalHeight = Math.max(320, maxNodesInWave * rowHeight + padY * 2);
    const totalWidth = Math.max(760, graph.waves.length * colWidth + padX * 2);

    const positions = new Map<string, { x: number; y: number }>();

    graph.waves.forEach((waveNodes, waveIdx) => {
      const x = padX + waveIdx * colWidth;
      const columnContentHeight = waveNodes.length * rowHeight;
      const startY = Math.max(padY, (totalHeight - columnContentHeight) / 2);

      waveNodes.forEach((node, idx) => {
        positions.set(node.id, {
          x,
          y: startY + idx * rowHeight,
        });
      });
    });

    return { positions, totalWidth, totalHeight, nodeWidth: 196, nodeHeight: 62 };
  }, [graph.waves]);

  const cachedCount = useMemo(() => {
    return graph.nodes.filter((n) => cachedHashes.has(n.hash)).length;
  }, [graph.nodes, cachedHashes]);

  const mutatedPackageNames = Object.keys(fileMutations).filter((k) => fileMutations[k] > 0);

  return (
    <div className="space-y-6">
      {/* Command Bar & Execution Controls */}
      <div className="bg-background-100 border border-gray-300 rounded-lg p-4 shadow-(--ds-shadow-border-small)">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Simulated CLI Command Preview */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-background-200 border border-gray-300 font-mono text-xs text-gray-1000 overflow-x-auto max-w-full">
              <Terminal className="w-3.5 h-3.5 text-[#FF1E56] shrink-0" />
              <span className="text-gray-600 select-none">$</span>
              <span className="font-semibold text-[#FF1E56] whitespace-nowrap">
                turbo run {selectedTask}
              </span>
              {filterExpr !== '*' && (
                <span className="text-[#0096FF] whitespace-nowrap">
                  --filter={filterExpr}
                </span>
              )}
              {remoteCacheEnabled && (
                <span className="text-emerald-400 whitespace-nowrap">
                  --remote-only=false
                </span>
              )}
              <span className="text-gray-700 whitespace-nowrap">--ui=tui</span>
            </div>
          </div>

          {/* Primary Execution Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onExecuteRun(false)}
              disabled={isRunning || graph.nodes.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-background-100 bg-gray-1000 hover:bg-gray-900 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executing DAG...' : `Run ${selectedTask}`}</span>
            </button>

            <button
              type="button"
              onClick={() => onExecuteRun(true)}
              disabled={isRunning || graph.nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-1000 bg-background-200 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Execute with --force to bypass existing cache artifacts"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Force (--force)</span>
            </button>

            <button
              type="button"
              onClick={onClearCache}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-900 hover:text-gray-1000 border border-gray-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Purge Cache ({cachedHashes.size})</span>
            </button>
          </div>
        </div>

        {/* Task Selector, Filter Bar, and Remote Cache Switch */}
        <div className="mt-4 pt-4 border-t border-gray-300 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Task Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                Target Task:
              </span>
              <div className="flex items-center gap-1 p-1 bg-background-200 rounded-md border border-gray-300">
                {availableTasks.map((task) => (
                  <button
                    key={task}
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedTask === task
                        ? 'bg-gray-1000 text-background-100 shadow-xs'
                        : 'text-gray-900 hover:text-gray-1000'
                    }`}
                  >
                    {task}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Scope Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                Scope (--filter):
              </span>
              <div className="flex items-center gap-1 p-1 bg-background-200 rounded-md border border-gray-300">
                {FILTER_PRESETS.map((fp) => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => onChangeFilter(fp.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      filterExpr === fp.value
                        ? 'bg-gray-1000 text-background-100 shadow-xs'
                        : 'text-gray-900 hover:text-gray-1000'
                    }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Remote Cache Toggle */}
          <button
            type="button"
            onClick={onToggleRemoteCache}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              remoteCacheEnabled
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-300 text-gray-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Vercel Remote Cache: {remoteCacheEnabled ? 'Connected' : 'Local Only'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-100 border border-gray-300 rounded-lg p-4 shadow-(--ds-shadow-border-small)">
          <div className="text-xs text-gray-900">
            Tasks in Execution Graph
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-gray-1000">
              {graph.nodes.length}
            </span>
            <span className="text-xs font-mono text-gray-800 tabular-nums">
              {graph.waves.length} topological {graph.waves.length === 1 ? 'wave' : 'waves'}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-900">
            Global Hash · <span className="font-mono text-gray-1000">{graph.globalHash.slice(0, 10)}</span>
          </div>
        </div>

        <div className="bg-background-100 border border-gray-300 rounded-lg p-4 shadow-(--ds-shadow-border-small)">
          <div className="text-xs text-gray-900">
            Cache Readiness (Warm Artifacts)
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-emerald-400">
              {cachedCount} / {graph.nodes.length}
            </span>
            <span className="text-xs font-mono text-gray-800 tabular-nums">
              {graph.nodes.length > 0 ? Math.round((cachedCount / graph.nodes.length) * 100) : 0}% warm
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-900">
            {remoteCacheEnabled ? 'Local .turbo/cache + HTTP Remote' : 'Local .turbo/cache filesystem'}
          </div>
        </div>

        <div className="bg-background-100 border border-gray-300 rounded-lg p-4 shadow-(--ds-shadow-border-small)">
          <div className="text-xs text-gray-900">
            Critical Path vs Sequential Time
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-gray-1000">
              {(graph.criticalPathDurationMs / 1000).toFixed(2)}s
            </span>
            <span className="text-xs font-mono text-gray-800 tabular-nums">
              seq {(graph.totalSequentialDurationMs / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-900">
            Parallel speedup ·{' '}
            <span className="font-mono text-gray-1000">
              {graph.criticalPathDurationMs > 0
                ? `${(graph.totalSequentialDurationMs / graph.criticalPathDurationMs).toFixed(1)}x`
                : '1.0x'}
            </span>
          </div>
        </div>

        <div className="bg-background-100 border border-gray-300 rounded-lg p-4 shadow-(--ds-shadow-border-small)">
          <div className="text-xs text-gray-900">
            Last Run Telemetry
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-gray-1000">
              {lastRunElapsedMs !== null ? `${lastRunElapsedMs}ms` : 'Not run'}
            </span>
            {fullTurboAchieved && (
              <span className="text-xs font-mono font-bold text-[#FF1E56] tracking-wide">
                &gt;&gt;&gt; FULL TURBO
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-900">
            {mutatedPackageNames.length > 0
              ? `${mutatedPackageNames.length} mutated workspace(s)`
              : 'Working tree clean (HEAD)'}
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Topological DAG Canvas & Package Hash Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Topological Task DAG + Source Mutation Bar */}
        <div className="lg:col-span-8 bg-background-100 border border-gray-300 rounded-lg flex flex-col justify-between overflow-hidden shadow-(--ds-shadow-border-small)">
          <div>
            <div className="px-5 py-3.5 border-b border-gray-300 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-1000">
                  Topological Task Graph (crates/turborepo-task-graph)
                </h2>
                <p className="text-xs text-gray-900 mt-0.5">
                  Click any task node to inspect its SHA-256 hash inputs, inferred framework env wildcards, and upstream dependencies.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-800">
                <span>Wave 0 = Foundational Packages</span>
                <span aria-hidden="true">·</span>
                <span>Critical Path Highlighted</span>
              </div>
            </div>

            {/* Interactive SVG DAG Viewport */}
            <div className="overflow-x-auto bg-background-200 border-b border-gray-300">
              {graph.nodes.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    No tasks match filter "{filterExpr}" for task "{selectedTask}".
                  </p>
                  <button
                    type="button"
                    onClick={() => onChangeFilter('*')}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-background-100 bg-gray-1000 rounded-md hover:bg-gray-900 transition-colors cursor-pointer"
                  >
                    Reset Filter to All Workspaces
                  </button>
                </div>
              ) : (
                <svg
                  width={svgLayout.totalWidth}
                  height={svgLayout.totalHeight}
                  className="block select-none"
                >
                  <defs>
                    <marker
                      id="dag-arrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" className="fill-gray-600" />
                    </marker>
                    <marker
                      id="dag-arrow-critical"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" className="fill-[#FF1E56]" />
                    </marker>
                  </defs>

                  {/* Wave Column Headers */}
                  {graph.waves.map((waveNodes, wIdx) => {
                    const x = 32 + wIdx * 248;
                    return (
                      <g key={`wave-header-${wIdx}`}>
                        <text
                          x={x + 4}
                          y={20}
                          className="fill-gray-700 text-[11px] font-mono uppercase"
                        >
                          Wave {wIdx} ({waveNodes.length} {waveNodes.length === 1 ? 'task' : 'tasks'})
                        </text>
                      </g>
                    );
                  })}

                  {/* Directed Dependency Edges */}
                  {graph.nodes.map((node) => {
                    const toPos = svgLayout.positions.get(node.id);
                    if (!toPos) return null;

                    return node.dependencies.map((depId) => {
                      const fromPos = svgLayout.positions.get(depId);
                      if (!fromPos) return null;

                      const startX = fromPos.x + svgLayout.nodeWidth;
                      const startY = fromPos.y + svgLayout.nodeHeight / 2;
                      const endX = toPos.x;
                      const endY = toPos.y + svgLayout.nodeHeight / 2;
                      const midX = (startX + endX) / 2;

                      const isCriticalEdge =
                        graph.criticalPathIds.includes(node.id) &&
                        graph.criticalPathIds.includes(depId);

                      const isSelectedEdge =
                        activeNode?.id === node.id || activeNode?.id === depId;

                      return (
                        <path
                          key={`${depId}->${node.id}`}
                          d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                          fill="none"
                          strokeWidth={isSelectedEdge || isCriticalEdge ? 2 : 1.25}
                          markerEnd={
                            isCriticalEdge ? 'url(#dag-arrow-critical)' : 'url(#dag-arrow)'
                          }
                          className={
                            isCriticalEdge
                              ? 'stroke-[#FF1E56]/80'
                              : isSelectedEdge
                              ? 'stroke-[#0096FF]'
                              : 'stroke-gray-300'
                          }
                        />
                      );
                    });
                  })}

                  {/* Task Nodes */}
                  {graph.nodes.map((node) => {
                    const pos = svgLayout.positions.get(node.id);
                    if (!pos) return null;

                    const isSelected = activeNode?.id === node.id;
                    const isCached = cachedHashes.has(node.hash);
                    const runStatus = lastRunStatuses[node.id] || 'idle';
                    const isMutated = (fileMutations[node.packageName] || 0) > 0;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setActiveTuiPane(node.id);
                        }}
                        className="cursor-pointer group"
                      >
                        <rect
                          width={svgLayout.nodeWidth}
                          height={svgLayout.nodeHeight}
                          rx={6}
                          className={`transition-colors ${
                            isSelected
                              ? 'fill-background-100 stroke-[#FF1E56] stroke-2'
                              : 'fill-background-100 stroke-gray-300 group-hover:stroke-gray-500'
                          }`}
                        />

                        {/* Node Title */}
                        <text
                          x={12}
                          y={21}
                          className="fill-gray-1000 text-[12px] font-mono font-semibold"
                        >
                          {node.id.length > 22 ? `${node.id.slice(0, 20)}..` : node.id}
                        </text>

                        {/* Hash & Timing Line */}
                        <text
                          x={12}
                          y={39}
                          className="fill-gray-800 text-[10px] font-mono"
                        >
                          #{node.hash.slice(0, 8)} · {node.estimatedDurationMs}ms
                        </text>

                        {/* Status Text */}
                        <text
                          x={12}
                          y={54}
                          className={`text-[10px] font-mono font-medium ${
                            runStatus === 'cache-hit' || isCached
                              ? 'fill-emerald-400'
                              : isMutated
                              ? 'fill-amber-400'
                              : 'fill-gray-700'
                          }`}
                        >
                          {runStatus === 'cache-hit'
                            ? 'CACHE HIT (0ms)'
                            : isCached
                            ? 'WARM IN CACHE'
                            : isMutated
                            ? 'SOURCE MUTATED'
                            : 'COLD (MISS)'}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          {/* Interactive Source File Mutation Simulator Bar */}
          <div className="p-4 bg-background-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-900">
              <FileEdit className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">Simulate File Edit (Invalidates Downstream Hashes):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {preset.packages.map((pkg) => {
                const mutCount = fileMutations[pkg.name] || 0;
                return (
                  <button
                    key={pkg.name}
                    type="button"
                    onClick={() => onMutatePackage(pkg.name)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      mutCount > 0
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-semibold'
                        : 'border-gray-300 text-gray-900 hover:border-gray-500 hover:text-gray-1000'
                    }`}
                  >
                    {pkg.name} {mutCount > 0 ? `(v${mutCount + 1})` : ''}
                  </button>
                );
              })}
              {mutatedPackageNames.length > 0 && (
                <button
                  type="button"
                  onClick={onResetMutations}
                  className="px-2.5 py-1 text-xs font-medium text-[#FF1E56] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  git checkout .
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Selected Task Hash Inspector */}
        <div className="lg:col-span-4 bg-background-100 border border-gray-300 rounded-lg p-5 flex flex-col justify-between shadow-(--ds-shadow-border-small)">
          {activeNode ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-300">
                <div className="text-xs text-gray-900">
                  Selected Task Node · Wave {activeNode.wave}
                </div>
                <h3 className="text-base font-bold font-mono text-gray-1000 mt-0.5">
                  {activeNode.id}
                </h3>
                <div className="mt-1 text-xs text-gray-800 font-mono">
                  {activeNode.packagePath} · {activeNode.packageType}
                </div>
              </div>

              {/* Computed SHA-256 Task Hash */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-900">
                  <span>Computed Task Hash (SHA-256 prefix)</span>
                  <span className="font-mono text-emerald-400">
                    {cachedHashes.has(activeNode.hash) ? 'ARTIFACT CACHED' : 'CACHE MISS'}
                  </span>
                </div>
                <div className="mt-1.5 px-3 py-2 rounded bg-background-200 border border-gray-300 font-mono text-xs text-gray-1000 flex items-center justify-between">
                  <span>{activeNode.hash}</span>
                  <span className="text-gray-700 text-[11px]">.tar.zst</span>
                </div>
              </div>

              {/* Hash Contributors Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="font-semibold text-gray-1000">
                  Deterministic Hash Inputs (turborepo-task-hash)
                </div>

                <div className="py-2 border-b border-gray-300 flex items-center justify-between gap-2">
                  <span className="text-gray-900">1. Working Tree Files</span>
                  <span className="font-mono text-gray-1000">
                    {activeNode.hashInputs.fileHashSummary}
                    {(fileMutations[activeNode.packageName] || 0) > 0 && (
                      <span className="text-amber-400 ml-1">
                        (mutated ×{fileMutations[activeNode.packageName]})
                      </span>
                    )}
                  </span>
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-900">
                      2. Upstream ^build Hashes
                    </span>
                    <span className="font-mono text-gray-1000">
                      {activeNode.hashInputs.upstreamTaskHashes.length} deps
                    </span>
                  </div>
                  {activeNode.hashInputs.upstreamTaskHashes.length > 0 && (
                    <div className="mt-1.5 space-y-1 pl-2">
                      {activeNode.hashInputs.upstreamTaskHashes.map((u) => (
                        <div
                          key={u.taskId}
                          className="flex items-center justify-between font-mono text-[11px] text-gray-900"
                        >
                          <span>{u.taskId}</span>
                          <span className="text-gray-700">{u.hash.slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="py-2 border-b border-gray-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-900">
                      3. Framework Inference
                    </span>
                    <span className="font-mono text-gray-1000">
                      {activeNode.hashInputs.matchedFramework || 'None'}
                    </span>
                  </div>
                  {activeNode.hashInputs.inferredEnvVars.length > 0 && (
                    <div className="mt-1.5 space-y-1 pl-2">
                      {activeNode.hashInputs.inferredEnvVars.map((env) => (
                        <div
                          key={env.key}
                          className="flex items-center justify-between font-mono text-[11px] text-[#0096FF]"
                        >
                          <span>{env.key}</span>
                          <span className="truncate max-w-[140px] text-gray-700">{env.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <div className="text-gray-900 mb-1">
                    4. Command &amp; Artifact Outputs
                  </div>
                  <div className="font-mono text-[11px] text-gray-1000 bg-background-200 p-2 rounded border border-gray-300">
                    $ {activeNode.scriptCommand}
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-gray-700">
                    Outputs: {activeNode.outputs.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-800">Select a task node to inspect its hash.</div>
          )}

          {activeNode && (
            <div className="pt-4 mt-4 border-t border-gray-300 flex items-center justify-between">
              <span className="text-xs text-gray-900">
                Test invalidating this package:
              </span>
              <button
                type="button"
                onClick={() => onMutatePackage(activeNode.packageName)}
                className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Edit {activeNode.packageName} File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Ghostty TUI Terminal Multiplexer */}
      <div className="bg-background-100 text-gray-1000 border border-gray-300 rounded-lg overflow-hidden shadow-(--ds-shadow-border-small)">
        <div className="px-4 py-2.5 bg-background-200 border-b border-gray-300 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-1000">Turborepo 2.11.10 Interactive TUI</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-800">crates/turborepo-ui (libghostty-vt-sys)</span>
          </div>
          <div className="flex items-center gap-3 text-gray-800">
            <span>↑↓ Select Task</span>
            <span>·</span>
            <span>Enter: Interact stdin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[220px]">
          {/* Left TUI Task List Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-300 p-2 space-y-0.5 max-h-[260px] overflow-y-auto font-mono text-xs bg-background-200">
            {graph.nodes.map((node) => {
              const isSelected = activeTuiNode?.id === node.id;
              const isCached = cachedHashes.has(node.hash);
              const status = lastRunStatuses[node.id] || 'idle';

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setActiveTuiPane(node.id);
                    setSelectedNodeId(node.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-gray-100 text-gray-1000 font-medium'
                      : 'text-gray-900 hover:bg-background-100 hover:text-gray-1000'
                  }`}
                >
                  <span className="truncate">{node.id}</span>
                  <span
                    className={`text-[10px] shrink-0 ml-2 ${
                      status === 'cache-hit' || isCached
                        ? 'text-emerald-400'
                        : status === 'executed'
                        ? 'text-[#0096FF]'
                        : 'text-gray-700'
                    }`}
                  >
                    {status === 'cache-hit'
                      ? 'CACHE HIT'
                      : status === 'executed'
                      ? `${node.estimatedDurationMs}ms`
                      : isCached
                      ? 'CACHED'
                      : 'READY'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right TUI Active Task Output Stream */}
          <div className="md:col-span-8 p-4 font-mono text-xs space-y-1.5 overflow-x-auto bg-background-200">
            {activeTuiNode ? (
              <>
                <div className="text-gray-800">
                  {activeTuiNode.id}: cache{' '}
                  {cachedHashes.has(activeTuiNode.hash)
                    ? `hit, replaying logs ${activeTuiNode.hash}`
                    : `miss, executing ${activeTuiNode.hash}`}
                </div>
                <div className="text-gray-1000">
                  {activeTuiNode.id}: &gt; {activeTuiNode.scriptCommand}
                </div>
                {activeTuiNode.hashInputs.matchedFramework && (
                  <div className="text-[#0096FF]">
                    {activeTuiNode.id}: [turborepo-frameworks] Inferred{' '}
                    {activeTuiNode.hashInputs.matchedFramework} environment wildcards (
                    {activeTuiNode.hashInputs.inferredEnvVars.map((e) => e.key).join(', ') || 'none'})
                  </div>
                )}
                <div className="text-gray-800">
                  {activeTuiNode.id}: Resolved {activeTuiNode.dependencies.length} upstream task
                  dependencies in topological Wave {activeTuiNode.wave}
                </div>
                <div className="text-emerald-400 pt-1">
                  {activeTuiNode.id}: Finished in{' '}
                  {lastRunStatuses[activeTuiNode.id] === 'cache-hit'
                    ? '2ms (restored from .turbo/cache/' + activeTuiNode.hash + '.tar.zst)'
                    : `${activeTuiNode.estimatedDurationMs}ms (wrote artifacts to ${activeTuiNode.outputs.join(', ')})`}
                </div>
                {fullTurboAchieved && (
                  <div className="pt-2 text-[#FF1E56] font-bold">
                    Tasks: {graph.nodes.length} successful, {graph.nodes.length} total
                    <br />
                    Cached: {graph.nodes.length} cached, {graph.nodes.length} total
                    <br />
                    Time: {lastRunElapsedMs ?? 14}ms &gt;&gt;&gt; FULL TURBO
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-800">No task selected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
