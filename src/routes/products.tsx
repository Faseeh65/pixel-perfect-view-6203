import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { ProductsSection, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/products")({
  head: () =>
    seo({
      title: "Custom Packaging Products | Printzy",
      description:
        "Printed cups, boxes, pizza boxes, takeaway packaging, napkins, paper bags, sleeves and stickers. Choose a product and get a quote.",
      path: "/products",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Custom printed packaging products",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.title,
            description: product.benefit,
            image: new URL(product.image, site.url).href,
            brand: { "@type": "Brand", name: site.name },
            url: `${site.url}/quote?product=${encodeURIComponent(product.slug)}`,
          },
        })),
      },
    }),
  component: () => (
    <>
      <ProductsSection heading="h1" />
      <QuoteCTA />
    </>
  ),
});
