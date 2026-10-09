// Single source of truth for brand + contact details.
export const site = {
  name: "Printzy",
  tagline: "Custom Packaging",
  url: import.meta.env.VITE_SITE_URL ?? "https://printzy.pk",
  email: "sales.printzy@gmail.com",
  phoneDisplay: "0339 9091707",
  phoneIntl: "+92 339 9091707",
  phoneHref: "tel:+923399091707",
  whatsapp:
    "https://wa.me/923399091707?text=Hello%20Printzy%2C%20I%20would%20like%20a%20quote%20for%20custom%20packaging.",
  whatsappNumber: "923399091707",
  about:
    "Printzy designs and prints custom packaging for brands, food chains and retailers. Premium print, low minimums, delivered nationwide.",
  social: {
    // TODO: Replace with verified social media URLs before launch
    instagram: "https://instagram.com/printzy.pk",
    facebook: "https://facebook.com/printzy.pk",
  },
};

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;
