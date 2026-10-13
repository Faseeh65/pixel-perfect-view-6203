import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Quote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { responsiveImageProps } from "@/data/images";

export type RevealDelay = 100 | 150 | 200 | 250 | 300 | 400 | 500;

export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  delay?: RevealDelay | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const delayClass = delay ? `reveal-delay-${delay}` : "";
  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", delayClass, visible && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  center = true,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  const H = as;
  return (
    <Reveal className={cn("mb-10 max-w-2xl md:mb-14", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-peach px-3 py-1 text-sm font-semibold text-navy transition-transform duration-200 hover:scale-105">
          {eyebrow}
        </span>
      )}
      <H>{title}</H>
      {text && <p className="mt-4 text-lg">{text}</p>}
    </Reveal>
  );
}

export function ProductCard({
  slug,
  title,
  benefit,
  image,
  delay,
}: {
  slug: string;
  title: string;
  benefit: string;
  image: string;
  delay?: RevealDelay | undefined;
}) {
  return (
    <Reveal
      delay={delay}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card border border-border/40 hover:border-secondary/40 card-lift"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted/30">
        <img
          src={image}
          {...responsiveImageProps(
            image,
            "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
          )}
          alt={`${title} by Printzy`}
          width={1024}
          height={768}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg transition-colors duration-200 group-hover:text-secondary">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-base">{benefit}</p>
        <Link
          to="/quote"
          search={{ product: slug }}
          className="mt-4 inline-flex min-h-11 items-center gap-1 font-display font-semibold text-secondary hover:text-secondary-hover"
        >
          <span>Get Quote</span>
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-1.5"
            aria-hidden
          />
        </Link>
      </div>
    </Reveal>
  );
}

export function IndustryCard({
  icon: Icon,
  title,
  text,
  delay,
}: {
  icon?: LucideIcon;
  title: string;
  text: string;
  delay?: RevealDelay | undefined;
}) {
  return (
    <Reveal
      delay={delay}
      className="group rounded-2xl bg-card p-6 border border-border/40 hover:border-secondary/30 card-lift"
    >
      {Icon && (
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-accent text-secondary transition-transform duration-300 group-hover:scale-110">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      )}
      <h3 className="text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-secondary">
        {title}
      </h3>
      <p className="mt-1 text-base text-muted-foreground">{text}</p>
    </Reveal>
  );
}

export function StepCard({
  n,
  title,
  text,
  delay,
}: {
  n: number;
  title: string;
  text: string;
  delay?: RevealDelay | undefined;
}) {
  return (
    <Reveal as="li" delay={delay} className="group relative flex gap-4 md:flex-col md:gap-0">
      <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg font-bold text-navy-foreground shadow-soft transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary md:mb-5">
        {n}
      </span>
      <div>
        <h3 className="text-lg transition-colors duration-200 group-hover:text-secondary">
          {title}
        </h3>
        <p className="mt-1 text-base">{text}</p>
      </div>
    </Reveal>
  );
}

export function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="h-full rounded-2xl bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-lift">
      <Quote
        aria-hidden
        className="mb-4 size-8 text-primary transition-transform duration-300 group-hover:scale-110"
      />
      <blockquote className="text-lg text-foreground">{quote}</blockquote>
      <figcaption className="mt-6">
        <div className="font-display font-semibold text-foreground">{name}</div>
        <div className="text-sm">{role}</div>
      </figcaption>
    </figure>
  );
}

export function StatCounter({
  value,
  suffix,
  text,
  label,
}: {
  value?: number;
  suffix?: string;
  text?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (value == null || !ref.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      if (reduce) return setN(value);
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1200);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl font-bold text-navy-foreground md:text-4xl">
        {value != null ? `${n}${suffix ?? ""}` : text}
      </div>
      <div className="mt-1 text-sm font-medium text-white">{label}</div>
    </div>
  );
}
