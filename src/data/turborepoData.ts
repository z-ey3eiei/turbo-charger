export interface FrameworkConfig {
  slug: string;
  name: string;
  envWildcards: string[];
  envConditionals?: Array<{
    when: { key: string; value: string };
    include: string[];
  }>;
  dependencyMatch: {
    strategy: 'all' | 'some';
    dependencies: string[];
  };
}

export interface WorkspacePackage {
  name: string;
  path: string;
  type: 'app' | 'package' | 'crate';
  framework?: string;
  tags: string[];
  dependencies: string[]; // internal workspace package names
  externalDeps: string[];
  scripts: Record<string, string>;
  files: Array<{ path: string; sizeBytes: number; hash: string }>;
  baseDurationMs: Record<string, number>;
}

export interface BoundaryRule {
  tag: string;
  allowDependenciesWithTags: string[];
  denyDependenciesWithTags: string[];
  description: string;
}

export interface TurboTaskConfig {
  dependsOn?: string[];
  inputs?: string[];
  outputs?: string[];
  env?: string[];
  cache?: boolean;
  persistent?: boolean;
  command?: string[] | { javascript?: string[] } | null;
}

export interface TurboJsonConfig {
  $schema: string;
  ui?: 'tui' | 'stream';
  noUpdateNotifier?: boolean;
  futureFlags?: {
    experimentalCargoWorkspaces?: boolean;
    experimentalTaskCommand?: boolean;
  };
  globalEnv?: string[];
  globalPassThroughEnv?: string[];
  tasks: Record<string, TurboTaskConfig>;
}

export interface MonorepoPreset {
  id: string;
  name: string;
  subtitle: string;
  version: string;
  packageManager: string;
  description: string;
  packages: WorkspacePackage[];
  turboJson: TurboJsonConfig;
  boundaryRules: BoundaryRule[];
  envVars: Record<string, string>;
}

// Exact 15 frameworks from packages/turbo-types/src/json/frameworks.json in z-ey3eiei/Turborepo
export const TURBO_FRAMEWORKS: FrameworkConfig[] = [
  {
    slug: 'astro',
    name: 'Astro',
    envWildcards: ['PUBLIC_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['astro'] },
  },
  {
    slug: 'blitzjs',
    name: 'Blitz',
    envWildcards: ['NEXT_PUBLIC_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['blitz'] },
  },
  {
    slug: 'create-react-app',
    name: 'Create React App',
    envWildcards: ['REACT_APP_*'],
    dependencyMatch: { strategy: 'some', dependencies: ['react-scripts', 'react-dev-utils'] },
  },
  {
    slug: 'expo',
    name: 'Expo',
    envWildcards: ['EXPO_PUBLIC_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['expo'] },
  },
  {
    slug: 'gatsby',
    name: 'Gatsby',
    envWildcards: ['GATSBY_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['gatsby'] },
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    envWildcards: ['NEXT_PUBLIC_*', 'NEXT_DEPLOYMENT_ID'],
    envConditionals: [
      {
        when: { key: 'VERCEL_SKEW_PROTECTION_ENABLED', value: '1' },
        include: ['VERCEL_DEPLOYMENT_ID'],
      },
    ],
    dependencyMatch: { strategy: 'all', dependencies: ['next'] },
  },
  {
    slug: 'nitro',
    name: 'Nitro',
    envWildcards: [
      'NITRO_*',
      'SERVER_*',
      'AWS_APP_ID',
      'INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN',
      'CLEAVR',
      'CF_PAGES',
      'FIREBASE_APP_HOSTING',
      'NETLIFY',
      'STORMKIT',
      'NOW_BUILDER',
      'ZEABUR',
      'RENDER',
    ],
    dependencyMatch: {
      strategy: 'some',
      dependencies: ['nitropack', 'nitropack-nightly', 'nitro', 'nitro-nightly'],
    },
  },
  {
    slug: 'nuxtjs',
    name: 'Nuxt.js',
    envWildcards: [
      'NUXT_*',
      'NUXT_ENV_*',
      'NITRO_*',
      'SERVER_*',
      'AWS_APP_ID',
      'CF_PAGES',
      'FIREBASE_APP_HOSTING',
      'NETLIFY',
      'RENDER',
      'LAUNCH_EDITOR',
    ],
    dependencyMatch: {
      strategy: 'some',
      dependencies: ['nuxt', 'nuxt-edge', 'nuxt3', 'nuxt3-edge'],
    },
  },
  {
    slug: 'redwoodjs',
    name: 'RedwoodJS',
    envWildcards: ['REDWOOD_ENV_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['@redwoodjs/core'] },
  },
  {
    slug: 'remix',
    name: 'Remix',
    envWildcards: ['REMIX_*'],
    dependencyMatch: {
      strategy: 'some',
      dependencies: ['@remix-run/dev', '@remix-run/react', '@remix-run/serve'],
    },
  },
  {
    slug: 'sanity',
    name: 'Sanity Studio',
    envWildcards: ['SANITY_STUDIO_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['@sanity/cli'] },
  },
  {
    slug: 'solidstart',
    name: 'Solid',
    envWildcards: ['VITE_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['solid-js', 'solid-start'] },
  },
  {
    slug: 'sveltekit',
    name: 'SvelteKit',
    envWildcards: ['VITE_*', 'PUBLIC_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['@sveltejs/kit'] },
  },
  {
    slug: 'vite',
    name: 'Vite',
    envWildcards: ['VITE_*'],
    dependencyMatch: { strategy: 'all', dependencies: ['vite'] },
  },
  {
    slug: 'vue',
    name: 'Vue',
    envWildcards: ['VUE_APP_*', 'LAUNCH_EDITOR'],
    dependencyMatch: { strategy: 'all', dependencies: ['@vue/cli-service'] },
  },
];

export const MONOREPO_PRESETS: MonorepoPreset[] = [
  {
    id: 'turbo-self',
    name: 'turbo-monorepo (v2.11.10)',
    subtitle: 'z-ey3eiei/Turborepo hybrid Rust + TypeScript workspace',
    version: '2.11.10',
    packageManager: 'pnpm@12.0.0',
    description:
      'The self-hosted Turborepo v2.11.10 repository combining Cargo crates, Next.js documentation and agent factory apps, and core @turbo/* npm packages.',
    envVars: {
      OS: 'linux',
      RUNNER_OS: 'Linux',
      NODE_VERSION: '22.15.0',
      NEXT_PUBLIC_DOCS_URL: 'https://turborepo.dev',
      VERCEL_SKEW_PROTECTION_ENABLED: '1',
      VERCEL_DEPLOYMENT_ID: 'dpl_turbo_2_11_10_9f8a',
      AI_GATEWAY_API_KEY: 'gw_live_98a7bc65',
    },
    boundaryRules: [
      {
        tag: 'core-types',
        allowDependenciesWithTags: ['core-types', 'config'],
        denyDependenciesWithTags: ['app', 'cli-plugin', 'rust-crate'],
        description: 'Foundational schema packages cannot depend on apps or CLI plugins.',
      },
      {
        tag: 'cli-plugin',
        allowDependenciesWithTags: ['core-types', 'shared-utils', 'config'],
        denyDependenciesWithTags: ['app'],
        description: 'CLI tools (@turbo/gen, @turbo/codemod, create-turbo) cannot import Next.js applications.',
      },
      {
        tag: 'app',
        allowDependenciesWithTags: ['core-types', 'shared-utils', 'cli-plugin', 'config'],
        denyDependenciesWithTags: [],
        description: 'Top-level applications can consume any workspace library.',
      },
    ],
    turboJson: {
      $schema: 'https://turborepo.dev/schema.json',
      ui: 'tui',
      noUpdateNotifier: true,
      futureFlags: {
        experimentalCargoWorkspaces: true,
        experimentalTaskCommand: true,
      },
      globalEnv: ['OS', 'RUNNER_OS'],
      globalPassThroughEnv: [
        'Path',
        'HOME',
        'TMPDIR',
        'SCCACHE_GHA_ENABLED',
        'CARGO_INCREMENTAL',
        'RUSTFLAGS',
      ],
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['dist/**/*', '.next/**/*', '!.next/cache/**/*'],
          cache: true,
        },
        test: {
          dependsOn: ['^build'],
          outputs: ['coverage/**/*'],
          env: ['NODE_VERSION'],
          cache: true,
        },
        'check-types': {
          dependsOn: ['^build'],
          command: { javascript: ['pnpm', 'exec', 'tsc', '--noEmit'] },
          cache: true,
        },
        lint: {
          dependsOn: [],
          inputs: ['$TURBO_DEFAULT$', '!pnpm-lock.yaml'],
          cache: true,
        },
        dev: {
          cache: false,
          persistent: true,
          env: ['AI_GATEWAY_API_KEY'],
        },
      },
    },
    packages: [
      {
        name: '@turbo/tsconfig',
        path: 'packages/tsconfig',
        type: 'package',
        tags: ['config'],
        dependencies: [],
        externalDeps: ['typescript'],
        scripts: {
          build: 'echo "tsconfig validated"',
          lint: 'oxlint .',
        },
        files: [
          { path: 'packages/tsconfig/base.json', sizeBytes: 620, hash: 'a10f92b' },
          { path: 'packages/tsconfig/library.json', sizeBytes: 410, hash: 'b24e81c' },
        ],
        baseDurationMs: { build: 180, lint: 140, test: 120, 'check-types': 110 },
      },
      {
        name: '@turbo/types',
        path: 'packages/turbo-types',
        type: 'package',
        tags: ['core-types'],
        dependencies: ['@turbo/tsconfig'],
        externalDeps: ['zod', 'json-schema-to-ts'],
        scripts: {
          build: 'tsc && node scripts/generate-schema.mjs',
          test: 'jest --passWithNoTests',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint src/',
        },
        files: [
          { path: 'packages/turbo-types/src/json/frameworks.json', sizeBytes: 3420, hash: 'f79c301' },
          { path: 'packages/turbo-types/src/types/config.ts', sizeBytes: 12840, hash: 'c91d44e' },
          { path: 'packages/turbo-types/schemas/schema.json', sizeBytes: 28900, hash: 'e48a012' },
        ],
        baseDurationMs: { build: 640, test: 420, 'check-types': 380, lint: 190 },
      },
      {
        name: '@turbo/utils',
        path: 'packages/turbo-utils',
        type: 'package',
        tags: ['shared-utils'],
        dependencies: ['@turbo/tsconfig', '@turbo/types'],
        externalDeps: ['picocolors', 'semver', 'execa'],
        scripts: {
          build: 'tsdown src/index.ts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint src/',
        },
        files: [
          { path: 'packages/turbo-utils/src/logger.ts', sizeBytes: 2150, hash: 'd38b119' },
          { path: 'packages/turbo-utils/src/getTurboRoot.ts', sizeBytes: 3890, hash: '992a7f0' },
        ],
        baseDurationMs: { build: 720, test: 610, 'check-types': 440, lint: 210 },
      },
      {
        name: '@turbo/workspaces',
        path: 'packages/turbo-workspaces',
        type: 'package',
        tags: ['shared-utils'],
        dependencies: ['@turbo/utils', '@turbo/types'],
        externalDeps: ['fs-extra', 'yaml'],
        scripts: {
          build: 'tsdown src/index.ts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint src/',
        },
        files: [
          { path: 'packages/turbo-workspaces/src/managers/pnpm.ts', sizeBytes: 6420, hash: '44b8e21' },
          { path: 'packages/turbo-workspaces/src/managers/npm.ts', sizeBytes: 5110, hash: '71c9a04' },
        ],
        baseDurationMs: { build: 890, test: 780, 'check-types': 490, lint: 240 },
      },
      {
        name: '@turbo/codemod',
        path: 'packages/turbo-codemod',
        type: 'package',
        tags: ['cli-plugin'],
        dependencies: ['@turbo/utils', '@turbo/workspaces', '@turbo/types'],
        externalDeps: ['commander', 'inquirer'],
        scripts: {
          build: 'tsdown src/cli.ts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint src/',
        },
        files: [
          { path: 'packages/turbo-codemod/src/transforms/rename-pipeline-to-tasks.ts', sizeBytes: 4210, hash: '88f12c3' },
          { path: 'packages/turbo-codemod/src/transforms/migrate-env-var-dependencies.ts', sizeBytes: 3980, hash: '52e90a1' },
        ],
        baseDurationMs: { build: 950, test: 1120, 'check-types': 530, lint: 280 },
      },
      {
        name: 'create-turbo',
        path: 'packages/create-turbo',
        type: 'package',
        tags: ['cli-plugin'],
        dependencies: ['@turbo/utils', '@turbo/workspaces', '@turbo/codemod'],
        externalDeps: ['commander', 'picocolors', 'tar'],
        scripts: {
          build: 'tsdown src/index.ts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint src/',
        },
        files: [
          { path: 'packages/create-turbo/src/commands/create/index.ts', sizeBytes: 8410, hash: '19c4b88' },
          { path: 'packages/create-turbo/src/transforms/official-starter.ts', sizeBytes: 3120, hash: '67a0d22' },
        ],
        baseDurationMs: { build: 840, test: 910, 'check-types': 460, lint: 230 },
      },
      {
        name: 'turborepo-crates',
        path: 'crates/turborepo',
        type: 'crate',
        tags: ['rust-crate'],
        dependencies: ['@turbo/types'],
        externalDeps: ['tokio', 'clap', 'serde', 'reqwest', 'wax', 'petgraph'],
        scripts: {
          build: 'cargo build --package turbo',
          test: 'cargo nextest run --workspace --exclude turborepo-lsp',
          lint: 'cargo clippy --workspace -- -D warnings',
        },
        files: [
          { path: 'crates/turborepo-lib/src/run/mod.rs', sizeBytes: 18420, hash: '77e39f1' },
          { path: 'crates/turborepo-task-graph/src/lib.rs', sizeBytes: 9840, hash: '23b10d4' },
          { path: 'crates/turborepo-task-hash/src/lib.rs', sizeBytes: 14210, hash: '55a8c90' },
        ],
        baseDurationMs: { build: 2450, test: 1980, lint: 1320, 'check-types': 640 },
      },
      {
        name: 'docs',
        path: 'apps/docs',
        type: 'app',
        framework: 'nextjs',
        tags: ['app'],
        dependencies: ['@turbo/types', '@turbo/utils'],
        externalDeps: ['next', 'react', 'fumadocs-core', 'fumadocs-ui', 'shiki'],
        scripts: {
          build: 'next build',
          test: 'node --experimental-strip-types ../../docs/link-checker/src/validate-docs-links.ts',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint app/ components/',
          dev: 'next dev --port 3000',
        },
        files: [
          { path: 'apps/docs/next.config.ts', sizeBytes: 16826, hash: '30f9a11' },
          { path: 'apps/docs/content/docs/reference/configuration.mdx', sizeBytes: 24510, hash: '81d4e72' },
          { path: 'apps/docs/geistdocs.tsx', sizeBytes: 4133, hash: '92b7c05' },
        ],
        baseDurationMs: { build: 2180, test: 840, 'check-types': 920, lint: 390 },
      },
      {
        name: 'examples-agent',
        path: 'apps/factory',
        type: 'app',
        framework: 'nextjs',
        tags: ['app'],
        dependencies: ['@turbo/types', '@turbo/workspaces', 'create-turbo'],
        externalDeps: ['next', 'react', '@xterm/xterm', 'streamdown', 'zod'],
        scripts: {
          build: 'eve build && next build',
          test: 'node --experimental-strip-types --test tests/*.test.mjs',
          'check-types': 'tsc --noEmit',
          lint: 'oxlint app/ agent/',
          dev: 'next dev',
        },
        files: [
          { path: 'apps/factory/agent/workflow.ts', sizeBytes: 9120, hash: '64c8e19' },
          { path: 'apps/factory/app/page.tsx', sizeBytes: 6840, hash: '12a3f80' },
        ],
        baseDurationMs: { build: 1890, test: 760, 'check-types': 780, lint: 310 },
      },
    ],
  },
  {
    id: 'kitchen-sink',
    name: 'examples/kitchen-sink',
    subtitle: 'Multi-framework full-stack monorepo (Next.js, Remix, Vite, Express)',
    version: '2.11.10',
    packageManager: 'pnpm@10.6.0',
    description:
      'Polyglot web monorepo demonstrating shared UI components, isomorphic logger, and strict TypeScript pipelines across Next.js, Remix, Vite SPA, and Express.',
    envVars: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_API_URL: 'https://api.example.com',
      VITE_ADMIN_ENDPOINT: 'https://api.example.com/admin',
      REMIX_PUBLIC_CDN: 'https://cdn.example.com',
    },
    boundaryRules: [
      {
        tag: 'ui-primitive',
        allowDependenciesWithTags: ['config', 'logger'],
        denyDependenciesWithTags: ['app', 'backend-service'],
        description: 'UI component primitives must remain pure and cannot import apps or backend services.',
      },
      {
        tag: 'frontend-app',
        allowDependenciesWithTags: ['ui-primitive', 'logger', 'config'],
        denyDependenciesWithTags: ['backend-service'],
        description: 'Frontend apps cannot directly bundle the Express API server code.',
      },
    ],
    turboJson: {
      $schema: 'https://turborepo.dev/schema.json',
      ui: 'tui',
      globalEnv: ['NODE_ENV'],
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['dist/**', '.next/**', '!.next/cache/**', 'build/**'],
          cache: true,
        },
        test: {
          dependsOn: ['^build'],
          outputs: ['coverage/**'],
          cache: true,
        },
        'check-types': {
          dependsOn: ['^build'],
          cache: true,
        },
        lint: {
          dependsOn: ['^build'],
          cache: true,
        },
        dev: {
          cache: false,
          persistent: true,
        },
      },
    },
    packages: [
      {
        name: '@repo/typescript-config',
        path: 'packages/typescript-config',
        type: 'package',
        tags: ['config'],
        dependencies: [],
        externalDeps: ['typescript'],
        scripts: { build: 'echo "ok"', lint: 'eslint .' },
        files: [{ path: 'packages/typescript-config/base.json', sizeBytes: 512, hash: '101a202' }],
        baseDurationMs: { build: 120, lint: 110, test: 100, 'check-types': 100 },
      },
      {
        name: '@repo/logger',
        path: 'packages/logger',
        type: 'package',
        tags: ['logger'],
        dependencies: ['@repo/typescript-config'],
        externalDeps: ['tsup'],
        scripts: {
          build: 'tsup src/index.ts --format cjs,esm --dts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'eslint src/',
        },
        files: [{ path: 'packages/logger/src/index.ts', sizeBytes: 1120, hash: '303c404' }],
        baseDurationMs: { build: 520, test: 410, 'check-types': 290, lint: 180 },
      },
      {
        name: '@repo/ui',
        path: 'packages/ui',
        type: 'package',
        tags: ['ui-primitive'],
        dependencies: ['@repo/typescript-config', '@repo/logger'],
        externalDeps: ['react', 'react-dom', 'tsup'],
        scripts: {
          build: 'tsup src/index.tsx --format esm,cjs --dts --external react',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'eslint src/',
        },
        files: [
          { path: 'packages/ui/src/counter-button.tsx', sizeBytes: 1840, hash: '505e606' },
          { path: 'packages/ui/src/link.tsx', sizeBytes: 980, hash: '707f808' },
        ],
        baseDurationMs: { build: 790, test: 540, 'check-types': 360, lint: 220 },
      },
      {
        name: 'api',
        path: 'apps/api',
        type: 'app',
        tags: ['backend-service'],
        dependencies: ['@repo/logger', '@repo/typescript-config'],
        externalDeps: ['express', 'cors', 'tsup'],
        scripts: {
          build: 'tsup src/index.ts',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'eslint src/',
        },
        files: [{ path: 'apps/api/src/server.ts', sizeBytes: 2640, hash: '909a111' }],
        baseDurationMs: { build: 680, test: 590, 'check-types': 340, lint: 210 },
      },
      {
        name: 'storefront',
        path: 'apps/storefront',
        type: 'app',
        framework: 'nextjs',
        tags: ['frontend-app'],
        dependencies: ['@repo/ui', '@repo/logger', '@repo/typescript-config'],
        externalDeps: ['next', 'react', 'react-dom'],
        scripts: {
          build: 'next build',
          test: 'jest',
          'check-types': 'tsc --noEmit',
          lint: 'eslint app/',
        },
        files: [{ path: 'apps/storefront/src/app/page.tsx', sizeBytes: 3120, hash: 'b12c314' }],
        baseDurationMs: { build: 1850, test: 620, 'check-types': 710, lint: 290 },
      },
      {
        name: 'blog',
        path: 'apps/blog',
        type: 'app',
        framework: 'remix',
        tags: ['frontend-app'],
        dependencies: ['@repo/ui', '@repo/logger', '@repo/typescript-config'],
        externalDeps: ['@remix-run/react', '@remix-run/dev', 'react'],
        scripts: {
          build: 'remix vite:build',
          test: 'vitest run',
          'check-types': 'tsc --noEmit',
          lint: 'eslint app/',
        },
        files: [{ path: 'apps/blog/app/routes/_index.tsx', sizeBytes: 2890, hash: 'd15e617' }],
        baseDurationMs: { build: 1420, test: 530, 'check-types': 610, lint: 250 },
      },
      {
        name: 'admin',
        path: 'apps/admin',
        type: 'app',
        framework: 'vite',
        tags: ['frontend-app'],
        dependencies: ['@repo/ui', '@repo/logger', '@repo/typescript-config'],
        externalDeps: ['vite', 'react', 'react-dom'],
        scripts: {
          build: 'tsc && vite build',
          test: 'vitest run',
          'check-types': 'tsc --noEmit',
          lint: 'eslint src/',
        },
        files: [{ path: 'apps/admin/src/App.tsx', sizeBytes: 2410, hash: 'f18a920' }],
        baseDurationMs: { build: 1120, test: 480, 'check-types': 520, lint: 230 },
      },
    ],
  },
  {
    id: 'with-microfrontends',
    name: 'examples/with-microfrontends',
    subtitle: 'Turborepo local microfrontends proxy & vertical slice architecture',
    version: '2.11.10',
    packageManager: 'pnpm@10.6.0',
    description:
      'Vertical microfrontend slices routed through turborepo-microfrontends-proxy with shared design tokens and isolated deployment units.',
    envVars: {
      NEXT_PUBLIC_MFE_PROXY_PORT: '3024',
      VITE_CHECKOUT_STRIPE_PUBLIC_KEY: 'pk_test_51Nq92x',
    },
    boundaryRules: [
      {
        tag: 'mfe-slice',
        allowDependenciesWithTags: ['design-system', 'mfe-config'],
        denyDependenciesWithTags: ['mfe-slice'],
        description: 'Microfrontend vertical slices must be independent and cannot import other MFE slices.',
      },
    ],
    turboJson: {
      $schema: 'https://turborepo.dev/schema.json',
      ui: 'tui',
      tasks: {
        build: {
          dependsOn: ['^build'],
          outputs: ['.next/**', 'dist/**'],
          cache: true,
        },
        test: {
          dependsOn: ['^build'],
          cache: true,
        },
        'check-types': {
          dependsOn: ['^build'],
          cache: true,
        },
        lint: {
          cache: true,
        },
      },
    },
    packages: [
      {
        name: '@mfe/design-tokens',
        path: 'packages/design-tokens',
        type: 'package',
        tags: ['design-system'],
        dependencies: [],
        externalDeps: ['style-dictionary'],
        scripts: { build: 'style-dictionary build', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint .' },
        files: [{ path: 'packages/design-tokens/tokens.json', sizeBytes: 4120, hash: '7a11b22' }],
        baseDurationMs: { build: 410, test: 220, 'check-types': 190, lint: 140 },
      },
      {
        name: '@mfe/config',
        path: 'packages/microfrontends-config',
        type: 'package',
        tags: ['mfe-config'],
        dependencies: [],
        externalDeps: ['@vercel/microfrontends'],
        scripts: { build: 'tsc', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint .' },
        files: [{ path: 'packages/microfrontends-config/microfrontends.json', sizeBytes: 1840, hash: '8c33d44' }],
        baseDurationMs: { build: 340, test: 210, 'check-types': 180, lint: 130 },
      },
      {
        name: '@mfe/ui-kit',
        path: 'packages/ui',
        type: 'package',
        tags: ['design-system'],
        dependencies: ['@mfe/design-tokens'],
        externalDeps: ['react', 'tailwindcss'],
        scripts: { build: 'tsup src/index.tsx', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint src/' },
        files: [{ path: 'packages/ui/src/ShellHeader.tsx', sizeBytes: 3290, hash: '9e55f66' }],
        baseDurationMs: { build: 690, test: 430, 'check-types': 310, lint: 190 },
      },
      {
        name: 'web-shell',
        path: 'apps/web',
        type: 'app',
        framework: 'nextjs',
        tags: ['mfe-slice'],
        dependencies: ['@mfe/ui-kit', '@mfe/config'],
        externalDeps: ['next', 'react', '@vercel/microfrontends'],
        scripts: { build: 'next build', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint app/' },
        files: [{ path: 'apps/web/app/layout.tsx', sizeBytes: 2740, hash: '1b77a88' }],
        baseDurationMs: { build: 1640, test: 510, 'check-types': 640, lint: 260 },
      },
      {
        name: 'docs-slice',
        path: 'apps/docs',
        type: 'app',
        framework: 'nextjs',
        tags: ['mfe-slice'],
        dependencies: ['@mfe/ui-kit', '@mfe/config'],
        externalDeps: ['next', 'react'],
        scripts: { build: 'next build', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint app/' },
        files: [{ path: 'apps/docs/app/docs/page.tsx', sizeBytes: 3110, hash: '2c88b99' }],
        baseDurationMs: { build: 1520, test: 490, 'check-types': 590, lint: 240 },
      },
      {
        name: 'checkout-slice',
        path: 'apps/checkout',
        type: 'app',
        framework: 'vite',
        tags: ['mfe-slice'],
        dependencies: ['@mfe/ui-kit', '@mfe/config'],
        externalDeps: ['vite', 'react'],
        scripts: { build: 'vite build', test: 'vitest run', 'check-types': 'tsc --noEmit', lint: 'oxlint src/' },
        files: [{ path: 'apps/checkout/src/CheckoutFlow.tsx', sizeBytes: 4210, hash: '3d99c00' }],
        baseDurationMs: { build: 1180, test: 460, 'check-types': 470, lint: 210 },
      },
    ],
  },
];

export interface CrateEntry {
  name: string;
  path: string;
  category:
    | 'Execution & Task Graph'
    | 'Caching & Content Hashing'
    | 'Workspaces & Lockfiles'
    | 'Developer Experience & TUI'
    | 'Query, Boundaries & AI';
  description: string;
  keyModules: string[];
}

export const TURBOREPO_CRATES: CrateEntry[] = [
  {
    name: 'turborepo-task-graph',
    path: 'crates/turborepo-task-graph',
    category: 'Execution & Task Graph',
    description: 'Constructs and validates the Directed Acyclic Graph (DAG) of package tasks, resolving topological ^dependencies and detecting cycles.',
    keyModules: ['Visitor', 'TaskGraph', 'CycleDetector'],
  },
  {
    name: 'turborepo-task-executor',
    path: 'crates/turborepo-task-executor',
    category: 'Execution & Task Graph',
    description: 'Executes individual task nodes with concurrency semaphores, child process spawning, environment injection, and log output capturing.',
    keyModules: ['TaskExecutor', 'ExecContext', 'CommandFactory'],
  },
  {
    name: 'turborepo-engine',
    path: 'crates/turborepo-engine',
    category: 'Execution & Task Graph',
    description: 'Core execution state machine coordinating task definitions, persistent task lifecycles, and topological traversal waves.',
    keyModules: ['Engine', 'Builder', 'ExecutionOptions'],
  },
  {
    name: 'turborepo-task-hash',
    path: 'crates/turborepo-task-hash',
    category: 'Caching & Content Hashing',
    description: 'Computes deterministic SHA-256 task hashes combining package file git-hashes, framework envWildcards, global hashes, and upstream task hashes.',
    keyModules: ['TaskHasher', 'TaskHashTracker', 'PackageInputsHashes'],
  },
  {
    name: 'turborepo-cache',
    path: 'crates/turborepo-cache',
    category: 'Caching & Content Hashing',
    description: 'Multiplexed async cache layer coordinating local filesystem tarballs (.turbo/cache) and HTTP Remote Cache artifact uploads/downloads.',
    keyModules: ['AsyncCache', 'FSache', 'HTTPCache', 'CacheMetadata'],
  },
  {
    name: 'turborepo-scm',
    path: 'crates/turborepo-scm',
    category: 'Caching & Content Hashing',
    description: 'High-speed Git integration using gitstatus and libgit2 to hash working tree files, untrack ignored paths, and resolve [HEAD^1] diffs.',
    keyModules: ['GitRepo', 'PackageDeps', 'Status'],
  },
  {
    name: 'turborepo-lockfiles',
    path: 'crates/turborepo-lockfiles',
    category: 'Workspaces & Lockfiles',
    description: 'Parses and subgraphs pnpm-lock.yaml, package-lock.json, yarn.lock (v1 & Berry v4 catalogs), and bun.lock for transitive closure calculation.',
    keyModules: ['Lockfile', 'PnpmLockfile', 'NpmLockfile', 'BunLockfile'],
  },
  {
    name: 'turborepo-repository',
    path: 'crates/turborepo-repository',
    category: 'Workspaces & Lockfiles',
    description: 'Discovers package managers, workspace globs, and experimental Cargo workspaces (v2.11.10) across polyglot monorepos.',
    keyModules: ['PackageGraph', 'PackageManager', 'Discovery'],
  },
  {
    name: 'turborepo-turbo-json',
    path: 'crates/turborepo-turbo-json',
    category: 'Workspaces & Lockfiles',
    description: 'Parses JSONC turbo.json configurations with span-accurate diagnostics, futureFlags validation, and package-level config merging.',
    keyModules: ['RawTurboJson', 'TurboJson', 'FutureFlags'],
  },
  {
    name: 'turborepo-ui',
    path: 'crates/turborepo-ui',
    category: 'Developer Experience & TUI',
    description: 'Interactive terminal user interface (TUI) powered by ratatui and libghostty-vt-sys for multiplexing parallel task streams and stdin.',
    keyModules: ['TerminalApp', 'TaskPane', 'LogSink'],
  },
  {
    name: 'turborepo-ghostty',
    path: 'crates/turborepo-ghostty',
    category: 'Developer Experience & TUI',
    description: 'Rust bindings around Ghostty virtual terminal emulation (libghostty-vt-sys) for zero-copy ANSI escape sequence rendering in the TUI.',
    keyModules: ['GhosttyScreen', 'VtParser'],
  },
  {
    name: 'turborepo-microfrontends-proxy',
    path: 'crates/turborepo-microfrontends-proxy',
    category: 'Developer Experience & TUI',
    description: 'Built-in local development reverse proxy routing path groups across independent Next.js and Vite microfrontend applications.',
    keyModules: ['ProxyServer', 'RouteMatcher'],
  },
  {
    name: 'turborepo-boundaries',
    path: 'crates/turborepo-boundaries',
    category: 'Query, Boundaries & AI',
    description: 'Static AST and dependency graph analyzer enforcing package tag rules and preventing cross-package relative file imports.',
    keyModules: ['BoundariesChecker', 'TagRules', 'ImportFinder'],
  },
  {
    name: 'turborepo-query',
    path: 'crates/turborepo-query',
    category: 'Query, Boundaries & AI',
    description: 'Async-GraphQL schema server exposing packages, tasks, file AST dependencies, and reverse dependency chains via `turbo query`.',
    keyModules: ['QuerySchema', 'RepositoryQuery', 'PackageObject'],
  },
  {
    name: 'turborepo-ai-agents',
    path: 'crates/turborepo-ai-agents',
    category: 'Query, Boundaries & AI',
    description: 'Agentic context detection and bundled documentation discovery (node_modules/turbo/docs/README.md) tailored for coding agents.',
    keyModules: ['AgentEnv', 'SkillsIndex'],
  },
];

export interface DocGuideEntry {
  title: string;
  docPath: string;
  category: 'Core Concepts' | 'Crafting Your Repository' | 'CLI & Reference';
  summary: string;
  cliExample: string;
  keyRules: string[];
}

export const TURBOREPO_DOCS_INDEX: DocGuideEntry[] = [
  {
    title: 'Package and Task Graph',
    docPath: 'core-concepts/package-and-task-graph.mdx',
    category: 'Core Concepts',
    summary:
      'Turborepo constructs a Package Graph from your package manager workspaces, then layers task dependencies (such as ^build) on top to create a parallelized Task Graph.',
    cliExample: 'turbo run build --graph=task-graph.svg',
    keyRules: [
      '"^build" runs build in all upstream workspace dependencies before running build in the dependent package.',
      '"topo" is a synthetic task with dependsOn: ["^topo"] to invalidate cache when internal dependency source files change without requiring a build step.',
      'Package-specific tasks like "docs#lint" override root task definitions for targeted workspaces.',
    ],
  },
  {
    title: 'Caching & Hash Inputs',
    docPath: 'crafting-your-repository/caching.mdx',
    category: 'Crafting Your Repository',
    summary:
      'Every task execution is fingerprinted using package file contents, task configuration, environment variables, and upstream dependency hashes.',
    cliExample: 'turbo run build --summarize --dry=json',
    keyRules: [
      'Always declare task file outputs (e.g. ["dist/**", ".next/**", "!.next/cache/**"]) so Turborepo can restore build artifacts on a cache hit.',
      'Use "$TURBO_DEFAULT$" inside inputs array to preserve default git-tracked file hashing while adding or excluding specific files.',
      'Use "$TURBO_ROOT$/version.txt" to include repository-root files in individual package task hashes.',
    ],
  },
  {
    title: 'Using Environment Variables & Framework Inference',
    docPath: 'crafting-your-repository/using-environment-variables.mdx',
    category: 'Crafting Your Repository',
    summary:
      'Turborepo automatically detects 15 popular frameworks (Next.js, Vite, Astro, Remix, etc.) and includes their public prefix wildcards (e.g. NEXT_PUBLIC_*, VITE_*) in the task hash.',
    cliExample: 'turbo run build --env-mode=strict',
    keyRules: [
      'Strict env mode (default in v2) filters environment variables passed to task processes to only those listed in env, globalEnv, globalPassThroughEnv, and system variables.',
      'Framework Inference automatically hashes NEXT_PUBLIC_*, VITE_*, EXPO_PUBLIC_*, and PUBLIC_* for matching packages.',
      'Add .env files to task inputs (e.g. ["$TURBO_DEFAULT$", ".env*"]) so file changes invalidate the cache.',
    ],
  },
  {
    title: 'Enforcing Package Boundaries',
    docPath: 'reference/boundaries.mdx',
    category: 'CLI & Reference',
    summary:
      'Prevent architectural drift by ensuring packages only import declared dependencies and adhere to tag-based access control rules.',
    cliExample: 'turbo boundaries',
    keyRules: [
      'Detects relative imports that escape a package root directory (e.g. import "../../other-pkg/src").',
      'Verifies that every imported package is explicitly declared in the importing package.json dependencies.',
      'Enforces tag allowlists and denylists defined in turbo.json boundaries configuration.',
    ],
  },
  {
    title: 'Querying the Monorepo with GraphQL',
    docPath: 'reference/query.mdx',
    category: 'CLI & Reference',
    summary:
      'Inspect package relationships, trace why a package is included, or find affected packages in CI using the built-in GraphQL engine.',
    cliExample: 'turbo query "{ packages { items { name path } } }"',
    keyRules: [
      'Run interactive GraphiQL explorer locally or pass a GraphQL query string directly via CLI.',
      'Filter packages using predicates like has(field: NAME, value: "@turbo/types") or downstream dependencies.',
      'Ideal for custom CI matrix generation and architectural auditing.',
    ],
  },
  {
    title: 'Experimental v2.11.10 Future Flags',
    docPath: 'reference/configuration.mdx',
    category: 'CLI & Reference',
    summary:
      'Turborepo v2.11.10 introduces first-class Cargo workspace integration and inline task command arrays directly inside turbo.json.',
    cliExample: 'turbo run turborepo-crates#test //#quality',
    keyRules: [
      'futureFlags.experimentalCargoWorkspaces: Discovers Rust Cargo.toml members alongside npm/pnpm workspaces.',
      'futureFlags.experimentalTaskCommand: Allows defining "command": ["cargo", "nextest", "run"] directly on tasks in turbo.json without needing a package.json script.',
      'ui: "tui" enables the Ghostty-powered terminal UI with interactive stdin support and scrollable task logs.',
    ],
  },
];
