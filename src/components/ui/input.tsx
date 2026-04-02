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
          <label htmlFor={id} className="block text-sm font-medium text-[#E2E8F0]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-lg border bg-[#0A0E17] px-3 py-2 text-sm text-[#E2E8F0]",
            "placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50",
            "transition-all duration-200",
            error
              ? "border-[#FF4655] focus:ring-[#FF4655]/50"
              : "border-white/[0.06]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#FF4655]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
