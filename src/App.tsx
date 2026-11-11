import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Terminal,
  FileJson,
  ShieldAlert,
  BookOpen,
  Play,
  ExternalLink,
  PanelLeft,
  SlidersHorizontal,
  X,
  Zap,
  Layers,
  Home,
  Cpu,
  Boxes,
  Sparkles,
} from 'lucide-react';
import { HomePage } from './apps/docs/HomePage';
import { DevtoolsPage } from './apps/docs/devtools/DevtoolsPage';
import { ShowcasePage } from './apps/docs/ShowcasePage';
import { FactoryApp } from './apps/factory/FactoryApp';
import { AboutPage } from './apps/docs/AboutPage';
import { ContactPage } from './apps/docs/ContactPage';
import { PrivacyPage } from './apps/docs/PrivacyPage';
import {
  TurborepoLogo,
  VercelLogo,
  GithubLogo,
} from './apps/docs/components/logos-and-testimonials';
import { MONOREPO_PRESETS, TurboJsonConfig } from './data/turborepoData';
import { buildTaskGraph } from './engine/turboEngine';
import { TaskGraphVisualizer } from './components/TaskGraphVisualizer';
import { TurboConfigStudio } from './components/TurboConfigStudio';
import { BoundariesAndQueryView } from './components/BoundariesAndQueryView';
import { CrateAndDocsExplorer } from './components/CrateAndDocsExplorer';
import { TurbochargerResolver } from './components/TurbochargerResolver';
import { ServerToolsManager } from './components/ServerToolsManager';
import { Server } from 'lucide-react';

type AppRoute =
  | 'home'
  | 'resolver'
  | 'server-tools'
  | 'devtools'
  | 'factory'
  | 'showcase'
  | 'docs'
  | 'about'
  | 'contact'
  | 'privacy';
type StudioSubTab = 'crates-docs' | 'config' | 'boundaries' | 'runner';

const ROUTE_ORDER: AppRoute[] = [
  'home',
  'resolver',
  'server-tools',
  'docs',
  'devtools',
  'factory',
  'showcase',
  'about',
  'contact',
  'privacy',
];

const SMOOTH_SLIDE_TRANSITION = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 32,
  mass: 0.85,
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/^\//, '');
      if (p === 'about') return 'about';
      if (p === 'contact') return 'contact';
      if (p === 'privacy') return 'privacy';
      if (p === 'resolver') return 'resolver';
      if (p === 'server-tools') return 'server-tools';
      if (p === 'devtools') return 'devtools';
      if (p === 'factory') return 'factory';
      if (p === 'showcase') return 'showcase';
      if (p === 'docs') return 'docs';
    }
    return 'home';
  });
  const [prevRouteIdx, setPrevRouteIdx] = useState<number>(0);
  const [studioTab, setStudioTab] = useState<StudioSubTab>('crates-docs');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Slide-out Side Navigation & Quick Resolver Drawer states
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false);
  const [isResolverDrawerOpen, setIsResolverDrawerOpen] =
    useState<boolean>(false);

  // Interactive Studio Engine State
  const [selectedPresetId] = useState<string>(MONOREPO_PRESETS[0].id);
  const preset = useMemo(
    () =>
      MONOREPO_PRESETS.find((p) => p.id === selectedPresetId) ??
      MONOREPO_PRESETS[0],
    [selectedPresetId]
  );

  const [selectedTask, setSelectedTask] = useState<string>('build');
  const [filterExpr, setFilterExpr] = useState<string>('*');
  const [fileMutations, setFileMutations] = useState<Record<string, number>>(
    {}
  );
  const [turboJsonText, setTurboJsonText] = useState<string>(() =>
    JSON.stringify(MONOREPO_PRESETS[0].turboJson, null, 2)
  );
  const [envVars, setEnvVars] = useState<Record<string, string>>(
    () => MONOREPO_PRESETS[0].envVars
  );
  const [injectedDependencies, setInjectedDependencies] = useState<
    Array<{ fromPkg: string; toPkg: string }>
  >([]);
  const [cachedHashes, setCachedHashes] = useState<Set<string>>(new Set());
  const [lastRunStatuses, setLastRunStatuses] = useState<
    Record<string, 'cache-hit' | 'executed' | 'idle'>
  >({});
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remoteCacheEnabled, setRemoteCacheEnabled] = useState<boolean>(true);
  const [lastRunElapsedMs, setLastRunElapsedMs] = useState<number | null>(null);
  const [fullTurboAchieved, setFullTurboAchieved] = useState<boolean>(false);

  const customTurboJson = useMemo<TurboJsonConfig | undefined>(() => {
    try {
      return JSON.parse(turboJsonText) as TurboJsonConfig;
    } catch {
      return undefined;
    }
  }, [turboJsonText]);

  const graph = useMemo(
    () =>
      buildTaskGraph(
        preset,
        selectedTask,
        filterExpr,
        fileMutations,
        customTurboJson,
        envVars
      ),
    [preset, selectedTask, filterExpr, fileMutations, customTurboJson, envVars]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleExecuteRun = (forceNoCache?: boolean) => {
    setIsRunning(true);
    const nextStatuses: Record<string, 'cache-hit' | 'executed' | 'idle'> = {};
    const nextCache = new Set(cachedHashes);
    let allHit = graph.nodes.length > 0;
    let elapsed = 0;

    for (const node of graph.nodes) {
      const hit = !forceNoCache && node.cacheable && nextCache.has(node.hash);
      if (hit) {
        nextStatuses[node.id] = 'cache-hit';
        elapsed += 12;
      } else {
        nextStatuses[node.id] = 'executed';
        allHit = false;
        elapsed += Math.round(node.estimatedDurationMs * 0.35);
        if (node.cacheable) {
          nextCache.add(node.hash);
        }
      }
    }

    setCachedHashes(nextCache);
    setLastRunStatuses(nextStatuses);
    setLastRunElapsedMs(allHit ? Math.max(48, elapsed) : elapsed);
    setFullTurboAchieved(allHit);
    setIsRunning(false);
  };

  const handleNavigate = (target: string) => {
    const nextRoute: AppRoute =
      target === 'resolver'
        ? 'resolver'
        : target === 'server-tools'
          ? 'server-tools'
          : target === 'devtools'
            ? 'devtools'
            : target === 'showcase'
              ? 'showcase'
              : target === 'factory'
                ? 'factory'
                : target === 'docs'
                  ? 'docs'
                  : target === 'about'
                    ? 'about'
                    : target === 'contact'
                      ? 'contact'
                      : target === 'privacy'
                        ? 'privacy'
                        : 'home';
    setPrevRouteIdx(ROUTE_ORDER.indexOf(route));
    setRoute(nextRoute);
    setIsSideNavOpen(false);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const url = nextRoute === 'home' ? '/' : `/${nextRoute}`;
      window.history.pushState({}, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentRouteIdx = ROUTE_ORDER.indexOf(route);
  const slideDir = currentRouteIdx >= prevRouteIdx ? 1 : -1;

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'resolver', label: 'Resolver', icon: Zap },
    { id: 'server-tools', label: 'Server Tools', icon: Server },
    { id: 'docs', label: 'Docs & Crates', icon: BookOpen },
    { id: 'devtools', label: 'Devtools', icon: Layers },
    { id: 'factory', label: 'Factory (fx)', icon: Cpu },
    { id: 'showcase', label: 'Showcase', icon: Boxes },
  ] as const;

  return (
    <div className="min-h-screen bg-background-100 text-gray-1000 flex flex-col overflow-x-hidden">
      {/* Official Geistdocs + Turbocharger Top Navigation Bar */}
      <header className="sticky top-0 z-50 h-16 border-b border-gray-200 dark:border-neutral-800 bg-background-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1340px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Slide-out Side Navigation Trigger */}
            <button
              type="button"
              onClick={() => setIsSideNavOpen((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 dark:border-neutral-800 bg-background-100 text-gray-900 hover:text-gray-1000 transition-colors cursor-pointer"
              title="Toggle Turbocharger Side Panel"
              aria-label="Toggle Turbocharger Side Panel"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            {/* Turborepo + .sidename Turbocharger Brand Lockup (Vercel logo relocated) */}
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <TurborepoLogo className="h-[22px] w-auto" />
              <span className="sidename text-base sm:text-lg">
                Turbocharger
              </span>
            </button>

            {/* Primary Nav Items with Smooth Sliding Active Pill */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {NAV_ITEMS.map((item) => {
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'text-gray-1000'
                        : 'text-gray-900 hover:text-gray-1000'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="turbocharger-header-nav-pill"
                        transition={SMOOTH_SLIDE_TRANSITION}
                        className="absolute inset-0 -z-10 rounded-md bg-gray-100 dark:bg-neutral-800 border border-gray-200/80 dark:border-neutral-700"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.id === 'resolver' && (
                        <Zap className="h-3.5 w-3.5 text-[#FF1E56]" />
                      )}
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
          {/* Slide-out Quick Resolver Drawer Button (without duplicate Turbocharger word) */}
          <button
            type="button"
            onClick={() => setIsResolverDrawerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-gray-200 dark:border-neutral-800 bg-background-200 text-xs font-medium text-gray-1000 hover:border-[#FF1E56] transition-colors cursor-pointer slide-smooth"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF1E56]" />
            <span>Resolver Drawer</span>
          </button>

            <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-800 bg-background-200 px-2.5 py-1 font-mono text-xs text-gray-900">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF1E56]" />
              v2.11.10 · a575396
            </span>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 dark:border-neutral-800 bg-background-100 text-gray-900 hover:text-gray-1000 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Sliding Nav Bar */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto border-t border-gray-200 dark:border-neutral-800 bg-background-100 px-4 py-1.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`relative px-2.5 py-1 rounded text-xs font-medium shrink-0 cursor-pointer ${
                route === item.id ? 'text-gray-1000' : 'text-gray-900'
              }`}
            >
              {route === item.id && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  transition={SMOOTH_SLIDE_TRANSITION}
                  className="absolute inset-0 -z-10 rounded bg-gray-200 dark:bg-neutral-800"
                />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Left Slide-Out Side Navigation Panel (.sidename Turbocharger) */}
      <AnimatePresence>
        {isSideNavOpen && (
          <>
            <motion.div
              key="sidenav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsSideNavOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              key="sidenav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={SMOOTH_SLIDE_TRANSITION}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 border-r border-gray-200 dark:border-neutral-800 bg-background-100 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <TurborepoLogo className="h-5 w-auto" />
                    <span className="sidename text-lg">Turbocharger</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSideNavOpen(false)}
                    className="rounded-md p-1 text-gray-800 hover:text-gray-1000 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-gray-700">
                    Workspace Navigation
                  </div>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = route === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer slide-smooth ${
                          active
                            ? 'bg-gray-100 dark:bg-neutral-800 text-gray-1000'
                            : 'text-gray-900 hover:bg-gray-100/60 dark:hover:bg-neutral-900 hover:text-gray-1000'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 ${
                              active ? 'text-[#FF1E56]' : 'text-gray-700'
                            }`}
                          />
                          <span>{item.label}</span>
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF1E56]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="sidename text-xs">Turbocharger</span>
                    <span className="font-mono text-[11px] text-emerald-500">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 dark:text-neutral-400">
                    DAG Task Graph &amp; UI/UX Slide Resolver active for{' '}
                    <code className="font-mono text-gray-1000">
                      {preset.packages.length} packages
                    </code>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSideNavOpen(false);
                      setIsResolverDrawerOpen(true);
                    }}
                    className="w-full rounded-md bg-gradient-to-r from-[#FF1E56] to-[#0096FF] py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    Open Slide Resolver Drawer
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800 pt-3 flex items-center justify-between font-mono text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-emerald-500" />
                  <span className="sidename text-xs font-semibold text-gray-1000 dark:text-neutral-200">Turbocharger Engine</span>
                </div>
                <span>v2.11.10 · a575396</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Right Slide-Out Quick Resolver Drawer */}
      <AnimatePresence>
        {isResolverDrawerOpen && (
          <>
            <motion.div
              key="resolver-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsResolverDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              key="resolver-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={SMOOTH_SLIDE_TRANSITION}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-2xl border-l border-gray-200 dark:border-neutral-800 bg-background-200 overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 bg-background-100/95 backdrop-blur-md px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#FF1E56]" />
                  <span className="sidename text-base">Turbocharger</span>
                  <span className="text-xs font-mono text-gray-800 dark:text-neutral-400">
                    Quick Slide Resolver Drawer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResolverDrawerOpen(false);
                      handleNavigate('resolver');
                    }}
                    className="rounded-md border border-gray-200 dark:border-neutral-800 bg-background-200 px-2.5 py-1 text-xs font-medium text-gray-1000 hover:border-[#0096FF] cursor-pointer"
                  >
                    Expand Full View
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResolverDrawerOpen(false)}
                    className="rounded-md p-1.5 text-gray-800 hover:text-gray-1000 cursor-pointer"
                    aria-label="Close Resolver Drawer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <TurbochargerResolver
                preset={preset}
                graph={graph}
                compactDrawer
                onNavigateRoute={(target) => {
                  setIsResolverDrawerOpen(false);
                  handleNavigate(target);
                }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Route Views with Smooth Directional Slide Animation */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={route}
            custom={slideDir}
            initial={{ opacity: 0, x: slideDir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideDir * 28 }}
            transition={SMOOTH_SLIDE_TRANSITION}
            className="flex-1 flex flex-col"
          >
            {route === 'home' && <HomePage onNavigate={handleNavigate} />}

            {route === 'resolver' && (
              <TurbochargerResolver
                preset={preset}
                graph={graph}
                onNavigateRoute={handleNavigate}
              />
            )}

            {route === 'server-tools' && <ServerToolsManager />}

            {route === 'devtools' && <DevtoolsPage />}

            {route === 'showcase' && <ShowcasePage />}

            {route === 'factory' && <FactoryApp />}

            {route === 'docs' && (
              <div className="flex-1 flex flex-col bg-background-200 text-gray-1000">
                {/* Sub-navigation bar for Docs, Crates, turbo.json Studio, Boundaries & Runner */}
                <div className="border-b border-gray-300 bg-background-100 px-4 sm:px-6 py-2.5">
                  <div className="mx-auto flex max-w-[1340px] flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {(
                        [
                          {
                            id: 'crates-docs',
                            label: 'Crates & Docs Reference',
                            icon: BookOpen,
                            color: 'text-[#0096FF]',
                          },
                          {
                            id: 'config',
                            label: 'turbo.json Studio',
                            icon: FileJson,
                            color: 'text-[#FF1E56]',
                          },
                          {
                            id: 'boundaries',
                            label: 'Boundaries & turbo query',
                            icon: ShieldAlert,
                            color: 'text-[#F59E0B]',
                          },
                          {
                            id: 'runner',
                            label: 'CLI Task Runner (`turbo run`)',
                            icon: Terminal,
                            color: 'text-[#10B981]',
                          },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = studioTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStudioTab(tab.id)}
                            className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                              isActive
                                ? 'text-gray-1000'
                                : 'text-gray-900 hover:text-gray-1000'
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="studio-subtab-pill"
                                transition={SMOOTH_SLIDE_TRANSITION}
                                className="absolute inset-0 rounded-md bg-background-200 border border-gray-300"
                              />
                            )}
                            <Icon
                              className={`relative z-10 w-3.5 h-3.5 ${tab.color}`}
                            />
                            <span className="relative z-10">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://docs.ai-sdk.pro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 bg-background-200 text-xs font-medium text-gray-1000 hover:border-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>docs.ai-sdk.pro</span>
                        <ExternalLink className="size-3 text-gray-600" />
                      </a>
                      {studioTab === 'runner' && (
                        <button
                          type="button"
                          onClick={() => handleExecuteRun(false)}
                          className="inline-flex items-center gap-1.5 rounded bg-gray-1000 text-background-100 px-3 py-1 text-xs font-semibold hover:bg-gray-900 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Execute `turbo run {selectedTask}`
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-[calc(100vh-7.5rem)] flex flex-col p-4 sm:p-6 max-w-[1340px] mx-auto w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={studioTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={SMOOTH_SLIDE_TRANSITION}
                      className="flex-1 flex flex-col"
                    >
                      {studioTab === 'crates-docs' && <CrateAndDocsExplorer />}
                      {studioTab === 'config' && (
                        <TurboConfigStudio
                          turboJsonText={turboJsonText}
                          onChangeTurboJsonText={setTurboJsonText}
                          onResetToPreset={() =>
                            setTurboJsonText(
                              JSON.stringify(preset.turboJson, null, 2)
                            )
                          }
                          envVars={envVars}
                          onUpdateEnvVar={(key, value) =>
                            setEnvVars((prev) => ({ ...prev, [key]: value }))
                          }
                        />
                      )}
                      {studioTab === 'boundaries' && (
                        <BoundariesAndQueryView
                          preset={preset}
                          graph={graph}
                          injectedDependencies={injectedDependencies}
                          onAddDependency={(fromPkg, toPkg) =>
                            setInjectedDependencies((prev) => [
                              ...prev,
                              { fromPkg, toPkg },
                            ])
                          }
                          onRemoveDependency={(fromPkg, toPkg) =>
                            setInjectedDependencies((prev) =>
                              prev.filter(
                                (d) =>
                                  !(d.fromPkg === fromPkg && d.toPkg === toPkg)
                              )
                            )
                          }
                        />
                      )}
                      {studioTab === 'runner' && (
                        <TaskGraphVisualizer
                          preset={preset}
                          graph={graph}
                          selectedTask={selectedTask}
                          onSelectTask={setSelectedTask}
                          filterExpr={filterExpr}
                          onChangeFilter={setFilterExpr}
                          fileMutations={fileMutations}
                          onMutatePackage={(pkgName) =>
                            setFileMutations((prev) => ({
                              ...prev,
                              [pkgName]: (prev[pkgName] || 0) + 1,
                            }))
                          }
                          onResetMutations={() => setFileMutations({})}
                          cachedHashes={cachedHashes}
                          lastRunStatuses={lastRunStatuses}
                          isRunning={isRunning}
                          remoteCacheEnabled={remoteCacheEnabled}
                          onToggleRemoteCache={() =>
                            setRemoteCacheEnabled((prev) => !prev)
                          }
                          onExecuteRun={handleExecuteRun}
                          onClearCache={() => {
                            setCachedHashes(new Set());
                            setLastRunStatuses({});
                            setFullTurboAchieved(false);
                          }}
                          lastRunElapsedMs={lastRunElapsedMs}
                          fullTurboAchieved={fullTurboAchieved}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}

            {route === 'about' && <AboutPage onNavigate={handleNavigate} />}

            {route === 'contact' && <ContactPage onNavigate={handleNavigate} />}

            {route === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer matching apps/docs + .sidename Turbocharger with Trust Anchor & Machine Links */}
      {route !== 'devtools' && (
        <footer className="border-t border-gray-200 dark:border-neutral-800 bg-background-100 py-8 px-6 text-xs text-gray-900">
          <div className="mx-auto flex max-w-[1080px] flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TurborepoLogo className="h-4 w-auto" />
                <span className="sidename text-sm font-semibold text-gray-1000">Turbocharger</span>
                <span className="text-gray-400">·</span>
                <span className="font-mono text-gray-700">
                  Open Source Engine v2.11.10 (a575396)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => handleNavigate('home')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('resolver')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Resolver
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('server-tools')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Server Tools
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('devtools')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Devtools
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('factory')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Factory (fx)
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('showcase')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Showcase
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('docs')}
                  className="hover:text-gray-1000 cursor-pointer"
                >
                  Docs
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between border-t border-gray-200 dark:border-neutral-800/60 pt-4 text-[11px] text-gray-500 gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleNavigate('about')}
                  className="hover:text-gray-1000 underline-offset-4 hover:underline cursor-pointer"
                >
                  About Us
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('contact')}
                  className="hover:text-gray-1000 underline-offset-4 hover:underline cursor-pointer"
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('privacy')}
                  className="hover:text-gray-1000 underline-offset-4 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-1000 underline-offset-4 hover:underline"
                >
                  Sitemap XML
                </a>
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-1000 underline-offset-4 hover:underline font-mono text-[10px] bg-background-200 border border-gray-300 px-2 py-0.5 rounded text-gray-1000"
                >
                  llms.txt
                </a>
              </div>
              <p>&copy; 2026 Turbocharger Team &bull; MIT License &bull; Contact: devstack.sdk@gmail.com</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
