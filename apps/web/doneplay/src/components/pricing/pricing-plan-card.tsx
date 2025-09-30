"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelContent,
  PanelFooter,
  PanelAction,
} from "@/components/ui/panel";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PricingFeature {
  label: string;
  hint?: string;
}
export interface PricingPlanData {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  perExtra?: string;
  description?: string;
  features: PricingFeature[];
  highlight?: boolean;
  icon?: React.ReactNode;
  ctaLabel?: string;
}

export interface PricingPlanCardProps {
  plan: PricingPlanData;
  collapsedCount?: number; // number of features to show when collapsed
  defaultExpanded?: boolean;
  onToggle?(id: string, expanded: boolean): void;
  className?: string;
  onSelect?(plan: PricingPlanData): void; // optional callback for selection
  onHeight?(id: string, height: number): void; // report natural height upward
  enforceHeight?: number; // applied height (synchronized)
}

export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({
  plan,
  collapsedCount = 6,
  defaultExpanded = false,
  onToggle,
  className,
  onSelect,
  onHeight,
  enforceHeight,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Observe height and notify parent for sync
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const measure = () =>
      onHeight?.(plan.id, el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, plan.features.length, onHeight, plan.id]);
  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onToggle?.(plan.id, next);
  };

  const visibleFeatures = expanded
    ? plan.features
    : plan.features.slice(0, collapsedCount);

  return (
    <Panel
      ref={ref}
      className={cn(
        "relative flex flex-col h-fit! sm:h-full! shadow-md border border-border/50 bg-background/60 backdrop-blur-sm p-0 overflow-hidden",
        plan.highlight && "bg-background/70",
        className
      )}
      style={enforceHeight ? { height: enforceHeight } : undefined}
      data-highlight={plan.highlight || undefined}>
      {plan.highlight && (
        <span className="absolute top-0 left-0 w-full bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground text-[10px] font-semibold tracking-wide px-4 py-1 flex items-center gap-1">
          <Crown className="size-3" /> پیشنهادی
        </span>
      )}
      <PanelHeader
        className={cn(
          "flex flex-col gap-2 px-5 pt-5 pb-3",
          plan.highlight && "mt-5"
        )}>
        <div className="flex items-start gap-3">
          {plan.icon && (
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center ring-1 text-primary shrink-0",
                plan.highlight
                  ? "bg-primary/15 ring-primary/30"
                  : "bg-primary/10 ring-primary/20"
              )}>
              {plan.icon}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <PanelTitle className="text-sm font-bold tracking-tight truncate">
              {plan.title}
            </PanelTitle>
            {plan.subtitle && (
              <PanelDescription className="text-[9px] text-primary/80 font-medium leading-relaxed">
                {plan.subtitle}
              </PanelDescription>
            )}
          </div>
          <PanelAction className="flex md:hidden">
            {plan.perExtra && (
              <span className="text-[9px] text-muted-foreground font-medium px-2 py-1 rounded-md bg-muted/60">
                {plan.perExtra}
              </span>
            )}
          </PanelAction>
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-[15px] font-extrabold">{plan.price}</span>
          {!plan.perExtra && plan.perExtra && (
            <span className="text-[10px] text-muted-foreground/70">
              {plan.perExtra}
            </span>
          )}
        </div>
        {plan.description && (
          <p className="text-[9px] leading-relaxed text-muted-foreground/85">
            {plan.description}
          </p>
        )}
      </PanelHeader>
      <Separator className="mx-5 bg-border/60" />
      <PanelContent className="block px-5 py-4">
        <ul className="space-y-1.5">
          {visibleFeatures.map((f) => (
            <li
              key={f.label}
              className="flex items-center gap-2 text-[11px] text-muted-foreground/90">
              <BadgeCheck className="size-3.5 text-primary" />
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
        {plan.features.length > visibleFeatures.length && (
          <button
            onClick={toggle}
            className="mt-3 w-full text-[10px] font-medium text-primary/80 hover:text-primary inline-flex items-center justify-center gap-1 transition-colors">
            {expanded
              ? "نمایش کمتر"
              : `+ ${plan.features.length - visibleFeatures.length} بیشتر`}
          </button>
        )}
      </PanelContent>
      <PanelFooter className="px-5 py-3 flex-col gap-3 mt-auto">
        <Button
          size="sm"
          variant={plan.highlight ? "default" : "outline"}
          className={cn(
            "w-full text-[11px] font-semibold",
            plan.highlight && "shadow"
          )}
          onClick={() => onSelect?.(plan)}>
          {plan.ctaLabel || "درخواست مشاوره"}
        </Button>
        {plan.highlight && (
          <div className="w-full text-center text-[10px] text-primary/80 font-medium">
            بیشترین انتخاب مشتریان
          </div>
        )}
      </PanelFooter>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 data-[highlight=true]:ring-1 group-hover:ring-2 ring-primary/25 transition" />
    </Panel>
  );
};

PricingPlanCard.displayName = "PricingPlanCard";
