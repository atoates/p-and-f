import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-dark-green text-white hover:bg-primary-green shadow-sm hover:shadow-md active:shadow-sm focus:ring-primary-green/40",
      secondary:
        "bg-sage-100 text-sage-800 hover:bg-sage-200 shadow-sm focus:ring-sage-300",
      outline:
        "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm focus:ring-primary-green/30",
      ghost:
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-400",
    };

    const sizeStyles: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-2.5 text-sm",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
