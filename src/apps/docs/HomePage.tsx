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
    illustration: <MonorepoVisual />,
  },
];

const AGENT_FEATURES: HomepageFeature[] = [
  {
    title: "Faster validation loops",
    description:
      "Run only the checks affected by each change, so agents can verify their work and iterate without waiting on the entire repository.",
    illustration: <ValidationLoopsVisual />,
  },
  {
    title: "Monorepo expertise, on demand",
    description:
      "Agent Skills give your coding agent Turborepo best practices and the context it needs to make the right changes across your monorepo.",
    illustration: <AgentSkillsVisual />,
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
    illustration: <TurboDocsVisual />,
  },
];

const simpleTurboJson = `{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}`;

const remoteCachingCommands = `# Link to Remote Cache
turbo login
turbo link

# Run tasks
turbo run build
turbo run build --affected`;

const intelligenceCommands = `# Find tasks
turbo run
# Find packages
turbo ls

# Get deep repository context
turbo query --schema`;

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

function OpenSourceMetrics() {
  const [downloads, setDownloads] = useState(FALLBACK.downloads);
  const [stars, setStars] = useState(FALLBACK.stars);
  const [openIssues, setOpenIssues] = useState(FALLBACK.openIssues);

  useEffect(() => {
    fetch("https://api.npmjs.org/downloads/range/last-month/turbo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.downloads?.length >= 21) {
          const recentDownloads = data.downloads.slice(-21);
          const weeklyTotals = [0, 7, 14].map((start) =>
            recentDownloads
              .slice(start, start + 7)
              .reduce((total: number, day: { downloads: number }) => total + day.downloads, 0)
          );
          setDownloads(formatNumber(Math.max(...weeklyTotals)));
        }
      })
      .catch(() => {});

    fetch("https://api.github.com/repos/vercel/turborepo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (typeof data?.stargazers_count === "number") {
          setStars(formatNumber(data.stargazers_count));
        }
        if (typeof data?.open_issues_count === "number") {
          setOpenIssues(data.open_issues_count);
        }
      })
      .catch(() => {});
  }, []);

  const metrics = [
    {
      id: "compute-hours",
      label: (
        <>
          Compute hours saved
          <span className="hidden lg:inline"> with Remote Caching</span>
        </>
      ),
      value: (
        <RemoteCacheCounterClient className="min-w-0 text-[inherit] leading-[inherit] font-[inherit] tracking-[inherit]" />
      ),
    },
    { id: "downloads", label: "Weekly downloads", value: downloads },
    { id: "stars", label: "GitHub stars", value: stars },
    {
      id: "issues",
      label: openIssues === 1 ? "Open issue" : "Open issues",
      value: formatNumber(openIssues),
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-10 py-10 sm:gap-x-8 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:gap-x-12 lg:py-12 border-y border-gray-300">
      {metrics.map((metric, index) => {
        const isFeatured = index === 0;
        return (
          <div
            className={isFeatured ? "min-w-0" : "min-w-0 lg:justify-self-end"}
            key={metric.id}
          >
            <dt
              className={
                isFeatured
                  ? "text-heading-32 sm:text-heading-40 lg:text-heading-64 inline-block bg-gradient-to-r from-[#FF1E56] to-[#0196FF] bg-clip-text pr-1 text-transparent"
                  : "text-heading-32 sm:text-heading-40 lg:text-heading-64 text-gray-1000"
              }
            >
              {metric.value}
            </dt>
            <dd className="text-copy-16 text-gray-1000 sm:whitespace-nowrap mt-1">
              {metric.label}
            </dd>
          </div>
        );
      })}
    </dl>
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
      <section className="relative grid grid-cols-1 items-center gap-12 py-12 lg:py-28 lg:grid-cols-12 lg:gap-0">
        <div className="relative z-1 flex flex-col justify-center lg:col-span-7 lg:pr-16">
          <h1 className="lg:max-w-[700px] text-heading-40 sm:text-heading-48 xl:text-heading-64">
            Your codebase, faster
          </h1>
          <p className="mt-6 text-balance text-gray-900 text-copy-18 max-w-2xl">
            Turborepo is the build system for coding agents. Developers, CI, and
            agents never do the same work twice.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
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
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>⚡ Open Factory Sandboxes (OpenAI SDK)</span>
            </button>
          </div>
        </div>
        <div className="relative order-first mx-auto flex min-h-56 w-full items-center justify-center pt-4 lg:order-last lg:col-span-5 lg:min-h-80 lg:pt-0">
          <SmoothMetallicGauge className="w-full max-w-[460px]" />
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

      <section className="py-10 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-y-4 md:flex-row">
          <div className="flex flex-col gap-y-1">
            <h2 className="text-heading-32 lg:text-heading-40">Simple setup</h2>
            <p className="text-muted-foreground text-base leading-6 text-pretty">
              Start a new repository or migrate an existing repo incrementally
              in minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("studio")}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-background-100 border border-gray-300 hover:border-gray-500 text-gray-1000 transition-colors cursor-pointer"
          >
            Read the docs &amp; Studio
          </button>
        </div>
        <div className="mt-6 grid w-full auto-rows-fr grid-cols-1 items-stretch gap-x-6 gap-y-6 md:grid-cols-3 md:gap-y-10 lg:gap-y-12">
          <HighlightedCode
            caption="Declare a build task"
            lang="json"
            code={simpleTurboJson}
          />
          <HighlightedCode
            caption="Link to Remote Cache and run tasks"
            lang="bash"
            code={remoteCachingCommands}
          />
          <HighlightedCode
            caption="Streamline monorepo intelligence"
            lang="bash"
            code={intelligenceCommands}
          />
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <h2 className="text-heading-32 sm:text-center sm:text-balance lg:text-heading-40">
          What builders say about Turborepo
        </h2>
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
