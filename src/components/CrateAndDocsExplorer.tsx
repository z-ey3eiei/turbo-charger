import React, { useMemo, useState } from 'react';
import { Search, Box, BookOpen, Terminal, FolderGit2, ExternalLink } from 'lucide-react';
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
      <div className="bg-background-100 border border-gray-300 rounded-lg p-5 space-y-5 shadow-(--ds-shadow-border-small)">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-300">
          <div>
            <h2 className="text-sm font-semibold text-gray-1000">
              Rust Architecture &amp; Crate Index (z-ey3eiei/Turborepo v2.11.10)
            </h2>
            <p className="text-xs text-gray-900 mt-0.5">
              Explore the core Rust workspace crates under <code className="font-mono bg-gray-200 px-1 py-0.5 rounded text-gray-1000">crates/turborepo-*</code> powering task graph execution, hashing, and TUI multiplexing.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter crates or Rust structs..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background-200 border border-gray-300 rounded-md text-gray-1000 placeholder:text-gray-600 focus:outline-none focus:border-gray-500"
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
                  ? 'bg-gray-1000 text-background-100 border-gray-1000'
                  : 'bg-background-200 text-gray-900 border-gray-300 hover:text-gray-1000 hover:border-gray-500'
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
              className="p-4 rounded-md bg-background-200 border border-gray-300 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="text-[11px] text-gray-800">
                  {crate.category} · <span className="font-mono text-gray-900">{crate.path}</span>
                </div>
                <h3 className="text-sm font-bold font-mono text-gray-1000">
                  {crate.name}
                </h3>
                <p className="text-xs text-gray-900 leading-relaxed">
                  {crate.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-300 text-[11px] font-mono text-gray-700">
                Modules: {crate.keyModules.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bundled Documentation & Agent Skill Reference */}
      <div className="bg-background-100 border border-gray-300 rounded-lg p-5 space-y-4 shadow-(--ds-shadow-border-small)">
        <div className="pb-3 border-b border-gray-300 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-1000">
              Bundled Documentation &amp; Agent Skill Index (packages/turbo/docs-index.md)
            </h2>
            <p className="text-xs text-gray-900 mt-0.5">
              In Turborepo v2.11.10, official MDX documentation ships directly inside <code className="font-mono bg-gray-200 px-1 py-0.5 rounded text-gray-1000">node_modules/turbo/docs/README.md</code> so coding agents always read version-exact docs.
            </p>
          </div>
          <a
            href="https://docs.ai-sdk.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 bg-background-200 text-xs font-medium text-gray-1000 hover:border-gray-500 hover:bg-gray-100 transition-colors"
          >
            <span>Live docs portal (docs.ai-sdk.pro)</span>
            <ExternalLink className="size-3 text-gray-600" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {TURBOREPO_DOCS_INDEX.map((doc) => (
            <div
              key={doc.docPath}
              className="p-4 rounded-md border border-gray-300 bg-background-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="text-xs text-gray-800">
                  {doc.category} · <span className="font-mono text-gray-900">{doc.docPath}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-1000">
                  {doc.title}
                </h3>
                <p className="text-xs text-gray-900 leading-relaxed">
                  {doc.summary}
                </p>
                <ul className="space-y-1 pt-1 text-xs text-gray-900 list-disc pl-4">
                  {doc.keyRules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-1000 font-mono text-xs flex items-center justify-between">
                <span>$ {doc.cliExample}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
