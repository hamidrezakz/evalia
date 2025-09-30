"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
} from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface FeatureCardProps {
  /** Main title */
  title: React.ReactNode;
  /** Optional compact tagline below the title */
  tagline?: React.ReactNode;
  /** Optional feature bullet list. Ignored if children provided. */
  bullets?: string[];
  /** Custom bullet renderer (receives bullet string, index) */
  renderBullet?: (bullet: string, index: number) => React.ReactNode;
  /** Badge content or string. Pass null/undefined to hide. */
  badge?: React.ReactNode;
  /** Icon node (omit for icon-less card) */
  icon?: React.ReactNode;
  /** Control icon & container sizing */
  iconSize?: "xs" | "sm" | "md" | "lg";
  /** Show the separator between header/text and list/content */
  showSeparator?: boolean;
  /** Control rendering of bullet list (if bullets provided) */
  showBullets?: boolean;
  /** If provided, overrides bullet list with arbitrary custom content */
  children?: React.ReactNode;
  /** Apply hover elevation / ring effects */
  hoverEffect?: boolean;
  /** Make the card more compact (smaller paddings & sizes) */
  compact?: boolean;
  /** Additional class for outer Panel */
  className?: string;
  /** Additional class for icon container */
  iconClassName?: string;
  /** Additional class for bullet list UL */
  bulletListClassName?: string;
  /** Additional header class */
  headerClassName?: string;
  /** Additional body (content) class */
  contentClassName?: string;
  /** Disable background blur */
  disableBlur?: boolean;
  /** Optional click handler */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** data-testid for testing */
  testId?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  tagline,
  bullets,
  renderBullet,
  badge,
  icon,
  iconSize = "md",
  showSeparator = true,
  showBullets = true,
  children,
  hoverEffect = true,
  compact = false,
  className,
  iconClassName,
  bulletListClassName,
  headerClassName,
  contentClassName,
  disableBlur,
  onClick,
  testId,
}) => {
  const hasBullets = !!bullets?.length && showBullets;
  const renderBullets = hasBullets && !children;
  const sizeClasses: Record<string, string> = {
    xs: "size-8 [&>svg]:size-4",
    sm: "size-9 [&>svg]:size-4",
    md: "size-10 [&>svg]:size-5",
    lg: "size-12 [&>svg]:size-6",
  };
  const containerSize = sizeClasses[iconSize] || sizeClasses.md;

  return (
    <Panel
      data-testid={testId}
      role="article"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        "relative group border border-border/50 bg-background/60 p-0",
        !disableBlur && "backdrop-blur-sm",
        hoverEffect &&
          "transition-all duration-300 shadow-[0_2px_6px_-2px_hsla(var(--primary-h),var(--primary-s),var(--primary-l),0.07)] hover:shadow-[0_6px_24px_-6px_hsla(var(--primary-h),var(--primary-s),var(--primary-l),0.28)] hover:border-primary/40",
        compact && "[&_[data-slot=panel-header]]:pt-4",
        className
      )}>
      <PanelHeader
        className={cn(
          "flex items-start justify-between gap-3 px-5 pt-5 pb-2",
          compact && "pt-4 pb-0.5",
          headerClassName
        )}>
        {icon && (
          <div
            className={cn(
              "rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 text-primary shrink-0",
              containerSize,
              compact && iconSize === "md" && "size-9 [&>svg]:size-4",
              compact && iconSize === "sm" && "size-8 [&>svg]:size-4",
              compact && iconSize === "xs" && "size-7 [&>svg]:size-3.5",
              iconClassName
            )}>
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0 grow">
          <PanelTitle
            className={cn(
              "text-sm font-semibold leading-snug tracking-tight",
              compact && "text-[13px]"
            )}>
            {title}
          </PanelTitle>
          {tagline && (
            <PanelDescription
              className={cn(
                "text-[11px] text-primary/80 font-medium leading-relaxed",
                compact && "text-[10px]"
              )}>
              {tagline}
            </PanelDescription>
          )}
        </div>
        {/* (iconPosition removed) */}
        {badge &&
          (typeof badge === "string" ? (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wide font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary/80 ring-1 ring-primary/20 border-transparent",
                compact && "text-[9px] px-1.5"
              )}>
              {badge}
            </Badge>
          ) : (
            badge
          ))}
      </PanelHeader>
      {showSeparator && (renderBullets || children) && (
        <div className={cn("px-5 my-3", compact && "my-2")}>
          <div className="h-px w-full bg-border/60" />
        </div>
      )}
      {(renderBullets || children) && (
        <PanelContent
          className={cn(
            "block px-5 pb-5 pt-0",
            compact && "pb-3",
            contentClassName
          )}>
          {children ? (
            children
          ) : (
            <ul
              className={cn(
                "space-y-1.5 text-[11px] leading-relaxed text-muted-foreground/90 pr-1 list-disc list-inside marker:text-primary/50",
                compact && "space-y-1 text-[10px]",
                bulletListClassName
              )}>
              {bullets!.map((b, i) => (
                <li key={b + i}>{renderBullet ? renderBullet(b, i) : b}</li>
              ))}
            </ul>
          )}
        </PanelContent>
      )}
      {hoverEffect && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 group-hover:ring-2 ring-primary/25 transition" />
      )}
    </Panel>
  );
};

FeatureCard.displayName = "FeatureCard";
