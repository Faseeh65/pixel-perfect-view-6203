import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { z } from "zod";
import { seo } from "@/lib/seo";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/site/sections";
import { TurnstileCaptcha } from "@/components/site/TurnstileCaptcha";

export const Route = createFileRoute("/quote")({
  validateSearch: (s: Record<string, unknown>) => ({ product: typeof s.product === "string" ? s.product : undefined }),
  head: () => seo({ title: "Get a Free Packaging Quote | Printzy", description: "Tell us the product, size and quantity. Printzy sends a design and clear price, usually within 24 hours.", path: "/quote" }),
  component: Quote,
});

const quoteSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name must be under 100 characters."),
  business: z.string().trim().max(100, "Business name must be under 100 characters.").optional().default(""),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30, "Phone number must be under 30 characters.")
    .regex(/^[\d\s\+\-\(\)]{7,30}$/, "Please enter a valid phone format."),
  quantity: z.string().trim().max(20, "Quantity must be under 20 characters.").optional().default(""),
  product: z.string().trim().min(1, "Please select a product."),
  details: z.string().trim().max(1000, "Details must be under 1000 characters.").optional().default(""),
  hp_website: z.string().max(0, "Bot submission blocked."),
});

function Quote() {
  const { product } = Route.useSearch();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    
    const parseResult = quoteSchema.safeParse({
      name: f.get("name"),
      business: f.get("business"),
      phone: f.get("phone"),
      quantity: f.get("quantity"),
      product: f.get("product"),
      details: f.get("details"),
      hp_website: f.get("hp_website"),
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? "Invalid input.";
      return setError(firstError);
    }

    const data = parseResult.data;
    setError("");
    setSubmitted(true);

    const title = products.find((p) => p.slug === data.product)?.title ?? data.product;
    const msg = `Hello Printzy, I would like a quote.\nName: ${data.name}\nBusiness: ${data.business}\nPhone: ${data.phone}\nProduct: ${title}\nQuantity: ${data.quantity}\nDetails: ${data.details}`;
    
    window.open(`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  const field = "min-h-11 bg-card";
  return (
    <>
      <PageHero title="Get a Free Quote" text="Share a few details. We reply with a design and price, usually within 24 hours." />
      <section className="section-pad">
        {submitted ? (
          <div className="container-site max-w-2xl text-center space-y-4 rounded-2xl bg-card p-8 shadow-soft md:p-12">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-peach text-navy font-bold text-2xl">✓</div>
            <h2 className="text-2xl font-bold text-foreground">Quote Request Opening in WhatsApp</h2>
            <p className="text-muted-foreground">Thank you! If WhatsApp did not open automatically, click below to send your request.</p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={() => setSubmitted(false)} variant="outline">Request Another Quote</Button>
              <Button asChild><a href={site.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle />Open WhatsApp</a></Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="container-site max-w-2xl space-y-5 rounded-2xl bg-card p-6 shadow-soft md:p-10">
            {/* SEC-4: Honeypot field hidden from real users */}
            <input type="text" name="hp_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name *</Label>
                <Input id="name" name="name" autoComplete="name" required maxLength={100} className={field} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Business name</Label>
                <Input id="business" name="business" autoComplete="organization" maxLength={100} className={field} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone / WhatsApp *</Label>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={30} className={field} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" inputMode="numeric" placeholder="e.g. 1000" maxLength={20} className={field} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              {/* A11Y-2: Added focus ring to select */}
              <select id="product" name="product" defaultValue={product ?? ""} required className="flex min-h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="" disabled>Select a product</option>
                {products.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Size, material or other details</Label>
              <Textarea id="details" name="details" rows={4} maxLength={1000} className="bg-card" />
            </div>
            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            <TurnstileCaptcha />
            <Button type="submit" size="lg" className="w-full"><MessageCircle />Send quote request via WhatsApp</Button>
            <p className="text-center text-sm">Prefer email? Write to <a href={`mailto:${site.email}`} className="font-medium text-secondary underline">{site.email}</a></p>
          </form>
        )}
      </section>
    </>
  );
}
