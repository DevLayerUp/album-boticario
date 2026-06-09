import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-gb-ink"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "h-12 w-full rounded-xl border border-border bg-surface px-4 text-base text-gb-ink",
            "placeholder:text-muted/70",
            "transition-colors duration-200",
            "focus:border-gb-green focus:outline-none focus-visible:outline-2 focus-visible:outline-gb-green",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
