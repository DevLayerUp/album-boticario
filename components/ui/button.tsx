import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "green"
  | "blue"
  | "yellow"
  | "gold";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

/** Variantes pill do Design System FGB (cores verde/azul/amarelo/gold). */
const variants: Record<Variant, string> = {
  primary: "bg-verde-500 text-white hover:bg-verde-escuro-500 shadow-paper",
  green: "bg-verde-500 text-white hover:bg-verde-escuro-500 shadow-paper",
  blue: "bg-azul-500 text-white hover:bg-azul-escuro-500 shadow-paper",
  yellow:
    "bg-amarelo text-verde-escuro-500 hover:brightness-95 shadow-paper",
  gold: "bg-gold-500 text-white hover:bg-gold-700 shadow-paper",
  secondary:
    "bg-verde-escuro-500 text-verde-100 hover:bg-verde-escuro-400",
  outline:
    "border border-verde-500 text-verde-escuro-500 bg-transparent hover:bg-verde-500/10",
  ghost: "bg-transparent text-verde-escuro-500 hover:bg-verde-500/10",
};

const sizes: Record<Size, string> = {
  // mínimo 44px de altura para alvo de toque acessível
  sm: "h-11 px-5 text-sm",
  md: "h-12 px-7 text-base",
  lg: "h-14 px-9 text-lg",
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
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill font-medium",
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
