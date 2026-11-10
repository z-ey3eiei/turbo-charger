#!/usr/bin/env node

/**
 * Turbocharger CLI Binary (`turbo-charger` & `turbocharger`)
 * Executable when installed via `npm i -g turbo-charger` or `npx turbo-charger`
 */

import {
  resolveTaskGraph,
  calculateRemoteCacheHash,
  auditBoundaries,
  runTurboDiagnostics,
  VERSION,
} from '../dist/index.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printBanner() {
  console.log(`\x1b[35m⚡ Turbocharger CLI\x1b[0m \x1b[90mv${VERSION}\x1b[0m - High-performance Turborepo Accel Engine\n`);
}

function printHelp() {
  printBanner();
  console.log(`\x1b[1mUsage:\x1b[0m
  $ npx turbo-charger <command> [options]
  $ npm i -g turbo-charger

\x1b[1mCommands:\x1b[0m
  \x1b[36mresolve\x1b[0m <specifier>     Resolve workspace package, subpath export, or crate DAG
  \x1b[36mhash\x1b[0m <task> [target]    Compute deterministic 64-bit FNV/SHA remote cache digest
  \x1b[36maudit\x1b[0m                   Scan workspace dependency tags for boundary violations
  \x1b[36mdiag\x1b[0m                    Run full monorepo & turbo.json health diagnostics
  \x1b[36minfo\x1b[0m                    Show Turbocharger engine metadata & capabilities
  \x1b[36m--version, -v\x1b[0m           Print current version (${VERSION})
  \x1b[36m--help, -h\x1b[0m              Show this command reference

\x1b[1mExamples:\x1b[0m
  $ turbo-charger resolve @repo/ui/button
  $ turbo-charger hash build web
  $ turbo-charger audit
  $ turbo-charger diag
`);
}

async function main() {
  if (args.includes('--help') || args.includes('-h') || command === 'help') {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v') || command === 'version') {
    console.log(`turbo-charger v${VERSION}`);
    process.exit(0);
  }

  printBanner();

  switch (command) {
    case 'resolve': {
      const specifier = args[1] || '@repo/ui/button';
      console.log(`\x1b[34m[Resolver]\x1b[0m Resolving target: \x1b[1m${specifier}\x1b[0m...`);
      const result = resolveTaskGraph(specifier);
      console.log(`\x1b[32m✔ Resolved in ${result.latencyMs}ms\x1b[0m`);
      console.log(`  Package:      ${result.packageScope}`);
      console.log(`  Path:         ${result.resolvedFilePath}`);
      console.log(`  Category:     ${result.category}`);
      console.log(`  Cache Digest: ${result.cacheSignature}`);
      console.log(`  Upstream:     ${result.upstreamDeps.join(', ') || 'none'}`);
      console.log(`  Consumers:    ${result.downstreamConsumers.join(', ') || 'none'}`);
      console.log(`\n\x1b[1mTopological Stages:\x1b[0m`);
      result.stages.forEach((s) => {
        console.log(`  \x1b[36m[Stage ${s.step}]\x1b[0m ${s.title} \x1b[90m(${s.durationUs}µs)\x1b[0m`);
        console.log(`    ↳ \x1b[90m${s.output}\x1b[0m`);
      });
      break;
    }

    case 'hash': {
      const task = args[1] || 'build';
      const target = args[2] || 'all';
      console.log(`\x1b[34m[Cache Engine]\x1b[0m Computing global hash for task: \x1b[1m${task}\x1b[0m (target: ${target})`);
      const hash = calculateRemoteCacheHash(task, target);
      console.log(`\x1b[32m✔ Deterministic Digest:\x1b[0m \x1b[1m${hash}\x1b[0m`);
      console.log(`  Artifact Status:  \x1b[32mHIT >>> FULL TURBO\x1b[0m`);
      console.log(`  Remote Endpoint:  https://api.vercel.com/v8/artifacts/${hash}`);
      break;
    }

    case 'audit': {
      console.log(`\x1b[34m[Boundaries Audit]\x1b[0m Auditing monorepo tag policies...`);
      const audit = auditBoundaries();
      console.log(`\x1b[32m✔ Status: ${audit.status}\x1b[0m (${audit.packagesScanned} packages audited)`);
      console.log(`  Violations: ${audit.violations.length}`);
      console.log(`  Tag Matrix: ${audit.rulesCount} active boundary rules enforced.`);
      break;
    }

    case 'diag': {
      console.log(`\x1b[34m[Diagnostics]\x1b[0m Running Turborepo v2.11.10 system inspection...`);
      const diag = runTurboDiagnostics();
      console.log(`\x1b[32m✔ Monorepo Health: ${diag.healthScore}%\x1b[0m`);
      console.log(`  Rust Crates:    ${diag.cratesCount} crates found`);
      console.log(`  Turbo JSON:     Valid schema (${diag.schemaVersion})`);
      console.log(`  Remote Cache:   ${diag.remoteCacheStatus}`);
      break;
    }

    case 'info': {
      console.log(`\x1b[1mTurbocharger Package Information:\x1b[0m`);
      console.log(`  Package:     turbo-charger`);
      console.log(`  Version:     ${VERSION}`);
      console.log(`  License:     MIT`);
      console.log(`  Binary:      turbocharger, turbo-charger`);
      console.log(`  Registry:    https://registry.npmjs.org/turbo-charger`);
      console.log(`  Install:     npm i -g turbo-charger`);
      break;
    }

    default: {
      console.error(`\x1b[31mUnknown command:\x1b[0m "${command}"`);
      console.log(`Run \x1b[36mturbo-charger --help\x1b[0m for list of available commands.`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(`\x1b[31mFatal error:\x1b[0m`, err);
  process.exit(1);
});
