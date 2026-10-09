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
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    
    // SEC-4: Honeypot bot protection
    if (get("hp_website")) return;

    // SEC-5: Validation and input bounds check
    const name = get("name");
    const phone = get("phone");
    const selectedProd = get("product");

    if (!name || !phone || !selectedProd) {
      return setError("Please fill in your name, phone number, and select a product.");
    }

    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      return setError("Please enter a valid phone number.");
    }

    setError("");
    setSubmitted(true);

    const title = products.find((p) => p.slug === selectedProd)?.title ?? selectedProd;
    const msg = `Hello Printzy, I would like a quote.\nName: ${name.slice(0, 100)}\nBusiness: ${get("business").slice(0, 100)}\nPhone: ${phone.slice(0, 30)}\nProduct: ${title}\nQuantity: ${get("quantity").slice(0, 20)}\nDetails: ${get("details").slice(0, 1000)}`;
    
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
            <Button type="submit" size="lg" className="w-full"><MessageCircle />Send quote request via WhatsApp</Button>
            <p className="text-center text-sm">Prefer email? Write to <a href={`mailto:${site.email}`} className="font-medium text-secondary underline">{site.email}</a></p>
          </form>
        )}
      </section>
    </>
  );
}
