import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { ProductsSection, CustomizeSection, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/products")({
  head: () => seo({ title: "Custom Packaging Products | Printzy", description: "Printed cups, boxes, pizza boxes, takeaway packaging, napkins, paper bags, sleeves and stickers. Choose a product and get a quote.", path: "/products" }),
  component: () => (
    <>
      <ProductsSection heading="h1" />
      <CustomizeSection />
      <QuoteCTA />
    </>
  ),
});
