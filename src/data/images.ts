export const images = {
  cups: "/images/cups-800.webp",
  boxes: "/images/boxes-800.webp",
  food: "/images/food-800.webp",
  bags: "/images/bags-800.webp",
  napkins: "/images/napkins-800.webp",
  press: "/images/press-800.webp",
};

const imageSrcSets: Record<string, string> = {
  [images.cups]:
    "/images/cups-480.webp 480w, /images/cups-800.webp 800w, /images/cups-1024.webp 1024w",
  [images.boxes]:
    "/images/boxes-480.webp 480w, /images/boxes-800.webp 800w, /images/boxes-1024.webp 1024w",
  [images.food]:
    "/images/food-480.webp 480w, /images/food-800.webp 800w, /images/food-1024.webp 1024w",
  [images.bags]:
    "/images/bags-480.webp 480w, /images/bags-800.webp 800w, /images/bags-1024.webp 1024w",
  [images.napkins]:
    "/images/napkins-480.webp 480w, /images/napkins-800.webp 800w, /images/napkins-1024.webp 1024w",
  [images.press]:
    "/images/press-480.webp 480w, /images/press-800.webp 800w, /images/press-1200.webp 1200w",
};

export function responsiveImageProps(src: string, sizes = "100vw") {
  const srcSet = imageSrcSets[src];
  return srcSet ? { srcSet, sizes } : {};
}

export const gallery = [
  {
    src: images.food,
    alt: "Branded pizza box, takeaway box, cup and napkins set",
    w: 1024,
    h: 1024,
  },
  { src: images.cups, alt: "Custom printed double-wall coffee cups", w: 1024, h: 1024 },
  { src: images.press, alt: "Offset press printing packaging sheets", w: 1280, h: 832 },
  { src: images.boxes, alt: "Stack of printed kraft shipping and gift boxes", w: 1024, h: 1024 },
  { src: images.napkins, alt: "Printed napkins, cup sleeves and logo stickers", w: 1024, h: 1024 },
  { src: images.bags, alt: "Kraft and white paper bags with printed logo", w: 1024, h: 1024 },
];
