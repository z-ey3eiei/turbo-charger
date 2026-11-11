
import { useState } from 'react';

const DEFAULT_COLUMNS = [
  { id: 'name', label: 'Product' },
  { id: 'category', label: 'Category' },
  { id: 'stock', label: 'Stock', align: 'right' },
  { id: 'price', label: 'Price', align: 'right' },
];

const SAMPLE_PRODUCTS = [
  {
    id: 'p-1',
    name: 'Turbocharger Resolver CLI',
    category: 'Tooling',
    stock: 42,
    price: 149,
    description:
      'Resolves task graphs across workspaces and exposes them to the quick drawer.',
  },
  {
    id: 'p-2',
    name: 'Remote Cache Gauge Module',
    category: 'Telemetry',
    stock: 128,
    price: 89,
    description:
      'Visualizes cache-hit ratios and compute hours saved per pipeline run.',
  },
  {
    id: 'p-3',
    name: 'Boundaries & Query Explorer',
    category: 'Analysis',
    stock: 17,
    price: 199,
    description:
      'Inspects workspace boundaries and turbo query results without leaving the app.',
  },
  {
    id: 'p-4',
    name: 'Factory Sandbox Runtime',
    category: 'Runtime',
    stock: 64,
    price: 249,
    description:
      'Sandboxes monorepo tasks with the OpenAI SDK for reproducible agent runs.',
  },
  {
    id: 'p-5',
    name: 'Devtools Task Graph Kit',
    category: 'Devtools',
    stock: 33,
    price: 129,
    description:
      'Interactive DAG visualization with per-task cache status and elapsed times.',
  },
  {
    id: 'p-6',
    name: 'Agent Skills Pack',
    category: 'Agents',
    stock: 512,
    price: 49,
    description:
      'Bundle of Turborepo best-practice skills that coding agents load on demand.',
  },
];

/**
 * Responsive product table/grid.
 *
 * Responsive design decisions (fixes for the issues found at docs.ai-sdk.pro):
 *
 *  1. Desktop (lg+): a semantic <table> with `whitespace-nowrap` only on short
 *     numeric/categorical cells and a truncated product-name cell, so rows never
 *     stretch the layout; the table region scrolls independently if it ever
 *     needs to, instead of pushing the page width.
 *
 *  2. Below lg: the table never appears on phones. Each row re-renders as a
 *     stacked card, eliminating the double horizontal scroll (page + table)
 *     that the current fixed-width grid produces on small screens.
 *
 *  3. The card grid uses `auto-fill` + `minmax(min(100%, 260px), 1fr)`, so
 *     columns adapt fluidly to any viewport instead of snapping at fixed
 *     breakpoints; `min-w-0` on every flex/grid child prevents long
 *     unbroken content from blowing out the track.
 *
 *  4. Copy is `line-clamp`-ed, prices use `tabular-nums` and are formatted
 *     with Intl.NumberFormat, and touch targets are at least 32px.
 */
export function ProductGrid({
  products = SAMPLE_PRODUCTS,
  columns = DEFAULT_COLUMNS,
  onRowAction,
}) {
  const [busyId, setBusyId] = useState(null);

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const handleAction = (product) => {
    if (onRowAction) {
      setBusyId(product.id);
      Promise.resolve(onRowAction(product)).finally(() => setBusyId(null));
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-700 dark:border-neutral-800">
        No products to display.
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Desktop: semantic table (lg and up) */}
      <div className="hidden w-full min-w-0 overflow-x-auto rounded-xl border border-gray-300 bg-background-100 shadow-(--ds-shadow-border-small) lg:block dark:border-neutral-800">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-neutral-800">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={`px-4 py-3 text-left font-medium text-gray-900 ${
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-200 transition-colors last:border-0 hover:bg-gray-100 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
              >
                <td className="max-w-[320px] px-4 py-3 min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-r from-[#FF1E56] to-[#0096FF]"
                    />
                    <span className="truncate font-medium text-gray-1000">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                  {product.category}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-900">
                  {product.stock}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-gray-1000">
                  {formatPrice(product.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet: fluid auto-fill card grid (below lg) */}
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4 p-0 lg:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex min-w-0 flex-col gap-3 rounded-xl border border-gray-300 bg-background-100 p-4 shadow-(--ds-shadow-border-small) dark:border-neutral-800"
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-medium text-gray-1000">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-xs tracking-wide text-gray-700 uppercase">
                  {product.category}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 font-mono text-xs text-gray-900 dark:bg-neutral-800">
                x{product.stock}
              </span>
            </div>

            <p className="line-clamp-2 text-sm text-gray-900">
              {product.description}
            </p>

            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <span className="font-medium tabular-nums text-gray-1000">
                {formatPrice(product.price)}
              </span>
              <button
                type="button"
                onClick={() => handleAction(product)}
                disabled={busyId === product.id}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-1000 transition-colors hover:border-[#FF1E56] disabled:opacity-60 cursor-pointer dark:border-neutral-700"
              >
                {busyId === product.id ? 'Working…' : 'View details'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductGrid;
