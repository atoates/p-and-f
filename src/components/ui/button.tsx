import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    const baseStyles =
      "font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles: Record<string, string> = {
      primary:
        "bg-primary-green text-white hover:bg-light-green focus:ring-primary-green",
      secondary: "bg-accent-pink text-white hover:bg-opacity-90 focus:ring-accent-pink",
      outline:
        "border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green",
      ghost:
        "text-primary-green hover:bg-soft-cream focus:ring-primary-green",
    };

    const sizeStyles: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
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
