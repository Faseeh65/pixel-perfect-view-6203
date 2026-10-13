import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  MessageCircle,
  Palette,
  Layers,
  Truck,
  BadgeCheck,
  Clock,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Reveal,
  SectionHeader,
  ProductCard,
  IndustryCard,
  StepCard,
  TestimonialCard,
  StatCounter,
} from "./primitives";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { industries } from "@/data/industries";
import { stats } from "@/data/stats";
import { faqs } from "@/data/faqs";
import { testimonials } from "@/data/testimonials";
import { images, gallery, responsiveImageProps } from "@/data/images";

function WhatsAppButton({
  variant = "outline" as const,
  label = "Chat on WhatsApp",
}: {
  variant?: "outline" | "outlineLight";
  label?: string;
}) {
  return (
    <Button asChild size="lg" variant={variant}>
      <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
        <MessageCircle />
        {label}
      </a>
    </Button>
  );
}

export function Hero() {
  return (
    <section className="relative bg-hero section-pad overflow-hidden">
      {/* Decorative ambient glowing blurred blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-24 size-80 rounded-full bg-peach/35 blur-3xl animate-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-24 size-96 rounded-full bg-secondary/15 blur-3xl animate-blob-delayed"
      />

      <div className="container-site relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Reveal delay={100}>
            <span className="mb-4 inline-block rounded-full bg-peach px-3 py-1 text-sm font-semibold text-navy transition-transform duration-200 hover:scale-105">
              Custom packaging for growing brands
            </span>
          </Reveal>
          <Reveal delay={150}>
            <h1>Packaging That Makes Your Brand Unforgettable.</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-lg">
              Custom printed boxes, cups, tissues and takeaway packaging for brands and food chains.
              Premium print quality, low minimum orders, fast delivery.
            </p>
          </Reveal>
          <Reveal delay={250}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/quote" search={{ product: undefined }}>
                  Get a Free Quote
                </Link>
              </Button>
              <WhatsAppButton />
            </div>
          </Reveal>
          <Reveal delay={300}>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground">
              {["Free design support", "Low MOQ", "Nationwide delivery"].map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 transition-transform duration-200 hover:translate-x-1"
                >
                  <Check className="size-4 text-secondary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={200} className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-4">
          <img
            src={images.food}
            {...responsiveImageProps(images.food, "(min-width: 1024px) 50vw, 100vw")}
            alt="Branded pizza box, takeaway box and cup"
            width={1024}
            height={1024}
            fetchPriority="high"
            className="col-span-2 aspect-[16/10] w-full rounded-2xl object-cover shadow-soft transition-transform duration-500 hover:scale-[1.02]"
          />
          <img
            src={images.cups}
            {...responsiveImageProps(images.cups, "(min-width: 1024px) 25vw, 50vw")}
            alt="Custom printed coffee cups"
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover shadow-soft transition-transform duration-500 hover:scale-[1.03]"
          />
          <img
            src={images.boxes}
            {...responsiveImageProps(images.boxes, "(min-width: 1024px) 25vw, 50vw")}
            alt="Printed kraft shipping boxes"
            width={1024}
            height={1024}
            loading="lazy"
            className="aspect-square w-full rounded-2xl object-cover shadow-soft transition-transform duration-500 hover:scale-[1.03]"
          />
          <div className="animate-float-slow absolute -left-3 top-6 rounded-xl bg-card border border-border/40 px-4 py-3 shadow-soft transition-all duration-300 hover:shadow-lift md:-left-8">
            <div className="font-display text-sm font-semibold text-foreground">Quote in 24h</div>
            <div className="text-xs text-muted-foreground">Free design help</div>
          </div>
          <div className="animate-float-delayed absolute -right-3 bottom-8 rounded-xl bg-navy border border-white/10 px-4 py-3 text-navy-foreground shadow-soft transition-all duration-300 hover:shadow-lift md:-right-6">
            <div className="font-display text-sm font-semibold">Low MOQ</div>
            <div className="text-xs text-navy-foreground/85">Start small, scale up</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TrustBar() {
  return (
    <section aria-label="Printzy at a glance" className="bg-secondary py-10">
      <div className="container-site grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s) => (
          <StatCounter key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

const CARD_DELAYS = [100, 150, 200, 250] as const;

export function ProductsSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section id="products" className="section-pad">
      <div className="container-site">
        <SectionHeader
          as={heading}
          eyebrow="Products"
          title="Packaging for every part of your business"
          text="Pick a category to get a quote. Every item is printed with your design."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, idx) => (
            <ProductCard key={p.slug} {...p} delay={CARD_DELAYS[idx % CARD_DELAYS.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustriesSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section className="section-pad bg-card">
      <div className="container-site">
        <SectionHeader
          as={heading}
          eyebrow="Industries"
          title="Industries We Serve"
          text="We understand how packaging works in your trade, from busy counters to doorstep deliveries."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((i, idx) => (
            <IndustryCard key={i.title} {...i} delay={CARD_DELAYS[idx % CARD_DELAYS.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { title: "Share Your Requirement", text: "Tell us the product, size, quantity and your logo." },
  {
    title: "Get Design and Quote",
    text: "We send a mockup and a clear price, usually within 24 hours.",
  },
  { title: "Approve Sample", text: "Check the proof. We adjust until it is right." },
  { title: "We Print and Deliver", text: "Production starts and your order ships to your door." },
];

const STEP_DELAYS = [100, 200, 300, 400] as const;

export function HowItWorksSection({ heading = "h2" as "h1" | "h2" }) {
  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader
          as={heading}
          eyebrow="Process"
          title="How It Works"
          text="Four simple steps from idea to delivered packaging."
        />
        <ol className="relative grid gap-8 md:grid-cols-4">
          <span
            aria-hidden
            className="absolute left-6 top-0 h-full w-0.5 bg-border md:left-0 md:top-6 md:h-0.5 md:w-full"
          />
          {steps.map((s, i) => (
            <StepCard key={s.title} n={i + 1} {...s} delay={STEP_DELAYS[i % STEP_DELAYS.length]} />
          ))}
        </ol>
      </div>
    </section>
  );
}

const features = [
  {
    icon: BadgeCheck,
    title: "Premium print quality",
    text: "Sharp detail and accurate brand colours on every run.",
  },
  {
    icon: Layers,
    title: "Low minimum orders",
    text: "Start with smaller quantities and reorder as you grow.",
  },
  {
    icon: Palette,
    title: "Free design support",
    text: "We prepare your artwork for print at no extra cost.",
  },
  {
    icon: Clock,
    title: "Fast turnaround",
    text: "Quotes within 24 hours and clear production timelines.",
  },
  {
    icon: Truck,
    title: "Nationwide delivery",
    text: "We ship to your city, wherever your branches are.",
  },
  {
    icon: Leaf,
    title: "Eco-friendly options",
    text: "Kraft and recyclable materials when you need them.",
  },
];

const FEATURE_DELAYS = [100, 200, 300] as const;

export function WhySection() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader eyebrow="Why Printzy" title="Why Choose Printzy" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, idx) => (
            <IndustryCard
              key={f.title}
              {...f}
              delay={FEATURE_DELAYS[idx % FEATURE_DELAYS.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryGrid({ items = gallery }: { items?: typeof gallery }) {
  const GALLERY_DELAYS = [100, 200, 300] as const;
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {items.map((g, idx) => (
        <Reveal
          key={g.alt}
          delay={GALLERY_DELAYS[idx % GALLERY_DELAYS.length]}
          className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl shadow-soft"
        >
          <img
            src={g.src}
            {...responsiveImageProps(
              g.src,
              "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
            )}
            alt={g.alt}
            width={g.w}
            height={g.h}
            loading="lazy"
            className="w-full transition-transform duration-500 ease-out group-hover:scale-105"
          />
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
          <Link
            to="/gallery"
            className="group inline-flex min-h-11 items-center gap-1 font-display font-semibold text-secondary hover:text-secondary-hover"
          >
            <span>View Full Gallery</span>
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1.5"
              aria-hidden
            />
          </Link>
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
          <div aria-live="polite" className="overflow-hidden min-h-[220px]">
            {testimonials[i] && (
              <div key={i} className="animate-fade-in">
                <TestimonialCard {...testimonials[i]} />
              </div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous review"
              onClick={() => setI((i - 1 + n) % n)}
              className="transition-transform duration-200 active:scale-95"
            >
              <ChevronLeft />
            </Button>
            {testimonials.map((_, k) => (
              <button
                key={k}
                aria-label={`Show review ${k + 1}`}
                aria-current={k === i ? "true" : "false"}
                onClick={() => setI(k)}
                className="flex size-11 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-full transition-transform hover:scale-125"
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    k === i ? "h-2.5 w-6 bg-navy" : "size-2.5 bg-border hover:bg-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next review"
              onClick={() => setI((i + 1) % n)}
              className="transition-transform duration-200 active:scale-95"
            >
              <ChevronRight />
            </Button>
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
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const safeJsonLd = JSON.stringify(faqSchema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <section className="section-pad">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd }} />
      <div className="container-site">
        <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-3xl rounded-2xl bg-card px-6 shadow-soft"
        >
          {faqs.map((f, k) => (
            <AccordionItem key={f.q} value={`f${k}`}>
              <AccordionTrigger className="min-h-14 text-left font-display text-base font-semibold text-foreground">
                {f.q}
              </AccordionTrigger>
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
    <section className="relative bg-navy section-pad text-navy-foreground overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 size-72 rounded-full bg-secondary/25 blur-3xl animate-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -bottom-16 size-72 rounded-full bg-primary/20 blur-3xl animate-blob-delayed"
      />
      <Reveal className="container-site relative z-10 text-center">
        <h2 className="text-navy-foreground">Ready to upgrade your packaging?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-navy-foreground/85">
          Send us your requirement today. You will have a design and a price within 24 hours.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/quote" search={{ product: undefined }}>
              Get a Free Quote
            </Link>
          </Button>
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
