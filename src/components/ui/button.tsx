import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
        teal: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline: "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        outlineLight: "border-2 border-navy-foreground/80 text-navy-foreground bg-transparent hover:bg-navy-foreground hover:text-navy",
        ghost: "text-foreground hover:bg-accent",
        link: "text-secondary underline-offset-4 hover:underline",
        destructive: "bg-destructive text-destructive-foreground",
        secondary: "bg-accent text-accent-foreground hover:bg-peach",
      },
      size: {
        default: "min-h-11 px-5 py-2.5 text-base",
        sm: "min-h-11 px-4 text-sm",
        lg: "min-h-12 px-7 py-3 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
