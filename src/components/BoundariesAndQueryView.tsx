import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  Plus,
  Trash2,
  Database,
  Code2,
} from 'lucide-react';
import { MonorepoPreset, WorkspacePackage } from '../data/turborepoData';
import {
  TaskGraphResult,
  checkPackageBoundaries,
  executeTurboQuery,
} from '../engine/turboEngine';

interface BoundariesAndQueryViewProps {
  preset: MonorepoPreset;
  graph: TaskGraphResult;
  injectedDependencies: Array<{ fromPkg: string; toPkg: string }>;
  onAddDependency: (fromPkg: string, toPkg: string) => void;
  onRemoveDependency: (fromPkg: string, toPkg: string) => void;
}

const GRAPHQL_PRESET_QUERIES = [
  {
    id: 'packages-overview',
    label: 'Workspace Packages & Reverse Dependents',
    graphql: `query WorkspacePackages {
  packages {
    items {
      name
      path
      tags
      directDependencies
      directDependents
    }
  }
}`,
  },
  {
    id: 'task-hashes',
    label: 'Task Graph SHA-256 Hashes & Waves',
    graphql: `query TaskGraphHashes {
  taskGraph {
    globalHash
    criticalPathMs
    nodes {
      id
      wave
      hash
      matchedFramework
      upstreamDependencies
    }
  }
}`,
  },
  {
    id: 'affected-reverse-deps',
    label: 'Blast Radius of Foundational Packages',
    graphql: `query FoundationalBlastRadius {
  foundationalPackages {
    name
    path
    transitiveDependentsCount
    transitiveDependents
  }
}`,
  },
  {
    id: 'framework-inference-audit',
    label: 'Framework Env Wildcard Audit',
    graphql: `query FrameworkInferenceAudit {
  frameworkInference {
    packageName
    detectedFramework
    envWildcards
    matchedEnvKeys
  }
}`,
  },
];

export const BoundariesAndQueryView: React.FC<BoundariesAndQueryViewProps> = ({
  preset,
  graph,
  injectedDependencies,
  onAddDependency,
  onRemoveDependency,
}) => {
  const [fromPkg, setFromPkg] = useState<string>(preset.packages[1]?.name || preset.packages[0].name);
  const [toPkg, setToPkg] = useState<string>(
    preset.packages[preset.packages.length - 1]?.name || preset.packages[0].name
  );
  const [selectedQueryId, setSelectedQueryId] = useState<string>('packages-overview');

  // Compute effective packages with injected dependencies
  const effectivePackages: WorkspacePackage[] = useMemo(() => {
    return preset.packages.map((pkg) => {
      const extra = injectedDependencies
        .filter((d) => d.fromPkg === pkg.name)
        .map((d) => d.toPkg);
      return {
        ...pkg,
        dependencies: Array.from(new Set([...pkg.dependencies, ...extra])),
      };
    });
  }, [preset.packages, injectedDependencies]);

  const violations = useMemo(
    () => checkPackageBoundaries(effectivePackages, preset.boundaryRules),
    [effectivePackages, preset.boundaryRules]
  );

  const selectedQueryObj = useMemo(
    () =>
      GRAPHQL_PRESET_QUERIES.find((q) => q.id === selectedQueryId) ||
      GRAPHQL_PRESET_QUERIES[0],
    [selectedQueryId]
  );

  const queryResult = useMemo(
    () => executeTurboQuery(preset, graph, selectedQueryId),
    [preset, graph, selectedQueryId]
  );

  const handleInjectDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromPkg && toPkg && fromPkg !== toPkg) {
      onAddDependency(fromPkg, toPkg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Package Boundaries Auditor (crates/turborepo-boundaries) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Boundary Tag Rules & Dependency Simulator */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Package Boundaries Rules (crates/turborepo-boundaries)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enforces architectural tag constraints across workspace packages via <code className="font-mono">turbo boundaries</code>.
              </p>
            </div>

            <div className="space-y-3">
              {preset.boundaryRules.map((rule) => (
                <div
                  key={rule.tag}
                  className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      tag: "{rule.tag}"
                    </span>
                    <span className="text-slate-500">
                      allow: [{rule.allowDependenciesWithTags.join(', ') || '*'}]
                    </span>
                  </div>
                  {rule.denyDependenciesWithTags.length > 0 && (
                    <div className="font-mono text-rose-600 dark:text-rose-400">
                      deny: [{rule.denyDependenciesWithTags.join(', ')}]
                    </div>
                  )}
                  <p className="text-slate-600 dark:text-slate-400">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Cross-Boundary Import Simulator */}
          <form
            onSubmit={handleInjectDependency}
            className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Test Cross-Package Dependency Injection
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Source Workspace (Importer)
                </label>
                <select
                  value={fromPkg}
                  onChange={(e) => setFromPkg(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white"
                >
                  {preset.packages.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.tags.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Target Dependency (Imported)
                </label>
                <select
                  value={toPkg}
                  onChange={(e) => setToPkg(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white"
                >
                  {preset.packages.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.tags.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Try linking a foundational package to an app to trigger a boundary violation.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dependency Edge</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 6 Cols: Live Audit Output of `turbo boundaries` */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Live Boundary Audit Output ($ turbo boundaries)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Scans all {effectivePackages.length} workspace packages against tag allowlists and denylists.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {violations.length} {violations.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>

            {violations.length === 0 ? (
              <div className="p-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                    turbo boundaries: All {effectivePackages.length} packages passed validation
                  </div>
                  <p className="text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
                    Zero illegal cross-package imports or tag boundary violations detected across the monorepo graph.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.map((v, idx) => (
                  <div
                    key={`${v.packageName}-${v.importedDependency}-${idx}`}
                    className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-semibold text-rose-700 dark:text-rose-300">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>
                          {v.packageName} ({v.packageTag}) → {v.importedDependency} (
                          {v.importedDependencyTag})
                        </span>
                      </div>
                      <span className="font-mono uppercase text-[11px] text-rose-600 dark:text-rose-400">
                        {v.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {v.ruleDescription}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {injectedDependencies.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Simulated Dependency Edges Added in Session:
                </div>
                <div className="space-y-1.5">
                  {injectedDependencies.map((dep) => (
                    <div
                      key={`${dep.fromPkg}->${dep.toPkg}`}
                      className="flex items-center justify-between px-3 py-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    >
                      <span>
                        {dep.fromPkg} → {dep.toPkg}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(dep.fromPkg, dep.toPkg)}
                        className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
            crates/turborepo-boundaries/src/lib.rs · AST + PackageGraph validator
          </div>
        </div>
      </div>

      {/* Bottom Section: `turbo query` GraphQL Playground (crates/turborepo-query) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Monorepo GraphQL Engine ($ turbo query · crates/turborepo-query)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute GraphQL introspection queries against the active PackageGraph and TaskGraph.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {GRAPHQL_PRESET_QUERIES.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedQueryId(q.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedQueryId === q.id
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 5 Cols: GraphQL Query Document */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
            <div className="text-xs font-mono text-slate-500 mb-2">
              $ turbo query '{selectedQueryObj.graphql.replace(/\s+/g, ' ')}'
            </div>
            <pre className="p-3.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed">
              {selectedQueryObj.graphql}
            </pre>
          </div>

          {/* Right 7 Cols: Live GraphQL JSON Response */}
          <div className="lg:col-span-7 p-4 bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>JSON Response (Async-GraphQL Schema)</span>
              <span>HTTP 200 OK</span>
            </div>
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-[320px] leading-relaxed">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
