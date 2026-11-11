
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, PanelLeft, SlidersHorizontal, Sun, X, Zap } from 'lucide-react';

const SPRING = {
  type: 'spring',
  stiffness: 340,
  damping: 32,
  mass: 0.85,
};

/**
 * Responsive site header — drop-in replacement for the inline <header> in App.tsx.
 *
 * Responsive fixes vs. the current implementation at docs.ai-sdk.pro:
 *
 *  1. No horizontal overflow on 320–375px viewports. Previously the top row
 *     (side-panel trigger + brand lockup + "Resolver Drawer" label button +
 *     theme toggle) exceeded the viewport and was clipped by the root
 *     `overflow-x-hidden`, cutting off the theme toggle. Now the resolver
 *     button collapses to an icon-only button below `sm`, and the brand text
 *     truncates inside a `min-w-0` flex child.
 *
 *  2. The always-visible mobile nav strip (the second `lg:hidden` row inside
 *     the sticky header) grew the sticky header to ~108px on phones/tablets.
 *     It is replaced by an accessible slide-in drawer, so the sticky header
 *     stays a constant h-16 on every breakpoint.
 *
 *  3. At the `lg` breakpoint (1024–1280px) the seven inline nav items
 *     collided with the right-side cluster. Inline nav now uses tighter
 *     padding at `lg` (px-2.5) and relaxes to px-3 at `xl`, where the
 *     version badge also appears.
 *
 *  4. Accessibility: `aria-expanded` / `aria-controls` on the drawer trigger,
 *     `aria-current` on active items, Escape-to-close, and body scroll lock
 *     while the drawer is open.
 */
export function Header({
  brandLogo,
  brandName = 'Turbocharger',
  navItems = [],
  activeId,
  onNavigate,
  isDark = true,
  onToggleTheme,
  onOpenResolverDrawer,
  version = 'v2.11.10 · a575396',
}) {
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Escape closes the drawer; lock body scroll while it is open.
  useEffect(() => {
    if (!isNavDrawerOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsNavDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isNavDrawerOpen]);

  const handleNavigate = (id) => {
    setIsNavDrawerOpen(false);
    onNavigate?.(id);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-background-100/90 backdrop-blur-md dark:border-neutral-800">
      <div className="mx-auto flex h-16 max-w-[1340px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        {/* Left cluster: drawer trigger, brand, desktop inline nav */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsNavDrawerOpen((prev) => !prev)}
            aria-expanded={isNavDrawerOpen}
            aria-controls="site-nav-drawer"
            aria-label="Toggle navigation panel"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-background-100 text-gray-900 transition-colors hover:text-gray-1000 cursor-pointer dark:border-neutral-800"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate(navItems[0]?.id ?? 'home')}
            className="flex min-w-0 items-center gap-2.5 text-left cursor-pointer"
            aria-label="Go to home"
          >
            {brandLogo}
            <span className="sidename truncate text-base sm:text-lg">{brandName}</span>
          </button>

          {/* Desktop inline nav: hidden below lg; tighter padding at lg–xl */}
          <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = activeId === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer xl:px-3 ${
                    active ? 'text-gray-1000' : 'text-gray-900 hover:text-gray-1000'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="turbocharger-header-nav-pill"
                      transition={SPRING}
                      className="absolute inset-0 -z-10 rounded-md border border-gray-200/80 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
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

        {/* Right cluster: collapse safely on small viewports */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenResolverDrawer}
            aria-label="Open resolver drawer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-background-200 px-3 text-xs font-medium text-gray-1000 transition-colors hover:border-[#FF1E56] cursor-pointer dark:border-neutral-800"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF1E56]" />
            <span className="hidden sm:inline">Resolver Drawer</span>
          </button>

          <span className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-background-200 px-2.5 py-1 font-mono text-xs text-gray-900 dark:border-neutral-800 xl:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF1E56]" />
            {version}
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-background-100 text-gray-900 transition-colors hover:text-gray-1000 cursor-pointer dark:border-neutral-800"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet slide-in navigation drawer */}
      <AnimatePresence>
        {isNavDrawerOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsNavDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            />
            <motion.nav
              key="nav-drawer"
              id="site-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={SPRING}
              aria-label="Site navigation"
              className="fixed top-0 left-0 bottom-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-background-100 p-5 shadow-2xl dark:border-neutral-800"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-800">
                <div className="flex min-w-0 items-center gap-2">
                  {brandLogo}
                  <span className="sidename truncate text-lg">{brandName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNavDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-md p-1 text-gray-800 hover:text-gray-1000 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-gray-100 text-gray-1000 dark:bg-neutral-800'
                          : 'text-gray-900 hover:bg-gray-100/60 hover:text-gray-1000 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 ${
                              active ? 'text-[#FF1E56]' : 'text-gray-700'
                            }`}
                          />
                        )}
                        {item.label}
                      </span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF1E56]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
