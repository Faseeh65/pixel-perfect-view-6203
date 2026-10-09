import { site } from "@/data/site";

export function seo({ title, description, path }: { title: string; description: string; path: string }) {
  const url = `${site.url}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${site.url}/og-image.jpg` },
      { property: "og:image:width", content: "1456" },
      { property: "og:image:height", content: "816" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${site.url}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
