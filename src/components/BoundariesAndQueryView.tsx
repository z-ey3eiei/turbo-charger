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
    label: 'Reverse Dependencies of @repo/ui',
    graphql: `query ReverseDepsOfUI {
  package(name: "@repo/ui") {
    directDependents
    allDependents
    transitivelyAffectedTasks(taskName: "build")
  }
}`,
  },
  {
    id: 'boundary-rules-introspection',
    label: 'Boundary Tag Rules & Allow/Deny Lists',
    graphql: `query BoundaryTagRules {
  boundaries {
    rules {
      tag
      allowDependenciesWithTags
      denyDependenciesWithTags
      description
    }
    violationsCount
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

  const queryResult = useMemo(() => {
    return executeTurboQuery(
      preset,
      graph,
      selectedQueryId
    );
  }, [preset, graph, selectedQueryId]);

  const handleInjectDependency = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromPkg && toPkg && fromPkg !== toPkg) {
      onAddDependency(fromPkg, toPkg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Package Boundaries Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Boundary Tag Rules & Dependency Simulator */}
        <div className="lg:col-span-6 bg-background-100 border border-gray-300 rounded-lg p-5 flex flex-col justify-between space-y-5 shadow-(--ds-shadow-border-small)">
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-300">
              <h2 className="text-sm font-semibold text-gray-1000">
                Package Boundaries Rules (crates/turborepo-boundaries)
              </h2>
              <p className="text-xs text-gray-900 mt-0.5">
                Enforces architectural tag constraints across workspace packages via <code className="font-mono bg-gray-200 px-1 py-0.5 rounded text-gray-1000">turbo boundaries</code>.
              </p>
            </div>

            <div className="space-y-3">
              {preset.boundaryRules.map((rule) => (
                <div
                  key={rule.tag}
                  className="p-3.5 rounded-md bg-background-200 border border-gray-300 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-gray-1000">
                      tag: "{rule.tag}"
                    </span>
                    <span className="text-gray-900">
                      allow: [{rule.allowDependenciesWithTags.join(', ') || '*'}]
                    </span>
                  </div>
                  {rule.denyDependenciesWithTags.length > 0 && (
                    <div className="font-mono text-rose-500">
                      deny: [{rule.denyDependenciesWithTags.join(', ')}]
                    </div>
                  )}
                  <p className="text-gray-900">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Cross-Boundary Import Simulator */}
          <form
            onSubmit={handleInjectDependency}
            className="pt-4 border-t border-gray-300 space-y-3"
          >
            <div className="text-xs font-semibold text-gray-1000">
              Test Cross-Package Dependency Injection
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-gray-900 mb-1">
                  Source Workspace (Importer)
                </label>
                <select
                  value={fromPkg}
                  onChange={(e) => setFromPkg(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-background-200 border border-gray-300 rounded-md text-gray-1000 focus:outline-none focus:border-gray-500"
                >
                  {preset.packages.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.tags.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-900 mb-1">
                  Target Dependency (Imported)
                </label>
                <select
                  value={toPkg}
                  onChange={(e) => setToPkg(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-background-200 border border-gray-300 rounded-md text-gray-1000 focus:outline-none focus:border-gray-500"
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
              <span className="text-xs text-gray-900">
                Link a foundational package to an app to test boundary violations.
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-background-100 bg-gray-1000 rounded-md hover:bg-gray-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dependency Edge</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 6 Cols: Live Audit Output of `turbo boundaries` */}
        <div className="lg:col-span-6 bg-background-100 border border-gray-300 rounded-lg p-5 flex flex-col justify-between shadow-(--ds-shadow-border-small)">
          <div className="space-y-4">
            <div className="pb-3 border-b border-gray-300 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-1000">
                  Live Boundary Audit Output ($ turbo boundaries)
                </h3>
                <p className="text-xs text-gray-900 mt-0.5">
                  Scans all {effectivePackages.length} workspace packages against tag allowlists and denylists.
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-gray-800">
                {violations.length} {violations.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>

            {violations.length === 0 ? (
              <div className="p-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-emerald-400">
                    turbo boundaries: All {effectivePackages.length} packages passed validation
                  </div>
                  <p className="text-gray-900 leading-relaxed">
                    Zero illegal cross-package imports or tag boundary violations detected across the monorepo graph.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {violations.map((v, idx) => (
                  <div
                    key={`${v.packageName}-${v.importedDependency}-${idx}`}
                    className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-semibold text-rose-400">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>
                          {v.packageName} ({v.packageTag}) → {v.importedDependency} (
                          {v.importedDependencyTag})
                        </span>
                      </div>
                      <span className="font-mono uppercase text-[11px] text-rose-400">
                        {v.severity}
                      </span>
                    </div>
                    <p className="text-gray-900 leading-relaxed">
                      {v.ruleDescription}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {injectedDependencies.length > 0 && (
              <div className="pt-3 border-t border-gray-300 space-y-2">
                <div className="text-xs font-medium text-gray-900">
                  Simulated Dependency Edges Added in Session:
                </div>
                <div className="space-y-1.5">
                  {injectedDependencies.map((dep) => (
                    <div
                      key={`${dep.fromPkg}->${dep.toPkg}`}
                      className="flex items-center justify-between px-3 py-1.5 rounded bg-background-200 border border-gray-300 text-xs font-mono"
                    >
                      <span className="text-gray-1000">
                        {dep.fromPkg} → {dep.toPkg}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveDependency(dep.fromPkg, dep.toPkg)}
                        className="inline-flex items-center gap-1 text-rose-400 hover:underline cursor-pointer"
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

          <div className="pt-4 mt-4 border-t border-gray-300 text-xs text-gray-700 font-mono">
            crates/turborepo-boundaries/src/lib.rs · AST + PackageGraph validator
          </div>
        </div>
      </div>

      {/* Bottom Section: `turbo query` GraphQL Playground */}
      <div className="bg-background-100 border border-gray-300 rounded-lg overflow-hidden shadow-(--ds-shadow-border-small)">
        <div className="px-5 py-3.5 border-b border-gray-300 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-1000">
              Monorepo GraphQL Engine ($ turbo query · crates/turborepo-query)
            </h3>
            <p className="text-xs text-gray-900 mt-0.5">
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
                    ? 'bg-gray-1000 text-background-100 border-gray-1000'
                    : 'bg-background-200 text-gray-900 border-gray-300 hover:text-gray-1000 hover:border-gray-500'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 5 Cols: GraphQL Query Document */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-gray-300 bg-background-200">
            <div className="text-xs font-mono text-gray-800 mb-2">
              $ turbo query '{selectedQueryObj.graphql.replace(/\s+/g, ' ')}'
            </div>
            <pre className="p-3.5 rounded-md bg-background-100 border border-gray-300 font-mono text-xs text-gray-1000 overflow-x-auto leading-relaxed">
              {selectedQueryObj.graphql}
            </pre>
          </div>

          {/* Right 7 Cols: Live GraphQL JSON Response */}
          <div className="lg:col-span-7 p-4 bg-background-200 text-gray-1000">
            <div className="flex items-center justify-between text-xs font-mono text-gray-800 mb-2">
              <span>JSON Response (Async-GraphQL Schema)</span>
              <span className="text-emerald-400">HTTP 200 OK</span>
            </div>
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-[320px] leading-relaxed bg-background-100 p-3.5 rounded-md border border-gray-300">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
