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

// Exact Testimonials from apps/docs/components/testimonials.tsx
export const Testimonials = () => {
  return (
    <div className="mb-6 mt-12 grid grid-cols-1 gap-6 min-[780px]:grid-cols-3">
      <div className="grid gap-6">
        <TestimonialCard
          name="Matt Pocock"
          alias="@mattpocockuk"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/mattpocockuk.jpg"
          url="https://x.com/mattpocockuk/status/1498696992943452168"
        >
          <p className="mb-4">
            🤯 @turborepo saved us 67 HOURS of CI since we adopted it.
          </p>
          <p>That's a team of only 4 full-time devs at @statelyai. Nuts.</p>
        </TestimonialCard>
        <TestimonialCard
          name="Lewis ⚡"
          alias="@lewisbuildsai"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/lewisbuildsai.jpg"
          url="https://x.com/lewisbuildsai/status/1906014322926420104"
        >
          <p className="mb-4">
            If turborepo has a million fans, then I am one of them. If turborepo
            has ten fans, then I am one of them. If turborepo has only one fan
            then that is me. If turborepo has no fans, then that means I am no
            longer on earth. If the world is against turborepo, then I am
            against the world.
          </p>
        </TestimonialCard>
      </div>

      <div className="grid gap-6">
        <TestimonialCard
          name="Cory House"
          alias="@housecor"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/housecor.jpg"
          url="https://x.com/housecor/status/1580923528596946944"
        >
          <p className="mb-4">
            I'm really enjoying @turborepo. It's a game changer.
          </p>

          <p className="mb-4">
            With Turbo, I have an incentive to break my repo down into many
            small, focused packages. This way, Turbo can cache each little
            build. So when I hit save, only the package I changed needs to
            recompile.
          </p>
          <p>Really speeds things up!</p>
        </TestimonialCard>
        <TestimonialCard
          name="Shrey Gupta"
          alias="@shreygups"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/shreygups.jpg"
          url="https://x.com/shreygups/status/1900284978367520817"
        >
          <p>wait i kinda love turborepo</p>
        </TestimonialCard>
        <TestimonialCard
          name="Jono Alford"
          alias="@jonoalford"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/jonoalford.jpg"
          url="https://x.com/jonoalford/status/1989274609192169943?s=20"
        >
          <p>
            The second we started using this for monorepos is the second we
            stopped having to worry about using monorepos.
          </p>
        </TestimonialCard>
      </div>
      <div className="grid gap-6">
        <TestimonialCard
          name="ALIAS"
          alias="LoadingALIAS"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/loadingalias.jpg"
          url="https://x.com/LoadingALIAS/status/1903228609021477283"
        >
          <p>Turborepo is the best.</p>
        </TestimonialCard>
        <TestimonialCard
          name="Andrew Lisowski"
          alias="@HipsterSmoothie"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/hipstersmoothie.jpg"
          url="https://x.com/HipsterSmoothie/status/1829245704386269515"
        >
          <p>
            Just setting up @turborepo in @DescriptApp's front-end cut our bill
            in half and saved us $20k
          </p>
        </TestimonialCard>
        <TestimonialCard
          name="Pontus Abrahamsson"
          alias="@pontusab"
          avatar="https://ufa25dqjajkmio0q.public.blob.vercel-storage.com/user-avatars/pontusab.jpg"
          url="https://x.com/pontusab/status/1827264818765799931"
        >
          <p>
            I love a monorepo setup, having everything in one place powered by
            Turborepo 🔥
          </p>
        </TestimonialCard>
      </div>
    </div>
  );
};
