import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]/50",
            "transition-all duration-200",
            error
              ? "border-[var(--accent-red)] focus:ring-[var(--accent-red)]/50"
              : "border-[var(--border-subtle)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--accent-red)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
