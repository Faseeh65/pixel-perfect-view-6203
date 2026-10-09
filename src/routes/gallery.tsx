import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHero, GalleryGrid, QuoteCTA } from "@/components/site/sections";

export const Route = createFileRoute("/gallery")({
  head: () => seo({ title: "Packaging Gallery | Printzy", description: "See examples of custom printed cups, boxes, bags, napkins and takeaway packaging made by Printzy.", path: "/gallery" }),
  component: () => (
    <>
      <PageHero title="Our Work" text="A look at the cups, boxes, bags and takeaway sets we print for brands." />
      <section className="section-pad"><div className="container-site"><GalleryGrid /></div></section>
      <QuoteCTA />
    </>
  ),
});
