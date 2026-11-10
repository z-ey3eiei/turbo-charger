import type { CSSProperties } from "react";

export interface ShowcaseCompany {
  caption: string;
  slug: string;
  infoLink: string;
  style?: CSSProperties;
}

// Exact 50 companies from apps/docs/app/_clients/users.ts in z-ey3eiei/Turborepo
export const SHOWCASE_USERS: Array<ShowcaseCompany> = [
  { caption: "Vercel", slug: "vercel", infoLink: "https://vercel.com/", style: { width: 150 } },
  { caption: "AWS", slug: "aws", infoLink: "https://aws.amazon.com/", style: { width: 75 } },
  { caption: "Microsoft", slug: "microsoft", infoLink: "https://www.microsoft.com/", style: { width: 125 } },
  { caption: "Netflix", slug: "netflix", infoLink: "https://netflix.com/", style: { width: 110 } },
  { caption: "Disney", slug: "disney", infoLink: "https://www.disney.com/" },
  { caption: "Github", slug: "github", infoLink: "https://www.github.com/", style: { width: 110 } },
  { caption: "Linear", slug: "linear", infoLink: "https://www.linear.app/", style: { width: 110 } },
  { caption: "Alibaba", slug: "alibaba", infoLink: "https://www.alibaba.com/", style: { width: 125 } },
  { caption: "Ant Group", slug: "ant", infoLink: "https://antgroup.com/", style: { width: 125 } },
  { caption: "Adobe", slug: "adobe", infoLink: "https://www.adobe.com/" },
  { caption: "PayPal", slug: "paypal", infoLink: "https://www.paypal.com/" },
  { caption: "Snap", slug: "snap", infoLink: "https://snap.com/" },
  { caption: "SAP", slug: "sap", infoLink: "https://www.sap.com/", style: { width: 75 } },
  { caption: "Shopify", slug: "shopify", infoLink: "https://www.shopify.com/", style: { width: 125 } },
  { caption: "Datadog", slug: "datadog", infoLink: "https://www.datadoghq.com/", style: { width: 125 } },
  { caption: "Twilio", slug: "twilio", infoLink: "https://www.twilio.com/" },
  { caption: "Segment", slug: "segment", infoLink: "https://segment.com/", style: { width: 125 } },
  { caption: "Twitch", slug: "twitch", infoLink: "https://www.twitch.tv/", style: { width: 125 } },
  { caption: "Xiaomi", slug: "xiaomi", infoLink: "https://www.mi.com/", style: { width: 50 } },
  { caption: "Line", slug: "line", infoLink: "https://line.me/", style: { width: 75 } },
  { caption: "ESPN", slug: "espn", infoLink: "https://www.espn.com/", style: { width: 125 } },
  { caption: "Volvo", slug: "volvo", infoLink: "https://www.volvo.com/", style: { width: 60 } },
  { caption: "Hearst", slug: "hearst", infoLink: "https://www.hearst.com/", style: { width: 175 } },
  { caption: "The Washington Post", slug: "washingtonpost", infoLink: "https://www.washingtonpost.com/", style: { width: 175 } },
  { caption: "Wayfair", slug: "wayfair", infoLink: "https://www.wayfair.com/", style: { width: 125 } },
  { caption: "Hulu", slug: "hulu", infoLink: "https://www.hulu.com/" },
  { caption: "CrowdStrike", slug: "crowdstrike", infoLink: "https://www.crowdstrike.com/", style: { width: 150 } },
  { caption: "Binance", slug: "binance", infoLink: "https://www.binance.com/", style: { width: 150 } },
  { caption: "Plex", slug: "plex", infoLink: "https://www.plex.tv/" },
  { caption: "Groupon", slug: "groupon", infoLink: "https://groupon.com/", style: { width: 125 } },
  { caption: "Vimeo", slug: "vimeo", infoLink: "https://vimeo.com/" },
  { caption: "GoodRx", slug: "goodrx", infoLink: "https://www.goodrx.com/", style: { width: 150 } },
  { caption: "Tripadvisor", slug: "tripadvisor", infoLink: "https://www.tripadvisor.com/", style: { width: 150 } },
  { caption: "RapidAPI", slug: "rapidapi", infoLink: "https://rapidapi.com/", style: { width: 150 } },
  { caption: "Miro", slug: "miro", infoLink: "https://miro.com/" },
  { caption: "Lattice", slug: "lattice", infoLink: "https://lattice.com/", style: { width: 150 } },
  { caption: "Watershed", slug: "watershed", infoLink: "https://watershed.com/", style: { width: 150 } },
  { caption: "N26", slug: "n26", infoLink: "https://n26.com/", style: { width: 75 } },
  { caption: "Sourcegraph", slug: "sourcegraph", infoLink: "https://sourcegraph.com/", style: { width: 150 } },
  { caption: "Big Commerce", slug: "bigcommerce", infoLink: "https://www.bigcommerce.com/", style: { width: 150 } },
  { caption: "Framer", slug: "framer", infoLink: "https://www.framer.com/" },
  { caption: "Builder.io", slug: "builderio", infoLink: "https://www.builder.io/", style: { width: 125 } },
  { caption: "Contentful", slug: "contentful", infoLink: "https://www.contentful.com/", style: { width: 150 } },
  { caption: "Xata", slug: "xata", infoLink: "https://xata.io/" },
  { caption: "Cal.com", slug: "calcom", infoLink: "https://cal.com/" },
  { caption: "Codesandbox", slug: "codesandbox", infoLink: "https://codesandbox.io/", style: { width: 150 } },
  { caption: "WooCommerce", slug: "woocommerce", infoLink: "https://woocommerce.com/", style: { width: 150 } },
  { caption: "Expo", slug: "expo", infoLink: "https://expo.dev/" },
  { caption: "Endear", slug: "endear", infoLink: "https://endearhq.com/" },
  { caption: "Makeswift", slug: "makeswift", infoLink: "https://www.makeswift.com/" },
];

export function ShowcasePage() {
  return (
    <div className="mx-auto w-full max-w-[1448px] px-4 sm:px-6 pt-8 pb-20">
      <div className="mx-auto">
        <div className="py-12 lg:text-center">
          <h1 className="mb-4 mt-2 text-center text-heading-48 lg:text-heading-56">
            Showcase
          </h1>
          <p className="text-center text-copy-20 text-gray-900">
            Who is using Turborepo?
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 items-center justify-items-center gap-8 sm:gap-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {SHOWCASE_USERS.map((user) => (
          <a
            key={user.caption}
            href={user.infoLink}
            target="_blank"
            rel="noreferrer"
            title={user.caption}
            className="flex h-20 w-full items-center justify-center p-4 rounded-lg border border-transparent hover:border-gray-300 hover:bg-background-100 transition-colors"
          >
            {/* Dark mode logo (white SVG from public/images/logos/white) */}
            <img
              src={`/images/logos/white/${user.slug}.svg`}
              alt={user.caption}
              style={user.style ?? { width: 110 }}
              referrerPolicy="no-referrer"
              className="hidden dark:block max-h-10 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
            {/* Light mode logo (color SVG from public/images/logos/color) */}
            <img
              src={`/images/logos/color/${user.slug}.svg`}
              alt={user.caption}
              style={user.style ?? { width: 110 }}
              referrerPolicy="no-referrer"
              className="block dark:hidden max-h-10 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
