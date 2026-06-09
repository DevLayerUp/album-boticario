import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-paper focus-visible:outline-gb-green",
  secondary:
    "bg-gb-green-deep text-gb-cream hover:bg-gb-green-dark",
  outline:
    "border border-gb-green text-gb-green-dark bg-transparent hover:bg-gb-green/10",
  ghost: "bg-transparent text-gb-green-dark hover:bg-gb-green/10",
};

const sizes: Record<Size, string> = {
  // mínimo 44px de altura para alvo de toque acessível
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold",
          "transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
