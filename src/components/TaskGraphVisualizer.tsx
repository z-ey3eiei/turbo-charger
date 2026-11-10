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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Simulated CLI Command Preview */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto max-w-full">
              <Terminal className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-slate-400 select-none">$</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                turbo run {selectedTask}
              </span>
              {filterExpr !== '*' && (
                <span className="text-sky-600 dark:text-sky-400 whitespace-nowrap">
                  --filter={filterExpr}
                </span>
              )}
              {remoteCacheEnabled && (
                <span className="text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  --remote-only=false
                </span>
              )}
              <span className="text-slate-500 whitespace-nowrap">--ui=tui</span>
            </div>
          </div>

          {/* Primary Execution Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onExecuteRun(false)}
              disabled={isRunning || graph.nodes.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executing DAG...' : `Run ${selectedTask}`}</span>
            </button>

            <button
              type="button"
              onClick={() => onExecuteRun(true)}
              disabled={isRunning || graph.nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Execute with --force to bypass existing cache artifacts"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Force (--force)</span>
            </button>

            <button
              type="button"
              onClick={onClearCache}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Purge Cache ({cachedHashes.size})</span>
            </button>
          </div>
        </div>

        {/* Task Selector, Filter Bar, and Remote Cache Switch */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Task Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Target Task:
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
                {availableTasks.map((task) => (
                  <button
                    key={task}
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedTask === task
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {task}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Scope Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Scope (--filter):
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800">
                {FILTER_PRESETS.map((fp) => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => onChangeFilter(fp.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      filterExpr === fp.value
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Vercel Remote Cache: {remoteCacheEnabled ? 'Connected' : 'Local Only'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tasks in Execution Graph
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-white">
              {graph.nodes.length}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {graph.waves.length} topological {graph.waves.length === 1 ? 'wave' : 'waves'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Global Hash · <span className="font-mono">{graph.globalHash.slice(0, 10)}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Cache Readiness (Warm Artifacts)
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">
              {cachedCount} / {graph.nodes.length}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {graph.nodes.length > 0 ? Math.round((cachedCount / graph.nodes.length) * 100) : 0}% warm
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {remoteCacheEnabled ? 'Local .turbo/cache + HTTP Remote' : 'Local .turbo/cache filesystem'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Critical Path vs Sequential Time
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-white">
              {(graph.criticalPathDurationMs / 1000).toFixed(2)}s
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              seq {(graph.totalSequentialDurationMs / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Parallel speedup ·{' '}
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {graph.criticalPathDurationMs > 0
                ? `${(graph.totalSequentialDurationMs / graph.criticalPathDurationMs).toFixed(1)}x`
                : '1.0x'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Last Run Telemetry
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display tabular-nums text-slate-900 dark:text-white">
              {lastRunElapsedMs !== null ? `${lastRunElapsedMs}ms` : 'Not run'}
            </span>
            {fullTurboAchieved && (
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 tracking-wide">
                &gt;&gt;&gt; FULL TURBO
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {mutatedPackageNames.length > 0
              ? `${mutatedPackageNames.length} mutated workspace(s)`
              : 'Working tree clean (HEAD)'}
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Topological DAG Canvas & Package Hash Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Topological Task DAG + Source Mutation Bar */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between overflow-hidden">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Topological Task Graph (crates/turborepo-task-graph)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any task node to inspect its SHA-256 hash inputs, inferred framework env wildcards, and upstream dependencies.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Wave 0 = Foundational Packages</span>
                <span aria-hidden="true">·</span>
                <span>Critical Path Highlighted</span>
              </div>
            </div>

            {/* Interactive SVG DAG Viewport */}
            <div className="overflow-x-auto bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
              {graph.nodes.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No tasks match filter "{filterExpr}" for task "{selectedTask}".
                  </p>
                  <button
                    type="button"
                    onClick={() => onChangeFilter('*')}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-500 transition-colors cursor-pointer"
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
                      <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
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
                      <path d="M 0 1 L 10 5 L 0 9 z" className="fill-rose-500" />
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
                          className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono uppercase"
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
                              ? 'stroke-rose-500/80'
                              : isSelectedEdge
                              ? 'stroke-sky-500'
                              : 'stroke-slate-300 dark:stroke-slate-700'
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
                              ? 'fill-white dark:fill-slate-800 stroke-rose-500 stroke-2'
                              : 'fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 group-hover:stroke-slate-400 dark:group-hover:stroke-slate-600'
                          }`}
                        />

                        {/* Node Title */}
                        <text
                          x={12}
                          y={21}
                          className="fill-slate-900 dark:fill-slate-100 text-[12px] font-mono font-semibold"
                        >
                          {node.id.length > 22 ? `${node.id.slice(0, 20)}..` : node.id}
                        </text>

                        {/* Hash & Timing Line */}
                        <text
                          x={12}
                          y={39}
                          className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
                        >
                          #{node.hash.slice(0, 8)} · {node.estimatedDurationMs}ms
                        </text>

                        {/* Status Text (Unboxed Clean Metadata) */}
                        <text
                          x={12}
                          y={54}
                          className={`text-[10px] font-mono font-medium ${
                            runStatus === 'cache-hit' || isCached
                              ? 'fill-emerald-600 dark:fill-emerald-400'
                              : isMutated
                              ? 'fill-amber-600 dark:fill-amber-400'
                              : 'fill-slate-400 dark:fill-slate-500'
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
          <div className="p-4 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <FileEdit className="w-4 h-4 text-amber-500 shrink-0" />
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
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
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
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  git checkout .
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Selected Task Hash Inspector (crates/turborepo-task-hash) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          {activeNode ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Selected Task Node · Wave {activeNode.wave}
                </div>
                <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {activeNode.id}
                </h3>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {activeNode.packagePath} · {activeNode.packageType}
                </div>
              </div>

              {/* Computed SHA-256 Task Hash */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Computed Task Hash (SHA-256 prefix)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {cachedHashes.has(activeNode.hash) ? 'ARTIFACT CACHED' : 'CACHE MISS'}
                  </span>
                </div>
                <div className="mt-1.5 px-3 py-2 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{activeNode.hash}</span>
                  <span className="text-slate-400 text-[11px]">.tar.zst</span>
                </div>
              </div>

              {/* Hash Contributors Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Deterministic Hash Inputs (turborepo-task-hash)
                </div>

                <div className="py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">1. Working Tree Files</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {activeNode.hashInputs.fileHashSummary}
                    {(fileMutations[activeNode.packageName] || 0) > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 ml-1">
                        (mutated ×{fileMutations[activeNode.packageName]})
                      </span>
                    )}
                  </span>
                </div>

                <div className="py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      2. Upstream ^build Hashes
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {activeNode.hashInputs.upstreamTaskHashes.length} deps
                    </span>
                  </div>
                  {activeNode.hashInputs.upstreamTaskHashes.length > 0 && (
                    <div className="mt-1.5 space-y-1 pl-2">
                      {activeNode.hashInputs.upstreamTaskHashes.map((u) => (
                        <div
                          key={u.taskId}
                          className="flex items-center justify-between font-mono text-[11px] text-slate-600 dark:text-slate-400"
                        >
                          <span>{u.taskId}</span>
                          <span>{u.hash.slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      3. Framework Inference
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {activeNode.hashInputs.matchedFramework || 'None'}
                    </span>
                  </div>
                  {activeNode.hashInputs.inferredEnvVars.length > 0 && (
                    <div className="mt-1.5 space-y-1 pl-2">
                      {activeNode.hashInputs.inferredEnvVars.map((env) => (
                        <div
                          key={env.key}
                          className="flex items-center justify-between font-mono text-[11px] text-sky-600 dark:text-sky-400"
                        >
                          <span>{env.key}</span>
                          <span className="truncate max-w-[140px]">{env.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">
                    4. Command & Artifact Outputs
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800">
                    $ {activeNode.scriptCommand}
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Outputs: {activeNode.outputs.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Select a task node to inspect its hash.</div>
          )}

          {activeNode && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Test invalidating this package:
              </span>
              <button
                type="button"
                onClick={() => onMutatePackage(activeNode.packageName)}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Edit {activeNode.packageName} File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Ghostty TUI Terminal Multiplexer (crates/turborepo-ui & libghostty-vt-sys) */}
      <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Turborepo 2.11.10 Interactive TUI</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">crates/turborepo-ui (libghostty-vt-sys)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>↑↓ Select Task</span>
            <span>·</span>
            <span>Enter: Interact stdin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[220px]">
          {/* Left TUI Task List Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 p-2 space-y-0.5 max-h-[260px] overflow-y-auto font-mono text-xs">
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
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{node.id}</span>
                  <span
                    className={`text-[10px] shrink-0 ml-2 ${
                      status === 'cache-hit' || isCached
                        ? 'text-emerald-400'
                        : status === 'executed'
                        ? 'text-sky-400'
                        : 'text-slate-500'
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
          <div className="md:col-span-8 p-4 font-mono text-xs space-y-1.5 overflow-x-auto">
            {activeTuiNode ? (
              <>
                <div className="text-slate-400">
                  {activeTuiNode.id}: cache{' '}
                  {cachedHashes.has(activeTuiNode.hash)
                    ? `hit, replaying logs ${activeTuiNode.hash}`
                    : `miss, executing ${activeTuiNode.hash}`}
                </div>
                <div className="text-slate-300">
                  {activeTuiNode.id}: &gt; {activeTuiNode.scriptCommand}
                </div>
                {activeTuiNode.hashInputs.matchedFramework && (
                  <div className="text-sky-400">
                    {activeTuiNode.id}: [turborepo-frameworks] Inferred{' '}
                    {activeTuiNode.hashInputs.matchedFramework} environment wildcards (
                    {activeTuiNode.hashInputs.inferredEnvVars.map((e) => e.key).join(', ') || 'none'})
                  </div>
                )}
                <div className="text-slate-400">
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
                  <div className="pt-2 text-rose-400 font-bold">
                    Tasks: {graph.nodes.length} successful, {graph.nodes.length} total
                    <br />
                    Cached: {graph.nodes.length} cached, {graph.nodes.length} total
                    <br />
                    Time: {lastRunElapsedMs ?? 14}ms &gt;&gt;&gt; FULL TURBO
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500">No task selected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
