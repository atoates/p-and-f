import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "secondary";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "primary", size = "sm", className = "", ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      primary: "bg-sage-100 text-sage-800 ring-1 ring-inset ring-sage-200",
      success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
      secondary: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200",
    };

    const sizeStyles: Record<string, string> = {
      sm: "px-2 py-0.5 text-[11px]",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-semibold rounded-md tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
