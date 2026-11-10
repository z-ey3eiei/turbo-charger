import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  RotateCcw,
  Sparkles,
  FileCode2,
  Cpu,
} from 'lucide-react';
import {
  MONOREPO_PRESETS,
  TURBO_FRAMEWORKS,
  TurboJsonConfig,
} from '../data/turborepoData';
import {
  applyTurboCodemod,
  matchWildcardEnvVars,
  validateTurboJsonText,
} from '../engine/turboEngine';

interface TurboConfigStudioProps {
  turboJsonText: string;
  onChangeTurboJsonText: (nextText: string) => void;
  onResetToPreset: () => void;
  envVars: Record<string, string>;
  onUpdateEnvVar: (key: string, value: string) => void;
}

const LEGACY_V1_SAMPLE = JSON.stringify(
  {
    globalDotEnv: ['.env.local', '.env'],
    globalEnv: ['NODE_ENV', 'CI'],
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: [],
      },
      test: {
        dependsOn: ['^build'],
        command: ['cargo', 'nextest', 'run'],
      },
      dev: {
        persistent: true,
      },
    },
  },
  null,
  2
);

export const TurboConfigStudio: React.FC<TurboConfigStudioProps> = ({
  turboJsonText,
  onChangeTurboJsonText,
  onResetToPreset,
  envVars,
  onUpdateEnvVar,
}) => {
  const [selectedFrameworkSlug, setSelectedFrameworkSlug] = useState<string>('nextjs');
  const [newEnvKey, setNewEnvKey] = useState<string>('NEXT_PUBLIC_FEATURE_FLAG');
  const [newEnvValue, setNewEnvValue] = useState<string>('enabled');

  const validation = useMemo(() => validateTurboJsonText(turboJsonText), [turboJsonText]);

  const selectedFramework = useMemo(
    () => TURBO_FRAMEWORKS.find((f) => f.slug === selectedFrameworkSlug) || TURBO_FRAMEWORKS[0],
    [selectedFrameworkSlug]
  );

  const matchedFrameworkEnvs = useMemo(() => {
    return matchWildcardEnvVars(
      selectedFramework.envWildcards,
      envVars,
      selectedFramework.envConditionals
    );
  }, [selectedFramework, envVars]);

  const handleAddEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim()) return;
    onUpdateEnvVar(newEnvKey.trim(), newEnvValue);
    setNewEnvKey('');
    setNewEnvValue('');
  };

  return (
    <div className="space-y-6">
      {/* Top Split: turbo.json v2.11.10 Editor + Real-Time Schema Diagnostics & @turbo/codemod */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Live JSONC Editor */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col justify-between overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                turbo.json Configuration Studio (crates/turborepo-turbo-json)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Edit task pipelines, v2.11.10 futureFlags, or load a legacy v1 config to run @turbo/codemod transforms.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeTurboJsonText(LEGACY_V1_SAMPLE)}
                className="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Load v1 Legacy Config
              </button>
              <button
                type="button"
                onClick={onResetToPreset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={turboJsonText}
              onChange={(e) => onChangeTurboJsonText(e.target.value)}
              spellCheck={false}
              aria-label="turbo.json configuration editor"
              className="w-full flex-1 min-h-[380px] p-4 font-mono text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y"
            />
          </div>

          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Schema: https://turborepo.dev/schema.json (v2.11.10)</span>
            <span className="font-mono tabular-nums">
              {turboJsonText.split('\n').length} lines
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Diagnostics & @turbo/codemod Runner */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  LSP & Codemod Diagnostics (@turbo/codemod)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Validates v2 task semantics, persistent task caching, and v2.11.10 futureFlags.
                </p>
              </div>
              {validation.diagnostics.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeTurboJsonText(applyTurboCodemod(turboJsonText, 'all'))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Fix All with Codemod</span>
                </button>
              )}
            </div>

            {validation.diagnostics.length === 0 ? (
              <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Configuration Valid (0 diagnostics)
                  </div>
                  <p className="text-emerald-700/90 dark:text-emerald-300/80 mt-1">
                    All tasks conform to Turborepo v2.11.10 schema rules. Changes are live-synced with the Task Graph Engine.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {validation.diagnostics.map((diag, idx) => (
                  <div
                    key={`${diag.path}-${idx}`}
                    className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {diag.level === 'error' ? (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                          {diag.path}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono uppercase text-slate-500">
                        {diag.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {diag.message}
                    </p>
                    {diag.fixableByCodemod && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            onChangeTurboJsonText(
                              applyTurboCodemod(turboJsonText, diag.fixableByCodemod!)
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>npx @turbo/codemod {diag.fixableByCodemod}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* v2.11.10 Future Flags Quick Reference */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Turborepo v2.11.10 Future Flags
            </div>
            <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-mono text-slate-700 dark:text-slate-300">
                experimentalCargoWorkspaces
              </span>{' '}
              · Automatically indexes Cargo.toml crates alongside JS workspaces.
            </div>
            <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-mono text-slate-700 dark:text-slate-300">
                experimentalTaskCommand
              </span>{' '}
              · Allows defining inline command arrays directly inside turbo.json tasks.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Framework Environment Variable Inference Tester (frameworks.json) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Framework Environment Wildcard Inference (packages/turbo-types/src/json/frameworks.json)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect how Turborepo detects 15 frontend/fullstack frameworks and automatically injects matching environment variables into task hashes.
            </p>
          </div>
        </div>

        {/* 15 Framework Selector Buttons */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {TURBO_FRAMEWORKS.map((fw) => (
            <button
              key={fw.slug}
              type="button"
              onClick={() => setSelectedFrameworkSlug(fw.slug)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFrameworkSlug === fw.slug
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {fw.name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selected Framework Rule Specification */}
          <div className="lg:col-span-6 p-4 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                {selectedFramework.name} ({selectedFramework.slug})
              </span>
              <span className="font-mono text-slate-500">
                match strategy: {selectedFramework.dependencyMatch.strategy}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400">
                Required package.json dependencies:{' '}
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {selectedFramework.dependencyMatch.dependencies.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400">
                Auto-Hashed envWildcards:{' '}
              </span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                {selectedFramework.envWildcards.join(' · ')}
              </span>
            </div>

            {selectedFramework.envConditionals && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                Conditional Skew Protection: When{' '}
                <code className="text-sky-600 dark:text-sky-400">
                  {selectedFramework.envConditionals[0].when.key}=
                  {selectedFramework.envConditionals[0].when.value}
                </code>
                , also includes{' '}
                <code className="text-sky-600 dark:text-sky-400">
                  {selectedFramework.envConditionals[0].include.join(', ')}
                </code>
                .
              </div>
            )}
          </div>

          {/* Live Environment Variables & Wildcard Match Output */}
          <div className="lg:col-span-6 space-y-3">
            <form onSubmit={handleAddEnvVar} className="flex items-center gap-2">
              <input
                type="text"
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value)}
                placeholder="ENV_VAR_NAME (e.g. NEXT_PUBLIC_API)"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                placeholder="Value"
                className="w-36 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
              >
                Set Env Var
              </button>
            </form>

            <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Matched Environment Variables for {selectedFramework.name}:</span>
                <span className="font-mono">{matchedFrameworkEnvs.length} matched</span>
              </div>
              {matchedFrameworkEnvs.length === 0 ? (
                <div className="text-slate-400 font-mono py-2">
                  No current workspace env vars match {selectedFramework.envWildcards.join(', ')}. Add one above to test hash injection.
                </div>
              ) : (
                <div className="space-y-1">
                  {matchedFrameworkEnvs.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between font-mono text-xs py-1 border-b border-slate-200/60 dark:border-slate-800/60 last:border-b-0"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {item.key}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
