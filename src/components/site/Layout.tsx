import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, Phone, Truck, Menu, MessageCircle, Instagram, Facebook } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { site, navLinks } from "@/data/site";
import { products } from "@/data/products";

export function TopBar() {
  return (
    <div className="hidden bg-navy text-sm text-navy-foreground md:block">
      <div className="container-site flex h-10 items-center justify-end gap-6">
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-peach"
        >
          <Mail className="size-4" aria-hidden="true" />
          {site.email}
        </a>
        <a
          href={site.phoneHref}
          className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-peach"
        >
          <Phone className="size-4" aria-hidden="true" />
          {site.phoneDisplay}
        </a>
        <span className="inline-flex items-center gap-2">
          <Truck className="size-4" aria-hidden="true" />
          Nationwide delivery
        </span>
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 bg-card/95 backdrop-blur transition-all duration-300 ${scrolled ? "shadow-soft py-0" : "py-1"}`}
    >
      <div className="container-site flex h-18 items-center justify-between gap-4 py-2">
        <Link to="/" aria-label="Printzy home" className="flex items-center group">
          <img
            src="/images/logo.jpeg"
            alt="Printzy Custom Packaging"
            width={1600}
            height={628}
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <nav aria-label="Main navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="rounded-lg px-3 py-2 font-medium text-foreground transition-all duration-200 hover:text-secondary hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  activeProps={{ className: "text-secondary font-semibold bg-accent/30" }}
                  activeOptions={{ exact: true }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/quote" search={{ product: undefined }}>
              Get a Free Quote
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-80 flex-col bg-card">
              <SheetTitle className="font-display text-foreground">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation menu links</SheetDescription>
              <nav aria-label="Mobile navigation" className="mt-4 flex flex-col">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center border-b font-display font-medium text-foreground hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 pb-4">
                <Button asChild size="lg">
                  <Link to="/quote" search={{ product: undefined }} onClick={() => setOpen(false)}>
                    Get a Free Quote
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={site.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-navy pb-24 text-navy-foreground md:pb-0" aria-label="Site footer">
      <h2 className="sr-only">Footer navigation and company information</h2>
      <div className="container-site grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-card p-3">
            <img
              src="/images/logo.jpeg"
              alt="Printzy Custom Packaging"
              width={1600}
              height={628}
              loading="lazy"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="mt-4 text-sm text-navy-foreground/85">{site.about}</p>
          <div className="mt-4 flex gap-2">
            <a
              href={site.social.instagram}
              aria-label="Follow Printzy on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-lg bg-navy-foreground/10 hover:bg-navy-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Instagram className="size-5" aria-hidden="true" />
            </a>
            <a
              href={site.social.facebook}
              aria-label="Follow Printzy on Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-lg bg-navy-foreground/10 hover:bg-navy-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Facebook className="size-5" aria-hidden="true" />
            </a>
          </div>
        </div>
        <FooterCol title="Quick links">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/privacy"
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              to="/terms"
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Terms of Service
            </Link>
          </li>
        </FooterCol>
        <FooterCol title="Products">
          {products.map((p) => (
            <li key={p.slug}>
              <Link
                to="/quote"
                search={{ product: p.slug }}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </FooterCol>
        <FooterCol title="Contact">
          <li>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <Phone className="size-4" aria-hidden="true" />
              {site.phoneIntl}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 break-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <Mail className="size-4" aria-hidden="true" />
              {site.email}
            </a>
          </li>
          <li>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp us
            </a>
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-navy-foreground/15">
        <p className="container-site py-6 text-sm text-navy-foreground/80">
          © {CURRENT_YEAR} Printzy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-navy-foreground">{title}</h3>
      <ul className="space-y-2 text-sm text-navy-foreground/85">{children}</ul>
    </div>
  );
}

export function FloatingActions() {
  return (
    <>
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Printzy on WhatsApp"
        className="wa-pulse fixed bottom-24 right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-soft transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-secondary-hover hover:shadow-lift active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal md:bottom-6 md:right-6"
      >
        <MessageCircle className="size-7" aria-hidden="true" />
      </a>
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-card p-2 md:hidden">
        <Button asChild variant="outline">
          <a href={site.phoneHref} aria-label={`Call Printzy at ${site.phoneDisplay}`}>
            <Phone aria-hidden="true" />
            Call
          </a>
        </Button>
        <Button asChild>
          <Link
            to="/quote"
            search={{ product: undefined }}
            aria-label="Get a custom packaging quote"
          >
            Get Quote
          </Link>
        </Button>
      </div>
    </>
  );
}
