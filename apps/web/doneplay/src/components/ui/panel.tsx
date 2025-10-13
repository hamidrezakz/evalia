/**
 * Custom Panel UI Components (Not part of ShadCN)
 * -------------------------------------------------
 * Author: [Your Name or Team]
 *
 * This file contains a set of custom panel components for Evalia UI.
 * These are NOT part of the official ShadCN UI kit and are written from scratch for project-specific needs.
 *
 * Features:
 * - Flexible layout primitives for dashboard panels and cards
 * - Consistent slot-based structure for header, content, footer, etc.
 * - Tailwind-based styling, theme-aware, and easy to extend
 *
 * Usage:
 * import { Panel, PanelHeader, PanelFooter, PanelTitle, PanelAction, PanelDescription, PanelContent } from "@/components/ui/panel";
 *
 * Feel free to customize or extend for your own use-case.
 */
import * as React from "react";

import { cn } from "@/lib/utils";

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "bg-muted/60 dark:bg-muted/50 text-card-foreground flex flex-col gap-6 rounded-xl py-5 overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "@container/panel-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=panel-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function PanelDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-description"
      className={cn("text-muted-foreground text-[12px]", className)}
      {...props}
    />
  );
}

function PanelAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn("px-5 text-sm flex flex-wrap", className)}
      {...props}
    />
  );
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-footer"
      className={cn("flex items-center px-5 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Panel,
  PanelHeader,
  PanelFooter,
  PanelTitle,
  PanelAction,
  PanelDescription,
  PanelContent,
};
