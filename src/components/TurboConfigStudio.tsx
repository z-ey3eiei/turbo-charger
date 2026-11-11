import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  TURBO_FRAMEWORKS,
  FrameworkConfig,
} from '../data/turborepoData';
import {
  validateTurboJsonText,
  applyTurboCodemod,
  ConfigDiagnostic,
} from '../engine/turboEngine';

interface TurboConfigStudioProps {
  turboJsonText: string;
  onChangeTurboJsonText: (newText: string) => void;
  onResetToPreset: () => void;
  envVars: Record<string, string>;
  onUpdateEnvVar: (key: string, value: string) => void;
}

const LEGACY_V1_SAMPLE = `{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}`;

export const TurboConfigStudio: React.FC<TurboConfigStudioProps> = ({
  turboJsonText,
  onChangeTurboJsonText,
  onResetToPreset,
  envVars,
  onUpdateEnvVar,
}) => {
  const [selectedFrameworkSlug, setSelectedFrameworkSlug] =
    useState<string>('next');
  const [newEnvKey, setNewEnvKey] = useState<string>('');
  const [newEnvValue, setNewEnvValue] = useState<string>('');
  const [migrationApplied, setMigrationApplied] = useState<boolean>(false);

  // Real-Time Schema Diagnostics
  const { diagnostics } = validateTurboJsonText(turboJsonText);

  // Selected Framework
  const selectedFramework: FrameworkConfig =
    TURBO_FRAMEWORKS.find((f) => f.slug === selectedFrameworkSlug) ||
    TURBO_FRAMEWORKS[0];

  // Matched Env Vars
  const matchedFrameworkEnvs = Object.entries(envVars)
    .filter(([key]) =>
      selectedFramework.envWildcards.some((wildcard: string) => {
        const prefix = wildcard.replace(/\*$/, '');
        return key.startsWith(prefix);
      })
    )
    .map(([key, value]) => ({ key, value }));

  const handleApplyCodemod = () => {
    const migrated = applyTurboCodemod(turboJsonText, 'rename-pipeline-to-tasks');
    onChangeTurboJsonText(migrated);
    setMigrationApplied(true);
    setTimeout(() => setMigrationApplied(false), 3000);
  };

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
        <div className="lg:col-span-7 bg-background-100 border border-gray-300 rounded-lg flex flex-col justify-between overflow-hidden shadow-(--ds-shadow-border-small)">
          <div className="px-5 py-3.5 border-b border-gray-300 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-1000">
                turbo.json Configuration Studio (crates/turborepo-turbo-json)
              </h2>
              <p className="text-xs text-gray-900 mt-0.5">
                Edit task pipelines, v2.11.10 futureFlags, or load a legacy v1 config to run @turbo/codemod transforms.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeTurboJsonText(LEGACY_V1_SAMPLE)}
                className="px-2.5 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Load v1 Legacy Config
              </button>
              <button
                type="button"
                onClick={onResetToPreset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-900 hover:text-gray-1000 border border-gray-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              className="w-full flex-1 min-h-[380px] p-4 font-mono text-xs leading-relaxed bg-background-200 text-gray-1000 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 resize-y"
            />
          </div>

          <div className="px-5 py-3 bg-background-200 border-t border-gray-300 flex items-center justify-between text-xs text-gray-900">
            <span>Schema: https://turborepo.dev/schema.json (v2.11.10)</span>
            <span className="font-mono tabular-nums">
              {turboJsonText.split('\n').length} lines
            </span>
          </div>
        </div>

        {/* Right 5 Cols: Diagnostics & @turbo/codemod Runner */}
        <div className="lg:col-span-5 bg-background-100 border border-gray-300 rounded-lg p-5 flex flex-col justify-between shadow-(--ds-shadow-border-small)">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-300">
              <div>
                <h3 className="text-sm font-semibold text-gray-1000">
                  Real-Time Schema Diagnostics
                </h3>
                <p className="text-xs text-gray-900 mt-0.5">
                  Powered by turborepo-turbo-json validation engine
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-gray-800">
                {diagnostics.length} {diagnostics.length === 1 ? 'diagnostic' : 'diagnostics'}
              </span>
            </div>

            {/* Codemod CTA Banner if pipeline is detected */}
            {diagnostics.some((d: ConfigDiagnostic) => d.fixableByCodemod === 'rename-pipeline-to-tasks') && (
              <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Legacy Turborepo v1 "pipeline" block detected!</span>
                </div>
                <p className="text-gray-900 leading-relaxed">
                  Turborepo 2.0 deprecates <code className="font-mono text-amber-400">"pipeline"</code> in favor of <code className="font-mono text-amber-400">"tasks"</code>. You can run automated @turbo/codemod migration directly in this studio.
                </p>
                <button
                  type="button"
                  onClick={handleApplyCodemod}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-background-100 bg-amber-400 rounded hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Run @turbo/codemod transform to "tasks"</span>
                </button>
              </div>
            )}

            {migrationApplied && (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Successfully migrated "pipeline" to "tasks" syntax!</span>
              </div>
            )}

            {/* Diagnostics List */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {diagnostics.length === 0 ? (
                <div className="p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>turbo.json is 100% compliant with Turborepo v2.11.10 schema</span>
                </div>
              ) : (
                diagnostics.map((diag: ConfigDiagnostic, index: number) => (
                  <div
                    key={`${diag.path}-${index}`}
                    className="p-3 rounded-md border border-gray-300 bg-background-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-1000">
                        {diag.level === 'error' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ) : diag.level === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span className="font-mono text-xs">{diag.path}</span>
                      </div>
                      <span className="text-[11px] font-mono uppercase text-gray-700">
                        {diag.level}
                      </span>
                    </div>
                    <p className="text-gray-900 leading-relaxed">
                      {diag.message}
                    </p>
                    {diag.fixableByCodemod && (
                      <div className="pt-1 text-[11px] text-emerald-400 font-mono">
                        Fixable by codemod: {diag.fixableByCodemod}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-300 space-y-2 text-xs">
            <div className="font-semibold text-gray-1000">
              Turborepo 2.11.10 Key Schema Features
            </div>
            <div className="text-gray-900 leading-relaxed">
              • <span className="font-mono text-gray-1000">"futureFlags": &#123; "daemon": true &#125;</span> — Toggles high-speed background daemon.
            </div>
            <div className="text-gray-900 leading-relaxed">
              • <span className="font-mono text-gray-1000">"interactive": true</span> — Enables full interactive TUI stdin support for task pipelines.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Framework Environment Variable Inference Tester */}
      <div className="bg-background-100 border border-gray-300 rounded-lg p-5 shadow-(--ds-shadow-border-small)">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-300">
          <div>
            <h3 className="text-sm font-semibold text-gray-1000">
              Framework Environment Wildcard Inference (packages/turbo-types/src/json/frameworks.json)
            </h3>
            <p className="text-xs text-gray-900 mt-0.5">
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
                  ? 'bg-gray-1000 text-background-100 border-gray-1000'
                  : 'bg-background-200 text-gray-900 border-gray-300 hover:text-gray-1000 hover:border-gray-500'
              }`}
            >
              {fw.name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selected Framework Rule Specification */}
          <div className="lg:col-span-6 p-4 rounded-md bg-background-200 border border-gray-300 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-1000 text-sm">
                {selectedFramework.name} ({selectedFramework.slug})
              </span>
              <span className="font-mono text-gray-700">
                match strategy: {selectedFramework.dependencyMatch.strategy}
              </span>
            </div>

            <div>
              <span className="text-gray-900">
                Required package.json dependencies:{' '}
              </span>
              <span className="font-mono text-gray-1000">
                {selectedFramework.dependencyMatch.dependencies.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-gray-900">
                Auto-Hashed envWildcards:{' '}
              </span>
              <span className="font-mono text-[#FF1E56] font-semibold">
                {selectedFramework.envWildcards.join(' · ')}
              </span>
            </div>

            {selectedFramework.envConditionals && (
              <div className="pt-2 border-t border-gray-300 text-gray-900">
                Conditional Skew Protection: When{' '}
                <code className="text-[#0096FF]">
                  {selectedFramework.envConditionals[0].when.key}=
                  {selectedFramework.envConditionals[0].when.value}
                </code>
                , also includes{' '}
                <code className="text-[#0096FF]">
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
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-background-200 border border-gray-300 rounded-md text-gray-1000 placeholder:text-gray-700 focus:outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                placeholder="Value"
                className="w-36 px-3 py-1.5 text-xs font-mono bg-background-200 border border-gray-300 rounded-md text-gray-1000 placeholder:text-gray-700 focus:outline-none focus:border-gray-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-background-100 bg-gray-1000 rounded-md hover:bg-gray-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Set Env Var
              </button>
            </form>

            <div className="p-3.5 rounded-md bg-background-200 border border-gray-300 text-xs space-y-2">
              <div className="flex items-center justify-between text-gray-900">
                <span>Matched Environment Variables for {selectedFramework.name}:</span>
                <span className="font-mono">{matchedFrameworkEnvs.length} matched</span>
              </div>
              {matchedFrameworkEnvs.length === 0 ? (
                <div className="text-gray-700 font-mono py-2">
                  No current workspace env vars match {selectedFramework.envWildcards.join(', ')}. Add one above to test hash injection.
                </div>
              ) : (
                <div className="space-y-1">
                  {matchedFrameworkEnvs.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between font-mono text-xs py-1 border-b border-gray-300 last:border-b-0"
                    >
                      <span className="text-emerald-400 font-medium">
                        {item.key}
                      </span>
                      <span className="text-gray-900">{item.value}</span>
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
