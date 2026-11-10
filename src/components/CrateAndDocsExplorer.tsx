import React, { useMemo, useState } from 'react';
import { Search, Box, BookOpen, Terminal, FolderGit2 } from 'lucide-react';
import {
  CrateEntry,
  TURBOREPO_CRATES,
  TURBOREPO_DOCS_INDEX,
} from '../data/turborepoData';

const CRATE_CATEGORIES: Array<'All' | CrateEntry['category']> = [
  'All',
  'Execution & Task Graph',
  'Caching & Content Hashing',
  'Workspaces & Lockfiles',
  'Developer Experience & TUI',
  'Query, Boundaries & AI',
];

export const CrateAndDocsExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CrateEntry['category']>('All');

  const filteredCrates = useMemo(() => {
    return TURBOREPO_CRATES.filter((crate) => {
      const matchesCategory =
        selectedCategory === 'All' || crate.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (crate.name.toLowerCase().includes(q) ||
          crate.description.toLowerCase().includes(q) ||
          crate.keyModules.some((m) => m.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Rust Crates Architecture Directory */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Rust Architecture & Crate Index (z-ey3eiei/Turborepo v2.11.10)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore the core Rust workspace crates under <code className="font-mono">crates/turborepo-*</code> powering task graph execution, hashing, and TUI multiplexing.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter crates or Rust structs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CRATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Crates Table / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrates.map((crate) => (
            <div
              key={crate.name}
              className="p-4 rounded-md bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {crate.category} · <span className="font-mono">{crate.path}</span>
                </div>
                <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {crate.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {crate.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Modules: {crate.keyModules.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundled Documentation & Agent Skill Reference (packages/turbo/docs-index.md) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Bundled Documentation & Agent Skill Index (packages/turbo/docs-index.md)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            In Turborepo v2.11.10, official MDX documentation ships directly inside <code className="font-mono">node_modules/turbo/docs/README.md</code> so coding agents always read version-exact docs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {TURBOREPO_DOCS_INDEX.map((doc) => (
            <div
              key={doc.docPath}
              className="p-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {doc.category} · <span className="font-mono">{doc.docPath}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {doc.summary}
                </p>
                <ul className="space-y-1 pt-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                  {doc.keyRules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="px-3 py-2 rounded bg-slate-900 text-slate-100 font-mono text-xs flex items-center justify-between">
                <span>$ {doc.cliExample}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
