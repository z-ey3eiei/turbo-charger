import React, { useEffect, useState, type JSX, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function VercelLogo({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={`${className ?? ""} fill-black dark:fill-white`}
      fill="none"
      height={22}
      viewBox="0 0 235 203"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M117.082 0L234.164 202.794H0L117.082 0Z" fill="currentColor" />
    </svg>
  );
}

export function TurborepoLogo({
  className,
  monochrome = false,
}: {
  className?: string;
  monochrome?: boolean;
}): JSX.Element {
  const gradientId = `turborepo-logo-gradient-${React.useId().replace(/:/g, "")}`;

  return (
    <svg
      className={className}
      aria-label="Turborepo logomark"
      height="80"
      role="img"
      viewBox="0 0 77 77"
      width="80"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="41.443"
          y1="11.5372"
          x2="10.5567"
          y2="42.4236"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0096FF" />
          <stop offset="1" stopColor="#FF1E56" />
        </linearGradient>
      </defs>
      <path
        className="fill-black dark:fill-white"
        d="M38.5017 18.0956C27.2499 18.0956 18.0957 27.2498 18.0957 38.5016C18.0957 49.7534 27.2499 58.9076 38.5017 58.9076C49.7535 58.9076 58.9077 49.7534 58.9077 38.5016C58.9077 27.2498 49.7535 18.0956 38.5017 18.0956ZM38.5017 49.0618C32.6687 49.0618 27.9415 44.3346 27.9415 38.5016C27.9415 32.6686 32.6687 27.9414 38.5017 27.9414C44.3347 27.9414 49.0619 32.6686 49.0619 38.5016C49.0619 44.3346 44.3347 49.0618 38.5017 49.0618Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M40.2115 14.744V7.125C56.7719 8.0104 69.9275 21.7208 69.9275 38.5016C69.9275 55.2824 56.7719 68.989 40.2115 69.8782V62.2592C52.5539 61.3776 62.3275 51.0644 62.3275 38.5016C62.3275 25.9388 52.5539 15.6256 40.2115 14.744ZM20.5048 54.0815C17.233 50.3043 15.124 45.4935 14.7478 40.2115H7.125C7.5202 47.6025 10.4766 54.3095 15.1088 59.4737L20.501 54.0815H20.5048ZM36.7916 69.8782V62.2592C31.5058 61.883 26.695 59.7778 22.9178 56.5022L17.5256 61.8944C22.6936 66.5304 29.4006 69.483 36.7878 69.8782H36.7916Z"
        fill={monochrome ? "currentColor" : `url(#${gradientId})`}
      />
    </svg>
  );
}

export function GithubLogo({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      height="24"
      shapeRendering="geometricPrecision"
      viewBox="0 0 24 24"
      width="24"
    >
      <path
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        fill="currentColor"
      />
    </svg>
  );
}

// REMOTE_CACHE_COUNTER_START_HOURS from apps/docs/components/remote-cache-counter/constants.ts
export const REMOTE_CACHE_COUNTER_START_HOURS = 12_434_353;

const counterFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

export function RemoteCacheCounterClient({
  className,
}: {
  className?: string;
}) {
  const [hours, setHours] = useState(REMOTE_CACHE_COUNTER_START_HOURS);

  useEffect(() => {
    const interval = setInterval(() => {
      setHours((prev) => prev + Math.floor(Math.random() * 14) + 3);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block tabular-nums min-w-[94.6875px] ${className ?? ""}`}
    >
      {counterFormatter.format(hours)}
    </span>
  );
}

export function InteractiveCommandPrompt({
  tabs,
  className,
}: {
  tabs: Array<{ id: string; label?: string; command: string }>;
  className?: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "default");
  const [copied, setCopied] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const handleCopy = async () => {
    if (!activeTab) return;
    try {
      await navigator.clipboard.writeText(activeTab.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      {tabs.length > 1 && (
        <div className="flex items-center gap-3 text-xs font-medium">
          {tabs.map((tab, idx) => (
            <React.Fragment key={tab.id}>
              {idx > 0 && <span className="text-gray-500">/</span>}
              <button
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={`transition-colors cursor-pointer ${
                  activeId === tab.id
                    ? "text-gray-1000 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="inline-flex items-center gap-3 h-10 px-3.5 rounded-lg bg-background-100 border border-gray-300 shadow-(--ds-shadow-border-small) font-mono text-sm">
        <span className="text-gray-600 select-none">$</span>
        <span className="text-gray-1000 whitespace-nowrap">
          {activeTab?.command}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy command"
          className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-1000 transition-colors cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-green-900" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}

interface CardProps {
  name: string;
  alias: string;
  avatar: string;
  url: string;
  children: ReactNode;
}

export const TestimonialCard = ({
  name,
  alias,
  avatar,
  url,
  children,
}: CardProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-background-100 p-4 transition-colors hover:border-gray-500 md:p-5 no-underline"
    >
      <div className="flex items-center gap-2.5">
        {!imgFailed ? (
          <img
            src={avatar}
            alt={name}
            width={40}
            height={40}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="size-9 rounded-full bg-gray-200 object-cover"
          />
        ) : (
          <div className="size-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-900">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <div className="font-medium text-gray-1000 text-sm">{name}</div>
          <div className="text-gray-900 text-sm">{alias}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 text-gray-900 text-sm leading-relaxed [&_p]:m-0">
        {children}
      </div>
    </a>
  );
};

// Realistic Practitioner Master-Class Insights featuring devstack.bid & ai-sdk.pro
export const Testimonials = () => {
  return (
    <div className="mb-6 mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: devstack.bid Full-Stack Automation */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900/90 dark:to-neutral-950 p-5 shadow-sm hover:border-gray-400 dark:hover:border-neutral-700 transition-all">
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-800 bg-black">
            <img
              src="/assets/aistudio/3198bbfa0_generated_image_f3b3de9f.png"
              alt="Developer engineering workspace"
              className="size-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-mono text-emerald-400 backdrop-blur-xs">
              devstack.bid
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-1000 dark:text-white">
            สถาปัตยกรรม Monorepo ที่ทำได้จริง
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
            "ในฐานะผู้ดูแลระบบ เราไม่จำเป็นต้องเสียเวลากับการคอมไพล์ซ้ำซ้อน หากเราจัดโครงสร้างแพ็กเกจด้วย Task Graph ที่แท้จริง ทุกโมดูลบน <a href="https://devstack.bid" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">devstack.bid</a> เชื่อมโยงกันอย่างแม่นยำ ไม่ต้องพึ่งพาสิ่งที่เพ้อฝัน"
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>แนวทาง: Full-Stack SDK</span>
          <span className="text-emerald-400 font-semibold">100% ประยุกต์ได้จริง</span>
        </div>
      </div>

      {/* Card 2: ai-sdk.pro Agent Sandbox */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900/90 dark:to-neutral-950 p-5 shadow-sm hover:border-gray-400 dark:hover:border-neutral-700 transition-all">
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-800 bg-black">
            <img
              src="/assets/aistudio/46a68812a_generated_image_c3f57939.png"
              alt="Kernel and Diagnostics Terminal"
              className="size-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-mono text-cyan-400 backdrop-blur-xs">
              ai-sdk.pro
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-1000 dark:text-white">
            พลังของ Agent Loops และ Sandboxes
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
            "การให้ AI เข้ามาแก้ไขโค้ดต้องมีขอบเขตการทดสอบที่รัดกุม บน <a href="https://ai-sdk.pro" target="_blank" rel="noopener noreferrer" className="text-cyan-500 underline font-medium">ai-sdk.pro</a> เราให้ Agent รันคำสั่งตรวจเช็คเฉพาะส่วนที่กระทบ ทำให้งานเสร็จไวโดยที่โครงสร้างหลักไม่พังทลาย"
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>แนวทาง: Agentic Loops</span>
          <span className="text-cyan-400 font-semibold">ทดสอบใน Sandbox</span>
        </div>
      </div>

      {/* Card 3: Deterministic Cache Metrics */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900/90 dark:to-neutral-950 p-5 shadow-sm hover:border-gray-400 dark:hover:border-neutral-700 transition-all">
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-800 bg-black">
            <img
              src="/assets/aistudio/2cfcaf728_generated_image_ce245edd.png"
              alt="Data Analytics and Metrics Dashboard"
              className="size-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-mono text-rose-400 backdrop-blur-xs">
              Metrics
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-1000 dark:text-white">
            วิเคราะห์คอขวดและเวลาที่ประหยัดได้
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
            "ตัวเลขไม่เคยหลอกใคร เมื่อเราคำนวณ Hashing ได้ตรงกับอาร์ติแฟกต์ในแคช เวลาบิลด์ใน CI ลดลงมากกว่า 70% นี่คือสิ่งที่วัดผลได้เป็นตัวเงินจริงในทุกโปรเจกต์ที่เราส่งมอบ"
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>แนวทาง: Deterministic Hash</span>
          <span className="text-rose-400 font-semibold">ลดต้นทุน CI จริง</span>
        </div>
      </div>

      {/* Card 4: Topological Graph Architecture */}
      <div className="flex flex-col justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900/90 dark:to-neutral-950 p-5 shadow-sm hover:border-gray-400 dark:hover:border-neutral-700 transition-all">
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-800 bg-black">
            <img
              src="/assets/aistudio/26311c1d8_generated_image_0165995f.png"
              alt="Neural Graph Network"
              className="size-full object-cover"
            />
            <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-mono text-purple-400 backdrop-blur-xs">
              Architecture
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-1000 dark:text-white">
            โครงสร้างกราฟและขอบเขตแพ็กเกจ
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
            "การเขียนโค้ดที่ดีเริ่มจากการวางระเบียบ Boundary Tags ให้เรากั้นโค้ดฝั่งเซิร์ฟเวอร์ออกจากฝั่งไคลเอนต์ เมื่อระบบของเราชัดเจน การสเกลซอฟต์แวร์ระดับองค์กรก็ไม่ใช่เรื่องยากอีกต่อไป"
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>แนวทาง: Boundary Control</span>
          <span className="text-purple-400 font-semibold">กฎระเบียบคมกริบ</span>
        </div>
      </div>
    </div>
  );
};
