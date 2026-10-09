import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, MessageCircle, Palette, Layers, Truck, BadgeCheck, Clock, Leaf, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, SectionHeader, ProductCard, IndustryCard, StepCard, TestimonialCard, StatCounter } from "./primitives";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { industries } from "@/data/industries";
import { stats } from "@/data/stats";
import { faqs } from "@/data/faqs";
import { testimonials } from "@/data/testimonials";
import { images, gallery } from "@/data/images";

function WhatsAppButton({ variant = "outline" as const, label = "Chat on WhatsApp" }: { variant?: "outline" | "outlineLight"; label?: string }) {
  return (
    <Button asChild size="lg" variant={variant}>
      <a href={site.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle />{label}</a>
    </Button>
  );
}

export function Hero() {
  return (
    <section className="bg-hero section-pad overflow-hidden">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-block rounded-full bg-peach px-3 py-1 text-sm font-semibold text-navy">Custom packaging for growing brands</span>
          <h1>Packaging That Makes Your Brand Unforgettable.</h1>
          <p className="mt-5 max-w-xl text-lg">Custom printed boxes, cups, tissues and takeaway packaging for brands and food chains. Premium print quality, low minimum orders, fast delivery.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link to="/quote">Get a Free Quote</Link></Button>
            <WhatsAppButton />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground">
            {["Free design support", "Low MOQ", "Nationwide delivery"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2"><Check className="size-4 text-secondary" aria-hidden />{t}</li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-4">
          <img src={images.food} alt="Branded pizza box, takeaway box and cup" width={1024} height={1024} fetchPriority="high" className="col-span-2 aspect-[16/10] w-full rounded-2xl object-cover shadow-soft" />
          <img src={images.cups} alt="Custom printed coffee cups" width={1024} height={1024} className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
          <img src={images.boxes} alt="Printed kraft shipping boxes" width={1024} height={1024} className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
          <div className="absolute -left-3 top-6 rounded-xl bg-card px-4 py-3 shadow-soft md:-left-8">
            <div className="font-display text-sm font-semibold text-foreground">Quote in 24h</div>
            <div className="text-xs">Free design help</div>
          </div>
          <div className="absolute -right-3 bottom-8 rounded-xl bg-navy px-4 py-3 text-navy-foreground shadow-soft md:-right-6">
            <div className="font-display text-sm font-semibold">Low MOQ</div>
            <div className="text-xs text-navy-foreground/85">Start small, scale up</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  return (
    <section aria-label="Printzy at a glance" className="bg-secondary py-10">
      <div className="container-site grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => <StatCounter key={s.label} {...s} />)}
      </div>
    </section>
  );
}

export function ProductsSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section id="products" className="section-pad">
      <div className="container-site">
        <SectionHeader as={heading} eyebrow="Products" title="Packaging for every part of your business" text="Pick a category to get a quote. Every item is printed with your design." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} {...p} />)}
        </div>
      </div>
    </section>
  );
}

export function IndustriesSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section className="section-pad bg-card">
      <div className="container-site">
        <SectionHeader as={heading} eyebrow="Industries" title="Industries We Serve" text="We understand how packaging works in your trade, from busy counters to doorstep deliveries." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((i) => <IndustryCard key={i.title} {...i} />)}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { title: "Share Your Requirement", text: "Tell us the product, size, quantity and your logo." },
  { title: "Get Design and Quote", text: "We send a mockup and a clear price, usually within 24 hours." },
  { title: "Approve Sample", text: "Check the proof. We adjust until it is right." },
  { title: "We Print and Deliver", text: "Production starts and your order ships to your door." },
];

export function HowItWorksSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader as={heading} eyebrow="Process" title="How It Works" text="Four simple steps from idea to delivered packaging." />
        <ol className="relative grid gap-8 md:grid-cols-4">
          <span aria-hidden className="absolute left-6 top-0 h-full w-0.5 bg-border md:left-0 md:top-6 md:h-0.5 md:w-full" />
          {steps.map((s, i) => <StepCard key={s.title} n={i + 1} {...s} />)}
        </ol>
      </div>
    </section>
  );
}

const options = {
  Sizes: ["Standard cup sizes (4 to 22 oz)", "Pizza boxes from 7 to 16 inch", "Custom box dimensions to your product", "Bags in small, medium and large"],
  Materials: ["Kraft", "Cardboard", "Corrugated", "Paper", "Plastic"],
  Printing: ["Offset printing", "Digital printing", "Foil stamping", "Embossing"],
  Finishes: ["Matte", "Gloss", "Spot UV"],
};

export function CustomizeSection() {
  return (
    <section className="section-pad bg-accent">
      <div className="container-site">
        <SectionHeader eyebrow="Options" title="Customize Every Detail" text="Choose the size, material, print method and finish that suit your product and budget." />
        <Reveal className="mx-auto max-w-3xl rounded-2xl bg-card p-6 shadow-soft md:p-8">
          <Tabs defaultValue="Sizes">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted p-1 sm:grid-cols-4">
              {Object.keys(options).map((k) => (
                <TabsTrigger key={k} value={k} className="min-h-11 font-display data-[state=active]:bg-navy data-[state=active]:text-navy-foreground">{k}</TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(options).map(([k, list]) => (
              <TabsContent key={k} value={k} className="mt-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {list.map((o) => <li key={o} className="flex items-center gap-3 rounded-xl border p-4 text-foreground"><Check className="size-5 text-secondary" aria-hidden />{o}</li>)}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}

const features = [
  { icon: BadgeCheck, title: "Premium print quality", text: "Sharp detail and accurate brand colours on every run." },
  { icon: Layers, title: "Low minimum orders", text: "Start with smaller quantities and reorder as you grow." },
  { icon: Palette, title: "Free design support", text: "We prepare your artwork for print at no extra cost." },
  { icon: Clock, title: "Fast turnaround", text: "Quotes within 24 hours and clear production timelines." },
  { icon: Truck, title: "Nationwide delivery", text: "We ship to your city, wherever your branches are." },
  { icon: Leaf, title: "Eco-friendly options", text: "Kraft and recyclable materials when you need them." },
];

export function WhySection() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader eyebrow="Why Printzy" title="Why Choose Printzy" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <IndustryCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

export function GalleryGrid({ items = gallery }: { items?: typeof gallery }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((g) => (
        <Reveal key={g.alt} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl shadow-soft">
          <img src={g.src} alt={g.alt} width={g.w} height={g.h} loading="lazy" className="w-full transition-transform duration-300 hover:scale-105" />
        </Reveal>
      ))}
    </div>
  );
}

export function FeaturedWork() {
  return (
    <section className="section-pad bg-card">
      <div className="container-site">
        <SectionHeader eyebrow="Our work" title="Featured Work" />
        <GalleryGrid />
        <div className="mt-8 text-center">
          <Link to="/gallery" className="inline-flex min-h-11 items-center gap-1 font-display font-semibold text-secondary hover:text-secondary-hover">View Full Gallery <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setI((i - 1 + n) % n);
    } else if (e.key === "ArrowRight") {
      setI((i + 1) % n);
    }
  };

  return (
    <section className="section-pad bg-accent">
      <div className="container-site">
        <SectionHeader eyebrow="Reviews" title="What clients say" />
        <div 
          tabIndex={0} 
          onKeyDown={handleKeyDown} 
          aria-label="Client testimonials carousel" 
          role="region" 
          className="mx-auto max-w-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl p-2"
        >
          <div aria-live="polite"><TestimonialCard {...testimonials[i]} /></div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Previous review" onClick={() => setI((i - 1 + n) % n)}><ChevronLeft /></Button>
            {testimonials.map((_, k) => (
              <button 
                key={k} 
                aria-label={`Show review ${k + 1}`} 
                aria-current={k === i ? "true" : "false"}
                onClick={() => setI(k)} 
                className="flex size-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full"
              >
                <span className={`block size-2.5 rounded-full ${k === i ? "bg-navy" : "bg-border"}`} />
              </button>
            ))}
            <Button variant="ghost" size="icon" aria-label="Next review" onClick={() => setI((i + 1) % n)}><ChevronRight /></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a,
      },
    })),
  };

  return (
    <section className="section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container-site">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
        <Accordion type="single" collapsible className="mx-auto max-w-3xl rounded-2xl bg-card px-6 shadow-soft">
          {faqs.map((f, k) => (
            <AccordionItem key={f.q} value={`f${k}`}>
              <AccordionTrigger className="min-h-14 text-left font-display text-base font-semibold text-foreground">{f.q}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function QuoteCTA() {
  return (
    <section className="bg-navy section-pad text-navy-foreground">
      <Reveal className="container-site text-center">
        <h2 className="text-navy-foreground">Ready to upgrade your packaging?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy-foreground/85">Send us your requirement today. You will have a design and a price within 24 hours.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/quote">Get a Free Quote</Link></Button>
          <WhatsAppButton variant="outlineLight" />
        </div>
      </Reveal>
    </section>
  );
}

export function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="bg-hero py-14 md:py-20">
      <div className="container-site max-w-3xl text-center">
        <h1>{title}</h1>
        <p className="mt-4 text-lg">{text}</p>
      </div>
    </section>
  );
}
