import {
  BoundaryRule,
  FrameworkConfig,
  MonorepoPreset,
  TURBO_FRAMEWORKS,
  TurboJsonConfig,
  WorkspacePackage,
} from '../data/turborepoData';

export interface TaskNode {
  id: string; // e.g. "docs#build"
  packageName: string;
  packagePath: string;
  packageType: 'app' | 'package' | 'crate';
  taskName: string;
  scriptCommand: string;
  dependencies: string[]; // upstream TaskNode ids
  dependents: string[]; // downstream TaskNode ids
  wave: number; // topological depth level (0 = leaves)
  hash: string; // 16-char deterministic hex hash
  hashInputs: {
    fileHashSummary: string;
    upstreamTaskHashes: Array<{ taskId: string; hash: string }>;
    matchedFramework: string | null;
    inferredEnvVars: Array<{ key: string; value: string }>;
    explicitEnvVars: Array<{ key: string; value: string }>;
    globalEnvHash: string;
    taskConfigSignature: string;
  };
  estimatedDurationMs: number;
  cacheable: boolean;
  outputs: string[];
}

export interface TaskGraphResult {
  nodes: TaskNode[];
  waves: TaskNode[][];
  criticalPathIds: string[];
  criticalPathDurationMs: number;
  totalSequentialDurationMs: number;
  globalHash: string;
}

export interface BoundaryViolation {
  packageName: string;
  packagePath: string;
  packageTag: string;
  importedDependency: string;
  importedDependencyTag: string;
  ruleDescription: string;
  severity: 'error' | 'warning';
}

export interface ConfigDiagnostic {
  level: 'error' | 'warning' | 'info';
  path: string;
  message: string;
  fixableByCodemod?: string;
}

// Fast deterministic string -> hex hash (FNV-1a 64-bit style simulated in two 32-bit halves)
export function deterministicHexHash(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}`;
}

export function detectPackageFramework(pkg: WorkspacePackage): FrameworkConfig | null {
  if (pkg.framework) {
    const bySlug = TURBO_FRAMEWORKS.find((f) => f.slug === pkg.framework);
    if (bySlug) return bySlug;
  }
  for (const fw of TURBO_FRAMEWORKS) {
    if (fw.dependencyMatch.strategy === 'all') {
      if (fw.dependencyMatch.dependencies.every((d) => pkg.externalDeps.includes(d))) {
        return fw;
      }
    } else {
      if (fw.dependencyMatch.dependencies.some((d) => pkg.externalDeps.includes(d))) {
        return fw;
      }
    }
  }
  return null;
}

export function matchWildcardEnvVars(
  wildcards: string[],
  envVars: Record<string, string>,
  conditionals?: FrameworkConfig['envConditionals']
): Array<{ key: string; value: string }> {
  const effectivePatterns = [...wildcards];
  if (conditionals) {
    for (const cond of conditionals) {
      if (envVars[cond.when.key] === cond.when.value) {
        effectivePatterns.push(...cond.include);
      }
    }
  }

  const matched: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(envVars)) {
    const isMatch = effectivePatterns.some((pattern) => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return key.startsWith(prefix);
      }
      return key === pattern;
    });
    if (isMatch) {
      matched.push({ key, value });
    }
  }
  return matched.sort((a, b) => a.key.localeCompare(b.key));
}

export function filterPackages(
  packages: WorkspacePackage[],
  filterExpr: string,
  mutatedPackages: Set<string>
): WorkspacePackage[] {
  const trimmed = filterExpr.trim();
  if (!trimmed || trimmed === '*' || trimmed === 'all') {
    return packages;
  }

  // Handle "[HEAD^1]" affected filter
  if (trimmed === '[HEAD^1]' || trimmed === '...[HEAD^1]') {
    if (mutatedPackages.size === 0) {
      // If no manual mutation yet, return apps and their direct dependencies
      return packages;
    }
    const included = new Set<string>(mutatedPackages);
    // Add downstream dependents recursively
    let changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (!included.has(pkg.name) && pkg.dependencies.some((d) => included.has(d))) {
          included.add(pkg.name);
          changed = true;
        }
      }
    }
    // Also include upstream dependencies needed to build them
    changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (included.has(pkg.name)) {
          for (const dep of pkg.dependencies) {
            if (!included.has(dep)) {
              included.add(dep);
              changed = true;
            }
          }
        }
      }
    }
    return packages.filter((p) => included.has(p.name));
  }

  // Handle "...<pkg>" (dependents of pkg + their upstream deps)
  if (trimmed.startsWith('...')) {
    const targetQuery = trimmed.slice(3).toLowerCase();
    const seed = packages.filter(
      (p) => p.name.toLowerCase().includes(targetQuery) || p.path.toLowerCase().includes(targetQuery)
    );
    const included = new Set<string>(seed.map((s) => s.name));
    let changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (!included.has(pkg.name) && pkg.dependencies.some((d) => included.has(d))) {
          included.add(pkg.name);
          changed = true;
        }
      }
    }
    // Include upstream build deps for topological completeness
    changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (included.has(pkg.name)) {
          for (const dep of pkg.dependencies) {
            if (!included.has(dep)) {
              included.add(dep);
              changed = true;
            }
          }
        }
      }
    }
    return packages.filter((p) => included.has(p.name));
  }

  // Handle "<pkg>..." (pkg and its upstream dependencies)
  if (trimmed.endsWith('...')) {
    const targetQuery = trimmed.slice(0, -3).toLowerCase();
    const seed = packages.filter(
      (p) => p.name.toLowerCase().includes(targetQuery) || p.path.toLowerCase().includes(targetQuery)
    );
    const included = new Set<string>(seed.map((s) => s.name));
    let changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (included.has(pkg.name)) {
          for (const dep of pkg.dependencies) {
            if (!included.has(dep)) {
              included.add(dep);
              changed = true;
            }
          }
        }
      }
    }
    return packages.filter((p) => included.has(p.name));
  }

  // Handle path glob e.g. "apps/*" or "packages/*"
  if (trimmed === 'apps/*' || trimmed === './apps/*') {
    const appNames = new Set(packages.filter((p) => p.type === 'app').map((p) => p.name));
    // Include their upstream dependencies so ^build resolves properly
    let changed = true;
    while (changed) {
      changed = false;
      for (const pkg of packages) {
        if (appNames.has(pkg.name)) {
          for (const dep of pkg.dependencies) {
            if (!appNames.has(dep)) {
              appNames.add(dep);
              changed = true;
            }
          }
        }
      }
    }
    return packages.filter((p) => appNames.has(p.name));
  }

  if (trimmed === 'packages/*' || trimmed === './packages/*') {
    return packages.filter((p) => p.type === 'package');
  }

  // Substring match + upstream dependencies
  const q = trimmed.toLowerCase();
  const matched = new Set(
    packages
      .filter((p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q))
      .map((p) => p.name)
  );
  let changed = true;
  while (changed) {
    changed = false;
    for (const pkg of packages) {
      if (matched.has(pkg.name)) {
        for (const dep of pkg.dependencies) {
          if (!matched.has(dep)) {
            matched.add(dep);
            changed = true;
          }
        }
      }
    }
  }
  return packages.filter((p) => matched.has(p.name));
}

export function buildTaskGraph(
  preset: MonorepoPreset,
  targetTask: string,
  filterExpr: string,
  fileMutations: Record<string, number>,
  customTurboJson?: TurboJsonConfig,
  customEnvVars?: Record<string, string>
): TaskGraphResult {
  const turboJson = customTurboJson || preset.turboJson;
  const envVars = customEnvVars || preset.envVars;
  const mutatedSet = new Set(Object.keys(fileMutations).filter((k) => fileMutations[k] > 0));

  const activePackages = filterPackages(preset.packages, filterExpr, mutatedSet);
  const pkgMap = new Map<string, WorkspacePackage>();
  for (const p of activePackages) {
    pkgMap.set(p.name, p);
  }

  // Compute global hash from globalEnv + packageManager + version
  const globalEnvValues = (turboJson.globalEnv || [])
    .map((k) => `${k}=${envVars[k] ?? ''}`)
    .join(';');
  const globalHash = deterministicHexHash(
    `turbo:${preset.version}|pm:${preset.packageManager}|globalEnv:${globalEnvValues}`
  );

  // Discover all required (pkg, task) pairs recursively starting from targetTask on activePackages
  const nodeKey = (pkgName: string, tName: string) => `${pkgName}#${tName}`;
  const rawNodes = new Map<
    string,
    {
      pkg: WorkspacePackage;
      taskName: string;
      upstreamIds: Set<string>;
    }
  >();

  const queue: Array<{ pkgName: string; taskName: string }> = [];
  for (const pkg of activePackages) {
    const pkgSpecificConfig = turboJson.tasks[`${pkg.name}#${targetTask}`];
    const rootTaskConfig = turboJson.tasks[targetTask];
    const hasScript = Boolean(
      pkg.scripts[targetTask] ||
        pkgSpecificConfig?.command ||
        rootTaskConfig?.command
    );
    if (hasScript) {
      queue.push({ pkgName: pkg.name, taskName: targetTask });
    }
  }

  while (queue.length > 0) {
    const { pkgName, taskName } = queue.shift()!;
    const id = nodeKey(pkgName, taskName);
    if (rawNodes.has(id)) continue;

    const pkg = pkgMap.get(pkgName);
    if (!pkg) continue;

    const taskConfig =
      turboJson.tasks[`${pkgName}#${taskName}`] || turboJson.tasks[taskName] || {};
    const dependsOn = taskConfig.dependsOn || [];
    const upstreamIds = new Set<string>();

    for (const depSpec of dependsOn) {
      if (depSpec.startsWith('^')) {
        const upTaskName = depSpec.slice(1);
        for (const depPkgName of pkg.dependencies) {
          const depPkg = pkgMap.get(depPkgName);
          if (!depPkg) continue;
          const depTaskCfg =
            turboJson.tasks[`${depPkgName}#${upTaskName}`] || turboJson.tasks[upTaskName];
          const depHasScript = Boolean(
            depPkg.scripts[upTaskName] || depTaskCfg?.command
          );
          if (depHasScript) {
            const upId = nodeKey(depPkgName, upTaskName);
            upstreamIds.add(upId);
            if (!rawNodes.has(upId)) {
              queue.push({ pkgName: depPkgName, taskName: upTaskName });
            }
          }
        }
      } else if (depSpec.includes('#')) {
        const [explicitPkg, explicitTask] = depSpec.split('#');
        if (pkgMap.has(explicitPkg)) {
          const upId = nodeKey(explicitPkg, explicitTask);
          upstreamIds.add(upId);
          if (!rawNodes.has(upId)) {
            queue.push({ pkgName: explicitPkg, taskName: explicitTask });
          }
        }
      } else {
        // Same-package task dependency
        const samePkgCfg =
          turboJson.tasks[`${pkgName}#${depSpec}`] || turboJson.tasks[depSpec];
        if (pkg.scripts[depSpec] || samePkgCfg?.command) {
          const upId = nodeKey(pkgName, depSpec);
          upstreamIds.add(upId);
          if (!rawNodes.has(upId)) {
            queue.push({ pkgName, taskName: depSpec });
          }
        }
      }
    }

    rawNodes.set(id, { pkg, taskName, upstreamIds });
  }

  // Compute topological wave depth for each node
  const waveMemo = new Map<string, number>();
  const visiting = new Set<string>();

  function getWave(id: string): number {
    if (waveMemo.has(id)) return waveMemo.get(id)!;
    if (visiting.has(id)) return 0; // cycle guard
    visiting.add(id);
    const entry = rawNodes.get(id);
    if (!entry || entry.upstreamIds.size === 0) {
      waveMemo.set(id, 0);
      visiting.delete(id);
      return 0;
    }
    let maxUpWave = 0;
    for (const upId of entry.upstreamIds) {
      if (rawNodes.has(upId)) {
        maxUpWave = Math.max(maxUpWave, getWave(upId) + 1);
      }
    }
    waveMemo.set(id, maxUpWave);
    visiting.delete(id);
    return maxUpWave;
  }

  for (const id of rawNodes.keys()) {
    getWave(id);
  }

  // Sort nodes by wave ascending so upstream hashes are always computed before downstream
  const sortedIds = Array.from(rawNodes.keys()).sort((a, b) => {
    const wa = waveMemo.get(a) ?? 0;
    const wb = waveMemo.get(b) ?? 0;
    if (wa !== wb) return wa - wb;
    return a.localeCompare(b);
  });

  const builtNodes = new Map<string, TaskNode>();

  for (const id of sortedIds) {
    const entry = rawNodes.get(id)!;
    const { pkg, taskName, upstreamIds } = entry;
    const taskConfig =
      turboJson.tasks[`${pkg.name}#${taskName}`] || turboJson.tasks[taskName] || {};

    // Resolve command string
    let scriptCommand = pkg.scripts[taskName] || '';
    if (!scriptCommand && taskConfig.command) {
      if (Array.isArray(taskConfig.command)) {
        scriptCommand = taskConfig.command.join(' ');
      } else if (taskConfig.command.javascript) {
        scriptCommand = taskConfig.command.javascript.join(' ');
      }
    }

    // File hash summary factoring in user mutations
    const mutationCount = fileMutations[pkg.name] || 0;
    const rawFileHashes = pkg.files
      .map((f) => `${f.path}:${f.hash}${mutationCount > 0 ? `_mut${mutationCount}` : ''}`)
      .join('|');
    const fileHashSummary = deterministicHexHash(rawFileHashes).slice(0, 12);

    // Upstream task hashes
    const upstreamTaskHashes = Array.from(upstreamIds)
      .filter((upId) => builtNodes.has(upId))
      .map((upId) => ({
        taskId: upId,
        hash: builtNodes.get(upId)!.hash,
      }));

    // Framework inference
    const matchedFw = detectPackageFramework(pkg);
    const inferredEnvVars = matchedFw
      ? matchWildcardEnvVars(matchedFw.envWildcards, envVars, matchedFw.envConditionals)
      : [];

    // Explicit task env vars
    const explicitEnvVars = (taskConfig.env || []).map((k) => ({
      key: k,
      value: envVars[k] ?? '',
    }));

    const taskConfigSignature = JSON.stringify({
      scriptCommand,
      outputs: taskConfig.outputs || [],
      inputs: taskConfig.inputs || ['$TURBO_DEFAULT$'],
      dependsOn: taskConfig.dependsOn || [],
    });

    const compositeHashPayload = [
      `global:${globalHash}`,
      `pkg:${pkg.name}`,
      `task:${taskName}`,
      `files:${fileHashSummary}`,
      `up:${upstreamTaskHashes.map((u) => `${u.taskId}=${u.hash}`).join(',')}`,
      `fwEnv:${inferredEnvVars.map((e) => `${e.key}=${e.value}`).join(',')}`,
      `taskEnv:${explicitEnvVars.map((e) => `${e.key}=${e.value}`).join(',')}`,
      `cfg:${taskConfigSignature}`,
    ].join('||');

    const hash = deterministicHexHash(compositeHashPayload);
    const estimatedDurationMs = pkg.baseDurationMs[taskName] ?? 650;

    builtNodes.set(id, {
      id,
      packageName: pkg.name,
      packagePath: pkg.path,
      packageType: pkg.type,
      taskName,
      scriptCommand,
      dependencies: Array.from(upstreamIds).filter((u) => rawNodes.has(u)),
      dependents: [],
      wave: waveMemo.get(id) ?? 0,
      hash,
      hashInputs: {
        fileHashSummary,
        upstreamTaskHashes,
        matchedFramework: matchedFw ? `${matchedFw.name} (${matchedFw.slug})` : null,
        inferredEnvVars,
        explicitEnvVars,
        globalEnvHash: globalHash,
        taskConfigSignature,
      },
      estimatedDurationMs,
      cacheable: taskConfig.cache !== false,
      outputs: taskConfig.outputs || ['dist/**'],
    });
  }

  // Populate dependents
  for (const node of builtNodes.values()) {
    for (const depId of node.dependencies) {
      const parent = builtNodes.get(depId);
      if (parent && !parent.dependents.includes(node.id)) {
        parent.dependents.push(node.id);
      }
    }
  }

  // Group into waves
  const maxWave = Math.max(0, ...Array.from(builtNodes.values()).map((n) => n.wave));
  const waves: TaskNode[][] = [];
  for (let w = 0; w <= maxWave; w++) {
    waves.push(Array.from(builtNodes.values()).filter((n) => n.wave === w));
  }

  // Critical path calculation (longest duration path through DAG)
  const cumulativeDuration = new Map<string, number>();
  const predecessor = new Map<string, string | null>();

  for (const id of sortedIds) {
    const node = builtNodes.get(id)!;
    let bestPrev: string | null = null;
    let bestPrevTime = 0;
    for (const depId of node.dependencies) {
      const depTime = cumulativeDuration.get(depId) ?? 0;
      if (depTime > bestPrevTime) {
        bestPrevTime = depTime;
        bestPrev = depId;
      }
    }
    cumulativeDuration.set(id, bestPrevTime + node.estimatedDurationMs);
    predecessor.set(id, bestPrev);
  }

  let endNodeId: string | null = null;
  let criticalPathDurationMs = 0;
  for (const [id, totalTime] of cumulativeDuration.entries()) {
    if (totalTime > criticalPathDurationMs) {
      criticalPathDurationMs = totalTime;
      endNodeId = id;
    }
  }

  const criticalPathIds: string[] = [];
  let cursor = endNodeId;
  while (cursor) {
    criticalPathIds.unshift(cursor);
    cursor = predecessor.get(cursor) ?? null;
  }

  const totalSequentialDurationMs = Array.from(builtNodes.values()).reduce(
    (sum, n) => sum + n.estimatedDurationMs,
    0
  );

  return {
    nodes: Array.from(builtNodes.values()),
    waves,
    criticalPathIds,
    criticalPathDurationMs,
    totalSequentialDurationMs,
    globalHash,
  };
}

export function checkPackageBoundaries(
  packages: WorkspacePackage[],
  rules: BoundaryRule[]
): BoundaryViolation[] {
  const pkgByName = new Map(packages.map((p) => [p.name, p]));
  const violations: BoundaryViolation[] = [];

  for (const pkg of packages) {
    for (const tag of pkg.tags) {
      const matchingRule = rules.find((r) => r.tag === tag);
      if (!matchingRule) continue;

      for (const depName of pkg.dependencies) {
        const depPkg = pkgByName.get(depName);
        if (!depPkg) continue;

        for (const depTag of depPkg.tags) {
          if (matchingRule.denyDependenciesWithTags.includes(depTag)) {
            violations.push({
              packageName: pkg.name,
              packagePath: pkg.path,
              packageTag: tag,
              importedDependency: depPkg.name,
              importedDependencyTag: depTag,
              ruleDescription: matchingRule.description,
              severity: 'error',
            });
          } else if (
            matchingRule.allowDependenciesWithTags.length > 0 &&
            !matchingRule.allowDependenciesWithTags.includes(depTag)
          ) {
            violations.push({
              packageName: pkg.name,
              packagePath: pkg.path,
              packageTag: tag,
              importedDependency: depPkg.name,
              importedDependencyTag: depTag,
              ruleDescription: `Tag "${tag}" only allows dependencies tagged [${matchingRule.allowDependenciesWithTags.join(', ')}], but "${depPkg.name}" is tagged "${depTag}".`,
              severity: 'warning',
            });
          }
        }
      }
    }
  }

  return violations;
}

export function validateTurboJsonText(rawText: string): {
  parsed: any | null;
  diagnostics: ConfigDiagnostic[];
} {
  const diagnostics: ConfigDiagnostic[] = [];
  let parsed: any = null;

  try {
    // Strip single-line JSONC comments safely outside strings
    const stripped = rawText
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//')) return '';
        return line;
      })
      .join('\n');
    parsed = JSON.parse(stripped);
  } catch (err: any) {
    diagnostics.push({
      level: 'error',
      path: 'root',
      message: `JSON syntax error: ${err.message}`,
    });
    return { parsed: null, diagnostics };
  }

  if (parsed.pipeline && !parsed.tasks) {
    diagnostics.push({
      level: 'error',
      path: 'pipeline',
      message:
        'Turborepo v2 renamed the root "pipeline" key to "tasks". Run @turbo/codemod rename-pipeline-to-tasks.',
      fixableByCodemod: 'rename-pipeline-to-tasks',
    });
  }

  if (parsed.globalDotEnv) {
    diagnostics.push({
      level: 'warning',
      path: 'globalDotEnv',
      message:
        '"globalDotEnv" was removed in v2. Move .env files into "globalDependencies" or task "inputs".',
      fixableByCodemod: 'migrate-dot-env',
    });
  }

  if (!parsed.$schema) {
    diagnostics.push({
      level: 'info',
      path: '$schema',
      message: 'Missing "$schema": "https://turborepo.dev/schema.json" for IDE autocomplete and LSP validation.',
      fixableByCodemod: 'add-schema',
    });
  }

  const tasksObj = parsed.tasks || parsed.pipeline || {};
  for (const [taskName, taskDef] of Object.entries<any>(tasksObj)) {
    if (taskDef.persistent === true && taskDef.cache !== false) {
      diagnostics.push({
        level: 'error',
        path: `tasks.${taskName}.cache`,
        message: `Persistent task "${taskName}" must set "cache": false so long-running dev servers are not cached.`,
        fixableByCodemod: 'fix-persistent-cache',
      });
    }

    if (
      (taskName === 'build' || taskName.endsWith('#build')) &&
      taskDef.cache !== false &&
      (!taskDef.outputs || taskDef.outputs.length === 0)
    ) {
      diagnostics.push({
        level: 'warning',
        path: `tasks.${taskName}.outputs`,
        message: `Build task "${taskName}" has no "outputs" configured. Turborepo will cache logs, but no build artifacts will be restored on cache hit.`,
      });
    }

    if (taskDef.command && !parsed.futureFlags?.experimentalTaskCommand) {
      diagnostics.push({
        level: 'warning',
        path: `tasks.${taskName}.command`,
        message: `Task "${taskName}" uses "command" in turbo.json, which requires "futureFlags.experimentalTaskCommand": true in Turborepo v2.11.10.`,
        fixableByCodemod: 'enable-future-flags',
      });
    }
  }

  return { parsed, diagnostics };
}

export function applyTurboCodemod(rawText: string, codemodId: string): string {
  const { parsed } = validateTurboJsonText(rawText);
  if (!parsed) return rawText;

  const clone = JSON.parse(JSON.stringify(parsed));

  if (codemodId === 'rename-pipeline-to-tasks' || codemodId === 'all') {
    if (clone.pipeline) {
      clone.tasks = clone.pipeline;
      delete clone.pipeline;
    }
  }

  if (codemodId === 'migrate-dot-env' || codemodId === 'all') {
    if (clone.globalDotEnv) {
      clone.globalDependencies = Array.from(
        new Set([...(clone.globalDependencies || []), ...clone.globalDotEnv])
      );
      delete clone.globalDotEnv;
    }
  }

  if (codemodId === 'add-schema' || codemodId === 'all') {
    clone.$schema = 'https://turborepo.dev/schema.json';
  }

  if (codemodId === 'fix-persistent-cache' || codemodId === 'all') {
    const tasks = clone.tasks || {};
    for (const key of Object.keys(tasks)) {
      if (tasks[key].persistent === true) {
        tasks[key].cache = false;
      }
    }
  }

  if (codemodId === 'enable-future-flags' || codemodId === 'all') {
    clone.futureFlags = {
      ...(clone.futureFlags || {}),
      experimentalCargoWorkspaces: true,
      experimentalTaskCommand: true,
    };
  }

  return JSON.stringify(clone, null, 2);
}

export function executeTurboQuery(
  preset: MonorepoPreset,
  graph: TaskGraphResult,
  queryPresetId: string
): object {
  switch (queryPresetId) {
    case 'packages-overview':
      return {
        data: {
          packages: {
            items: preset.packages.map((p) => ({
              name: p.name,
              path: p.path,
              type: p.type,
              tags: p.tags,
              directDependencies: p.dependencies,
              directDependents: preset.packages
                .filter((other) => other.dependencies.includes(p.name))
                .map((other) => other.name),
            })),
          },
        },
      };
    case 'task-hashes':
      return {
        data: {
          taskGraph: {
            globalHash: graph.globalHash,
            criticalPathMs: graph.criticalPathDurationMs,
            nodes: graph.nodes.map((n) => ({
              id: n.id,
              wave: n.wave,
              hash: n.hash,
              matchedFramework: n.hashInputs.matchedFramework,
              inferredEnvCount: n.hashInputs.inferredEnvVars.length,
              upstreamDependencies: n.dependencies,
            })),
          },
        },
      };
    case 'affected-reverse-deps': {
      const leafPackages = preset.packages.filter((p) => p.dependencies.length === 0);
      return {
        data: {
          foundationalPackages: leafPackages.map((leaf) => {
            const impacted = preset.packages.filter(
              (p) =>
                p.dependencies.includes(leaf.name) ||
                p.dependencies.some((d) =>
                  preset.packages.find((x) => x.name === d)?.dependencies.includes(leaf.name)
                )
            );
            return {
              name: leaf.name,
              path: leaf.path,
              transitiveDependentsCount: impacted.length,
              transitiveDependents: impacted.map((i) => i.name),
            };
          }),
        },
      };
    }
    case 'framework-inference-audit':
      return {
        data: {
          frameworkInference: preset.packages.map((p) => {
            const fw = detectPackageFramework(p);
            return {
              packageName: p.name,
              detectedFramework: fw ? fw.name : 'None (Library / Node / Crate)',
              envWildcards: fw ? fw.envWildcards : [],
              matchedEnvKeys: fw
                ? matchWildcardEnvVars(fw.envWildcards, preset.envVars, fw.envConditionals).map(
                    (e) => e.key
                  )
                : [],
            };
          }),
        },
      };
    default:
      return { data: {} };
  }
}
