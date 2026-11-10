# ⚡ turbo-charger

> High-performance CLI & Node.js Engine for Turborepo Monorepo Acceleration, Deterministic DAG Resolution, and Remote Cache Diagnostics.

[![npm version](https://img.shields.io/badge/npm-v1.0.0-cb3837.svg)](https://www.npmjs.com/package/turbo-charger)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Installation

Install globally via npm:

```bash
npm install -g turbo-charger
```

Or run directly without installation via **npx**:

```bash
npx turbo-charger --help
```

Or add to your Turborepo project dependencies:

```bash
npm install turbo-charger --save-dev
```

---

## 🛠️ CLI Usage

```bash
# Resolve any workspace package, internal crate, or route specifier
turbo-charger resolve @repo/ui/button

# Compute deterministic 64-bit FNV/SHA remote cache digest for any task
turbo-charger hash build web

# Audit workspace dependency tags against boundary constraints
turbo-charger audit

# Run Turborepo & Turbocharger full monorepo health diagnostics
turbo-charger diag

# View package info & registry metadata
turbo-charger info
```

---

## 💻 Node.js / JavaScript SDK

You can import and use Turbocharger programmatically in your Node.js server or build scripts:

```javascript
import {
  resolveTaskGraph,
  calculateRemoteCacheHash,
  auditBoundaries,
  runTurboDiagnostics,
} from 'turbo-charger';

// 1. Resolve workspace DAG
const resolution = resolveTaskGraph('@repo/ui/button');
console.log('Resolved path:', resolution.resolvedFilePath);
console.log('Artifact hash:', resolution.cacheSignature);

// 2. Compute remote cache hash
const hash = calculateRemoteCacheHash('build', 'web');
console.log('Deterministic Remote Cache Digest:', hash);

// 3. Audit tag boundaries
const audit = auditBoundaries();
console.log('Boundary violations:', audit.violations.length);
```

---

## 📦 Features

- **⚡ Sub-Millisecond Specifier Resolution**: Resolves workspace exports, tsconfig paths, and Cargo crates in < 0.45ms.
- **🛡️ Boundary Tag Enforcement**: Automatically audits tag isolation rules between apps and packages.
- **🔁 Remote Cache Replay**: Deterministic 64-bit FNV/SHA hashing compatible with Vercel Remote Cache.
- **⚙️ Integrated Server Tools**: Pairs directly with Turbocharger Express server suite.

---

## 📄 License

MIT © Turbocharger Team
