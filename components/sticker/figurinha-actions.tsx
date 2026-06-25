import { cn } from "@/lib/utils";

interface FigurinhaOutlineButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function FigurinhaOutlineButton({
  children,
  className,
  disabled,
  ...props
}: FigurinhaOutlineButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-11 min-w-[200px] cursor-pointer items-center justify-center rounded-pill border px-8 text-sm font-medium transition-colors duration-200",
        disabled
          ? "cursor-not-allowed border-white/20 text-white/35"
          : "border-white/40 text-white/90 hover:border-white/70 hover:bg-white/5 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface FigurinhaPrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
}

export function FigurinhaPrimaryButton({
  children,
  className,
  disabled,
  ...props
}: FigurinhaPrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-11 min-w-[200px] cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 text-sm font-semibold text-verde-escuro-500 transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
