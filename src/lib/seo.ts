import { site } from "@/data/site";

const breadcrumbLabels: Record<string, string> = {
  "/about": "About",
  "/contact": "Contact",
  "/gallery": "Gallery",
  "/how-it-works": "How It Works",
  "/industries": "Industries",
  "/privacy": "Privacy Policy",
  "/products": "Products",
  "/quote": "Get a Quote",
  "/terms": "Terms of Service",
};

export function seo({
  title,
  description,
  path,
  robots,
  structuredData,
}: {
  title: string;
  description: string;
  path: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
}) {
  const siteUrl = site.url.replace(/\/$/, "");
  const url = `${siteUrl}${path}`;
  const breadcrumbName = breadcrumbLabels[path];
  const breadcrumb = breadcrumbName
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${siteUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: breadcrumbName,
            item: url,
          },
        ],
      }
    : undefined;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(robots ? [{ name: "robots", content: robots }] : []),
      { property: "og:site_name", content: site.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_PK" },
      { property: "og:image", content: `${siteUrl}/og-image.jpg` },
      { property: "og:image:alt", content: `${site.name} — ${title}` },
      { property: "og:image:width", content: "1456" },
      { property: "og:image:height", content: "816" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${siteUrl}/og-image.jpg` },
      { name: "twitter:image:alt", content: `${site.name} — ${title}` },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [breadcrumb, structuredData]
      .filter((data): data is Record<string, unknown> => data !== undefined)
      .map((data) => ({
        type: "application/ld+json",
        children: JSON.stringify(data),
      })),
  };
}

const canonicalDomainAliases = new Set([
  "printzy.pk",
  "www.printzy.pk",
  "printzy.site",
  "www.printzy.site",
]);

export function getCanonicalRedirectUrl(request: Request): string | undefined {
  const requestUrl = new URL(request.url);
  const canonicalUrl = new URL(site.url);
  const isKnownDomain =
    requestUrl.hostname === canonicalUrl.hostname ||
    canonicalDomainAliases.has(requestUrl.hostname);

  if (
    !isKnownDomain ||
    requestUrl.hostname === "localhost" ||
    requestUrl.hostname === "127.0.0.1"
  ) {
    return undefined;
  }

  if (requestUrl.hostname === canonicalUrl.hostname && requestUrl.protocol === "https:") {
    return undefined;
  }

  return new URL(`${requestUrl.pathname}${requestUrl.search}`, canonicalUrl.origin).href;
}
