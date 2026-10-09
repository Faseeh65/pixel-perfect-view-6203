import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { seo } from "@/lib/seo";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/sections";

export const Route = createFileRoute("/quote")({
  validateSearch: (s: Record<string, unknown>) => ({ product: typeof s.product === "string" ? s.product : undefined }),
  head: () => seo({ title: "Get a Free Packaging Quote | Printzy", description: "Tell us the product, size and quantity. Printzy sends a design and clear price, usually within 24 hours.", path: "/quote" }),
  component: Quote,
});

function Quote() {
  const { product } = Route.useSearch();
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    if (!get("name") || !get("phone") || !get("product")) return setError("Please add your name, phone and product.");
    setError("");
    const title = products.find((p) => p.slug === get("product"))?.title ?? get("product");
    const msg = `Hello Printzy, I would like a quote.\nName: ${get("name")}\nBusiness: ${get("business")}\nPhone: ${get("phone")}\nProduct: ${title}\nQuantity: ${get("quantity")}\nDetails: ${get("details")}`;
    window.open(`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  const field = "min-h-11 bg-card";
  return (
    <>
      <PageHero title="Get a Free Quote" text="Share a few details. We reply with a design and price, usually within 24 hours." />
      <section className="section-pad">
        <form onSubmit={onSubmit} noValidate className="container-site max-w-2xl space-y-5 rounded-2xl bg-card p-6 shadow-soft md:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="name">Your name *</Label><Input id="name" name="name" autoComplete="name" required className={field} /></div>
            <div className="space-y-2"><Label htmlFor="business">Business name</Label><Input id="business" name="business" autoComplete="organization" className={field} /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone / WhatsApp *</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" required className={field} /></div>
            <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" name="quantity" inputMode="numeric" placeholder="e.g. 1000" className={field} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <select id="product" name="product" defaultValue={product ?? ""} required className="flex min-h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground">
              <option value="" disabled>Select a product</option>
              {products.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="details">Size, material or other details</Label><Textarea id="details" name="details" rows={4} className="bg-card" /></div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full"><MessageCircle />Send quote request via WhatsApp</Button>
          <p className="text-center text-sm">Prefer email? Write to <a href={`mailto:${site.email}`} className="font-medium text-secondary underline">{site.email}</a></p>
        </form>
      </section>
    </>
  );
}
