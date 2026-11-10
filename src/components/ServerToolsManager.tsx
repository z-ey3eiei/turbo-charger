import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Terminal,
  RefreshCw,
  PackageCheck,
  Send,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowUpRight,
  Server,
  Sparkles,
} from 'lucide-react';

interface ServerStatus {
  status: string;
  version: string;
  nodeVersion: string;
  platform: string;
  uptimeSec: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  npmTokenConfigured: boolean;
  maskedToken: string;
  tokenConfiguredAt: string | null;
  availableTools: Array<{
    id: string;
    name: string;
    method: string;
    endpoint: string;
  }>;
}

interface WhoamiResult {
  success: boolean;
  authenticated: boolean;
  username?: string;
  registry?: string;
  error?: string;
  checkedAt?: string;
}

interface ServerToolLog {
  id: string;
  timestamp: string;
  type: string;
  command: string;
  status: 'success' | 'warning' | 'error';
  summary: string;
}

export const ServerToolsManager: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [savingToken, setSavingToken] = useState<boolean>(false);
  const [verifyingWhoami, setVerifyingWhoami] = useState<boolean>(false);
  const [whoamiResult, setWhoamiResult] = useState<WhoamiResult | null>(null);
  const [logs, setLogs] = useState<ServerToolLog[]>([]);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Quick package lookup state
  const [pkgSearch, setPkgSearch] = useState<string>('turbo');
  const [pkgData, setPkgData] = useState<any>(null);
  const [loadingPkg, setLoadingPkg] = useState<boolean>(false);

  // Publish dry-run state
  const [dryRunPkg, setDryRunPkg] = useState<string>('turbo-charger');
  const [dryRunVersion, setDryRunVersion] = useState<string>('1.0.0');
  const [dryRunResult, setDryRunResult] = useState<any>(null);
  const [loadingDryRun, setLoadingDryRun] = useState<boolean>(false);

  // turbo-charger package metadata & interactive CLI simulator
  const [turboChargerPkg, setTurboChargerPkg] = useState<any>(null);
  const [cliCmdInput, setCliCmdInput] = useState<string>('resolve');
  const [cliArgsInput, setCliArgsInput] = useState<string>('@repo/ui/button');
  const [cliOutput, setCliOutput] = useState<string | null>(null);
  const [runningCli, setRunningCli] = useState<boolean>(false);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState<boolean>(false);

  const fetchTurboChargerPkg = async () => {
    try {
      const res = await fetch('/api/package/turbo-charger');
      if (res.ok) {
        const data = await res.json();
        setTurboChargerPkg(data);
      }
    } catch (err) {
      console.error('Failed to load turbo-charger package info:', err);
    }
  };

  const [publishingReal, setPublishingReal] = useState<boolean>(false);
  const [realPublishResult, setRealPublishResult] = useState<any>(null);

  const handleRunCliCommand = async (cmd?: string, arg?: string) => {
    const commandToRun = cmd || cliCmdInput;
    const argsToRun = arg ? [arg] : cliArgsInput.trim() ? cliArgsInput.trim().split(' ') : [];
    setRunningCli(true);

    try {
      const res = await fetch('/api/package/turbo-charger/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandToRun,
          args: argsToRun,
        }),
      });
      const data = await res.json();
      setCliOutput(data.stdout || '');
      await fetchLogs();
    } catch (err: any) {
      setCliOutput(`Error running CLI: ${err.message}`);
    } finally {
      setRunningCli(false);
    }
  };

  const handlePublishToNpm = async () => {
    setPublishingReal(true);
    setRealPublishResult(null);

    try {
      const res = await fetch('/api/npm/publish-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName: 'turbo-charger' }),
      });
      const data = await res.json();
      setRealPublishResult(data);
      await fetchLogs();
      if (!res.ok) {
        alert(data.error || 'Publish failed');
      }
    } catch (err: any) {
      setRealPublishResult({ success: false, error: err.message });
    } finally {
      setPublishingReal(false);
    }
  };

  // Git Push state
  const [gitRepoUrl, setGitRepoUrl] = useState<string>('https://github.com/z-ey3eiei/Turborepo.git');
  const [gitToken, setGitToken] = useState<string>('');
  const [gitBranch, setGitBranch] = useState<string>('main');
  const [gitCommitMsg, setGitCommitMsg] = useState<string>('feat: update Turbocharger monorepo & tools');
  const [pushingGit, setPushingGit] = useState<boolean>(false);
  const [gitPushResult, setGitPushResult] = useState<any>(null);

  const handleGitPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitRepoUrl.trim() || !gitToken.trim()) {
      alert('Please enter both GitHub Repository URL and Personal Access Token (PAT).');
      return;
    }

    setPushingGit(true);
    setGitPushResult(null);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: gitRepoUrl.trim(),
          token: gitToken.trim(),
          branch: gitBranch.trim() || 'main',
          commitMessage: gitCommitMsg.trim() || 'feat: update Turbocharger codebase',
        }),
      });
      const data = await res.json();
      setGitPushResult(data);
      await fetchLogs();
      if (res.ok) {
        setGitToken('');
      } else {
        alert(data.error || 'Git push failed');
      }
    } catch (err: any) {
      setGitPushResult({ success: false, error: err.message });
    } finally {
      setPushingGit(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/server/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load server status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/server/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load tool logs:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    fetchTurboChargerPkg();
    const interval = setInterval(() => {
      fetchLogs();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingToken(true);
    setWhoamiResult(null);

    try {
      const res = await fetch('/api/npm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchStatus();
        await fetchLogs();
        setTokenInput('');
        // Automatically verify token
        handleVerifyToken();
      } else {
        alert(data.error || 'Failed to save token');
      }
    } catch (err: any) {
      alert(`Error saving token: ${err.message}`);
    } finally {
      setSavingToken(false);
    }
  };

  const handleVerifyToken = async () => {
    setVerifyingWhoami(true);
    try {
      const res = await fetch('/api/npm/whoami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setWhoamiResult(data);
      await fetchLogs();
    } catch (err: any) {
      setWhoamiResult({
        success: false,
        authenticated: false,
        error: err.message,
      });
    } finally {
      setVerifyingWhoami(false);
    }
  };

  const handleLookupPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgSearch.trim()) return;
    setLoadingPkg(true);
    try {
      const res = await fetch(`/api/npm/package/${encodeURIComponent(pkgSearch.trim())}`);
      const data = await res.json();
      setPkgData(data);
    } catch (err: any) {
      setPkgData({ error: err.message });
    } finally {
      setLoadingPkg(false);
    }
  };

  const handleRunPublishDryRun = async () => {
    setLoadingDryRun(true);
    try {
      const res = await fetch('/api/npm/publish-dryrun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: dryRunPkg,
          version: dryRunVersion,
          tag: 'latest',
        }),
      });
      const data = await res.json();
      setDryRunResult(data);
      await fetchLogs();
    } catch (err: any) {
      setDryRunResult({ error: err.message });
    } finally {
      setLoadingDryRun(false);
    }
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Header */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="sidename text-sm font-bold">Turbocharger</span>
              <span className="font-mono text-xs text-gray-500">
                Node.js Backend &amp; NPM Server Tools
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-1000">
              JavaScript NPM Node.js Server Tool Suite
            </h1>
            <p className="max-w-2xl text-sm text-gray-700 dark:text-neutral-400">
              เครื่องมือฝั่งเซิร์ฟเวอร์แบบ Full-Stack รันด้วย Node.js Express และรองรับการใส่ NPM Token สำหรับตรวจสอบสิทธิ์ ตรวจสอบ Registry และรันคำสั่งแพ็กเกจ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3.5 py-2 text-right font-mono text-xs">
              <div className="text-gray-500 text-[10px] uppercase">Node Runtime</div>
              <div className="font-semibold text-emerald-500">
                {status ? `${status.nodeVersion} (${status.platform})` : 'connecting...'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchStatus();
                fetchLogs();
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-100 text-gray-800 hover:text-gray-1000 transition-colors cursor-pointer"
              title="Refresh Server Status"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: NPM Token Configuration & Whoami Status */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Token Input Card */}
        <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#FF1E56]/10 flex items-center justify-center text-[#FF1E56]">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-1000">
                  NPM Token Configuration
                </h3>
                <p className="text-xs text-gray-500">
                  ใส่โทเค็น npm สำหรับยืนยันตัวตนกับ registry.npmjs.org
                </p>
              </div>
            </div>

            {status?.npmTokenConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active ({status.maskedToken})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-500">
                <AlertCircle className="h-3.5 w-3.5" />
                No Token Set
              </span>
            )}
          </div>

          <form onSubmit={handleSaveToken} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-gray-600 dark:text-neutral-400 flex items-center justify-between">
                <span>NPM Token (npm_...)</span>
                {status?.tokenConfiguredAt && (
                  <span className="text-[11px] text-gray-500 lowercase">
                    updated: {new Date(status.tokenConfiguredAt).toLocaleTimeString()}
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={
                    status?.npmTokenConfigured
                      ? `Current token: ${status.maskedToken} (enter new token to update)`
                      : 'npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                  }
                  className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-4 py-2.5 pr-20 font-mono text-sm text-gray-1000 placeholder:text-gray-500 focus:border-[#FF1E56] focus:outline-none"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-gray-500 font-mono">
                Stored securely in Node.js server process memory &amp; .env
              </p>
              <div className="flex items-center gap-2">
                {status?.npmTokenConfigured && (
                  <button
                    type="button"
                    onClick={handleVerifyToken}
                    disabled={verifyingWhoami}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3.5 py-2 text-xs font-semibold text-gray-1000 hover:border-gray-400 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${verifyingWhoami ? 'animate-spin' : ''}`} />
                    <span>Run npm whoami</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={savingToken || !tokenInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF1E56] to-[#0096FF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Save NPM Token</span>
                </button>
              </div>
            </div>
          </form>

          {/* Whoami verification feedback */}
          {whoamiResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3.5 border font-mono text-xs ${
                whoamiResult.authenticated
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {whoamiResult.authenticated ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {whoamiResult.authenticated
                    ? `Authenticated as: @${whoamiResult.username}`
                    : 'Authentication Failed'}
                </span>
                <span className="text-[11px] text-gray-500">
                  {whoamiResult.checkedAt && new Date(whoamiResult.checkedAt).toLocaleTimeString()}
                </span>
              </div>
              {whoamiResult.error && <p className="mt-1 text-[11px]">{whoamiResult.error}</p>}
            </motion.div>
          )}
        </div>

        {/* Server Status & Memory Card */}
        <div className="lg:col-span-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0096FF]/10 flex items-center justify-center text-[#0096FF]">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-1000">Server Environment</h3>
              <p className="text-xs text-gray-500">Node.js Express Native Tools</p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-neutral-800">
              <span className="text-gray-500">Runtime Port</span>
              <span className="text-gray-1000 font-semibold">3000 (Express Full-Stack)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-neutral-800">
              <span className="text-gray-500">Uptime</span>
              <span className="text-gray-1000">
                {status ? `${status.uptimeSec}s` : '...'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-200 dark:border-neutral-800">
              <span className="text-gray-500">Heap Memory</span>
              <span className="text-emerald-500">
                {status ? `${status.memoryUsageMb.heapUsed} MB / ${status.memoryUsageMb.heapTotal} MB` : '...'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-500">Remote Cache Bridge</span>
              <span className="text-[#0096FF] font-semibold">Ready (HTTP Relay)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunPublishDryRun}
              disabled={loadingDryRun}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-background-200 border border-gray-200 dark:border-neutral-800 px-4 py-2.5 text-xs font-semibold text-gray-1000 hover:border-[#FF1E56] transition-colors cursor-pointer"
            >
              <PackageCheck className="h-4 w-4 text-[#FF1E56]" />
              <span>Simulate Turborepo Package Publish Dry-Run</span>
            </button>
          </div>
        </div>

        {/* GitHub Repository Push Card */}
        <div className="lg:col-span-12 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#FF1E56]/10 flex items-center justify-center text-[#FF1E56]">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-1000">Push to GitHub Repository</h3>
                  <span className="font-mono text-xs rounded bg-[#FF1E56]/15 text-[#FF1E56] px-2 py-0.5 font-semibold">
                    git push --force
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  ใส่ GitHub Personal Access Token (PAT) เพื่อให้เซิร์ฟเวอร์ทำการ commit และ push ซอร์สโค้ดทั้งหมดขึ้น GitHub ให้คุณอัตโนมัติ
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGitPush} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-mono uppercase text-gray-600 dark:text-neutral-400">
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={gitRepoUrl}
                onChange={(e) => setGitRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 font-mono text-xs text-gray-1000 focus:outline-none focus:border-[#0096FF]"
                required
              />
            </div>

            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-mono uppercase text-gray-600 dark:text-neutral-400">
                GitHub Personal Access Token (PAT) (ghp_...)
              </label>
              <input
                type="password"
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 font-mono text-xs text-gray-1000 focus:outline-none focus:border-[#FF1E56]"
                required
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-mono uppercase text-gray-600 dark:text-neutral-400">
                Branch
              </label>
              <input
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                placeholder="main"
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 font-mono text-xs text-gray-1000 focus:outline-none focus:border-[#0096FF]"
              />
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="text-xs font-mono uppercase text-gray-600 dark:text-neutral-400">
                Commit Message
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gitCommitMsg}
                  onChange={(e) => setGitCommitMsg(e.target.value)}
                  placeholder="feat: update Turbocharger codebase"
                  className="flex-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 font-mono text-xs text-gray-1000 focus:outline-none focus:border-[#0096FF]"
                />
                <button
                  type="submit"
                  disabled={pushingGit || !gitToken.trim() || !gitRepoUrl.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF1E56] to-[#0096FF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-40 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{pushingGit ? 'Pushing to GitHub...' : 'Push to GitHub'}</span>
                </button>
              </div>
            </div>
          </form>

          {gitPushResult && (
            <div
              className={`rounded-lg p-3.5 border font-mono text-xs ${
                gitPushResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {gitPushResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{gitPushResult.message || gitPushResult.error}</span>
              </div>
              {gitPushResult.stdout && (
                <pre className="mt-2 text-[11px] whitespace-pre-wrap text-gray-700 dark:text-neutral-300">
                  {gitPushResult.stdout}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW: turbo-charger NPM Registry Package & CLI Tool Showcase */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#0096FF] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-1000">@10rigin/turbo-charger</h2>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-500">
                  npm package v1.0.1 (PUBLISHED)
                </span>
                <span className="sidename text-xs">Live on npmjs.com</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mt-0.5">
                Full-featured CLI &amp; Node.js Engine for Turborepo Monorepo Acceleration, Deterministic DAG Resolution, and Remote Cache Diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('npm i -g @10rigin/turbo-charger');
                setCopiedInstallCmd(true);
                setTimeout(() => setCopiedInstallCmd(false), 2000);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-background-200 border border-gray-200 dark:border-neutral-800 px-3.5 py-2 text-xs font-mono font-medium text-gray-1000 hover:border-[#FF1E56] transition-colors cursor-pointer"
            >
              <span>$ npm i -g @10rigin/turbo-charger</span>
              {copiedInstallCmd ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-gray-500" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setDryRunPkg('turbo-charger');
                setDryRunVersion('1.0.0');
                handleRunPublishDryRun();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-background-200 border border-gray-200 dark:border-neutral-800 px-3.5 py-2 text-xs font-semibold text-gray-1000 hover:border-gray-400 transition-opacity cursor-pointer"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Dry-Run</span>
            </button>

            <button
              type="button"
              onClick={handlePublishToNpm}
              disabled={publishingReal || !status?.npmTokenConfigured}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF1E56] to-[#0096FF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{publishingReal ? 'Publishing...' : 'Publish to NPM Registry'}</span>
            </button>
          </div>
        </div>

        {realPublishResult && (
          <div
            className={`rounded-lg p-3.5 border font-mono text-xs ${
              realPublishResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {realPublishResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{realPublishResult.message || realPublishResult.error}</span>
            </div>
            {realPublishResult.stdout && (
              <pre className="mt-2 text-[11px] whitespace-pre-wrap text-gray-700 dark:text-neutral-300">
                {realPublishResult.stdout}
              </pre>
            )}
          </div>
        )}

        {/* Package Files & CLI Interactive Runner */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* File Architecture */}
          <div className="lg:col-span-5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-semibold text-gray-1000">Package Tarball Assets:</span>
              <span className="text-emerald-500">5 files (packages/turbo-charger)</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 px-2 rounded bg-background-100 border border-gray-200 dark:border-neutral-800">
                <span className="text-[#0096FF]">bin/turbocharger.js</span>
                <span className="text-gray-500 text-[11px]">3.8 kB (CLI binary)</span>
              </div>
              <div className="flex justify-between py-1 px-2 rounded bg-background-100 border border-gray-200 dark:border-neutral-800">
                <span className="text-[#FF1E56]">dist/index.js</span>
                <span className="text-gray-500 text-[11px]">4.6 kB (ESM runtime)</span>
              </div>
              <div className="flex justify-between py-1 px-2 rounded bg-background-100 border border-gray-200 dark:border-neutral-800">
                <span className="text-purple-400">dist/index.d.ts</span>
                <span className="text-gray-500 text-[11px]">1.2 kB (TypeScript)</span>
              </div>
              <div className="flex justify-between py-1 px-2 rounded bg-background-100 border border-gray-200 dark:border-neutral-800">
                <span className="text-gray-800 dark:text-neutral-300">package.json</span>
                <span className="text-gray-500 text-[11px]">780 B</span>
              </div>
              <div className="flex justify-between py-1 px-2 rounded bg-background-100 border border-gray-200 dark:border-neutral-800">
                <span className="text-gray-800 dark:text-neutral-300">README.md</span>
                <span className="text-gray-500 text-[11px]">2.1 kB (Docs)</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500 font-mono">
              Executable aliases: <code className="text-gray-1000">turbo-charger</code> &amp; <code className="text-gray-1000">turbocharger</code>
            </div>
          </div>

          {/* Interactive CLI Console */}
          <div className="lg:col-span-7 rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-gray-1000 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#FF1E56]" />
                Live CLI Execution Console
              </span>
              <div className="flex items-center gap-1 text-xs">
                {['resolve', 'hash', 'audit', 'diag'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCliCmdInput(c);
                      handleRunCliCommand(c);
                    }}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] cursor-pointer ${
                      cliCmdInput === c
                        ? 'bg-[#FF1E56] text-white'
                        : 'bg-background-100 border border-gray-200 dark:border-neutral-800 text-gray-700 hover:text-gray-1000'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-100 px-3 py-1.5 font-mono text-xs text-gray-1000">
                <span className="text-[#FF1E56] font-bold mr-2">$ turbo-charger</span>
                <input
                  type="text"
                  value={cliCmdInput}
                  onChange={(e) => setCliCmdInput(e.target.value)}
                  placeholder="command"
                  className="w-20 bg-transparent text-emerald-500 font-semibold focus:outline-none"
                />
                <input
                  type="text"
                  value={cliArgsInput}
                  onChange={(e) => setCliArgsInput(e.target.value)}
                  placeholder="args (e.g. @repo/ui/button)"
                  className="flex-1 bg-transparent text-gray-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRunCliCommand()}
                disabled={runningCli}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-900 dark:bg-neutral-800 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-black cursor-pointer disabled:opacity-50"
              >
                {runningCli ? 'Executing...' : 'Run CLI'}
              </button>
            </div>

            {/* CLI Output Screen */}
            <div className="rounded-lg border border-neutral-900 bg-black p-3.5 font-mono text-xs text-neutral-300 min-h-[140px] max-h-[220px] overflow-y-auto">
              <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">
                {cliOutput ||
                  `$ npx turbo-charger resolve @repo/ui/button\n\nClick one of the commands above (resolve, hash, audit, diag) or click "Run CLI" to execute turbo-charger live.`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section: NPM Package Inspector & Dry-Run Output */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Package Lookup */}
        <div className="lg:col-span-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <PackageCheck className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-gray-1000">NPM Package Registry Lookup</h3>
            </div>
          </div>

          <form onSubmit={handleLookupPackage} className="flex gap-2">
            <input
              type="text"
              value={pkgSearch}
              onChange={(e) => setPkgSearch(e.target.value)}
              placeholder="e.g. turbo, next, react, @repo/ui"
              className="flex-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 px-3 py-2 font-mono text-xs text-gray-1000 focus:outline-none focus:border-[#0096FF]"
            />
            <button
              type="submit"
              disabled={loadingPkg}
              className="rounded-lg bg-background-200 border border-gray-200 dark:border-neutral-800 px-3.5 py-2 text-xs font-semibold text-gray-1000 hover:border-gray-400 cursor-pointer"
            >
              {loadingPkg ? 'Querying...' : 'Lookup'}
            </button>
          </form>

          {pkgData && (
            <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 p-3 font-mono text-xs space-y-1.5">
              {pkgData.error ? (
                <span className="text-red-400">{pkgData.error}</span>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Package:</span>
                    <span className="text-gray-1000 font-bold">{pkgData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Latest Version:</span>
                    <span className="text-emerald-500 font-semibold">{pkgData.latestVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">License:</span>
                    <span className="text-gray-1000">{pkgData.license}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-neutral-400 pt-1 line-clamp-2">
                    {pkgData.description}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Publish Dry-Run Output */}
        <div className="lg:col-span-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-1000">Publish Output (Dry-Run)</h3>
            <span className="font-mono text-xs text-gray-500">npm publish --dry-run</span>
          </div>

          {dryRunResult ? (
            <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-background-200 p-3.5 font-mono text-xs space-y-2">
              <div className="flex justify-between text-emerald-500 font-semibold">
                <span>{dryRunResult.packageName}@{dryRunResult.version}</span>
                <span>[dry-run ready]</span>
              </div>
              <div className="text-gray-500 text-[11px]">
                {dryRunResult.message}
              </div>
              <div className="pt-1 space-y-1 border-t border-gray-200 dark:border-neutral-800">
                {dryRunResult.files?.map((f: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px] text-gray-600 dark:text-neutral-300">
                    <span>+ {f.path}</span>
                    <span>{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-neutral-800 p-6 text-center text-xs text-gray-500 font-mono">
              Click &quot;Simulate Turborepo Package Publish Dry-Run&quot; to test packaging with your NPM Token.
            </div>
          )}
        </div>
      </div>

      {/* Server Tools Audit Log */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#FF1E56]" />
            <h3 className="text-base font-bold text-gray-1000">Server Tool Activity Logs</h3>
          </div>
          <span className="font-mono text-xs text-gray-500">{logs.length} logged events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-800 text-gray-500">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Command</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-900">
              {logs.map((log) => (
                <tr key={log.id} className="text-gray-800 dark:text-neutral-300">
                  <td className="py-2.5 text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-background-200 px-1.5 py-0.5 text-[10px] text-[#0096FF]">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-gray-1000">{log.command}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-500'
                          : log.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 text-gray-600 dark:text-neutral-400">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
