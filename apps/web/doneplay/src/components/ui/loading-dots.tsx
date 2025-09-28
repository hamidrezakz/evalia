/**
 * Custom LoadingDots Spinner (Not part of ShadCN)
 * -------------------------------------------------
 * Author: [Your Name or Team]
 *
 * This is a custom, accessible, theme-aware 3-dot loading spinner for Evalia UI.
 * Not part of the official ShadCN UI kit; written from scratch for project needs.
 *
 * Features:
 * - Minimal, flexible, and easy to style
 * - Uses CSS animation from globals.css
 * - Props for size, color, speed, and accessibility
 *
 * Usage:
 * import { LoadingDots } from "@/components/ui/loading-dots";
 *
 * Feel free to customize or extend for your own use-case.
 */
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Tailwind arbitrary size in rem (base: 0.5 -> 2)
  colorClassName?: string; // Allows overriding color (default uses currentColor)
  label?: string; // Accessible label
  speed?: number; // seconds per full cycle (default 1.1 like classic)
}

/*
  A minimal, accessible, theme-aware 3-dot loading indicator.
  - Respects parent font-size & color by default (uses currentColor)
  - Customizable via props (size, colorClassName, speed)
  - Uses CSS animation defined in globals.css (loading-dots-fade)
*/
export const LoadingDots = React.forwardRef<HTMLDivElement, LoadingDotsProps>(
  (
    {
      className,
      size = 2,
      colorClassName = "bg-current",
      label = "Loading…",
      speed = 1.4,
      ...props
    },
    ref
  ) => {
    const dotStyle: React.CSSProperties = {
      width: `${size / 10}rem`,
      height: `${size / 10}rem`,
      animationDuration: `${speed}s`,
    };
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn("inline-flex items-center gap-1", className)}
        {...props}>
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            data-loading-dot
            data-index={i}
            style={dotStyle}
            className={cn(
              "loading-dots-dot rounded-full", // animation & shape
              colorClassName,
              "shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-none"
            )}
          />
        ))}
      </div>
    );
  }
);
LoadingDots.displayName = "LoadingDots";

export default LoadingDots;
