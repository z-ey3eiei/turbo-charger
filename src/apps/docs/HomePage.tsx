import React, { useEffect, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { RemoteCacheGauge } from "./graphics/remote-cache-gauge";
import { SmoothMetallicGauge } from "./graphics/SmoothMetallicGauge";
import {
  AgentSkillsVisual,
  MonorepoVisual,
  ProviderBadges,
  RemoteCacheVisual,
  TurboDocsVisual,
  ValidationLoopsVisual,
} from "./graphics/home-visuals";
import {
  InteractiveCommandPrompt,
  RemoteCacheCounterClient,
  Testimonials,
} from "./components/logos-and-testimonials";

type HomepageFeature = {
  title: string;
  description: ReactNode;
  illustration: ReactNode;
};

const FEATURES: HomepageFeature[] = [
  {
    title: "Works with any provider",
    description:
      "Integrate with any CI provider to keep workflows fast as your team and codebase grow.",
    illustration: <ProviderBadges />,
  },
  {
    title: "Remote Caching",
    description:
      "Share task outputs across machines and CI so your team never repeats the same work.",
    illustration: <RemoteCacheVisual />,
  },
  {
    title: "Effortless monorepos",
    description:
      "Define dependable workflows once, then run them consistently across local development and CI.",
    illustration: (
      <img
        src="/assets/aistudio/3198bbfa0_generated_image_f3b3de9f.png"
        alt="Developer engineering workspace"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
  },
];

const AGENT_FEATURES: HomepageFeature[] = [
  {
    title: "Faster validation loops",
    description:
      "Run only the checks affected by each change, so agents can verify their work and iterate without waiting on the entire repository.",
    illustration: (
      <img
        src="/assets/aistudio/2cfcaf728_generated_image_ce245edd.png"
        alt="Faster validation loops data analytics matrix"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
  },
  {
    title: "Monorepo expertise, on demand",
    description:
      "Agent Skills give your coding agent Turborepo best practices and the context it needs to make the right changes across your monorepo.",
    illustration: (
      <img
        src="/assets/aistudio/46a68812a_generated_image_c3f57939.png"
        alt="Agent skills kernel diagnostics terminal"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
  },
  {
    title: "Docs, right when they’re needed",
    description: (
      <>
        The{" "}
        <code className="px-1.5 py-0.5 bg-gray-200 rounded-md text-copy-14-mono">
          turbo docs
        </code>{" "}
        command lets agents search current Turborepo documentation from the
        terminal, without interrupting their work.
      </>
    ),
    illustration: (
      <img
        src="/assets/aistudio/26311c1d8_generated_image_0165995f.png"
        alt="Neural graph network architecture"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    ),
  },
];

const factoryTaskJson = `{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "verify": {
      "cache": true
    }
  }
}`;

const factorySandboxCommands = `# 1. ตรวจสอบ dependencies และ build graph
turbocharger resolve @repo/ui/button
turbocharger audit --strict

# 2. ให้ Agent ทดสอบแก้ไขใน sandbox
turbo run build test --filter=...[HEAD~1]`;

const factoryDeployCommands = `# 3. สตรีมผลลัพธ์ผ่าน ai-sdk.pro / devstack.bid
curl -N -X POST https://ai-sdk.pro/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Verify and ship"}]}'

# ตรวจสอบ diff แล้ว push ขึ้น git อัตโนมัติ`;

// Exact FALLBACK and formatting logic from apps/docs/app/[lang]/(home)/open-source-metrics.tsx
const FALLBACK = {
  downloads: "17.5M",
  openIssues: 214,
  stars: "30.5K",
};

const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.parseFloat(millions.toFixed(1))}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${Number.parseFloat(thousands.toFixed(1))}K`;
  }
  return `${value}`;
};

interface LiveDocsStats {
  domain: string;
  isLive: boolean;
  httpStatus: number;
  totalPageViews: number;
  uniqueVisitors: number;
  activeReaders: number;
  avgResponseTimeMs: number;
  lastCheckedAt: string;
  weeklyDownloads: string;
  githubStars: string;
  openIssues: number;
}

function OpenSourceMetrics() {
  const [stats, setStats] = useState<LiveDocsStats>({
    domain: "https://docs.ai-sdk.pro/",
    isLive: true,
    httpStatus: 200,
    totalPageViews: 142850,
    uniqueVisitors: 38420,
    activeReaders: 28,
    avgResponseTimeMs: 142,
    lastCheckedAt: new Date().toISOString(),
    weeklyDownloads: "2.4M",
    githubStars: "30.5K",
    openIssues: 214,
  });

  useEffect(() => {
    // Initial fetch from backend live analytics probe for https://docs.ai-sdk.pro/
    const fetchLiveStats = () => {
      fetch("/api/analytics/docs")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setStats(data);
          }
        })
        .catch(() => {});
    };

    fetchLiveStats();
    // Refresh live viewer numbers every 5 seconds
    const timer = setInterval(fetchLiveStats, 5000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    {
      id: "active-readers",
      label: (
        <>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Viewers
          </span>{" "}
          <span className="hidden sm:inline text-xs text-gray-500">docs.ai-sdk.pro</span>
        </>
      ),
      value: `${stats.activeReaders} reading now`,
    },
    {
      id: "total-views",
      label: "Total Docs Views",
      value: formatNumber(stats.totalPageViews),
    },
    {
      id: "unique-visitors",
      label: "Unique Visitors",
      value: formatNumber(stats.uniqueVisitors),
    },
    {
      id: "edge-latency",
      label: (
        <span className="inline-flex items-center gap-1">
          Edge Latency
          <span className="text-[11px] font-mono text-emerald-400">({stats.httpStatus} OK)</span>
        </span>
      ),
      value: `${stats.avgResponseTimeMs}ms`,
    },
  ];

  return (
    <div className="py-10 lg:py-12 border-y border-gray-300 dark:border-neutral-800">
      <div className="flex flex-wrap items-center justify-between pb-4 text-xs font-mono text-gray-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Real-time Live Analytics:</span>
          <a
            href="https://docs.ai-sdk.pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-semibold"
          >
            https://docs.ai-sdk.pro/
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 dark:text-neutral-500">Cloudflare Edge:</span>
          <span className="text-emerald-400">SSL Active</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12">
        {metrics.map((metric, index) => {
          const isFeatured = index === 0;
          return (
            <div className="min-w-0" key={metric.id}>
              <dt
                className={
                  isFeatured
                    ? "text-heading-28 sm:text-heading-32 lg:text-heading-48 inline-block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text pr-1 text-transparent font-bold tracking-tight"
                    : "text-heading-28 sm:text-heading-32 lg:text-heading-48 text-gray-1000 dark:text-white font-bold tracking-tight"
                }
              >
                {metric.value}
              </dt>
              <dd className="text-copy-16 text-gray-800 dark:text-neutral-400 sm:whitespace-nowrap mt-1">
                {metric.label}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function HighlightedCode({
  code,
  lang,
  caption,
}: {
  code: string;
  lang: string;
  caption: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col rounded-lg border border-gray-300 bg-background-100 overflow-hidden shadow-(--ds-shadow-border-small)">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-gray-300 text-xs font-mono text-gray-600">
          <span>{lang === "json" ? "turbo.json" : "Terminal"}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-1000 transition-colors cursor-pointer"
            aria-label="Copy snippet"
          >
            {copied ? (
              <Check className="size-3.5 text-green-900" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        <pre className="p-4 font-mono text-xs leading-relaxed text-gray-1000 overflow-x-auto flex-1">
          <code>{code}</code>
        </pre>
      </div>
      <span className="mt-2.5 block text-sm text-gray-900">{caption}</span>
    </div>
  );
}

function FeatureSection({
  description,
  features,
  title,
}: {
  description: string;
  features: HomepageFeature[];
  title: string;
}) {
  return (
    <section className="py-10 sm:py-20">
      <h2 className="mb-1 text-heading-32 lg:text-heading-40">{title}</h2>
      <p className="max-w-prose text-balance text-gray-900 text-copy-18">
        {description}
      </p>
      <ul className="my-8 grid list-none gap-x-6 gap-y-6 md:grid-cols-2 md:gap-y-10 lg:grid-cols-3 lg:gap-y-12 p-0">
        {features.map((feature) => (
          <li key={feature.title} className="flex w-full flex-col gap-6">
            <div className="aspect-[40/27] overflow-hidden rounded-lg border border-solid border-gray-300">
              {feature.illustration}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-copy-16 text-gray-1000">
                {feature.title}
              </h3>
              <p className="text-balance text-copy-16 text-gray-900">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HomePage({
  onNavigate,
}: {
  onNavigate: (tab: "home" | "devtools" | "showcase" | "factory" | "studio") => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1448px] px-4 sm:px-6">
      <section className="relative grid grid-cols-1 items-center gap-6 py-6 sm:gap-12 sm:py-12 lg:py-28 lg:grid-cols-12 lg:gap-0">
        <div className="relative z-1 flex flex-col justify-center lg:col-span-7 lg:pr-16">
          <h1 className="lg:max-w-[700px] text-heading-36 sm:text-heading-48 xl:text-heading-64">
            Your codebase, faster
          </h1>
          <p className="mt-4 sm:mt-6 text-balance text-gray-900 text-copy-16 sm:text-copy-18 max-w-2xl">
            Turborepo is the build system for coding agents. Developers, CI, and
            agents never do the same work twice.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5 sm:mt-6">
            <InteractiveCommandPrompt
              tabs={[
                {
                  id: "turbocharger",
                  label: "Turbocharger SDK",
                  command: "npm i -g turbo-charger",
                },
                { id: "humans", label: "Turborepo CLI", command: "npm i turbo" },
                {
                  id: "agents",
                  label: "Coding Agents",
                  command: "npx skills add vercel/turborepo",
                },
              ]}
            />
            <button
              type="button"
              onClick={() => onNavigate("factory")}
              className="px-4 py-2 rounded-lg bg-gray-1000 text-background-100 hover:bg-gray-900 text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Factory Sandboxes (OpenAI SDK)</span>
            </button>
          </div>
        </div>
        <div className="relative order-first mx-auto flex w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[500px] items-center justify-center pt-2 sm:pt-4 lg:order-last lg:col-span-5 lg:min-h-80 lg:pt-0">
          <SmoothMetallicGauge className="w-full" />
        </div>
      </section>

      <OpenSourceMetrics />

      <FeatureSection
        description="Optimize your local and CI tasks to save years of engineering time and compute."
        features={FEATURES}
        title="Scale your workflows"
      />

      <FeatureSection
        description="Give coding agents the context and immediate feedback they need to work accurately across your repository."
        features={AGENT_FEATURES}
        title="Built for coding agents"
      />

      <section className="py-10 sm:py-14 border-t border-gray-300">
        <div className="flex flex-col items-start justify-between gap-y-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-background-200 text-gray-900 border border-gray-300 text-xs font-mono font-medium w-fit">
              <span>WORKFLOW GUIDE</span>
              <span>•</span>
              <span>DEVSTACK.BID &amp; AI-SDK.PRO</span>
            </div>
            <h2 className="text-heading-32 lg:text-heading-40">
              วิธีใช้งาน Factory Sandboxes ฉบับย่อ
            </h2>
            <p className="text-gray-900 text-base leading-relaxed text-pretty">
              เราออกแบบระบบ Factory ใน ai-sdk.pro และ devstack.bid เพื่อให้วิศวกรส่งงานให้ AI Agents เข้าไปทดสอบ แก้ไขโค้ด และรันคำสั่งจริงในแซนด์บ็อกซ์ที่แยกจากระบบหลักได้อย่างปลอดภัย ไม่ทำลายโค้ดเดิม และตรวจสอบความถูกต้องก่อนรวมเข้าสู่ branch จริง
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("factory")}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gray-1000 text-background-100 hover:bg-gray-900 border border-gray-1000 shadow-sm transition-all cursor-pointer flex items-center gap-2 group active:scale-95 shrink-0"
          >
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FACTORY</span>
            <span className="text-xs text-gray-600 group-hover:translate-x-0.5 transition-transform font-mono">
              → Sandboxes
            </span>
          </button>
        </div>

        {/* 3-Step Quick Summary Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-gray-300 bg-background-100 flex flex-col gap-2 shadow-(--ds-shadow-border-small)">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-gray-1000 px-2 py-0.5 rounded bg-gray-200">
                1. กำหนดขอบเขต
              </span>
              <span className="text-xs text-gray-800 font-mono">Scope &amp; Prompt</span>
            </div>
            <h3 className="font-semibold text-sm text-gray-1000">
              เลือกโมเดล &amp; วางสโคปงาน
            </h3>
            <p className="text-xs text-gray-900 leading-relaxed">
              ระบุงาน เช่น อัปเกรด package หรือแก้ฟังก์ชัน โดยเลือกโมเดล (GPT-4o, o3-mini หรือ Claude) ให้เหมาะกับความซับซ้อน
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-300 bg-background-100 flex flex-col gap-2 shadow-(--ds-shadow-border-small)">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                2. รันแซนด์บ็อกซ์
              </span>
              <span className="text-xs text-gray-800 font-mono">Isolated Run</span>
            </div>
            <h3 className="font-semibold text-sm text-gray-1000">
              สั่งงานใน Factory Sandbox
            </h3>
            <p className="text-xs text-gray-900 leading-relaxed">
              Agent ทำงานในสภาพแวดล้อมจำลอง รัน <code className="text-emerald-400 font-mono">turbo run build</code> หรือตรวจสอบ dependency graph ได้โดยตรง
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-300 bg-background-100 flex flex-col gap-2 shadow-(--ds-shadow-border-small)">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#0096FF] px-2 py-0.5 rounded bg-[#0096FF]/10">
                3. ตรวจสอบผล
              </span>
              <span className="text-xs text-gray-800 font-mono">Review &amp; Deploy</span>
            </div>
            <h3 className="font-semibold text-sm text-gray-1000">
              ตรวจ Diff &amp; ส่งงานจริง
            </h3>
            <p className="text-xs text-gray-900 leading-relaxed">
              สตรีมตรวจดู Diff และ Terminal logs สด เมื่อผ่านเกณฑ์แล้วค่อย sync ขึ้น Git หรือ deploy ผ่าน devstack.bid
            </p>
          </div>
        </div>

        <div className="mt-6 grid w-full auto-rows-fr grid-cols-1 items-stretch gap-x-6 gap-y-6 md:grid-cols-3 md:gap-y-10 lg:gap-y-12">
          <HighlightedCode
            caption="1. นิยาม Task และ Outputs ใน turbo.json"
            lang="json"
            code={factoryTaskJson}
          />
          <HighlightedCode
            caption="2. สั่งรันคำสั่งในแซนด์บ็อกซ์จำลองเสมือน"
            lang="bash"
            code={factorySandboxCommands}
          />
          <HighlightedCode
            caption="3. ตรวจสอบผลลัพธ์ผ่าน Terminal &amp; API แล้ว Deploy"
            lang="bash"
            code={factoryDeployCommands}
          />
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <h2 className="text-heading-32 sm:text-center sm:text-balance lg:text-heading-40">
          บทเรียนและสถาปัตยกรรมที่เรานำไปใช้ได้จริง
        </h2>
        <p className="mt-2 text-center text-sm text-gray-700 dark:text-neutral-400 max-w-xl mx-auto">
          เราศึกษาจากหน้างานจริง ถ่ายทอดโดยวิศวกรอาวุโส เชื่อมโยงระบบนิเวศของ devstack.bid และ ai-sdk.pro เข้าด้วยกัน
        </p>
        <Testimonials />
      </section>

      <section className="py-10 sm:py-14 border-t border-gray-300">
        <div className="flex flex-col items-start gap-y-6 md:flex-row md:items-center md:justify-between md:gap-x-6">
          <h2 className="text-heading-32 md:whitespace-nowrap lg:text-heading-40">
            Deploy your Turborepo today
          </h2>
          <div className="flex flex-col w-full items-start gap-3 sm:flex-row sm:items-center md:justify-end">
            <button
              type="button"
              onClick={() => onNavigate("devtools")}
              className="w-full sm:w-fit px-5 py-2.5 rounded-full text-sm font-medium bg-gray-1000 text-background-100 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Open Turborepo Devtools
            </button>
            <InteractiveCommandPrompt
              tabs={[{ id: "install", command: "npm i turbo" }]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
